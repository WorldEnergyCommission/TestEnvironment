package pdf

import (
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"os"
	"os/exec"
	"time"
)

// Create pdf
// name: normal/zev
// This runs headless chromium (see dockerfile) with the "--print-to-pdf" flag
// Create temporary html file and serve it -> headless chrome saves it as pdf -> read file and return
func Create(name string, data any) ([]byte, error) {
	now := time.Now().UnixNano()
	htmlName := fmt.Sprintf("%d.html", now)
	pdfName := fmt.Sprintf("%d.pdf", now)

	// used functions
	t, err := template.New("").Funcs(template.FuncMap{
		"round":    func(input float64) string { return fmt.Sprintf("%.2f", input) },
		"multiply": func(f1, f2 float64) float64 { return f1 * f2 },
		"json": func(i any) string { // only for development purposes
			b, err := json.MarshalIndent(i, "", "  ")
			if err != nil {
				return err.Error()
			}

			return string(b)
		},
	}).ParseFiles("template/" + name)
	if err != nil {
		return nil, err
	}

	f, err := os.Create(htmlName)
	if err != nil {
		return nil, err
	}
	defer os.Remove(htmlName)

	if err := t.ExecuteTemplate(f, name, data); err != nil {
		return nil, err
	}

	args := []string{
		"chromium-browser",
		"--run-all-compositor-stages-before-draw",
		"--headless",
		"--print-to-pdf=" + pdfName,
		"http://localhost:8000/" + htmlName,
	}

	cmd := exec.Command(args[0], args[1:]...)
	//cmd.Stdout = os.Stdout
	//cmd.Stderr = os.Stderr

	if err := cmd.Run(); err != nil {
		return nil, err
	}

	bytes, err := ioutil.ReadFile(pdfName)
	if err != nil {
		return nil, err
	}

	return bytes, os.Remove(pdfName)
}
