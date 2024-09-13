package utils

import (
	"errors"
	"regexp"
	"strconv"
	"strings"

	"github.com/google/uuid"
	"golang.org/x/exp/slices"
)

type ShellyInfo struct {
	Id           string
	Name         string
	Generation   int
	User         string
	Category     string
	Manufacturer string
	Model        string
	Phase        int
	Attribute    string
}

// ValidateVariableName checks if the provided name is valid
// checks if the length and the used characters are suitable
func ValidateVariableName(name string) error {
	// variable name can be 60 characters at maximum
	// the empty variable name represents the heartbeat of the project
	if len(name) > 60 {
		return errors.New("variable name too long")
	}
	// https://github.com/cisco/senml/blob/master/senml.go#L465
	// only allow certain characters
	for _, c := range name {
		if (c < 'a' || c > 'z') && (c < 'A' || c > 'Z') && (c < '0' || c > '9') && (c != '.') && (c != '_') {
			return errors.New("bad character")
		}
	}
	// return nil if no violation occurred
	return nil
}

// GetProjectIdFromTopic returns the project id from an mqtt topic with error handling
func GetProjectIdFromTopic(topic string) (string, error) {
	stringParts := strings.Split(topic, "/")
	if len(stringParts) != 3 {
		return "", errors.New("invalid topic format")
	}
	projectIdString := stringParts[1]
	_, err := uuid.Parse(projectIdString)
	if err != nil {
		return "", errors.New("invalid project id format")
	}
	return projectIdString, nil
}

// IsShellyTopic checks if it is a shelly topic
func IsShellyTopic(topic string) bool {
	return strings.HasPrefix(topic, "shellies") || strings.Contains(topic, "shelly")
}

// GetShellyInfoFromTopic should get the ShellyInfo from a shelly topic
func GetShellyInfoFromTopic(topic string) (ShellyInfo, error) {
	var generation int
	// check if it is a shelly topic
	if !IsShellyTopic(topic) {
		return ShellyInfo{}, errors.New("not a shelly topic")
	}
	// check the amount of parts in the topic
	topicParts := strings.Split(topic, "/")
	if !slices.Contains([]int{10, 11}, len(topicParts)) {
		return ShellyInfo{}, errors.New("topic has the wrong structure")
	}
	// add the attribute as last topic part
	if len(topicParts) == 10 {
		topicParts = append(topicParts, "")
	} else {
		if !slices.Contains([]string{"power", "energy"}, topicParts[10]) {
			return ShellyInfo{}, errors.New("not supported attribute")
		}
	}
	// check the first part
	if topicParts[0] != "shellies" {
		return ShellyInfo{}, errors.New("topic has the wrong prefix")
	}
	// check the generation
	supportedGenerations := []string{"gen1", "gen2"}
	if !slices.Contains(supportedGenerations, topicParts[3]) {
		return ShellyInfo{}, errors.New("specified generation is not supported")
	} else {
		if topicParts[3] == supportedGenerations[0] {
			generation = 1
		} else {
			generation = 2
		}
	}
	// check the relay
	if topicParts[8] != "relay" {
		return ShellyInfo{}, errors.New("topic is not structured right")
	}
	// check the passed phase
	phase, err := strconv.Atoi(topicParts[9])
	if err != nil {
		return ShellyInfo{}, errors.New("the passed phase is no number")
	}
	// check the passed user, category, manufacturer and model
	if len(topicParts[2]) == 0 || len(topicParts[4]) == 0 || len(topicParts[5]) == 0 || len(topicParts[6]) == 0 || len(topicParts[7]) == 0 {
		return ShellyInfo{}, errors.New("shelly model, user, category, manufacturer and model must be non-empty strings")
	}
	// check the shelly identifiers
	isMatch := false
	if generation == 1 && len(topicParts[1]) == 6 {
		isMatch, err = regexp.MatchString("[a-zA-Z0-9]{6}", topicParts[1])
	}
	if generation == 2 && len(topicParts[1]) == 12 {
		isMatch, err = regexp.MatchString("[a-zA-Z0-9]{12}", topicParts[1])
	}
	if err != nil || !isMatch {
		return ShellyInfo{}, errors.New("the provided identifier has the wrong format")
	}
	// if all checks have passed, the shelly information can be used
	return ShellyInfo{
		Id: topicParts[1], Name: topicParts[2], Generation: generation,
		User: topicParts[4], Category: topicParts[5], Manufacturer: topicParts[6],
		Model: topicParts[7], Phase: phase, Attribute: topicParts[10]}, nil
}
