package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"net"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/eneries/eneries/api/pkg/resource/ai"
	"github.com/eneries/eneries/api/pkg/resource/project"
	"github.com/eneries/eneries/api/pkg/utils"

	"github.com/go-resty/resty/v2"
	"github.com/gorilla/mux"
)

type CustomTime time.Time

func (ct *CustomTime) UnmarshalJSON(data []byte) error {
	// Define your custom layout for time parsing
	layout := "2006-01-02T15:04:05.999999"

	// Parse the time using the custom layout
	t, err := time.Parse(layout, string(data[1:len(data)-1]))
	if err != nil {
		return err
	}

	*ct = CustomTime(t)
	return nil
}

type AIController struct {
	ID           string         `json:"id"`
	Name         string         `json:"name"`
	Data         map[string]any `json:"data"`
	Favorite     bool           `json:"favorite"`
	CollectionID string         `json:"collection_id"`
	ProjectID    string         `json:"project_id"`
	CreatedAt    CustomTime     `json:"created_at"`
}

// list all possible ai models for project
func aiListHandler(w http.ResponseWriter, r *http.Request) {
	project_id := mux.Vars(r)["project_id"]
	url := fmt.Sprintf("%s/controllers/%s", envMPCAddr, project_id)
	client := resty.New()

	response, err := client.R().
		Get(url)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}

	var controllers []AIController

	if err := json.Unmarshal(response.Body(), &controllers); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}
	var opts ai.ListOptions
	opts.ProjectID = project_id
	opts.UserID = r.Header.Get("x-user")
	allowedControllers, err := aiRepo.List(opts)

	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	controllersToReturn := make([]AIController, 0)
	for _, controller := range controllers {
		if utils.StringArrayContains(allowedControllers, controller.ID) {
			controllersToReturn = append(controllersToReturn, controller)
		}
	}
	respond(w, 200, controllersToReturn)
}

func aiGetHandler(w http.ResponseWriter, r *http.Request) {
	model_id := mux.Vars(r)["model_id"]
	url := fmt.Sprintf("%s/%s", envMPCAddr, model_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiCreateHandler(w http.ResponseWriter, r *http.Request) {
	url := fmt.Sprintf("%s/controllers", envMPCAddr)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiUpdateHandler(w http.ResponseWriter, r *http.Request) {
	model_id := mux.Vars(r)["model_id"]
	url := fmt.Sprintf("%s/controllers/%s", envMPCAddr, model_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiDeleteHandler(w http.ResponseWriter, r *http.Request) {
	model_id := mux.Vars(r)["model_id"]
	url := fmt.Sprintf("%s/controllers/%s", envMPCAddr, model_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiAddFavoritesHandler(w http.ResponseWriter, r *http.Request) {
	model_id := mux.Vars(r)["model_id"]
	url := fmt.Sprintf("%s/controllers/%s/favorites", envMPCAddr, model_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiDeleteFavoritesHandler(w http.ResponseWriter, r *http.Request) {
	model_id := mux.Vars(r)["model_id"]
	url := fmt.Sprintf("%s/controllers/%s/favorites", envMPCAddr, model_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiSettingsHandler(w http.ResponseWriter, r *http.Request) {
	model_id := mux.Vars(r)["model_id"]
	url := fmt.Sprintf("%s/controllers/%s/settings", envMPCAddr, model_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiAutarchyHandler(w http.ResponseWriter, r *http.Request) {
	project_id := mux.Vars(r)["project_id"]
	start := mux.Vars(r)["start"]
	end := mux.Vars(r)["end"]
	query := r.URL.RawQuery
	url := fmt.Sprintf("%s/autarchy/%s/%s/%s?%s", envMPCAddr, project_id, start, end, query)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiGetWeatherHandler(w http.ResponseWriter, r *http.Request) {
	project_id := mux.Vars(r)["project_id"]
	url := fmt.Sprintf("%s/weather/%s", envMPCAddr, project_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiGetScoreHandler(w http.ResponseWriter, r *http.Request) {
	model_id := mux.Vars(r)["model_id"]
	url := fmt.Sprintf("%s/controllers/%s/score", envMPCAddr, model_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

func aiGetReportHandler(w http.ResponseWriter, r *http.Request) {
	model_id := mux.Vars(r)["model_id"]
	queryValues := r.URL.Query()
	url := fmt.Sprintf("%s/controllers/%s/report", envMPCAddr, model_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url, query: &queryValues})
}

type CreateWeatherHandlerBody struct {
	Latitude  float32 `json:"latitude,omitempty"`
	Longitude float32 `json:"longitude,omitempty"`
	Username  string  `json:"username,omitempty"`
	Password  string  `json:"password,omitempty"`
}

func aiCreateWeatherHandler(w http.ResponseWriter, r *http.Request) {
	project_id := mux.Vars(r)["project_id"]
	url := fmt.Sprintf("%s/weather/%s", envMPCAddr, project_id)

	var opts CreateWeatherHandlerBody
	if err := json.NewDecoder(r.Body).Decode(&opts); err != nil {
		reject(w, r, http.StatusBadRequest, err.Error())
		return
	}

	p_opts := project.GetOptions{ID: project_id, WithSecret: true}
	p, err := projectRepo.Get(p_opts)
	if err != nil {
		reject(w, r, http.StatusInternalServerError, err.Error())
		return
	}

	opts.Username = project_id
	opts.Password = p.Secret

	b, err_b := json.Marshal(opts)
	if err_b != nil {
		reject(w, r, http.StatusInternalServerError, err_b.Error())
		return
	}

	proxyToUrl(ProxyRequest{w: w, req: r, url: url, customBody: true, body: b})
}

func aiDeleteWeatherHandler(w http.ResponseWriter, r *http.Request) {
	project_id := mux.Vars(r)["project_id"]
	url := fmt.Sprintf("%s/weather/%s", envMPCAddr, project_id)
	proxyToUrl(ProxyRequest{w: w, req: r, url: url})
}

type ProxyRequest struct {
	w          http.ResponseWriter
	req        *http.Request
	url        string
	customBody bool
	body       []byte
	query      *url.Values
}

func proxyToUrl(opts ProxyRequest) {
	// https://stackoverflow.com/a/34725635
	// https://gist.github.com/yowu/f7dc34bd4736a65ff28d
	body, err := ioutil.ReadAll(opts.req.Body)
	if err != nil {
		reject(opts.w, opts.req, http.StatusInternalServerError, err.Error())
		return
	}

	var proxyReq *http.Request
	if opts.customBody {
		proxyReq, err = http.NewRequest(opts.req.Method, opts.url, bytes.NewReader(opts.body))
	} else {
		proxyReq, err = http.NewRequest(opts.req.Method, opts.url, bytes.NewReader(body))
	}

	if opts.query != nil {
		q := proxyReq.URL.Query()
		for key, value := range *opts.query {
			for _, v := range value {
				q.Add(key, v)
			}
		}

		proxyReq.URL.RawQuery = q.Encode()
	}

	if err != nil {
		reject(opts.w, opts.req, http.StatusInternalServerError, err.Error())
		return
	}

	proxyReq.Header = opts.req.Header

	delHopHeaders(proxyReq.Header)

	if clientIP, _, err := net.SplitHostPort(opts.url); err == nil {
		appendHostToXForwardHeader(proxyReq.Header, clientIP)
	}

	httpClient := http.Client{}
	resp, err := httpClient.Do(proxyReq)

	if err != nil {
		reject(opts.w, opts.req, http.StatusInternalServerError, err.Error())
		return
	}

	delHopHeaders(resp.Header)
	// manually delte cors header
	resp.Header.Del("Access-Control-Allow-Origin")
	copyHeader(opts.w.Header(), resp.Header)
	opts.w.WriteHeader(resp.StatusCode)
	io.Copy(opts.w, resp.Body)
	defer resp.Body.Close()
}

func copyHeader(dst, src http.Header) {
	for k, vv := range src {
		for _, v := range vv {
			dst.Add(k, v)
		}
	}
}

// Hop-by-hop headers. These are removed when sent to the backend.
// http://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html
var hopHeaders = []string{
	"Connection",
	"Keep-Alive",
	"Proxy-Authenticate",
	"Proxy-Authorization",
	"Te", // canonicalized version of "TE"
	"Trailers",
	"Transfer-Encoding",
	"Upgrade",
}

func delHopHeaders(header http.Header) {
	for _, h := range hopHeaders {
		header.Del(h)
	}
}

func appendHostToXForwardHeader(header http.Header, host string) {
	// If we aren't the first proxy retain prior
	// X-Forwarded-For information as a comma+space
	// separated list and fold multiple headers into one.
	if prior, ok := header["X-Forwarded-For"]; ok {
		host = strings.Join(prior, ", ") + ", " + host
	}
	header.Set("X-Forwarded-For", host)
}
