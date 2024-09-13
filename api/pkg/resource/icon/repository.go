package icon

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/dghubble/oauth1"
)

// HTTPClient interface is an abstraction for testing
type HTTPClient interface {
	Do(req *http.Request) (*http.Response, error)
}

var Client HTTPClient

func init() {
	Client = &http.Client{}
}

type Repository struct{}
type Icon struct {
	ID   string `json:"id"`
	Term string `json:"term"`
}
type ListOptions struct {
	Query string `json:"query"`
}

// List does an API request to thenounproject to get images from there
func (r Repository) List(o ListOptions) ([]Icon, error) {
	url := fmt.Sprintf("https://api.thenounproject.com/v2/icon?query=%s&limit=40", o.Query)

	config := oauth1.NewConfig("c00d1ebc4d134a94b5967f4d1e6b900b", "27b5fe336077406b910eb23bb5b9e737")
	token := oauth1.NewToken("", "")

	httpClient := config.Client(oauth1.NoContext, token)

	resp, err := httpClient.Get(url)
	if err != nil {
		return nil, err
	}

	if resp.StatusCode != 200 {
		return nil, fmt.Errorf("Got unexpected response from thenounproject. Status: ", resp.StatusCode, "Resp:", resp)
	}

	defer resp.Body.Close()
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	// when there are errors, it answers with html
	if body[0] == '<' {
		return make([]Icon, 0), nil
	}

	var response struct {
		Icons []Icon `json:"icons"`
	}

	if err := json.Unmarshal(body, &response); err != nil {
		return nil, err
	}

	return response.Icons, nil
}
