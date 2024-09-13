package report

import (
	"bytes"
	"database/sql"
	"errors"
	"fmt"
	"math/rand"
	"text/template"
	"time"

	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"github.com/efficientIO/efficientIO/report/pkg/pdf"
)

const (
	tariffHigh = 0
	tariffLow  = 1
)

type (
	// bucket related structs
	ZevBucket struct {
		Time      time.Time
		Producers ZevProducer
		Consumers map[string]ZevConsumer
		Tariffs   ZevTariffs
	}
	ZevProducer struct {
		Internal float64
		External float64
	}
	ZevConsumer struct {
		Value    float64
		Internal float64
		External float64
	}
	ZevTariffs struct {
		Internal int
		External int
	}

	ZevResult struct {
		Report        *Report
		Name          string
		TransactionID string
		Start         time.Time
		End           time.Time
		Currency      string
		Address       ZevResultAddress
		Buckets       []ZevBucket
		Production    struct {
			Total    float64
			Internal ZevResultLowHigh
			External ZevResultLowHigh
		}
		// very simple map, maybe
		Consumption struct {
			Total      float64
			TotalPrice float64
			Consumers  map[string]ZevResultConsumer
		}
		Tariffs struct {
			Internal struct {
				High float64
				Low  float64
			}
			External struct {
				High float64
				Low  float64
			}
		}
	}
	ZevResultLowHigh struct {
		Start      float64
		End        float64
		Total      float64
		TotalPrice float64
		Low        float64
		LowPrice   float64
		High       float64
		HighPrice  float64
	}
	ZevResultConsumer struct {
		MeteringID string
		Total      float64
		TotalPrice float64
		Start      float64
		End        float64
		Internal   ZevResultLowHigh
		External   ZevResultLowHigh
	}
	ZevResultAddress struct {
		Street  string
		City    string
		Country string
	}
	ZevVariable struct {
		Name       string `json:"name"`
		Title      string `json:"title"`
		MeteringID string `json:"metering_id"`
	}

	Zev struct {
		result *ZevResult
		report *Report
	}
)

// Zev calculation
func (r *Report) Zev() (*Zev, error) {
	buckets, err := generateZevBuckets(r, r.db)
	if err != nil {
		return nil, err
	}

	if len(buckets) == 0 {
		return nil, errors.New("no data for time period")
	}

	// generate transaction_id
	// e.g 2830 20210605 062758
	transactionId := fmt.Sprintf("%d%s%d",
		rand.Intn(9999-1000)+1000,
		buckets[0].Time.Format("20060102"),
		rand.Intn(9999-1000)+1000)

	// fill in default fields
	result := ZevResult{
		Report:        r,
		Name:          r.Name,
		TransactionID: transactionId,
		Start:         buckets[0].Time,
		End:           buckets[len(buckets)-1].Time.Add(15 * time.Minute),
		Currency:      r.Currency,
		Buckets:       buckets,
		Address: ZevResultAddress{
			Street:  r.Address.Street,
			City:    r.Address.City,
			Country: r.Address.Country,
		},
	}

	// initialize map otherwise it will be nil
	result.Consumption.Consumers = make(map[string]ZevResultConsumer)

	for _, b := range buckets {
		// high/low/total for external production
		if b.Tariffs.External == tariffHigh {
			result.Production.External.High += b.Producers.External
		} else {
			result.Production.External.Low += b.Producers.External
		}
		result.Production.External.Total += b.Producers.External

		// high/low/total for internal production
		if b.Tariffs.Internal == tariffHigh {
			result.Production.Internal.High += b.Producers.Internal
		} else {
			result.Production.Internal.Low += b.Producers.Internal
		}
		result.Production.Internal.Total += b.Producers.Internal

		result.Production.Total += b.Producers.External + b.Producers.Internal

		// now for the consumption
		for k, v := range b.Consumers {
			lhr := result.Consumption.Consumers[k]

			// high/low/total for external tariff
			if b.Tariffs.External == tariffHigh {
				lhr.External.High += v.External
			} else {
				lhr.External.Low += v.External
			}
			lhr.External.Total += v.External

			// high/low for internal tariff
			if b.Tariffs.Internal == tariffHigh {
				lhr.Internal.High += v.Internal
			} else {
				lhr.Internal.Low += v.Internal
			}
			lhr.Internal.Total += v.Internal

			// total for consumer and absolute total
			lhr.Total += v.Internal + v.External
			result.Consumption.Total += v.Internal + v.External

			// update map entry
			result.Consumption.Consumers[k] = lhr
		}
	}

	// set start and end value
	for k, v := range result.Consumption.Consumers {
		lhr := v

		lhr.Start = buckets[0].Consumers[k].Value
		lhr.End = buckets[len(buckets)-1].Consumers[k].Value

		lhr.External.LowPrice = lhr.External.Low * r.Meta.Zev.Tariffs.External.Low
		lhr.External.HighPrice = lhr.External.High * r.Meta.Zev.Tariffs.External.High
		lhr.External.TotalPrice = lhr.External.LowPrice + lhr.External.HighPrice

		lhr.Internal.LowPrice = lhr.Internal.Low * r.Meta.Zev.Tariffs.Internal.Low
		lhr.Internal.HighPrice = lhr.Internal.High * r.Meta.Zev.Tariffs.Internal.High
		lhr.Internal.TotalPrice = lhr.Internal.LowPrice + lhr.Internal.HighPrice

		lhr.TotalPrice = lhr.External.TotalPrice + lhr.Internal.TotalPrice

		result.Consumption.TotalPrice += lhr.TotalPrice
		result.Consumption.Consumers[k] = lhr
	}

	// rename zev consumers
	for _, c := range r.Meta.Zev.Consumers {
		val := result.Consumption.Consumers[c.Name]
		val.MeteringID = c.MeteringID

		if c.Title == "" {
			result.Consumption.Consumers[c.Name] = val
			continue
		}

		result.Consumption.Consumers[c.Title] = val
		delete(result.Consumption.Consumers, c.Name)
	}

	return &Zev{
		result: &result,
		report: r,
	}, nil
}

// validateTariff
// A tariff is a three-dimensional array: 7 days, every day there can be intervals,
// e.g. from 1 AM to 2 AM, 2:40 AM to 3 AM, etc.
func validateTariff(tariff [][][]int) error {
	if len(tariff) != 7 {
		return errors.New("tariff must have 7 days")
	}

	for _, v := range tariff {
		for _, v2 := range v {
			if len(v2) != 2 {
				return fmt.Errorf("tariff %d must have 2 items", v2)
			}
			if v2[0] > v2[1] {
				return fmt.Errorf("tariff %d start must not be greater than end", v2)
			}
		}
	}

	return nil
}

// I think I will rename this to generateBuckets, so that I split
// buckets calculation and total calculation
func generateZevBuckets(r *Report, db *sql.DB) ([]ZevBucket, error) {
	// tariff validation
	if err := validateTariff(r.Meta.Zev.Tariffs.Internal.Time); err != nil {
		return nil, err
	}
	if err := validateTariff(r.Meta.Zev.Tariffs.External.Time); err != nil {
		return nil, err
	}

	// fetch measurements of producers/consumers
	variables := []string{}
	for _, v := range r.Meta.Zev.Consumers {
		variables = append(variables, v.Name)
	}
	for _, v := range r.Meta.Zev.Producers.External {
		variables = append(variables, v.Name)
	}
	for _, v := range r.Meta.Zev.Producers.Internal {
		variables = append(variables, v.Name)
	}

	measurements, err := queryData(db, r.Timezone, r.ProjectID, variables, r.Start, r.End)
	if err != nil {
		return nil, err
	}

	// r.Meta.Zev.Consumers[0] is just a random item, but it doesn't matter
	// because all items have the same amount of measurements in them
	item := r.Meta.Zev.Consumers[0]
	length := len(measurements[item.Name])
	buckets := make([]ZevBucket, 0)
	for i := 1; i < length; i++ {
		ts := measurements[item.Name][i][0].(time.Time)

		// current counter value cannot be greater than the previous one
		// since counters can only count up. This is a safe-guard, when e.g.
		// a counter has been reset or some other strange thing happened
		for k := range measurements {
			curr := measurements[k][i][1].(float64)
			prev := measurements[k][i-1][1].(float64)

			if curr < prev {
				measurements[k][i][1] = prev
			}
		}

		// create initial bucket information
		bucket := ZevBucket{
			Time: ts,
			Tariffs: ZevTariffs{
				// set the tariffs
				Internal: boolToInt(isLowTariff(ts,
					r.Meta.Zev.Tariffs.Internal.Time)),
				External: boolToInt(isLowTariff(ts,
					r.Meta.Zev.Tariffs.External.Time)),
			},
		}

		production := ZevProducer{
			Internal: 0,
			External: 0,
		}

		// sum internal producers
		for _, ip := range r.Meta.Zev.Producers.Internal {
			// get the difference to the value before
			diff := measurements[ip.Name][i][1].(float64) -
				measurements[ip.Name][i-1][1].(float64)
			production.Internal += diff
		}

		// sum external producers
		for _, ep := range r.Meta.Zev.Producers.External {
			diff := measurements[ep.Name][i][1].(float64) -
				measurements[ep.Name][i-1][1].(float64)
			production.External += diff
		}

		// get the total production and percentage of internal/external
		// productions
		totalProduction := production.Internal + production.External

		// if there hasn't been any production, for whatever reason...
		if totalProduction == 0 {
			// fill it with empty consumers, just that the data is there
			consumption := make(map[string]ZevConsumer)
			for _, c := range r.Meta.Zev.Consumers {
				consumption[c.Name] = ZevConsumer{
					// the value needs to be added up here, because
					// if the total production is zero, it will continue...
					Value: measurements[c.Name][i][1].(float64),
				}
			}

			bucket.Producers = production
			bucket.Consumers = consumption

			buckets = append(buckets, bucket)
			continue
		}

		internalProductionShare := production.Internal / totalProduction
		externalProductionShare := production.External / totalProduction

		// consumption calculation part
		totalConsumption := 0.00
		consumption := make(map[string]ZevConsumer)
		for _, c := range r.Meta.Zev.Consumers {
			diff := measurements[c.Name][i][1].(float64) -
				measurements[c.Name][i-1][1].(float64)

			consumer := ZevConsumer{
				// the last value of the period
				Value:    measurements[c.Name][i][1].(float64),
				Internal: diff * internalProductionShare,
				External: diff * externalProductionShare,
			}

			consumption[c.Name] = consumer
			totalConsumption += diff
		}

		// special case when consumption doesn't equal production
		// we need to add that difference
		if totalConsumption != totalProduction {
			productionConsumptionDiff := totalProduction - totalConsumption

			consumerCount := len(consumption)
			for k, c := range consumption {

				// calculate the difference of the consumption between
				// production
				total := c.Internal + c.External
				consumptionShare := total / totalConsumption
				internalRest := 0.00
				externalRest := 0.00

				// check whether totalConsumption is zero, then we have to split everything equally
				if totalConsumption == 0 {
					consumptionShare = float64(1) / float64(consumerCount)
					internalRest = totalProduction * internalProductionShare * consumptionShare
					externalRest = totalProduction * externalProductionShare * consumptionShare
				} else {
					rest := consumptionShare * productionConsumptionDiff
					// ignore if the rest is zero
					if rest == 0 {
						continue
					}

					internalRest = rest * (c.Internal / total)
					externalRest = rest * (c.External / total)
				}

				// update bucket values
				e := consumption[k]
				e.Internal += internalRest
				e.External += externalRest
				consumption[k] = e
			}
		}

		bucket.Consumers = consumption
		bucket.Producers = production
		buckets = append(buckets, bucket)
	}

	return buckets, err
}

// isLowTariff returns true if the fare is low
// for the current time of the day
// offset is the timezone offset in minutes
func isLowTariff(ts time.Time, tariffs [][][]int) bool {
	minutes := ts.Hour()*60 + ts.Minute()
	weekday := int(ts.Weekday()) - 1
	if weekday == -1 {
		weekday = 6
	}

	for _, e := range tariffs[weekday] {
		start := e[0]
		end := e[1]

		if minutes >= start && minutes <= end {
			return true
		}
	}

	return false
}

// boolToInt is a simple helper func for high/low tariff
func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}

func queryData(db *sql.DB, timezone string, project string, variables []string,
	from time.Time, to time.Time) (map[string][][]any, error) {

	// because the bucket size is 15 minutes and we need the last element
	// before the period to calculate the difference
	from = from.Add(-15 * time.Minute)
	// to = to.Add(15 * time.Minute)

	// generate "ANY(<data>)"
	list := `{`
	for i := 0; i < len(variables); i++ {
		if i == len(variables)-1 {
			list += variables[i] + "}"
			break
		}
		list += variables[i] + ","

	}

	query := `
		SELECT
			time_bucket_gapfill('15 minutes', 
				time AT TIME ZONE $5, 
				$2 AT TIME ZONE $5, 
				$3 AT TIME ZONE $5) 
			AS bucket,
			locf(
				last(value, time),
				(SELECT value FROM measurements WHERE 
						time < $2 AND 
						time >= $2 - INTERVAL '1 day' AND
						measurements.variable = measurements_meta.id 
					ORDER BY time 
					DESC LIMIT 1)
			) as last,
			measurements_meta.variable
		FROM
			measurements
			INNER JOIN measurements_meta
				ON measurements.variable = measurements_meta.id
		WHERE
			measurements_meta.project = $1 AND
			measurements_meta.variable = ANY($4) AND
			measurements.time >= $2 AND
			measurements.time <= $3
		GROUP BY bucket, measurements_meta.id
		ORDER BY bucket
	`

	rows, err := db.Query(query, project, from, to, list, timezone)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("no data")
		}
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	result := make(map[string][][]any)
	for rows.Next() {
		var ts time.Time
		var val sql.NullFloat64
		var variableName string

		if err := rows.Scan(&ts, &val, &variableName); err != nil {
			return nil, err
		}

		result[variableName] = append(result[variableName], []any{ts, val.Float64})
	}

	return result, nil
}

func (z *Zev) PDF() ([]byte, error) {
	return pdf.Create("zev.html", &z.result)
}

// InnosolvXML was only used for a specific customer which didn't need it after all...
// need a way to define the template location
func (z *Zev) InnosolvXML() ([]byte, error) {
	t, err := template.New("").Funcs(template.FuncMap{
		"round": func(input float64) string { return fmt.Sprintf("%.2f", input) },
	}).ParseFiles("template/innosolv.xml")
	if err != nil {
		return nil, err
	}

	var tpl bytes.Buffer
	err = t.ExecuteTemplate(&tpl, "innosolv.xml", &z.result)
	return tpl.Bytes(), err
}

// CSV report
func (z *Zev) CSV() ([]byte, error) {
	text := "id;name;obis;value;price\n"
	for k, v := range z.result.Consumption.Consumers {
		text += fmt.Sprintf("%s;%s;%s;%.2f;%.2f\n", v.MeteringID, k, "1-5:10.9.5", v.Internal.Low, v.Internal.LowPrice)
		text += fmt.Sprintf("%s;%s;%s;%.2f;%.2f\n", v.MeteringID, k, "1-5:10.9.4", v.Internal.High, v.Internal.HighPrice)
		text += fmt.Sprintf("%s;%s;%s;%.2f;%.2f\n", v.MeteringID, k, "1-5:1.9.2", v.External.Low, v.External.LowPrice)
		text += fmt.Sprintf("%s;%s;%s;%.2f;%.2f\n", v.MeteringID, k, "1-5:1.9.1", v.External.High, v.External.HighPrice)
	}
	return []byte(text), nil
}
