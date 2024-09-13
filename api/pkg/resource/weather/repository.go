// Package weather is a wrapper for openweathermap and nominatim to
// return the current weather and to search for a location (location name)
// that returns the lat/lon coordinates
// openweathermap api key can be obtained at https://openweathermap.org/price
// nominatim has a public api https://nominatim.org/release-docs/develop/api/Overview/
package weather

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

type Repository struct {
	OpenWeatherAPIKey string
}

// Weather represents a weather response from OpenWeatherMap
// https://openweathermap.org/current (Fields in API response)
type Weather struct {
	Coordinates struct {
		Longitude float32 `json:"lon"`
		Latitude  float32 `json:"lat"`
	} `json:"coord"`
	Weather []struct {
		Id          int    `json:"id"`
		Main        string `json:"main"`
		Description string `json:"description"`
		Icon        string `json:"icon"`
	} `json:"weather"`
	Main struct {
		Temperature    float32 `json:"temp"`
		FeelsLike      float32 `json:"feels_like"`
		TemperatureMax float32 `json:"temp_min"`
		TemperatureMin float32 `json:"temp_max"`
		Pressure       float32 `json:"pressure"`
		Humidity       float32 `json:"humidity"`
	} `json:"main"`
	Wind struct {
		Speed float32 `json:"speed"`
		Deg   float32 `json:"deg"`
	} `json:"wind"`
	Clouds struct {
		Cloudiness int `json:"all"`
	} `json:"clouds"`
	DateTime int64 `json:"dt"`
	Timezone int64 `json:"timezone"`
}

// Location represents a http response from, e.g:
// https://nominatim.openstreetmap.org/search?q=Zurich&format=json
type Location struct {
	Name      string `json:"display_name"`
	Latitude  string `json:"lat"`
	Longitude string `json:"lon"`
}
type GetOptions struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}
type FindOptions struct {
	Query string `json:"query"`
}

// Get weather from openweathermap
func (r Repository) Get(o GetOptions) (Weather, error) {
	u := fmt.Sprintf("https://api.openweathermap.org/data/2.5/weather?lat=%f&lon=%f&appid=%s&units=metric",
		o.Latitude, o.Longitude, r.OpenWeatherAPIKey)
	resp, err := http.Get(u)
	if err != nil {
		return Weather{}, err
	}
	defer resp.Body.Close()

	var w Weather
	err = json.NewDecoder(resp.Body).Decode(&w)
	if err != nil {
		return Weather{}, err
	}

	return w, err
}

type WeatherForecast struct {
	List []Weather `json:"list"`
}

// Get weather from openweathermap
func (r Repository) GetHourForecast(o GetOptions) (WeatherForecast, error) {
	u := fmt.Sprintf("https://api.openweathermap.org/data/2.5/forecast?lat=%f&lon=%f&appid=%s&units=metric",
		o.Latitude, o.Longitude, r.OpenWeatherAPIKey)
	resp, err := http.Get(u)
	if err != nil {
		return WeatherForecast{}, err
	}
	defer resp.Body.Close()

	var w WeatherForecast
	err = json.NewDecoder(resp.Body).Decode(&w)
	if err != nil {
		return WeatherForecast{}, err
	}

	return w, err
}

// Find a list of locations through openstreetmap nomatim query
func (r Repository) Find(o FindOptions) ([]Location, error) {
	getUrl := fmt.Sprintf("https://nominatim.openstreetmap.org/search?q=%s&format=json", url.QueryEscape(o.Query))
	resp, err := http.Get(getUrl)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	locations := make([]Location, 0)
	err = json.NewDecoder(resp.Body).Decode(&locations)
	if err != nil {
		return nil, err
	}

	return locations, nil
}
