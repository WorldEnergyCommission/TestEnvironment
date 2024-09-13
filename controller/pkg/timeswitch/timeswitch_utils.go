package timeswitch

import (
	"encoding/json"
	"time"

	mqtt "github.com/eclipse/paho.mqtt.golang"
	"github.com/eneries/eneries/api/pkg/resource/device"
	"github.com/eneries/eneries/api/pkg/resource/measurement"
	"github.com/eneries/eneries/api/pkg/utils"
)

type DeviceData struct {
	Settings DeviceSettings    `json:"settings"`
	Mappings map[string]string `json:"mappings"`
}

type DeviceSettings struct {
	Schedule []ScheduleItem `json:"schedule"`
	IsActive bool           `json:"isActive"`
}

type ITime struct {
	Hours    byte   `json:"hours"`
	Minutes  byte   `json:"minutes"`
	Timezone string `json:"timezone"`
}

type ScheduleItem struct {
	Time       ITime  `json:"time"`
	Action     byte   `json:"action"`
	ActiveDays []bool `json:"activeDays"`
	Index      int    `json:"index"`
}

const timeSwitchOnKey = "TimeSwitch_on"
const timeSwitchOffKey = "TimeSwitch_off"

func HandleTimeSwitchDevices(devices []device.Device, mqttClient *mqtt.Client, measurementRepo *measurement.Repository, variableWrittenCallback func()) {

	for _, dev := range devices {
		timeSwitchData := parseTimeSwitchData(dev)
		if !isTimeSwitchActive(dev, measurementRepo) {
			continue
		}
		for _, item := range timeSwitchData.Settings.Schedule {
			item.runScheduleTask(mqttClient, dev, timeSwitchData, variableWrittenCallback)
		}
	}
}

// checks if the task should run and publish variables
func (item ScheduleItem) runScheduleTask(mqttClient *mqtt.Client, device device.Device, timeSwitchData DeviceData, variableWrittenCallback func()) {
	if !isTimeToRun(item) {
		return
	}
	// send 1s change impulse (with value 1) to variable mapped on/off variable
	go measurement.PublishImpulse(mqttClient, device.ProjectID, timeSwitchData.Mappings[getActionKey(item.Action)], variableWrittenCallback)
}

func isTimeToRun(item ScheduleItem) bool {
	now := time.Now().UTC()
	loc, err := time.LoadLocation(item.Time.Timezone)
	if err != nil {
		utils.LogError(err, "Error parsing timezone")
		return false
	}

	// if current time in selected timezone differs with with scheduled time, skip the task
	if now.In(loc).Hour() != int(item.Time.Hours) ||
		now.In(loc).Minute() != int(item.Time.Minutes) ||
		!item.ActiveDays[now.In(loc).Weekday()] {
		return false
	}
	return true
}

func getActionKey(b byte) string {
	if b == 1 {
		return timeSwitchOnKey
	}
	return timeSwitchOffKey
}

func parseTimeSwitchData(device device.Device) DeviceData {
	// Convert map to json string
	jsonBytes, err := json.Marshal(device.Data)
	if err != nil {
		l := utils.GetLogger()
		l.Fatal().Err(err).Msg("")
	}

	// Convert json bytes to struct
	data := DeviceData{}
	err = json.Unmarshal(jsonBytes, &data)
	if err != nil {
		l := utils.GetLogger()
		l.Fatal().Err(err).Msg("")
	}
	return data
}

func isTimeSwitchActive(device device.Device, measurementRepo *measurement.Repository) bool {
	data := parseTimeSwitchData(device)
	variable := data.Mappings["TimeSwitchControls_onOff"]

	if variable == "" {
		// if variable is not set return settings
		return data.Settings.IsActive
	}

	optionalVariableValue, err := measurementRepo.Get(measurement.GetOptions{
		ProjectID: device.ProjectID,
		Variable:  variable,
	})

	// check if datapoint has value
	if err == nil && utils.HasOptionalValue(optionalVariableValue) {
		dataPoint := utils.GetOptionalValue[measurement.DataPoint](optionalVariableValue)
		// chekc if variable in datapoint has value and is 1
		if utils.HasOptionalValue(dataPoint.Value) && utils.GetOptionalValue[float64](dataPoint.Value) == 1.0 {
			return true
		}
	}

	// default to false
	return false

}
