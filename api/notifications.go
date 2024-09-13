package main

import (
	"encoding/json"
	"github.com/efficientIO/efficientIO/api/pkg/resource/notification"
	"net/http"
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
