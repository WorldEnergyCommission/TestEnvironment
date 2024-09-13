package utils

// NotFoundError should be returned whenever the requested resource was not found in the data source
type NotFoundError struct{}

func (e NotFoundError) Error() string {
	return "the requested resource was not found"
}

type NotAuthorizedError struct{}

func (e NotAuthorizedError) Error() string {
	return "not authorized for the requested resource"
}

type NotValidError struct {
}

func (e NotValidError) Error() string {
	return "the resource is not valid"

}
