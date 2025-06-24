package main

import (
	"os"
	"os/signal"
	"path/filepath"
	"syscall"

	"github.com/cherrai/nyanyago-utils/nint"
	"github.com/cherrai/nyanyago-utils/nlog"
	"github.com/cherrai/nyanyago-utils/ntimer"
	"github.com/shirou/gopsutil/process"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	flagconfig "github.com/ShiinaAiiko/meow-backups/flag"
	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/ShiinaAiiko/meow-backups/services/server"
	"github.com/ShiinaAiiko/meow-backups/traybar"

	// "github.com/ShiinaAiiko/meow-backups/traybar"
	"strings"

	"github.com/cherrai/nyanyago-utils/ncommon"
)

var (
	log = conf.Log
)

func init() {
	log.Info("Init开始运行 Meow Backups Core!")
	nlog.SetPrefixTemplate("[{{Timer}}] [{{Type}}] [{{Date}}] [{{File}}]@{{Name}}")
	nlog.SetName("mbc")
	path, _ := os.Executable()
	pathDir := filepath.Dir(path)
	rootPath := filepath.Join(filepath.Join(pathDir, ncommon.IfElse(strings.LastIndex(pathDir, "tmp") == len(pathDir)-3, "..", ".")), ncommon.IfElse(strings.LastIndex(pathDir, "bin") == len(pathDir)-3, "..", "."))

	conf.RootPath = rootPath
	conf.CorePath = filepath.Join(rootPath, "./meow-backups")
	conf.IconPath = filepath.Join(rootPath, "./static/icons/256x256.png")

	log.Info(filepath.Join(rootPath, "./logs/output.log"))
	nlog.SetOutputFile(filepath.Join(rootPath, "./logs/output.log"), 1024*1024*10)

	methods.InitLog()
}

func main() {
	log.Info("开始运行 Meow Backups Core!")
	defer func() {
		if err := recover(); err != nil {
			log.FullCallChain(err.(error).Error(), "Error")
		}
	}()

	parent := os.Getenv("APP_PPID")

	if parent != "" {
		log.Info("parent", parent)
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
	methods.ScheduledBackup(true)
	// 创建lock文件
	methods.InitLock()

	// ntimer.SetTimeout(func() {
	// 	m := map[string]map[string][]byte{}
	// 	jsonV, err := json.Marshal(m)
	// 	if err != nil {
	// 		return
	// 	}
	// 	log.Info(string(jsonV), len(jsonV), len(m))
	// 	if string(jsonV) == "" {
	// 		log.Error("db.modelData is nil")
	// 		return
	// 	}
	// 	// var wg sync.WaitGroup
	// 	// // mutex := new(sync.RWMutex)
	// 	// log.Info(runtime.NumCPU())
	// 	// ch := make(chan struct{}, runtime.NumCPU())

	// 	// for i := 0; i < 1000; i++ {
	// 	// 	ch <- struct{}{}
	// 	// 	wg.Add(1)

	// 	// 	go func(i int) {
	// 	// 		defer wg.Done()
	// 	// 		ntimer.SetTimeout(func() {
	// 	// 			log.Info(i)
	// 	// 			<-ch
	// 	// 		}, 1000)
	// 	// 	}(i)
	// 	// }
	// 	// // fmt.Println(wg)
	// 	// wg.Wait()
	// }, 1000)
	// ntimer.SetTimeout(func() {
	// 	path := "./logs/output.log"
	// 	log.Info(filepath.Dir(path))
	// 	log.Info(filepath.Base(path))
	// 	log.Info(filepath.Ext(path))
	// 	log.Info("./" + filepath.Join(filepath.Dir(path), strings.TrimSuffix(filepath.Base(path), filepath.Ext(path))+"_"+time.Now().Format("20060102150405")+filepath.Ext(path)))
	// }, 1000)
	ntimer.SetTimeout(func() {
	}, 1000)
	traybar.Install()
	server.Init()
}

func WatchExit() {
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan,
		// syscall.SIGHUP,
		syscall.SIGINT,
		syscall.SIGTERM,
		syscall.SIGKILL,
		syscall.SIGQUIT)

	go func() {
		log.Info(<-signalChan)
		log.Info("正在退出程序中...")
		methods.DeleteLock()
		methods.StopApp()

		os.Exit(0)
	}()
}
