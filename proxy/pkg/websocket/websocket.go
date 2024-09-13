package websocket

import (
	"net/http"
	"net/url"
	"time"

	"github.com/efficientIO/efficientIO/proxy/pkg/session"
	"github.com/gorilla/websocket"

	"github.com/efficientIO/efficientIO/api/pkg/utils"
)

// Proxy represents WS Proxy.
type Proxy struct {
	target string
	path   string
	scheme string
	event  session.Handler
}

// New - creates new HTTP proxy
func New(target, path, scheme string, event session.Handler) *Proxy {
	return &Proxy{
		target: target,
		path:   path,
		scheme: scheme,
		event:  event,
	}
}

var upgrader = websocket.Upgrader{
	// Timeout for WS upgrade request handshake
	HandshakeTimeout: 10 * time.Second,
	// Paho JS client expecting header Sec-WebSocket-Protocol:mqtt in Upgrade response during handshake.
	Subprotocols: []string{"mqtt"},
	// Allow CORS
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// Handler - proxies HTTP traffic
func (p Proxy) Handler() http.Handler {
	return p.handle()
}

func (p Proxy) handle() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cconn, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			utils.LogError(err, "")
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		go p.pass(cconn)
	})
}

func (p Proxy) pass(in *websocket.Conn) {
	defer in.Close()

	url := url.URL{
		Scheme: p.scheme,
		Host:   p.target,
		Path:   p.path,
	}

	dialer := &websocket.Dialer{
		Subprotocols: []string{"mqtt"},
	}
	srv, _, err := dialer.Dial(url.String(), nil)

	if err != nil {
		utils.LogError(err, "unable to connect to broker")
		return
	}

	errc := make(chan error, 1)
	c := newConn(in)
	s := newConn(srv)

	defer s.Close()
	defer c.Close()

	session := session.New(c, s, p.event)
	err = session.Stream()
	errc <- err
	l := utils.GetLogger()
	l.Error().Str("client", session.Client.ID).Err(err).Msg("broken connection")
}
