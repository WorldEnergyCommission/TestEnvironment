package rule

type ScheduleItem struct {
	TimeFrom   ITime  `json:"timeFrom"`
	TimeTo     ITime  `json:"timeTo"`
	Timezone   string `json:"timezone"`
	ActiveDays []bool `json:"activeDays"`
}

type ITime struct {
	Minutes int `json:"minutes"`
	Hours   int `json:"hours"`
}
