package benchmarking

import (
	"database/sql"
	"fmt"
	"math"
	"net/url"
	"strconv"
	"time"

	data_mapping "github.com/efficientIO/efficientIO/api/pkg/resource/data_mapping"
	"github.com/efficientIO/efficientIO/api/pkg/resource/measurement"
	"github.com/efficientIO/efficientIO/api/pkg/resource/project"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"github.com/gomodule/redigo/redis"
)

type (
	Repository struct {
		Database        *sql.DB
		MeasurementRepo *measurement.Repository
		RedisPool       *redis.Pool
	}
)

const (
	integralContinousAggregateQueryClauses = ` FROM public.measurements_daily_integral 
	WHERE variable = $1 AND "bucket" >= $2 AND "bucket" <= $3
	ORDER BY "bucket"`
	selectPosiviteIntegralForVariable            = `SELECT "bucket", integral_positive` + integralContinousAggregateQueryClauses
	selectNegativeIntegralForVariable            = `SELECT "bucket", integral_negative ` + integralContinousAggregateQueryClauses
	selectBooleanPostiveChangeCountLastSevenDays = `
		SELECT time_bucket('1 day', time) AS bucket, sum(cycle) 
		FROM (
			SELECT
				time,
				GREATEST ((value - lag(value) OVER w), 0.0) AS "cycle"
			FROM measurements
			WHERE time >= $2 AND variable = $1
			WINDOW w AS (ORDER BY time)) AS internal
		GROUP BY bucket 
		ORDER BY bucket ASC;`
)

// Return integraded Measurements from Continous aggregate
func (r Repository) FetchIntegratedMeasurements(project, variable string, start, end time.Time, positive bool) (map[int64]float64, error) {
	variable_id, err := r.MeasurementRepo.GetVariableID(project, variable)
	if err != nil {
		utils.LogError(err, "GetVariableID did not work!")
		return nil, err
	}
	query := selectPosiviteIntegralForVariable
	if !positive {
		query = selectNegativeIntegralForVariable
	}
	rows, err := r.Database.Query(query, variable_id, start, end)
	if err != nil {
		l := utils.GetLogger()
		l.Error().Err(err).Str("Query", query).Int("VariableID", variable_id).Stack().Msg("Query did not work")
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	measurements := map[int64]float64{}

	for rows.Next() {
		var (
			timestamp time.Time
			value     float64
		)
		if err := rows.Scan(&timestamp, &value); err != nil {
			utils.LogError(err, "Scanning did not work!")
			return nil, err
		}

		measurements[utils.BeginningOfDay(timestamp).Unix()] = value

	}
	return measurements, nil
}

func (r Repository) FetchBooleanIncreaseCounterMeasurements(project, variable string, start time.Time) (map[int64]float64, error) {
	variable_id, err := r.MeasurementRepo.GetVariableID(project, variable)
	if err != nil {
		utils.LogError(err, "GetVariableID did not work!")
		return nil, err
	}

	rows, err := r.Database.Query(selectBooleanPostiveChangeCountLastSevenDays, variable_id, start)
	if err != nil {
		l := utils.GetLogger()
		l.Error().Err(err).Str("Query", selectBooleanPostiveChangeCountLastSevenDays).Int("VariableID", variable_id).Stack().Msg("Query did not work")
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	measurements := map[int64]float64{}

	for rows.Next() {
		var (
			timestamp time.Time
			value     float64
		)
		if err := rows.Scan(&timestamp, &value); err != nil {
			utils.LogError(err, "Scanning did not work!")
			return nil, err
		}

		measurements[utils.BeginningOfDay(timestamp).Unix()] = value

	}
	return measurements, nil
}

func (r Repository) GenerateProjectReport(projectId string, timezone string, mpcAddr string, userId string) (map[string]any, error) {
	// maps to store values
	live_mapping := map[string][]string{}
	today_mapping := map[string]float64{}
	week_mapping := map[string]map[int64]float64{}

	// prepare map to return
	data := map[string]any{}
	data["valid"] = false

	project, err := project.GetProject(r.Database, r.RedisPool, project.GetOptions{ID: projectId,
		WithSecret: false})
	if err != nil {
		return nil, err
	}

	enabled, found := project.Meta["enableAutomaticReport"]

	// variable may only be set if found
	if found {
		enabled_bool, cast_ok := enabled.(bool)
		// if found, but could not get casted, return an error
		if !cast_ok {
			return nil, fmt.Errorf("could not cast Project-Meta \"enableAutomaticReport\"")
		}
		// if report is not enabled send back empty data (with valid set to false as default)
		if !enabled_bool {
			return data, nil
		}
	}

	// ------------------
	// Get PV data
	pv_power_vars, sum_daily_pv, sum_weekly_pv, err := r.GetReportDataForType(projectId, timezone,
		"PV System", "power", userId, 1)

	if len(pv_power_vars) > 0 {
		live_mapping["pv"] = pv_power_vars
		today_mapping["pv"] = sum_daily_pv
		today_mapping["trees_planted"] = math.Floor(sum_daily_pv * 0.23 / 18.3 / 40)
		today_mapping["co2_saved"] = sum_daily_pv * 0.23
		today_mapping["coal_saved"] = sum_daily_pv * 0.4
		week_mapping["pv"] = sum_weekly_pv
	}

	// ------------------
	// Get Grid data
	grid_power_vars, sum_daily_grid_con, sum_weekly_grid_con, err_g := r.GetReportDataForType(projectId, timezone,
		"Grid System", "power", userId, 1)
	_, sum_daily_grid_feed, sum_weekly_grid_feed, err_gf := r.GetReportDataForType(projectId, timezone,
		"Grid System", "power", userId, -1)

	if len(grid_power_vars) > 0 {
		live_mapping["grid"] = grid_power_vars
		today_mapping["grid_consumption"] = sum_daily_grid_con
		today_mapping["grid_feed_in"] = sum_daily_grid_feed
		week_mapping["grid_consumption"] = sum_weekly_grid_con
		week_mapping["grid_feed_in"] = sum_weekly_grid_feed
	}

	// ------------------
	// Get battery data
	batteries_soc_vars, err_bsoc := r.GetMeasurementsForType(projectId, "Battery System", "soc", userId)
	if len(batteries_soc_vars) > 0 {
		live_mapping["battery_soc"] = batteries_soc_vars
	}

	// ------------------
	// Get charging station data
	cs_power_vars, sum_daily_cs, sum_weekly_cs, err_cs := r.GetReportDataForType(projectId, timezone,
		"Charging Station", "power", userId, 1)

	if len(cs_power_vars) > 0 {
		live_mapping["cs"] = cs_power_vars
		today_mapping["cs"] = sum_daily_cs
		week_mapping["cs"] = sum_weekly_cs
	}

	cs_state_vars, sum_daily_cs_state, sum_weekly_cs_state, err_cs_state := r.GetReportDataForBooleanType(projectId, timezone,
		"Charging Station", "cs_state", userId)

	if len(cs_state_vars) > 0 {
		live_mapping["cs_state"] = cs_state_vars
		today_mapping["cs_state"] = sum_daily_cs_state
		week_mapping["cs_state"] = sum_weekly_cs_state
	}
	// ------------------
	// Get autarchy scores
	autarchy_scores, err_aut := r.GetAutarchyScoresForLastWeek(mpcAddr, projectId, pv_power_vars,
		grid_power_vars, batteries_soc_vars, utils.Int64Keys(sum_weekly_pv))

	// don't return currently on MPC error
	if err_aut != nil {
		utils.LogError(err_aut, "")
	} else if len(autarchy_scores) > 0 {
		week_mapping["autarchy"] = autarchy_scores
	}

	// autarchy for the complete week
	autarchy_score_complete, err_autc := GetSingleAutarchyScore(mpcAddr, projectId, pv_power_vars,
		grid_power_vars, batteries_soc_vars, time.Unix(utils.GetBiggestIntKey(sum_weekly_pv, 0), 0))

	// don't return currently on MPC bug
	if err_autc != nil {
		utils.LogError(err_autc, "")
	}

	// check errors
	// TODO: create util function that returns first error
	if err != nil {
		return nil, err
	}
	if err_g != nil {
		return nil, err_g
	}
	if err_bsoc != nil {
		return nil, err_bsoc
	}
	if err_gf != nil {
		return nil, err_gf
	}
	if err_cs != nil {
		return nil, err_cs
	}
	if err_cs_state != nil {
		return nil, err_cs_state
	}

	if len(live_mapping) > 0 {
		data["live"] = live_mapping
		data["valid"] = true
	}
	if len(week_mapping) > 0 {
		data["week"] = week_mapping
		data["valid"] = true
	}
	if len(today_mapping) > 0 {
		data["today"] = today_mapping
		data["valid"] = true
	}
	if autarchy_score_complete > 0 {
		data["autarchy"] = autarchy_score_complete
		data["valid"] = true
	}

	electricity_prices, found := project.Meta["electricity_price"]
	if !found {
		return data, nil
	}

	electricity_map, cast_ok_any := electricity_prices.(map[string]any)
	if !cast_ok_any {
		l := utils.GetLogger()
		l.Error().Msg(fmt.Sprintf("Could not cast electricity_map: %v", electricity_map))
		return data, nil
	}

	consumption_price, found_cp := electricity_map["consumption"]

	if found_cp && len(grid_power_vars) > 0 {
		switch consumption_price_casted := consumption_price.(type) {
		case int:
			today_mapping["electricity_cost"] = today_mapping["grid_consumption"] * float64(consumption_price_casted)
			data["today"] = today_mapping
		case float64:
			today_mapping["electricity_cost"] = today_mapping["grid_consumption"] * consumption_price_casted
			data["today"] = today_mapping
		case string:
			consumption_price_float, err := strconv.ParseFloat(consumption_price_casted, 64)
			if err == nil {
				today_mapping["electricity_cost"] = today_mapping["grid_consumption"] * consumption_price_float
				data["today"] = today_mapping
			}
		}
	}

	feed_in_price, found_fp := electricity_map["feed_in"]
	if found_fp && len(grid_power_vars) > 0 {
		switch feed_in_prince_casted := feed_in_price.(type) {
		case int:
			today_mapping["electricity_earnings"] = today_mapping["grid_feed_in"] * float64(feed_in_prince_casted)
			data["today"] = today_mapping
		case float64:
			today_mapping["electricity_earnings"] = today_mapping["grid_feed_in"] * feed_in_prince_casted
			data["today"] = today_mapping
		case string:
			feed_in_price_float, err := strconv.ParseFloat(feed_in_prince_casted, 64)
			if err == nil {
				today_mapping["electricity_earnings"] = today_mapping["grid_feed_in"] * feed_in_price_float
				data["today"] = today_mapping
			}
		}
	}

	cs_price, found_cs := electricity_map["feed_in"]
	if found_cs && len(cs_state_vars) > 0 {
		switch cs_casted := cs_price.(type) {
		case int:
			today_mapping["cs_earnings"] = today_mapping["cs"] * float64(cs_casted)
			data["today"] = today_mapping
		case float64:
			today_mapping["cs_earnings"] = today_mapping["cs"] * cs_casted
			data["today"] = today_mapping
		case string:
			cs_casted_float, err := strconv.ParseFloat(cs_casted, 64)
			if err == nil {
				today_mapping["cs_earnings"] = today_mapping["cs"] * cs_casted_float
				data["today"] = today_mapping
			}
		}
	}

	return data, nil
}

// GetReportDataForType returns data for a report (array of measrument names for live view, daily sum & sum of last 7 days)
// takes as arguments the projectId, the timezone for aggregation, the aggregeation device type name and the key of the mapping
// as well as if only positive (1) only negative (-1) or all (0) measruemtn should be summed up
func (r Repository) GetReportDataForType(projectId, timezone, typeName, mappingKey, userId string, sumAll int) ([]string, float64, map[int64]float64, error) {
	devices, err := data_mapping.ListDataMappingsForProjectByTypeName(r.Database, projectId, typeName, userId)

	if err != nil {
		return nil, 0, nil, err
	}

	measurement_names := []string{}
	sum_daily := 0.0
	sum_week := map[int64]float64{}

	now := time.Now()
	today_bod := utils.BeginningOfDay(now)
	yesterday_eod := utils.EndOfDay(now.Add(time.Hour * -1 * 24))
	seven_day_ago := yesterday_eod.Add(time.Hour * -7 * 24)

	for _, dev := range devices {

		mappings, err := data_mapping.ListMappingsForDataMapping(r.Database, dev.ID)
		if err != nil {
			utils.LogError(err, "")
			continue
		}

		// get measruement name
		measurment_name, exists := mappings[mappingKey]
		if !exists {
			continue

		}
		// apend to list of names for live array
		measurement_names = append(measurement_names, measurment_name)

		// get data from 15m cagg for daily data
		history, err := r.MeasurementRepo.History(measurement.HistoryOptions{
			ProjectID:            projectId,
			Variable:             measurment_name,
			Start:                today_bod,
			End:                  now,
			Interval:             "1h",       // TODO: CHECK
			Aggregation:          "integral", // TODO: CHECK
			MissingValueStrategy: "locf",
			Timezone:             timezone,
		})

		if err != nil {
			utils.LogError(err, "Error Getting Data for Daily Report Module")
			continue
		}

		// sum up dailly values  form 15m cagg
		for _, v := range history {
			var anyValue interface{} = v[1]
			floatValue, ok := anyValue.(float64)
			if !ok {
				continue
			}
			sum_daily = SumConditional(sum_daily, floatValue, sumAll)
		}

		positive := sumAll > 0
		// get daily data for the past 7 days
		// TODO: timezone??? CAgg is in Europe vienna... might need to work different for other tz
		history_week, err_week := r.FetchIntegratedMeasurements(projectId, measurment_name, seven_day_ago, yesterday_eod, positive)

		if err_week != nil {
			utils.LogError(err, "Error Getting Data for Weekly Report Module")
			continue
		}

		// for every value add to map
		for key, v := range history_week {

			// remove trailing timestamps by not including them in map
			if (yesterday_eod.Unix()+1) == key || (today_bod.Unix()+1) == key || seven_day_ago.Unix() == key {
				continue
			}

			// check if data already exists for given timestamp
			tmpSum, exists := sum_week[key]

			// if not set to 0
			if !exists {
				tmpSum = 0
			}

			sum_week[key] = tmpSum + v
		}
	}

	return measurement_names, sum_daily, sum_week, nil
}

func (r Repository) GetReportDataForBooleanType(projectId, timezone, typeName, mappingKey, userId string) ([]string, float64, map[int64]float64, error) {
	devices, err := data_mapping.ListDataMappingsForProjectByTypeName(r.Database, projectId, typeName, userId)

	if err != nil {
		return nil, 0, nil, err
	}

	measurement_names := []string{}
	sum_daily := 0.0
	sum_week := map[int64]float64{}

	now := time.Now()
	today_bod := utils.BeginningOfDay(now)
	yesterday_eod := utils.EndOfDay(now.Add(time.Hour * -1 * 24))
	seven_day_ago := yesterday_eod.Add(time.Hour * -7 * 24)
	for _, dev := range devices {

		mappings, err := data_mapping.ListMappingsForDataMapping(r.Database, dev.ID)
		if err != nil {
			utils.LogError(err, "")
			continue
		}

		// get measruement name
		measurment_name, exists := mappings[mappingKey]
		if !exists {
			continue

		}

		// apend to list of names for live array
		measurement_names = append(measurement_names, measurment_name)

		history_week, err_week := r.FetchBooleanIncreaseCounterMeasurements(projectId, measurment_name, seven_day_ago)

		if err_week != nil {
			utils.LogError(err, "Error Getting Data for Weekly Report Module (boolean counter)")
			continue
		}

		index := 0
		// for every value add to map
		for key, v := range history_week {
			index += 1

			// if last value add to daily sum
			if today_bod.Unix() == key {
				sum_daily += v
				continue
			}

			// remove trailing timestamps by not including them in map
			if (yesterday_eod.Unix()+1) == key || (today_bod.Unix()+1) == key || seven_day_ago.Unix() == key {
				continue
			}

			// check if data already exists for given timestamp
			tmpSum, exists := sum_week[key]

			// if not set to 0
			if !exists {
				tmpSum = 0
			}

			sum_week[key] = tmpSum + v
		}
	}

	return measurement_names, sum_daily, sum_week, nil
}

func GetSingleAutarchyScore(mpcAddr string, projectId string, pvs, grids, batteries []string, endDate time.Time) (float64, error) {
	params := getAutarchyParams(pvs, batteries, grids)
	mpcResp, err := callMPCAutarchyEnpoint(mpcAddr, projectId, endDate.Add(time.Hour*-7*24), endDate, params)

	if err != nil {
		return 0.0, err
	}

	return mpcResp["autarchy_score"], nil

}

func (Repository) GetAutarchyScoresForLastWeek(mpcAddr string, projectId string, pvs, grids, batteries []string, dates []int64) (map[int64]float64, error) {
	allInvalid := true
	params := getAutarchyParams(pvs, batteries, grids)

	results := map[int64]float64{}
	for _, v := range dates {
		end := time.Unix(v, 0)
		start := end.Add(time.Hour * -1 * 24)
		mpcResp, err := callMPCAutarchyEnpoint(mpcAddr, projectId, start, end, params)

		if err != nil {
			utils.LogError(err, "http error to mpc: ")
			results[end.Unix()] = 0
			// return nil, err
			continue
		}
		allInvalid = false
		results[end.Unix()] = mpcResp["autarchy_score"]

	}

	if allInvalid {
		return nil, fmt.Errorf("No valid autarchy scores")
	}
	return results, nil
}

func getAutarchyParams(pvs []string, batteries []string, grids []string) url.Values {
	params := url.Values{}

	for _, v := range pvs {
		params.Add("pv", v)
	}
	for _, v := range batteries {
		params.Add("battery", v)
	}
	for _, v := range grids {
		params.Add("grid", v)
	}
	return params
}

func callMPCAutarchyEnpoint(mpcAddr string, projectId string, start time.Time, end time.Time, params url.Values) (map[string]float64, error) {
	url := fmt.Sprintf("%s/autarchy/%s/%v/%v?%s", mpcAddr, projectId,
		utils.BeginningOfDay(start).Unix(), utils.BeginningOfDay(end).Unix(),
		params.Encode())
	// TODO add time out
	mpcResp, err := utils.MakeHttpRequestWithTimeout[map[string]float64]("GET", url, nil, nil, false, time.Second*5)
	return mpcResp, err
}

func (r Repository) GetMeasurementsForType(projectId, typeName, mappingKey, userId string) ([]string, error) {
	devices, err := data_mapping.ListDataMappingsForProjectByTypeName(r.Database, projectId, typeName, userId)

	if err != nil {
		return nil, err
	}

	measurement_names := []string{}

	for _, dev := range devices {

		mappings, err := data_mapping.ListMappingsForDataMapping(r.Database, dev.ID)
		if err != nil {
			utils.LogError(err, "")
			continue
		}

		// get measruement name
		measurment_name, exists := mappings[mappingKey]
		if !exists {
			continue

		}
		// apend to list of names for live array
		measurement_names = append(measurement_names, measurment_name)
	}

	return measurement_names, nil
}

// add to sum depending on summ all
func SumConditional(sum, add float64, sumAll int) float64 {
	if sumAll == 0 {
		return sum + add
	}
	if sumAll == 1 && add >= 0 {
		return sum + add
	}
	if sumAll == -1 && add <= 0 {
		return sum + add
	}
	return sum
}
