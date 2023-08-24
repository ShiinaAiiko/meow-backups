//go:generate goversioninfo -icon=icon.ico -64=true
package main

import (
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"strings"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	flagconfig "github.com/ShiinaAiiko/meow-backups/run/flag"
	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/cherrai/nyanyago-utils/ncommon"
	"github.com/cherrai/nyanyago-utils/nint"
	"github.com/cherrai/nyanyago-utils/nlog"
	"github.com/shirou/gopsutil/process"
)

var (
	log = nlog.New()
)

func init() {
	nlog.SetPrefixTemplate("[{{Timer}}] [{{Type}}] [{{Date}}] [{{File}}]@{{Name}}")
	nlog.SetName("meow-backups")

	path, _ := os.Executable()
	pathDir := filepath.Dir(path)
	rootPath := filepath.Join(pathDir, ncommon.IfElse(strings.LastIndex(pathDir, "bin") == len(pathDir)-3, "..", "."))

	conf.RootPath = rootPath
	conf.CorePath = filepath.Join(rootPath, "./meow-backups")
	conf.IconPath = filepath.Join(rootPath, "./static/icons/256x256.png")

	nlog.SetOutputFile(filepath.Join(rootPath, "./logs/output.log"), 1024*1024*10)

}

func main() {
	defer func() {
		if err := recover(); err != nil {
			log.FullCallChain(err.(error).Error(), "Error")
		}
	}()
	parent := os.Getenv("APP_PPID")
	if parent != "" {
		p, err := process.NewProcess(nint.ToInt32(parent))
		if err != nil {
			log.Error(err)
		} else {
			log.Warn("Killed the process with pid " + parent)
			if err := p.Kill(); err != nil {
				log.Error(err)
			}
		}
	}
	// syscall.Kill(parent, syscall.SIGTERM)
	conf.CreateConfig()
	WatchExit()

	flagconfig.FlagInit()
	if !flagconfig.FlagParse() {
		return
	}
	log.Info("Meow Backups < " + conf.Version + " >")
	log.Info(os.Args)
	log.Info(os.Executable())
	methods.InitLock()
	methods.OpenApp(nil)
}

func WatchExit() {
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan,
		// syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGKILL,
		syscall.SIGTERM,
		syscall.SIGQUIT)

	go func() {
		log.Info(<-signalChan)
		log.Info("正在退出程序中...")
		methods.DeleteLock()
		methods.StopApp()

		os.Exit(0)
	}()
}
