package flagconfig

import (
	"flag"
	"fmt"
	"os"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/services/update"
)

var (
	flagUpdate          = flag.Bool("update", false, "Update meow backups")
	flagCheckForUpdates = flag.Bool("check-update", false, "Check for Updates")
	flagFinalUpgrade    = flag.Bool("final-upgrade", false, "Final Upgrade Process")
	flagUpdateRestart   = flag.Bool("update-restart", false, "Update and restart")

	log = conf.Log
	// log = nlog.New()
)

func FlagInit() {
	flag.Usage = func() {
		fmt.Fprintf(os.Stderr, `Usage:
  hello [options]...

Options:
`)
		flag.PrintDefaults()
		fmt.Fprintf(os.Stderr, "%s\n", `
`)
	}
}

func FlagParse() bool {
	flag.Parse()

	if *flagCheckForUpdates {
		version, err := update.CheckForUpdates()
		if err != nil {
			log.Error(err)
		}
		log.Println(os.Stdout, "发现了新版本<"+version.Version+">")
		return false
	}

	if *flagFinalUpgrade {
		// wg := sync.WaitGroup{}
		// wg.Add(1)
		// ntimer.SetTimeout(func() {
		update.FinalUpgrade(*flagUpdateRestart)
		// 	wg.Done()
		// }, 300)
		// wg.Wait()
		return false
	}

	if *flagUpdate || *flagUpdateRestart {

		version, err := update.CheckForUpdates()
		if err != nil {
			log.Error(err)
			return false
		}
		log.Info(version)

		err = update.DownloadUpdate(version, nil)
		if err != nil {
			log.Error(err)
			return false
		}
		update.FinalUpgrade(*flagUpdateRestart)
		return false
	}

	return true
}
