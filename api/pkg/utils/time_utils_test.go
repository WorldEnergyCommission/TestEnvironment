package utils

import (
	"testing"
)

func TestGetLocation_EuropeVienna(t *testing.T) {
	location, err := GetLocation("Europe/Vienna")

	if err != nil {
		t.Error(err.Error())
		return
	}

	if location.String() != "Europe/Vienna" {
		t.Error("Wrong location!")
		return
	}
}

func TestCompareTimezones_Vienna_CET(t *testing.T) {
	equal, err := CompareTimezones("Europe/Vienna", "CET")

	if err != nil {
		t.Error(err.Error())
		return
	}

	if equal {
		t.Error("Timezones \"Europe/Vienna\" and \"CET\" should not be equal!")
		return
	}
}

func TestCompareTimezones_Vienna_Berlin(t *testing.T) {
	equal, err := CompareTimezones("Europe/Vienna", "Europe/Berlin")

	if err != nil {
		t.Error(err.Error())
		return
	}

	if !equal {
		t.Error("Timezones \"Europe/Vienna\" and \"Europe/Berlin\" should be equal!")
		return
	}
}
