package rule

import (
	"errors"
	"github.com/efficientIO/efficientIO/api/pkg/utils"
	"net"
	"net/http"
	"net/url"
	"regexp"
	"time"
)

type ValidateOptions = UpdateOptions

func Validate(o ValidateOptions) error {
	if o.Timeout < 0 {
		return errors.New("timeout cannot be less than 0 seconds")
	}

	if o.Timeout > int64(1*time.Hour*24*7) {
		return errors.New("timeout cannot be greater than 1 week")
	}

	if len(o.Name) == 0 || len(o.Name) > 50 {
		return errors.New("name must be between 1 to 50 characters")
	}

	if len(o.ProjectID) != 36 {
		return errors.New("project_id must have 36 characters and be a uuid")
	}

	if len(o.Conditions) == 0 || len(o.Actions) == 0 {
		return errors.New("there must at least be 1 action and 1 condition")
	}

	if len(o.Conditions) > 5 {
		return errors.New("there must not be more than 5 conditions")
	}

	if len(o.Actions) > 5 {
		return errors.New("there must not be more than 5 actions")
	}

	for _, c := range o.Conditions {
		if err := c.Validate(); err != nil {
			return err
		}
	}

	for _, a := range o.Actions {
		if err := a.Validate(); err != nil {
			return err
		}
	}

	return nil
}

func (c *Condition) Validate() error {
	if len(c.Variable) == 0 || utils.ValidateVariableName(c.Variable) != nil {
		return errors.New("variable name is not supported")
	}

	if !(c.Condition == ConditionLess ||
		c.Condition == ConditionLessEquals ||
		c.Condition == ConditionEquals ||
		c.Condition == ConditionNotEquals ||
		c.Condition == ConditionGreaterEquals ||
		c.Condition == ConditionGreater) {
		return errors.New("invalid condition")
	}

	return nil
}

// https://golangcode.com/validate-an-email-address/
var emailRegex = regexp.MustCompile("^[a-zA-Z0-9.!#$%&'*+\\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$")

// Validate email action
func (e *Email) Validate() error {
	if len(e.Recipients) == 0 || len(e.Recipients) > 10 {
		return errors.New("there needs to be between 1 and 10 recipients")
	}

	for _, recipient := range e.Recipients {
		if !isEmailValid(recipient) {
			return errors.New("email is invalid")
		}
	}

	if len(e.Subject) > 256 {
		return errors.New("subject must not be larger than 256 characters")
	}

	if len(e.Body) > 1000 {
		return errors.New("subject must not be larger than 1000 characters")
	}

	return nil
}

// Validate webhook
func (w *Webhook) Validate() error {
	if !(w.Method == http.MethodPost || w.Method == http.MethodPut || w.Method == http.MethodGet ||
		w.Method == http.MethodDelete || w.Method == http.MethodPatch) {
		return errors.New("invalid http method, allowed: POST, PUT, GET, DELETE, PATCH")
	}

	if len(w.Body) > 1000 {
		return errors.New("body must not be larger than 1000 characters")
	}

	if len(w.URL) == 0 || len(w.URL) > 256 {
		return errors.New("url must not be larger than 256 characters")
	}

	for k, v := range w.Headers {
		// key
		if len(k) == 0 || len(k) > 100 {
			return errors.New("header name must be between 1 and 100 characters")
		}
		// value
		if len(v) == 0 || len(v) > 1000 {
			return errors.New("header value must be between 1 and 1000 characters")
		}
	}

	// this validates the URL and checks that it's IP is not internal
	u, err := url.Parse(w.URL)
	if err != nil {
		return err
	}

	ips, err := net.LookupIP(u.Host)
	if err != nil {
		return err
	}
	for _, ip := range ips {
		if isPrivateIP(ip) {
			return errors.New("private ip")
		}
	}

	return nil
}

func (a *Alert) Validate() error {
	if len(a.Body) == 0 || len(a.Body) > 200 {
		return errors.New("body must not be larger than 200 characters")
	}

	// 0 = OK, 1 = WARNING, 2 = ERROR
	if a.Type < 0 || a.Type > 2 {
		return errors.New("invalid type")
	}

	return nil
}

func (a *Action) Validate() error {
	if len(a.Type) == 0 {
		return errors.New("an action type must be supplied")
	}

	switch a.Type {
	case TypeEmail:
		e := Email{
			Recipients: a.Params.Recipients,
			Subject:    a.Params.Subject,
			Body:       a.Params.Body,
		}

		if err := e.Validate(); err != nil {
			return err
		}
		return nil
	case TypeWebhook:
		w := Webhook{
			URL:     a.Params.URL,
			Method:  a.Params.Method,
			Headers: a.Params.Headers,
			Body:    a.Params.Body,
		}
		if err := w.Validate(); err != nil {
			return err
		}
		return nil
	case TypeAlert:
		e := Alert{
			Type: a.Params.Type,
			Body: a.Params.Body,
		}

		if err := e.Validate(); err != nil {
			return err
		}
		return nil
	default:
		return errors.New("invalid action type")
	}
}

func isEmailValid(e string) bool {
	if len(e) < 3 && len(e) > 254 {
		return false
	}
	return emailRegex.MatchString(e)
}

// isPrivateIP checks whether an IP is local
func isPrivateIP(ip net.IP) bool {
	if ip.IsLoopback() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}

	for _, cidr := range []string{
		"127.0.0.0/8",    // IPv4 loopback
		"10.0.0.0/8",     // RFC1918
		"172.16.0.0/12",  // RFC1918
		"192.168.0.0/16", // RFC1918
		"169.254.0.0/16", // RFC3927 link-local
		"::1/128",        // IPv6 loopback
		"fe80::/10",      // IPv6 link-local
		"fc00::/7",       // IPv6 unique local addr
	} {
		_, block, err := net.ParseCIDR(cidr)
		if err == nil {
			if block.Contains(ip) {
				return true
			}
		}
	}
	return false
}
