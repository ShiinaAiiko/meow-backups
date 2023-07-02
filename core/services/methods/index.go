package methods

import (
	"runtime"

	conf "github.com/ShiinaAiiko/meow-backups/config"
)

var (
	log     = conf.Log
	sysType = runtime.GOOS
)
