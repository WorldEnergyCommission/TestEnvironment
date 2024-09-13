package utils

import (
	"io"
	"os"
	"runtime/debug"
	"strconv"
	"sync"
	"time"

	"github.com/rs/zerolog"
	"github.com/rs/zerolog/pkgerrors"
)

var once sync.Once

var log zerolog.Logger

// see https://betterstack.com/community/guides/logging/zerolog/ for source of inspiration
func GetLogger() zerolog.Logger {
	once.Do(func() {
		zerolog.ErrorStackMarshaler = pkgerrors.MarshalStack
		zerolog.TimeFieldFormat = time.RFC3339

		logLevel, err := strconv.Atoi(os.Getenv("LOG_LEVEL"))
		if err != nil {
			logLevel = int(zerolog.DebugLevel) // default to Debug
		}

		var output io.Writer = zerolog.ConsoleWriter{
			Out:        os.Stdout,
			TimeFormat: time.RFC3339,
		}

		var gitRevision string

		buildInfo, ok := debug.ReadBuildInfo()
		if ok {
			for _, v := range buildInfo.Settings {
				if v.Key == "vcs.revision" {
					gitRevision = v.Value
					if len(gitRevision) > 7 {
						gitRevision = gitRevision[:7]
					}
					break
				}
			}
		}

		log = zerolog.New(output).
			Level(zerolog.Level(logLevel)).
			With().
			Timestamp().
			Caller().
			Str("git_revision", gitRevision).
			Str("go_version", buildInfo.GoVersion).
			Logger()
	})

	return log
}

func LogError(err error, msg string) {
	// update skipframe count
	// default is 2, need one more since abstracted here
	l := GetLogger().
		With().
		CallerWithSkipFrameCount(3).
		Logger()
	l.Error().Err(err).Stack().Msg(msg)
}

// LogDebugByteWriter is used to abstract logging with a Write(p []byte) function.
// That way it can be used in places were logging is implemented via io.Writer.
// It uses the log level Debug to write logs.
// see: https://stackoverflow.com/questions/52294334/net-http-set-custom-logger
type LogDebugByteWriter struct {
}

func (fw *LogDebugByteWriter) Write(p []byte) (n int, err error) {
	l := GetLogger().
		With().
		CallerWithSkipFrameCount(4).
		Logger()

	l.Debug().Stack().Msg(string(p))

	return len(p), nil
}
