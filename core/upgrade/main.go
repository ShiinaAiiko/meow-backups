package main

import (
	"flag"
	flagconfig "github.com/ShiinaAiiko/meow-backups/upgrade/flag"
	"github.com/cherrai/nyanyago-utils/ncommon"
	"github.com/cherrai/nyanyago-utils/nlog"
	"os"
	"path/filepath"
	"strings"
)

var (
	log       = nlog.New()
	Version   = ""
	Platform  = ""
	GitRev    = ""
	BuildTime = ""
)

func init() {
	nlog.SetPrefixTemplate("[{{Timer}}] [{{Type}}] [{{Date}}] [{{File}}]@{{Name}}")
	nlog.SetName("meow-backups-upgrade")
	path, _ := os.Executable()
	pathDir := filepath.Dir(path)
	rootPath := filepath.Join(pathDir, ncommon.IfElse(strings.LastIndex(pathDir, "bin") == len(pathDir)-3, "..", "."))

	nlog.SetOutputFile(filepath.Join(rootPath, "./logs/output.log"), 1024*1024*10)

}

// cmd.exe /C start .\meow-backups

func main() {
	defer func() {
		if err := recover(); err != nil {
			log.Error(err)
		}
	}()
	log.Info("Meow Backups Upgrade <" + Version + ">")
	flagconfig.FlagInit()
	if !flagconfig.FlagParse() {
		return
	}

	flag.Usage()
}
