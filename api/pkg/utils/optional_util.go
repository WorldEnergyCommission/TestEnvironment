package utils

type Optional[T any] struct {
	value    T
	hasValue bool
}

// HasOptionalValue returns if the optional contains a value
func HasOptionalValue[T any](optional Optional[T]) bool {
	return optional.hasValue
}

// GetOptionalValue returns the value in the optional
func GetOptionalValue[T any](optional Optional[T]) T {
	return optional.value
}

// FilledOptional creates an optional with a passed value
func FilledOptional[T any](value T) Optional[T] {
	return Optional[T]{value: value, hasValue: true}
}

// EmptyOptional creates an optional with a zero value
func EmptyOptional[T any]() Optional[T] {
	return Optional[T]{value: GetZeroValue[T](), hasValue: false}
}
