package utils

import (
	"math"
	"time"
	_ "time/tzdata"

	"github.com/tkuchiki/go-timezone"
)

// GetFloatUnixTimestampFromTime converts a time value into a float64 unix timestamp
func GetFloatUnixTimestampFromTime(value time.Time) float64 {
	return float64(value.UnixNano()) / 1e9
}

// GetTimeFromFloatUnixTimestamp converts a float64 unix timestamp into a time value
func GetTimeFromFloatUnixTimestamp(value float64) time.Time {
	integer, fractional := math.Modf(value)
	return time.Unix(int64(integer), int64(fractional*1e9))
}

// Compare a timezone, defined by its name to another timezone
// Returns true if for the next year, the time is equal
// If one timezone can not be found, returns false and an error
func CompareTimezones(tz1 string, tz2 string) (bool, error) {
	// no need to compare, if name is the same
	if tz1 == tz2 {
		return true, nil
	}

	now := time.Now().Unix()
	equal := true

	// first location
	loc1, err := GetLocation(tz1)
	if err != nil {
		return false, err
	}

	// second location
	loc2, err := GetLocation(tz2)
	if err != nil {
		return false, err
	}

	// loop to compare if date is the same in both timezones
	// 35040 equals 1 year 365days * 24h * 4quarterHours
	for i := 1; i <= 35040; i++ {
		timestamp := int64(now) + int64(i)*int64(15)*int64(60)
		t1 := time.Unix(timestamp, 0).In(loc1)
		t2 := time.Unix(timestamp, 0).In(loc2)

		equal = equal && (t1.Month() == t2.Month()) &&
			(t1.Day() == t2.Day()) &&
			(t1.Year() == t2.Year()) &&
			(t1.Hour() == t2.Hour()) &&
			(t1.Minute() == t2.Minute())
		if !equal {
			break
		}
	}

	return equal, nil
}

// Get a time location using either an timezone name (IANA) or an timezone abbreviation
func GetLocation(timezoneName string) (*time.Location, error) {
	tzInfo, err1 := timezone.New().GetTzAbbreviationInfo(timezoneName)
	// prefer timezone library, since time libaray may include location with multiple timezones
	if err1 == nil {
		loc := time.FixedZone(timezoneName, tzInfo[0].Offset())
		return loc, nil
	}

	loc, err2 := time.LoadLocation(timezoneName)
	if err2 == nil {
		return loc, nil
	}

	// no location found, return error
	return nil, err2
}

// validateTimezone validates the passed timezone string, e.g. ""Europe/Vienna""
func ValidateTimezone(timezoneAbbreviation string) error {
	_, err := GetLocation(timezoneAbbreviation)
	return err
}

func IsOlderThanDays(compareTime time.Time, days int) bool {
	// Get the current time
	currentTime := time.Now()

	// Calculate the duration between the two times
	duration := currentTime.Sub(compareTime)

	// Calculate the duration equivalent to 30 days vb
	thirtyDays := 24 * time.Hour * time.Duration(days)

	// Compare the duration with 30 days
	return duration > thirtyDays
}

func BeginningOfDay(t time.Time) time.Time {
	year, month, day := t.Date()
	return time.Date(year, month, day, 0, 0, 0, 0, t.Location())
}

func EndOfDay(t time.Time) time.Time {
	year, month, day := t.Add(time.Hour * 24).Date()
	return time.Date(year, month, day, 0, 0, 0, 0, t.Location()).AddDate(0, 0, -1)
}
