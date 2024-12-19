// this golang project acts as a static file-server
// that takes care of the following:
// - Read the config.json file, get all domains and their config data,
//    generate a index.<domain>.html since it's just going to be a static
//    file with the injected config
// -

// https://github.com/kjk/go-cookbook/blob/master/free-ssl-certificates/main.go
package main

import (
	"compress/gzip"
	"context"
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"golang.org/x/crypto/acme/autocert"

	"github.com/eneries/eneries/api/pkg/utils"
)

const (
	CacheDirectory              = "/certs"
	ConsoleCapacitorUpdaterPath = "/console-capacitor-updater"
	HttpsProtocol               = "https://"
	LatestPath                  = "/latest"
	DistZipFileName             = "dist.zip"
)

var (
	// new domains must be added to this slice
	domains = []string{
		"console.eneries.com",
		"console.effectas.com",
		"connect.peneder.com",
	}
	// the latest git sha, will be replaced on program start
	latestSha = ""
)

type LatestInfo struct {
	Version string `json:"version"`
	Url     string `json:"url"`
}

type Version struct {
	Sha string `json:"sha"`
}

func main() {
	// setup logging
	l := utils.GetLogger()

	// set the latest sha
	var err error
	latestSha, err = getLatestSha()
	if err != nil {
		l.Fatal().Err(err).Msg("Could not get lastest SHA")
	}

	// initialize the certificate manager
	certManager := &autocert.Manager{
		Prompt: autocert.AcceptTOS,
		Cache:  autocert.DirCache(CacheDirectory),
		HostPolicy: func(ctx context.Context, host string) error {
			for _, h := range domains {
				if h == host {
					return nil
				}
			}
			return fmt.Errorf("invalid host: %s", host)
		},
	}

	enableHTTP := os.Getenv("ENABLE_HTTP")

	if enableHTTP == "" || enableHTTP == "false" {
		// https server
		httpSecureServer := httpSecureServer()
		httpSecureServer.TLSConfig = &tls.Config{
			GetCertificate: certManager.GetCertificate,
			MinVersion:     tls.VersionTLS12,
			CipherSuites: []uint16{
				tls.TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256, tls.TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256,
				tls.TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384, tls.TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256,
				tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256, tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384},
		}

		go func() {
			if err := httpSecureServer.ListenAndServeTLS("", ""); err != nil {
				l.Fatal().Err(err).Msg("Could not Serve TLS")
			}
		}()
	}

	// basic server
	httpServer := httpServer()
	// tls verification handler
	if certManager != nil {
		httpServer.Handler = certManager.HTTPHandler(httpServer.Handler)
	}

	l.Info().Msg("Starting console Server")

	if err := httpServer.ListenAndServe(); err != nil {
		l.Fatal().Err(err).Stack().Msg("Could not Serve")
	}
}

// httpServer listens on port 80 and simply redirects to httpSecureServer
func httpServer() *http.Server {
	mux := http.NewServeMux()

	enableHTTP := os.Getenv("ENABLE_HTTP")

	if enableHTTP == "" || enableHTTP == "false" {
		// redirect to https server
		mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, HttpsProtocol+r.Host+r.URL.String(), http.StatusFound)
		})
	} else {
		// serve the http server
		registerHandlers(mux)
	}

	l := utils.LogDebugByteWriter{}

	logger := log.New(&l, "http internal: ", log.Lshortfile)

	return &http.Server{
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		Handler:      mux,
		Addr:         ":80",
		ErrorLog:     logger,
	}
}

func getLatestSha() (string, error) {
	data, err := ioutil.ReadFile("version.json")
	if err != nil {
		return "", err
	}
	var version Version
	if err := json.Unmarshal(data, &version); err != nil {
		return "", err
	}
	return version.Sha, nil
}

func LatestHandler(w http.ResponseWriter, r *http.Request) {
	update := LatestInfo{
		Version: latestSha,
		Url:     fmt.Sprintf("%s%s%s/%s/%s", HttpsProtocol, r.Host, ConsoleCapacitorUpdaterPath, latestSha, DistZipFileName),
	}
	w.Header().Set("Content-Type", "application/json")
	err := json.NewEncoder(w).Encode(update)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

func DistZipServeHandler(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, DistZipFileName)
}

func registerHandlers(mux *http.ServeMux) {
	// two needed endpoints for capgo updater
	mux.HandleFunc(fmt.Sprintf("%s%s", ConsoleCapacitorUpdaterPath, LatestPath), LatestHandler)
	mux.HandleFunc(fmt.Sprintf("%s/%s/%s", ConsoleCapacitorUpdaterPath, latestSha, DistZipFileName), DistZipServeHandler)

	// dist folder serve
	mux.Handle("/", gzipHandler(fileServer("dist/")))
}

func httpSecureServer() *http.Server {
	mux := http.NewServeMux()

	registerHandlers(mux)

	l := utils.LogDebugByteWriter{}

	logger := log.New(&l, "https internal: ", log.Lshortfile)

	return &http.Server{
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		Handler:      mux,
		Addr:         ":443",
		ErrorLog:     logger,
	}
}

// fileServer is responsible for static console hosting
func fileServer(root string) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		file := strings.TrimPrefix(r.URL.Path, "/")

		if file == "" {
			file = "index.html"
		}

		http.ServeFile(w, r, root+file)
	})
}

// gzip encoding
var gzPool = sync.Pool{
	New: func() any {
		w := gzip.NewWriter(ioutil.Discard)
		return w
	},
}

type gzipResponseWriter struct {
	io.Writer
	http.ResponseWriter
}

func (w *gzipResponseWriter) WriteHeader(status int) {
	w.Header().Del("Content-Length")
	w.ResponseWriter.WriteHeader(status)
}

func (w *gzipResponseWriter) Write(b []byte) (int, error) {
	return w.Writer.Write(b)
}

func gzipHandler(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
			next.ServeHTTP(w, r)
			return
		}

		w.Header().Set("Content-Encoding", "gzip")

		gz := gzPool.Get().(*gzip.Writer)
		defer gzPool.Put(gz)

		gz.Reset(w)
		defer func(gz *gzip.Writer) {
			err := gz.Close()
			if err != nil {
				utils.LogError(err, "")
			}
		}(gz)

		next.ServeHTTP(&gzipResponseWriter{ResponseWriter: w, Writer: gz}, r)
	})
}
