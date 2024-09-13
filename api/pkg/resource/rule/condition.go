package rule

const (
	ConditionLess          = "less"
	ConditionLessEquals    = "less_equals"
	ConditionEquals        = "equals"
	ConditionNotEquals     = "not_equals"
	ConditionGreaterEquals = "greater_equals"
	ConditionGreater       = "greater"
)

type Condition struct {
	Variable  string  `json:"variable"`
	AndOr     bool    `json:"and_or"`
	Condition string  `json:"condition"`
	Target    float64 `json:"target"`
}
