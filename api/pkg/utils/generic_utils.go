package utils

// GetZeroValue returns the zero value for an arbitrary type
func GetZeroValue[T any]() T {
	return *new(T)
}
