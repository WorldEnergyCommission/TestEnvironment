package invoice

import (
	"database/sql"
	"time"

	"github.com/eneries/eneries/api/pkg/utils"
)

const (
	getQuery  = "SELECT id, user_id, name, description, notes, amount::numeric::float, paid_at, due_at, created_at FROM invoice WHERE id=$1 AND user_id=$2"
	listQuery = "SELECT id, user_id, name, description, notes, amount::numeric::float, paid_at, due_at, created_at FROM invoice WHERE user_id=$1"
)

// Invoice is not used anymore, but still available
// this is the initial invoice stuff
type Invoice struct {
	ID          string     `json:"id"`
	UserID      string     `json:"-"` // user_id is just used internally, it shouldn't be exposed
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Notes       string     `json:"-"`      // admin_note is used internally
	Amount      float64    `json:"amount"` // amount will be in cents so that we can deal in integers instead of floating point
	PaidAt      *time.Time `json:"paid_at"`
	DueAt       time.Time  `json:"due_at"`
	CreatedAt   time.Time  `json:"created_at"`
}

type Repository struct {
	Database *sql.DB
}

type ListOptions struct {
	UserID string `json:"user_id"`
}

type GetOptions struct {
	ID     string `json:"id"`
	UserID string `json:"user_id"`
}

func (r Repository) List(o ListOptions) ([]Invoice, error) {
	invoices := make([]Invoice, 0)

	rows, err := r.Database.Query(listQuery, o.UserID)
	if err != nil {
		return nil, err
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			utils.LogError(err, "")
		}
	}(rows)

	for rows.Next() {
		var (
			paidAt sql.NullTime
			i      Invoice
		)

		if err := rows.Scan(&i.ID, &i.UserID, &i.Name, &i.Description, &i.Notes, &i.Amount, &paidAt, &i.DueAt, &i.CreatedAt); err != nil {
			return nil, err
		}

		if paidAt.Valid {
			i.PaidAt = &paidAt.Time
		}

		invoices = append(invoices, i)
	}

	return invoices, nil
}

func (r Repository) Get(o GetOptions) (Invoice, error) {
	var (
		paidAt sql.NullTime
		i      Invoice
	)

	if err := r.Database.QueryRow(getQuery, o.ID, o.UserID).Scan(&i.ID, &i.UserID, &i.Name, &i.Description, &i.Notes, &i.Amount, &paidAt, &i.DueAt, &i.CreatedAt); err != nil {
		return i, err
	}

	if paidAt.Valid {
		i.PaidAt = &paidAt.Time
	}

	return i, nil
}
