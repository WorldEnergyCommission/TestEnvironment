package main

import (
	"encoding/json"
	"net/http"

	"github.com/eneries/eneries/api/pkg/resource/notification"
)

func notificationsCreateHandler(w http.ResponseWriter, r *http.Request) {
	var o notification.SendOptions
	if err := json.NewDecoder(r.Body).Decode(&o); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	if err := notificationRepo.Send(o); err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
	}
}
