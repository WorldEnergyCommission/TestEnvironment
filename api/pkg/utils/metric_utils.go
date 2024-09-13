package utils

import "strconv"

func CreateVariableAndMeasurementMetrics(application string, measurementsCreated int64, variablesCreated int64) string {
	response := "# HELP " + application + "_measurements_total Total recorded measurements\n"
	response += "# TYPE " + application + "_measurements_total counter\n"
	response += application + "_measurements_total " + strconv.FormatInt(measurementsCreated, 10) + "\n"
	response += "# HELP " + application + "_variables_total Total created variables\n"
	response += "# TYPE " + application + "_variables_total counter\n"
	response += application + "_variables_total " + strconv.FormatInt(variablesCreated, 10) + "\n"
	return response
}

func CreateVariablesWrittenMetrics(application string, variablesWritten int64) string {
	response := "# HELP " + application + "_variables_written_total Total written variables\n"
	response += "# TYPE " + application + "_variables_written_total counter\n"
	response += application + "variables_written_total " + strconv.FormatInt(variablesWritten, 10) + "\n"
	return response
}
