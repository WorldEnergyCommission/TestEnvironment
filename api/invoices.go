package main

import (
	"net/http"

	"github.com/eneries/eneries/api/pkg/resource/invoice"

	"github.com/gorilla/mux"
)

// invoicesGetHandler retrieves an invoice by ID and returns it as a response.
//
//	@Summary      Retrieve an invoice
//	@Description  Retrieve an invoice by ID
//	@Tags         Invoices
//	@Accept       json
//	@Produce      json
//	@Param        invoice_id path string true "Invoice ID"
//	@Success      200 {object} invoice.Invoice "Invoice details"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /invoices/{invoice_id} [get]
func invoicesGetHandler(w http.ResponseWriter, r *http.Request) {
	o := invoice.GetOptions{
		ID:     mux.Vars(r)["invoice_id"],
		UserID: r.Header.Get("x-user"),
	}

	i, err := invoiceRepo.Get(o)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, i)
}

// invoicesListHandler handles the HTTP request to list invoices.
//
//	@Summary      List invoices
//	@Description  List all invoices for a user
//	@Tags         Invoices
//	@Accept       json
//	@Produce      json
//	@Success      200  {object}  []invoice.Invoice "List of invoices"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /invoices [get]
func invoicesListHandler(w http.ResponseWriter, r *http.Request) {
	o := invoice.ListOptions{UserID: r.Header.Get("x-user")}

	invoices, err := invoiceRepo.List(o)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, invoices)
}
