package main

import (
	"net/http"
	"strconv"

	"github.com/eneries/eneries/api/pkg/resource/weather"
)

// weatherGetHandler retrieves weather information based on latitude and longitude.
//
//	@Summary      Get weather information
//	@Description  Retrieves weather information based on latitude and longitude.
//	@Tags         Weather
//	@Accept       json
//	@Param        lat query number true "Latitude"
//	@Param        lon query number true "Longitude"
//	@Security     OAuth2Application[readWeather]
//	@Produce      json
//	@Success      200  {object}  weather.Weather "Weather information"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /weather [get]
func weatherGetHandler(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 32)
	lon, _ := strconv.ParseFloat(r.URL.Query().Get("lon"), 32)

	res, err := weatherRepo.Get(weather.GetOptions{
		Latitude:  lat,
		Longitude: lon,
	})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, &res)
}

// weatherGetForecastHandler retrieves the hour forecast for a given latitude and longitude.
//
//	@Summary      Get weather forecast
//	@Description  Retrieves the hour forecast for a given latitude and longitude.
//	@Tags         Weather
//	@Accept       json
//	@Param        lat query number true "Latitude of the location"
//	@Param        lon query number true "Longitude of the location"
//	@Security     OAuth2Application[readWeather]
//	@Produce      json
//	@Success      200  {object}  weather.WeatherForecast "Hourly forecast"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /weather/forecast [get]
func weatherGetForecastHandler(w http.ResponseWriter, r *http.Request) {
	lat, _ := strconv.ParseFloat(r.URL.Query().Get("lat"), 32)
	lon, _ := strconv.ParseFloat(r.URL.Query().Get("lon"), 32)

	res, err := weatherRepo.GetHourForecast(weather.GetOptions{
		Latitude:  lat,
		Longitude: lon,
	})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, &res)
}

// weatherPlaceGetHandler handles the GET request for weather place.
//
//	@Summary      Get weather place
//	@Description  Get weather place based on the query parameter
//	@Tags         Weather
//	@Accept       json
//	@Param        q query string true "The query parameter for weather place"
//	@Security     OAuth2Application[readWeather]
//	@Produce      json
//	@Success      200  {object}  []weather.Location "List of weather locations"
//	@Failure      400  {object}  map[string]any "Bad request"
//	@Failure      401  {object}  map[string]any "Unauthorized"
//	@Failure      500  {object}  map[string]any "Internal server error"
//	@Router       /weather/place [get]
func weatherPlaceGetHandler(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	if len(q) < 3 {
		reject(w, r, http.StatusBadRequest, "q must be at least 3 characters")
		return
	}

	locations, err := weatherRepo.Find(weather.FindOptions{Query: q})
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	respond(w, http.StatusOK, locations)
}
