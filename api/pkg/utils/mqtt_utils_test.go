package utils

import (
	"testing"
)

func TestGetShellyInfoFromTopic(t *testing.T) {
	var err error
	_, err = GetShellyInfoFromTopic("shellies/30c6f7816130/shelly_pro_1_pm/gen2/hannes/tv/samsung/q65c/relay/0")
	if err != nil {
		t.Error("error should be nil")
	}
	_, err = GetShellyInfoFromTopic("shellies/e3135c/shelly_plug/gen1/hannes/tv/samsung/q65c/relay/0")
	if err != nil {
		t.Error("error should be nil")
	}
	_, err = GetShellyInfoFromTopic("shellies/e3135c/shelly_plug/gen1/hannes/tv/samsung/q65c/relay/0/power")
	if err != nil {
		t.Error("error should be nil")
	}
	_, err = GetShellyInfoFromTopic("shellies/e3135c/shelly_plug/gen1/hannes/tv/samsung/q65c/relay/0/energy")
	if err != nil {
		t.Error("error should be nil")
	}
	_, err = GetShellyInfoFromTopic("shellies/e31356c/shelly_plug/gen1/hannes/tv/samsung/q65c/relay/0/energy")
	if err == nil {
		t.Error("error should not be nil")
	}
	_, err = GetShellyInfoFromTopic("shellies/e3135c/shelly_plug/gen1//tv/samsung/q65c/relay/0/energy")
	if err == nil {
		t.Error("error should not be nil")
	}
	_, err = GetShellyInfoFromTopic("shellies/e3135c/shelly_plug/gen1/hannes/tv/samsung/q65c/relay/0/energies")
	if err == nil {
		t.Error("error should not be nil")
	}
	_, err = GetShellyInfoFromTopic("shellies/e3135c/shelly_plug/gen5/hannes/tv/samsung/q65c/relays/0/energy")
	if err == nil {
		t.Error("error should not be nil")
	}
	_, err = GetShellyInfoFromTopic("shelly/e3135c/shelly_plug/gen1/hannes/tv/samsung/q65c/relay/0/energy")
	if err == nil {
		t.Error("error should not be nil")
	}
	_, err = GetShellyInfoFromTopic("shelly/e3135c/shelly_plug/gen1/hannes/tv/samsung/q65c/relay/first/energy")
	if err == nil {
		t.Error("error should not be nil")
	}
	_, err = GetShellyInfoFromTopic("shelly/e3135c/shelly_plug/hannes/tv/samsung/q65c/relay/0/energy")
	if err == nil {
		t.Error("error should not be nil")
	}
	_, err = GetShellyInfoFromTopic("shelly/e3135c/shelly_plug/gen1/hannes/tv/samsung/q65c/relay/0/")
	if err == nil {
		t.Error("error should not be nil")
	}
}
