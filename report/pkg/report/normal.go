package report

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"time"

	"github.com/eneries/eneries/api/pkg/utils"
	"github.com/eneries/eneries/report/pkg/pdf"
)

type (
	NormalVariable struct {
		Title    string
		Name     string
		Start    float64
		End      float64
		Diff     float64
		Unit     string
		Cost     float64
		Currency string
	}

	NormalResult struct {
		Name      string
		Street    string
		City      string
		Country   string
		ImageUrl  string
		Start     time.Time
		End       time.Time
		Variables []NormalVariable
	}

	Normal struct {
		result *NormalResult
		report *Report
	}
)

// Normal report
func (r *Report) Normal(staticAssets string) (*Normal, error) {
	result := NormalResult{
		Name:    r.Name,
		Street:  r.Address.Street,
		City:    r.Address.City,
		Country: r.Address.Country,
		Start:   r.Start,
		End:     r.End,
	}

	// TODO: Goroutines
	// for each variable calculate difference: now-old
	for _, v := range r.Variables {
		variable := NormalVariable{
			Title:    v.Title,
			Name:     v.Name,
			Unit:     v.Unit,
			Cost:     v.UnitCost,
			Currency: r.Currency,
		}

		val, _, err := getMeasurement(r.db, r.ProjectID, v.Name, r.Start)
		if err != nil {
			return nil, err
		}
		variable.Start = val

		val, _, err = getMeasurement(r.db, r.ProjectID, v.Name, r.End)
		if err != nil {
			return nil, err
		}
		variable.End = val

		variable.Diff = math.Abs(variable.End - variable.Start)
		variable.Cost = variable.Diff * v.UnitCost

		result.Variables = append(result.Variables, variable)
	}

	// set timezone stuff
	tz, err := time.LoadLocation(r.Timezone)
	if err != nil {
		return nil, err
	}
	result.Start = result.Start.In(tz)
	result.End = result.End.In(tz)

	if reportImageId, err := r.getReportImageId(); r.Meta.ShowReportImage && err == nil {
		result.ImageUrl = staticAssets + reportImageId
	}

	return &Normal{
		result: &result,
		report: r,
	}, nil
}

// getMeasurement returns a measurement from the database (it searches at max 7 days back from the specified ts)
func getMeasurement(db *sql.DB, projectID string, variableName string, ts time.Time) (float64, time.Time, error) {
	var val float64
	rows, err := db.Query("SELECT value, time FROM measurements WHERE "+
		"variable=(SELECT id FROM measurements_meta WHERE project=$1 AND "+
		"variable=$2) AND time <= $3 AND time >= ($3 - INTERVAL '7 DAY') "+
		"ORDER BY time DESC LIMIT 1", projectID, variableName, ts)
	if err != nil {
		return 0, time.Time{}, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if !rows.Next() {
		return 0, ts, nil
	}
	err = rows.Scan(&val, &ts)
	if err != nil {
		return 0, ts, err
	}
	return val, ts, err
}

func (r *Report) getReportImageId() (string, error) {

	var meta []byte

	rows, err := r.db.Query("SELECT meta FROM project WHERE id=$1", r.ProjectID)
	if err != nil {
		return "", err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	if !rows.Next() {
		return "", err
	}
	err = rows.Scan(&meta)
	if err != nil {
		return "", err
	}

	var jsonData map[string]interface{}
	err = json.Unmarshal(meta, &jsonData)
	if err != nil {
		return "", err
	}

	switch id := jsonData["reportImageId"].(type) {
	case string:
		return id, nil
	default:
		return "", err
	}
}

// CSV formatting
func (n *Normal) CSV() ([]byte, error) {
	str := "variable;name;start;end;diff;price;currency\n"
	for _, v := range n.result.Variables {
		str += fmt.Sprintf("%s;%s;%.2f;%.2f;%.2f;%.2f;%s\n",
			v.Name, v.Title, v.Start, v.End, v.Diff, v.Cost, v.Currency)
	}

	return []byte(str), nil
}

// JSON formatting
func (n *Normal) JSON() ([]byte, error) {
	return json.Marshal(&n.result)
}

// PDF formatting
func (n *Normal) PDF() ([]byte, error) {
	return pdf.Create("normal.html", &n.result)
}
