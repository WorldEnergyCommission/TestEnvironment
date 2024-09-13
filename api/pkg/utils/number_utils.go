package utils

import (
	"fmt"
	"reflect"
)

func TryConversionToFloat64(value any) (float64, error) {
	var boolType = reflect.TypeOf(false)
	if reflect.TypeOf(value) == boolType {
		if value == true {
			return 1, nil
		} else {
			return 0, nil
		}
	}
	var floatType = reflect.TypeOf(float64(0))
	v := reflect.ValueOf(value)
	v = reflect.Indirect(v)
	if !v.Type().ConvertibleTo(floatType) {
		return 0, fmt.Errorf("cannot convert type %v to type %v", v.Type(), floatType)
	}
	fv := v.Convert(floatType)
	return fv.Float(), nil
}
