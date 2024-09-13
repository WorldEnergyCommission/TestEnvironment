package utils

import (
	"io/ioutil"
	"os"
	"strings"
)

func ReplaceTextInFile(path string, find string, replacement string) error {
	content, err := ioutil.ReadFile(path)
	if err != nil {
		return err
	}
	newContent := strings.Replace(string(content), find, replacement, -1)
	err = ioutil.WriteFile(path, []byte(newContent), 0)
	if err != nil {
		return err
	}
	return nil
}

func ReadFileAndApplyReplacements(path string, replacements map[string]string) (string, error) {
	content, err := os.ReadFile(path)
	if err != nil {
		return "", err
	}
	result := string(content)

	for key, replacement := range replacements {
		result = strings.Replace(result, key, replacement, -1)
	}
	return result, nil

}
