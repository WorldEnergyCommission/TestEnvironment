// go test ./... -coverprofile coverage.out && go tool cover -html=coverage.out && rm coverage.out
package icon_test

import (
	"bytes"
	"io/ioutil"
	"net/http"
	"testing"

	"github.com/eneries/eneries/api/pkg/resource/icon"
)

type MockClient struct {
	MockDo func(req *http.Request) (*http.Response, error)
}

func (m *MockClient) Do(req *http.Request) (*http.Response, error) {
	return m.MockDo(req)
}

func TestRepository_List(t *testing.T) {
	repo := icon.Repository{}
	mockResp := `{"icons": [{"id": "1", "term": "house"}]}`
	r := ioutil.NopCloser(bytes.NewReader([]byte(mockResp)))

	icon.Client = &MockClient{
		MockDo: func(req *http.Request) (*http.Response, error) {
			return &http.Response{
				StatusCode: 200,
				Body:       r,
			}, nil
		},
	}

	icons, err := repo.List(icon.ListOptions{Query: "house"})
	if err != nil {
		t.Error(err.Error())
		return
	}

	t.Logf("%v\n", icons)

}
