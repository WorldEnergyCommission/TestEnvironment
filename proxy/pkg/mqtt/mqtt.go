package mqtt

import (
	"io"
	"net"

	"github.com/eneries/eneries/api/pkg/utils"
	"github.com/eneries/eneries/proxy/pkg/session"
)

// Proxy is main MQTT proxy struct
type Proxy struct {
	address string
	target  string
	handler session.Handler
	dialer  net.Dialer
}

// New returns a new mqtt Proxy instance.
func New(address, target string, handler session.Handler) *Proxy {
	return &Proxy{
		address: address,
		target:  target,
		handler: handler,
	}
}

func (p Proxy) accept(l net.Listener) {
	logger := utils.GetLogger()
	for {
		conn, err := l.Accept()
		if err != nil {
			utils.LogError(err, "accept error")
			continue
		}

		logger.Debug().Msg("accepted new client")
		go p.handle(conn)
	}
}

func (p Proxy) handle(inbound net.Conn) {
	defer p.close(inbound)
	outbound, err := p.dialer.Dial("tcp", p.target)
	if err != nil {
		l := utils.GetLogger()
		l.Error().Err(err).Str("target", p.target).Msg("cannot connect to broker")
		return
	}
	defer p.close(outbound)

	s := session.New(inbound, outbound, p.handler)

	if err = s.Stream(); err != nil && err != io.EOF {
		l := utils.GetLogger()
		l.Error().Err(err).Str("client", s.Client.ID).Msg("broken connection for client")
	}
}

// Proxy of the server, this will block.
func (p Proxy) Proxy() error {
	l, err := net.Listen("tcp", p.address)
	if err != nil {
		return err
	}
	defer l.Close()

	// Acceptor loop
	p.accept(l)

	logger := utils.GetLogger()
	logger.Info().Msg("server exiting...")
	return nil
}

func (p Proxy) close(conn net.Conn) {
	if err := conn.Close(); err != nil {
		utils.LogError(err, "error closing connection")
	}
}
