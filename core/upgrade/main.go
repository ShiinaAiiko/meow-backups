package main

import (
	"flag"

	flagconfig "github.com/ShiinaAiiko/meow-backups/upgrade/flag"
	"github.com/cherrai/nyanyago-utils/nlog"
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
