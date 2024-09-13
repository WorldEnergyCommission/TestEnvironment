package rule

const (
	TypeEmail   = "email"
	TypeWebhook = "webhook"
	TypeAlert   = "alert"
)

type Action struct {
	Type   string `json:"type"`
	Params Params `json:"params"`
}

type Email struct {
	Recipients []string
	Subject    string
	Body       string
}

type Webhook struct {
	URL     string
	Method  string
	Headers map[string]string
	Body    string
}

type Alert struct {
	Type int
	Body string
}

// Params is used for parsing and later for validation
type Params struct {
	// email specific
	Recipients []string `json:"recipients,omitempty"`
	Subject    string   `json:"subject,omitempty"`

	// webhook specific
	URL     string            `json:"url,omitempty"`
	Method  string            `json:"method,omitempty"`
	Headers map[string]string `json:"headers,omitempty"`

	// event specific
	Type      int    `json:"type,omitempty"`
	ProjectID string `json:"project,omitempty"`

	// sms specific
	Recipient string `json:"recipient,omitempty"`

	Body string `json:"body,omitempty"`
}
