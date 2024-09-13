package main

import (
	"testing"
	"time"

	"github.com/eneries/eneries/api/pkg/resource/rule"
)

const (
	tz = "Europe/Vienna"
)

var (
	wholeDayTime = rule.ITime{
		Minutes: 0,
		Hours:   0,
	}
	ruleWholeDay = MonitoredRule{
		Rule: rule.Rule{
			Schedule: []rule.ScheduleItem{{
				TimeFrom:   wholeDayTime,
				TimeTo:     wholeDayTime,
				Timezone:   tz,
				ActiveDays: []bool{true, true, true, true, true, true, true},
			}},
		}}
)

func TestEmptySchedule(t *testing.T) {
	ruleEmpty := MonitoredRule{Rule: rule.Rule{
		Schedule: []rule.ScheduleItem{},
	}}

	if active, _ := ruleEmpty.isScheduledActiveNow(); !active {
		t.Fatalf(`empty schedule should always run.`)
	}
}

func TestWholeDayRuleSchedule(t *testing.T) {
	if active, _ := ruleWholeDay.isScheduledActiveNow(); !active {
		t.Fatalf(`whole day schedule should run every time.`)
	}
}

func TestDisabledDay(t *testing.T) {
	ruleDisabledDay := ruleWholeDay
	ruleDisabledDay.Rule.Schedule = nil
	ruleDisabledDay.Rule.Schedule = append(ruleDisabledDay.Rule.Schedule, ruleWholeDay.Rule.Schedule...)

	ruleDisabledDay.Rule.Schedule[0].ActiveDays[time.Now().Weekday()] = false

	if active, _ := ruleDisabledDay.isScheduledActiveNow(); active {
		t.Fatalf(`rules should not run on disabled days.`)
	}
}

func TestActiveTime(t *testing.T) {
	loc, _ := time.LoadLocation(tz)
	now := time.Now().In(loc)
	ruleActiveTime := MonitoredRule{Rule: rule.Rule{
		Schedule: []rule.ScheduleItem{{
			TimeFrom:   rule.ITime{Hours: now.Hour(), Minutes: now.Minute() - 2},
			TimeTo:     rule.ITime{Hours: now.Hour(), Minutes: now.Minute() + 2},
			Timezone:   tz,
			ActiveDays: []bool{true, true, true, true, true, true, true},
		}},
	}}

	if active, _ := ruleActiveTime.isScheduledActiveNow(); !active {
		t.Fatalf(`rules should run when time range is active.`)
	}
}

func TestInactiveTime(t *testing.T) {
	loc, _ := time.LoadLocation(tz)
	now := time.Now().In(loc)
	ruleInactiveTime := MonitoredRule{Rule: rule.Rule{
		Schedule: []rule.ScheduleItem{{
			TimeFrom:   rule.ITime{Hours: now.Hour(), Minutes: now.Minute() + 2},
			TimeTo:     rule.ITime{Hours: now.Hour(), Minutes: now.Minute() + 4},
			Timezone:   tz,
			ActiveDays: []bool{true, true, true, true, true, true, true},
		}},
	}}

	if active, _ := ruleInactiveTime.isScheduledActiveNow(); active {
		t.Fatalf(`rule should not run when time range is not suitable.`)
	}
}
