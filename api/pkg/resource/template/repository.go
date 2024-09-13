// template is currently unused/WIP
package template // todo rename

// templates can only be deleted when no project uses the template
// templates also cannot be edited (devices, rooms, members, variables)
// you can upgrade a project template
// calculation goes as follows to check
type Template struct {
	ID        string `json:"id"`
	Price     int    `json:"price"` // price in cents or what???
	Name      string `json:"name"`
	Variables int    `json:"variables"`
	Devices   int    `json:"devices"`
	Rooms     int    `json:"rooms"`
	Members   int    `json:"members"`
}
