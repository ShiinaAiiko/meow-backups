package main

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/cherrai/nyanyago-utils/nint"
	_ "github.com/mattn/go-sqlite3"
	"github.com/shirou/gopsutil/process"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	flagconfig "github.com/ShiinaAiiko/meow-backups/flag"
	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/ShiinaAiiko/meow-backups/services/server"
	"github.com/cherrai/nyanyago-utils/nlog"
)

var (
	log = conf.Log
)

func init() {
	nlog.SetPrefixTemplate("[{{Timer}}] [{{Type}}] [{{Date}}] [{{File}}]@{{Name}}")
	nlog.SetName("meow-backups-core")
}

func main() {
	defer func() {
		if err := recover(); err != nil {
			log.Error(err)
		}
	}()

	parent := os.Getenv("APP_PPID")
	if parent != "" {
		p, err := process.NewProcess(nint.ToInt32(parent))
		if err != nil {
			log.Error(err)
		}
		if err := p.Kill(); err != nil {
			log.Error(err)
		}
	}
	log.Info("开始运行 Meow Backups Core!")
	log.Info(os.Args, os.Getpid(), os.Getppid(), os.Getenv("APP_PPID"))

	WatchExit()
	flagconfig.FlagInit()
	if !conf.Init() {
		log.Warn("未通过配置初始化")
		return
	}
	// test()
	// ntimer.SetTimeout(func() {
	// 	// methods.CheckForUpdates()
	// 	fmt.Printf("example1: %s-%s.%s\n", version, gitRev, buildTime)
	// }, 1000)
	methods.ScheduledBackup()
	// 创建lock文件
	methods.InitLock()
	server.Init()
}

func WatchExit() {
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan,
		syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGTERM,
		syscall.SIGQUIT)

	go func() {
		<-signalChan
		log.Info("正在退出程序中...")
		methods.DeleteLock()
		methods.StopApp()

		os.Exit(0)
	}()
}
