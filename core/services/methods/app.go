package methods

import (
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"syscall"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/cherrai/nyanyago-utils/narrays"
	"github.com/cherrai/nyanyago-utils/nfile"
	"github.com/cherrai/nyanyago-utils/nint"
	"github.com/cherrai/nyanyago-utils/nstrings"
	"github.com/cherrai/nyanyago-utils/ntimer"
	"github.com/go-ole/go-ole"
	"github.com/go-ole/go-ole/oleutil"
	"github.com/kardianos/service"
	"github.com/shirou/gopsutil/process"
)

var (
	svc service.Service
)

type CVSProgram struct {
}

func (p *CVSProgram) Start(s service.Service) error {
	log.Info("1")
	// Start should not block. Do the actual work async.
	go p.run()
	return nil
}
func (p *CVSProgram) run() {
	log.Info("2")
	// Do work here
}
func (p *CVSProgram) Stop(s service.Service) error {
	log.Info("3")
	// Stop should not block. Return with a few seconds.
	return nil
}

func InitSVC() {
	prg := &CVSProgram{}
	s, err := service.New(prg, conf.SVCConfig)
	if err != nil {
		log.Error(err)
	}
	svc = s
}

func NoConsoleRunApp() {
	// InitSVC()
	if !conf.Config.NoBrowser {
		OpenUrl("http://127.0.0.1:" + nstrings.ToString(conf.Config.Port))
	}
	p, err := os.Executable()
	if err != nil {
		log.Error(err)
	}
	switch sysType {
	case "windows":
		// 需要检测是否设置了自启，是的则不用安装或卸载服务
		// mwinsvc.InstallService(conf.AppInfoConfig.AppPath,
		// 	conf.AppInfoConfig.ServiceName,
		// 	conf.AppInfoConfig.ServiceDesc)
		// mwinsvc.StartService(conf.AppInfoConfig.ServiceName)
		// mwinsvc.RemoveService(conf.AppInfoConfig.ServiceName)

		// log.Info("正在安装服务")
		// if err := svc.Install(); err != nil {
		// 	log.Error(err)
		// }
		// log.Info("正在启动服务")
		// // mwinsvc.StartService(conf.AppInfoConfig.ServiceName)
		// if err := svc.Start(); err != nil {
		// 	log.Error(err)
		// }
		// log.Info("正在卸载服务")
		// if err := svc.Uninstall(); err != nil {
		// 	log.Error(err)
		// }

		// // 使用sh
		// nohup ./meow-backups >/dev/null 2>&1 &
		// log.Info(path.Join(path.Dir(p), "bin/run.sh"), "noConsole")
		// log.Info(os.Args[1:])
		// log.Info(conf.StaticPath, path.Join(path.Dir(p), "./bin/meow-backups-no-console.exe"), narrays.Filter(append(os.Args[1:], "static-path='../static'"), func(v string) bool {
		// 	return v != "-no-console"
		// }), path.Join("../static", "a.jpg"))
		// log.Info(path.Join(path.Dir(p), "./bin/run.sh"), append([]string{"noConsole"}, os.Args[1:]...))
		// ntimer.SetTimeout(func() {
		// 	log.Info("...")
		// 	os.Exit(0)
		// }, 1500)
		err = exec.Command(filepath.Join(filepath.Dir(p), "./bin/meow-backups-core.exe"), narrays.Filter(os.Args[1:], func(v string) bool {
			return v != "-no-console"
		})...).Start()
		if err != nil {
			log.Error(err)
		}
		// log.Info("out", string(out))
	case "linux":

		if err = exec.Command(filepath.Join(filepath.Dir(p), "./bin/meow-backups-core"), narrays.Filter(os.Args[1:], func(v string) bool {
			return v != "-no-console"
		})...).Start(); err != nil {
			log.Error(err)
		}

		// 后续改为 检测是否自启动，是则仅启动，否则删除
		// sStatus, err := svc.Status()
		// if err != nil {
		// 	log.Error(err)
		// }
		// log.Info(sStatus, sStatus != 1)
		// if sStatus != 1 {
		// log.Info("正在安装服务")
		// if err := svc.Install(); err != nil {
		// 	log.Error(err)
		// }

		// log.Info("正在启动服务")
		// // mwinsvc.StartService(conf.AppInfoConfig.ServiceName)
		// if err := svc.Start(); err != nil {
		// 	log.Error(err)
		// }
		// log.Info("正在卸载服务")
		// if err := svc.Uninstall(); err != nil {
		// 	log.Error(err)
		// }
		// } else {
		// 	log.Info("正在启动服务")
		// 	if err := svc.Start(); err != nil {
		// 		log.Error(err)
		// 	}
		// }

		// // 使用nohup
		// path, err := os.Executable()
		// if err != nil {
		// 	log.Error(err)
		// }
		// // nohup ./meow-backups >/dev/null 2>&1 &
		// out, err := exec.Command("nohup", path, ">/dev/null", " 2>&1", "&").CombinedOutput()
		// if err != nil {
		// 	log.Error("cmd.Run() failed with %s\n", err)
		// }
		// log.Info(out)

		// // 使用sh
		// // nohup ./meow-backups >/dev/null 2>&1 &
		// // log.Info(path.Join(path.Dir(p), "bin/run.sh"), "noConsole")
		// // log.Info(os.Args[1:])
		// log.Info(path.Join(path.Dir(p), "./bin/run.sh"),
		// 	narrays.Filter(append([]string{"noConsoleLinux"}, os.Args[1:]...), func(v string) bool {
		// 		return v != "-no-console"
		// 	}))
		// // log.Info(path.Join(path.Dir(p), "./bin/run.sh"), append([]string{"noConsole"}, os.Args[1:]...))
		// out, err := exec.Command(path.Join(path.Dir(p), "./bin/run.sh"), narrays.Filter(append([]string{"noConsoleLinux"}, os.Args[1:]...), func(v string) bool {
		// 	return v != "-no-console"
		// })...).CombinedOutput()
		// if err != nil {
		// 	log.Error("cmd.Run() failed with %s\n", err)
		// }
		// log.Info("out", string(out))

	}
	// signals := make(chan os.Signal, 1)
	// signal.Notify(signals, syscall.SIGINT, syscall.SIGTERM)

	// log.Info("Started")

	// <-signals
	// log.Info("Exited")

}
func StartService() {
	InitSVC()
	log.Info("正在启动服务")
	if err := svc.Start(); err != nil {
		log.Error(err)
	}
}

func OpenAutoStart() {
	InitSVC()
	switch sysType {
	case "windows":
		// // 需要检测是否设置了自启
		// mwinsvc.InstallService(conf.AppInfoConfig.AppPath,
		// 	conf.AppInfoConfig.ServiceName,
		// 	conf.AppInfoConfig.ServiceDesc)

		p, err := os.Executable()
		if err != nil {
			log.Error(err)
		}
		// if err := svc.Install(); err != nil {
		// 	log.Error(err)
		// }

		// likPath := SVCConfig.Name + ".lnk"
		exePath := filepath.Join(filepath.Dir(p), "./"+conf.SVCConfig.Name+".exe")
		lnkPath := filepath.Join(filepath.Dir(p), "./"+conf.SVCConfig.Name+".lnk")
		// log.Info(likPath)
		// lnk, err := lnk.File(likPath)
		// if err != nil {
		// 	log.Error(err)
		// }
		// log.Info(lnk.Header)
		// log.Info(lnk.LinkInfo.LocalBasePath)

		log.Info("正在创建快捷方式")
		ole.CoInitializeEx(0, ole.COINIT_APARTMENTTHREADED|ole.COINIT_SPEED_OVER_MEMORY)
		oleShellObject, err := oleutil.CreateObject("WScript.Shell")
		if err != nil {
			log.Error(err)
			return
		}
		defer oleShellObject.Release()
		wshell, err := oleShellObject.QueryInterface(ole.IID_IDispatch)
		if err != nil {
			log.Error(err)
			return
		}
		defer wshell.Release()
		cs, err := oleutil.CallMethod(wshell, "CreateShortcut", lnkPath)
		if err != nil {
			log.Error(err)
			return
		}
		idispatch := cs.ToIDispatch()
		oleutil.PutProperty(idispatch, "TargetPath", exePath)
		oleutil.PutProperty(idispatch, "TargetPath", exePath)
		oleutil.CallMethod(idispatch, "Save")

		log.Info("正在设置开机方式")

		u, _ := user.Current()

		newLnkPath := filepath.Join(u.HomeDir, "./AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup", "./"+conf.SVCConfig.Name+".lnk")

		log.Info("自启动快捷方式路径 => ", newLnkPath)
		if err := nfile.Move(lnkPath, newLnkPath); err != nil {
			log.Error(err)
			return
		}
		// StopApp()
	case "linux":
		// sStatus, _ := svc.Status()
		// log.Info("sStatus", sStatus, sStatus != 1, sStatus == 1)
		// if sStatus != 1 {
		// 	if err := svc.Install(); err != nil {
		// 		log.Error(err)
		// 	}
		// }
		log.Info("正在安装服务")
		if err := svc.Install(); err != nil {
			log.Error(err)
		}

		log.Info("正在设置自启")
		cmd := exec.Command("systemctl", "enable", conf.SVCConfig.Name+".service")
		err := cmd.Run()
		if err != nil {
			log.Error(err)
		}
	}
}

func CloseAutoStart() {
	InitSVC()
	switch sysType {
	case "windows":
		log.Info("正在关闭自启")
		u, _ := user.Current()
		lnkPath := filepath.Join(u.HomeDir, "./AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup", "./"+conf.SVCConfig.Name+".lnk")
		if err := nfile.Remove(lnkPath); err != nil {
			log.Error(err)
		}
		// // // 需要检测是否设置了自启
		// mwinsvc.RemoveService(conf.AppInfoConfig.ServiceName)
	case "linux":
		// sStatus, _ := svc.Status()
		// if sStatus != 1 {
		// 	// log.Error(svc.Install())
		// } else {
		log.Info("正在关闭自启")
		cmd := exec.Command("systemctl", "disable", conf.SVCConfig.Name+".service")
		err := cmd.Run()
		if err != nil {
			log.Error(err)
		}
		log.Info("正在卸载服务")
		if err := svc.Uninstall(); err != nil {
			log.Error(err)
		}
		// }
	}
}

func StopApp() {
	// InitSVC()
	log.Info("StopServer")
	pid := os.Getpid()
	// log.Info("正在停用端口", SVCConfig.Name+".exe", SVCConfig.Name+"-no-console.exe")
	processes, err := process.Processes()
	if err != nil {
		log.Error(err)
		return
	}
	for _, p := range processes {
		n, err := p.Name()
		if err != nil {
			log.Error(err)
			return
		}
		// log.Info(n, pid, p.Pid, n == SVCConfig.Name+".exe",
		// 	n == SVCConfig.Name+"-no-console.exe",
		// 	n == SVCConfig.Name || n == SVCConfig.Name+".exe" || n == SVCConfig.Name+"-core.exe")
		// log.Info(nint.ToInt32(pid) != p.Pid &&
		// 	(strings.Contains(n, conf.SVCConfig.Name) ||
		// 		n == conf.SVCConfig.Name ||
		// 		n == conf.SVCConfig.Name+"-core" ||
		// 		n == conf.SVCConfig.Name+".exe" ||
		// 		n == conf.SVCConfig.Name+"-core.exe"))
		if nint.ToInt32(pid) != p.Pid &&
			(n == conf.SVCConfig.Name ||
				n == conf.SVCConfig.Name+".exe" ||
				n == conf.SVCConfig.Name+"-core" ||
				n == conf.SVCConfig.Name+"-core.exe") {
			if err = p.Kill(); err != nil {
				log.Error(n+" Error:", err)
			} else {
				log.Info(n + " PID<" + nstrings.ToString(p.Pid) + "> has been killed")
			}
		}
	}

	// switch sysType {
	// case "windows":
	// 	// 需要检测是服务的形式启动的还是直接启动
	// 	mwinsvc.StopService(SVCConfig.Name)
	// default:
	// log.Info("正在停用服务")
	// if err := svc.Stop(); err != nil {
	// 	log.Error(err)
	// }

	// }

}

func InstallService() {
	InitSVC()
	log.Info("正在安装服务")
	if err := svc.Install(); err != nil {
		log.Error(err)
	}
}

func UninstallService() {
	InitSVC()
	log.Info("正在卸载服务")
	if err := svc.Uninstall(); err != nil {
		log.Error(err)
	}
}

func OpenApp(logFunc func(stdout io.ReadCloser, l string)) {

	log.Info("正在启动 Meow Backups<" + conf.Version + ", " + conf.Platform + ">")
	// log.Warn("打开浏览器吗", !conf.NoBrowser)
	if !conf.Config.NoBrowser {
		OpenUrl("http://127.0.0.1:" + nstrings.ToString(conf.Config.Port))
	}
	// log.Info("开始执行！")
	// 正常启动
	// 根据启动配置，确定是否需要对应参数

	p, err := os.Executable()
	if err != nil {
		log.Error(err)
		return
	}
	// log.Info("NoConsole => ", conf.NoConsole)
	// cmdPath := filepath.Join(filepath.Dir(p), "./bin/run.sh")
	cmdPath := filepath.Join(filepath.Dir(p), "./bin/meow-backups-core")
	if sysType == "windows" {
		cmdPath += ".exe"
	}

	// args := append(
	// 	os.Args[1:],
	// 	"-port="+nstrings.ToString(conf.Port),
	// 	"-no-browser",
	// )

	args := []string{
		cmdPath,
		"-port=" + nstrings.ToString(conf.Config.Port),
		"-static-path=" + conf.Config.StaticPath,
	}
	if conf.Config.Debug {
		args = append(args, "-debug")
	}
	// if conf.NoBrowser {
	args = append(args, "-no-browser")
	// }
	if conf.Config.NoConsole {
		args = append(args, "-no-console")
	}
	if conf.Config.DefaultUser {
		args = append(args, "-default-user")
	}

	// if conf.Mode == "debug" {
	// 	args = append(
	// 		args,
	// 		"-debug",
	// 	)
	// }

	pid := os.Getpid()
	log.Info("args => ", args)
	// os.Setenv("APP_PPID", nstrings.ToString(pid))
	log.Info("ppid", pid)

	// 暂时性用这个

	switch sysType {
	case "linux":
		process, err := os.StartProcess(cmdPath, args, &os.ProcAttr{
			Dir: filepath.Dir(p),
			Files: []*os.File{
				os.Stdin, os.Stdout, os.Stderr,
			},
			Env: os.Environ(),
			Sys: &syscall.SysProcAttr{},
		})
		if err != nil {
			log.Error(err)
			return
		}

		log.Error("process", process)

		process.Wait()
	case "windows":

		cmd := exec.Command(cmdPath, args...)
		// 命令的错误输出和标准输出都连接到同一个管道
		stdout, err := cmd.StdoutPipe()
		cmd.Stderr = cmd.Stdout

		if err != nil {
			log.Error(err)
			return
		}

		if err = cmd.Start(); err != nil {
			log.Error(err)
			return
		}
		// 从管道中实时获取输出并打印到终端
		for {
			tmp := make([]byte, 1024)
			_, err := stdout.Read(tmp)
			t := string(tmp)
			fmt.Print(t)

			if logFunc != nil {
				logFunc(stdout, t)
			}

			if err != nil {
				break
			}
			// if strings.Contains(t, "准备执行更新程序") {
			// 	// stdout.Close()
			// 	// OpenApp()
			// 	log.Error("开始结束了")
			// 	os.Exit(0)

			// 	return
			// }
		}

		if err = cmd.Wait(); err != nil {
			log.Error(err)
			return
		}
	}

	// cmd := exec.Command(cmdPath, args...)
	// // 命令的错误输出和标准输出都连接到同一个管道

	// cmd.Stderr = os.Stderr
	// cmd.Stdout = os.Stdout
	// cmd.Stdin = os.Stdin
	// // cmd.SysProcAttr = &syscall.SysProcAttr{Setpgid: true}
	// // cmd.Process.Signal(syscall.SIGTERM)

	// if err != nil {
	// 	log.Error(err)
	// 	return
	// }

	// if err = cmd.Start(); err != nil {
	// 	log.Error(err)
	// 	return
	// }

	// 暂时放弃
	log.Info(conf.SVCConfig.Name + " 结束运行")
}

func IsAutoStart() bool {
	switch runtime.GOOS {
	case "windows":
		u, _ := user.Current()
		lnkPath := filepath.Join(u.HomeDir, "./AppData/Roaming/Microsoft/Windows/Start Menu/Programs/Startup", "./"+conf.SVCConfig.Name+".lnk")
		return nfile.IsExists(lnkPath)
	case "linux":
		cmd := exec.Command("systemctl", "is-enabled", conf.SVCConfig.Name+".service")
		out, err := cmd.CombinedOutput()
		if err != nil {
			log.Error(err)
			// log.Error("cmd.Run() failed with %s\n", err)
		}
		// log.Info("out", string(out), string(out) == "enabled")

		return strings.Contains(string(out), "enabled")
		// systemConfig.AutomaticStart = string(out) == "enabled"
	default:
	}
	return false
}

func InitLock() {
	path, _ := os.Executable()
	pathDir := filepath.Dir(path)
	// rootPath := filepath.Join(pathDir, ncommon.IfElse(strings.LastIndex(pathDir, "bin") == len(pathDir)-3, "..", "."))

	lockFilePath := filepath.Join(pathDir, "./lock")
	if nfile.IsExists(lockFilePath) {
		fileBuffer, err := ioutil.ReadFile(lockFilePath)
		if err != nil {
			log.Error(err)
			// return v.Value, err
		} else {
			log.Info(string(fileBuffer))
			if len(fileBuffer) != 0 {
				p, err := process.NewProcess(nint.ToInt32(string(fileBuffer)))
				if err != nil {
					log.Error(err)
				} else {
					if err := p.Kill(); err != nil {
						log.Error(err)
					}
				}
			}
		}
	}
	f, err := os.Create(lockFilePath)
	if err != nil {
		log.Error(err)
		return
	}
	err = f.Chmod(0600)
	if err != nil {
		log.Error(err)
		return
	}
	defer f.Close()
	f.Write([]byte(nstrings.ToString(os.Getpid())))

	wg := sync.WaitGroup{}
	wg.Add(1)
	ntimer.SetTimeout(func() {
		wg.Done()
	}, 500)
	wg.Wait()
}

func DeleteLock() {
	path, _ := os.Executable()
	pathDir := filepath.Dir(path)
	// rootPath := filepath.Join(pathDir, ncommon.IfElse(strings.LastIndex(pathDir, "bin") == len(pathDir)-3, "..", "."))

	nfile.Remove(filepath.Join(pathDir, "./lock"))
	nfile.Remove(filepath.Join(pathDir, "./bin/lock"))
}
