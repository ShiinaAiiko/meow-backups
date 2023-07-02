package update

import (
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"syscall"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/cherrai/nyanyago-utils/narchive"
	"github.com/cherrai/nyanyago-utils/narrays"
	"github.com/cherrai/nyanyago-utils/ncommon"
	"github.com/cherrai/nyanyago-utils/nfile"
	"github.com/cherrai/nyanyago-utils/nint"
	"github.com/cherrai/nyanyago-utils/nstrings"
	"github.com/go-resty/resty/v2"
	"github.com/gosuri/uiprogress"
	"github.com/shirou/gopsutil/process"
)

var (
	restyClient = resty.New()
	log         = conf.Log
	sysType     = runtime.GOOS
)

type VersionItem struct {
	Version     string
	DownloadUrl string
}

func CheckForUpdates() (*VersionItem, error) {
	log.Info("正在检测更新")
	// log.Info(conf.Version)
	res, err := restyClient.R().SetQueryParams(map[string]string{
		"path": "/meow-backups",
		"sid":  conf.VersionSid,
		"pwd":  "",
	}).Get(conf.VersionApiUrl + "/api/v1/share")
	if err != nil {
		return nil, err
	}
	var m map[string]interface{}

	if err = json.Unmarshal(res.Body(), &m); err != nil {
		return nil, err
	}
	// log.Info(m)
	if m["code"] != nil && m["code"].(float64) == 200 {
		dataMap := m["data"].(map[string]interface{})
		listMap := dataMap["list"].([]interface{})
		// log.Info(listMap)
		version := conf.Version
		dUrl := ""
		for _, v := range listMap {
			vMap := v.(map[string]interface{})

			if vMap["fileName"] != nil {
				fileName := vMap["fileName"].(string)

				startIndex := strings.Index(fileName, conf.SVCConfig.Name)
				endIndex := strings.Index(fileName, conf.Platform)
				if startIndex >= 0 && endIndex >= 0 {
					log.Info(fileName)
					log.Info(version, conf.Platform, conf.Version)

					newVersion := fileName[startIndex+len(conf.SVCConfig.Name)+1 : endIndex-1]

					if ncommon.CompareVersionNumber(version, newVersion) {
						version = newVersion
						urls := vMap["urls"].(map[string]interface{})
						dUrl = urls["domainUrl"].(string) + urls["url"].(string)
					}
				}
				// log.Info(fileName[
				// 	strings.Index(fileName, conf.SVCConfig.Name),
				// strings.Index(fileName, conf.Platform)-1])
			}
		}

		if dUrl != "" {
			return &VersionItem{
				Version:     version,
				DownloadUrl: dUrl,
			}, nil
		} else {
			log.Info("没有新版本")
		}
	} else {
		log.Info("版本更新获取失败")
	}
	return nil, errors.New("error checking version")
}

type Downloader struct {
	io.Reader
	Total       int64
	Current     int64
	Bar         *uiprogress.Bar
	Progress    func(progress int)
	progressArr []int
}

func (d *Downloader) Read(p []byte) (n int, err error) {
	n, err = d.Reader.Read(p)
	d.Current += int64(n)
	// log.Info(d.Current, d.Total, int(float64(d.Current*10000/d.Total)/100))
	// d.Bar.Set(int(d.Current / d.Total * 100))

	// fmt.Printf("\r正在下载，下载进度：%.2f%%", float64(d.Current*10000/d.Total)/100)
	// d.Bar.Set(n int)
	d.Bar.Incr()
	dp := int(float64(d.Current*10000/d.Total) / 100)
	if !narrays.Includes(d.progressArr, dp) {
		d.progressArr = append(d.progressArr, dp)
		if d.Current == d.Total {
			if d.Progress != nil {
				d.Progress(100)
			}
		} else {
			if d.Progress != nil {
				d.Progress(dp)
			}
		}
	}
	if d.Current == d.Total {
		d.Bar.Set(100)
	}
	return
}

func DownloadUpdate(version *VersionItem, progress func(progress int)) error {
	defer func() {
		if err := recover(); err != nil {
			log.Error(err)
		}
	}()

	path, _ := os.Executable()

	pathDir := filepath.Dir(path)
	rootPath := filepath.Join(pathDir, ncommon.IfElse(strings.LastIndex(pathDir, "bin") == len(pathDir)-3, "..", "."))

	log.Info("下载", rootPath)
	tempZipPath := filepath.Join(rootPath, "./_update.zip")

	unzipPath := filepath.Join(rootPath, "./_update_temp")

	log.Info("下载1", tempZipPath)
	log.Info("下载1", unzipPath)
	if err := nfile.Remove(unzipPath); err != nil {
		return err
	}
	if err := nfile.Remove(tempZipPath); err != nil {
		return err
	}

	// Get the data
	// resp, err := http.Get("https://saki-ui.aiiko.club/saki-ui.tgz")
	resp, err := http.Get(version.DownloadUrl)
	if err != nil {
		log.Error(err)
		return err
	}
	defer resp.Body.Close()

	// 创建一个文件用于保存

	log.Info(tempZipPath)

	out, err := os.Create(tempZipPath)
	if err != nil {
		log.Error(err)
		return err
	}
	defer out.Close()

	uip := uiprogress.New()

	uip.Start() // 开始
	defer uip.Stop()
	bar := uip.AddBar(100) // 添加一个新的进度条

	bar.Width = 20
	// 可选，添加完成进度
	bar.AppendCompleted()
	// 可选，添加耗费时间
	bar.PrependElapsed()

	downloader := &Downloader{
		Reader:      resp.Body,
		Total:       resp.ContentLength,
		Bar:         bar,
		Progress:    progress,
		progressArr: []int{},
	}
	// 然后将响应流和文件流对接起来
	_, err = io.Copy(out, downloader)
	if err != nil {
		log.Error(err)
		return err
	}
	log.Info(tempZipPath)
	log.Info("下载完成")
	// 2 解压
	log.Info("开始解压")
	if err := narchive.UnZip(unzipPath, tempZipPath); err != nil {
		log.Error(err)
		return err
	}

	log.Info("解压成功")
	return nil
}

// 在线更新则是下载完毕后，关闭程序，更新完了，再启动程序
// 核心程序和守护程序调用
// 执行更新程序
func StartUpdate(flagUpdateRestart bool) error {
	// log.Info("正在检测更新")

	// version, err := CheckForUpdates()
	// if err != nil {
	// 	log.Error(err)
	// 	return err
	// }
	// log.Info(version)

	// // 1 开始下载
	// log.Info("开始下载")
	// err = DownloadUpdate(version)
	// if err != nil {
	// 	log.Error(err)
	// 	return err
	// }

	// 3 执行更新程序
	// 3.1 copy更新程序
	log.Info("执行更新程序")
	path, _ := os.Executable()

	pathDir := filepath.Dir(path)
	rootPath := filepath.Join(pathDir, ncommon.IfElse(strings.LastIndex(pathDir, "bin") == len(pathDir)-3, "..", "."))

	oldUpgradePath := filepath.Join(rootPath, "./bin/meow-backups-upgrade")
	newUpgradePath := filepath.Join(rootPath, "./upgrade")
	switch sysType {
	case "windows":
		oldUpgradePath += ".exe"
		newUpgradePath += ".exe"
	}
	log.Info(oldUpgradePath, newUpgradePath)

	if err := nfile.Copy(
		oldUpgradePath,
		newUpgradePath,
	); err != nil {
		log.Error(err)
		return err
	}

	// copyRunFile, err := os.Open(copyRunFilePath)
	// if err != nil {
	// 	return err
	// }

	// if err := copyRunFile.Chmod(0777); err != nil {
	// 	return err
	// }

	os.Chmod(newUpgradePath, 0777)

	// file := netListener.File() // this returns a Dup()
	// cmd := exec.Command(copyRunFilePath, []string{copyRunFilePath,
	// 	"-copy-update-file", ncommon.IfElse(*flagUpdateRestart, "-update-restart", "")}...)
	// cmd.Stdout = os.Stdout
	// cmd.Stderr = os.Stderr
	// cmd.ExtraFiles = []*os.File{}
	// err = cmd.Start()
	// if err != nil {
	// 	log.Error(err)
	// }
	// file := netListener.File()

	// log.Info(files)

	os.Setenv("APP_PPID", nstrings.ToString(os.Getpid()))

	os.Setenv("PAPP_ARGS", strings.Join(os.Args, "_,_"))

	process, err := os.StartProcess(newUpgradePath, []string{newUpgradePath,
		"-final-upgrade",
		ncommon.IfElse(flagUpdateRestart, "-update-restart", "")}, &os.ProcAttr{
		Dir: filepath.Dir(path),
		Files: []*os.File{
			os.Stdin, os.Stdout, os.Stderr,
		},
		Env: os.Environ(),
		Sys: &syscall.SysProcAttr{},
	})
	if err != nil {
		log.Error(err)
		return err
	}

	log.Error("process", process)

	// wg := sync.WaitGroup{}
	// wg.Add(1)
	// signalChan := make(chan os.Signal, 1)
	// signal.Notify(signalChan,
	// 	syscall.SIGHUP,
	// 	syscall.SIGINT,
	// 	syscall.SIGTERM,
	// 	syscall.SIGQUIT)

	// log.Info("监听信号中")
	// ntimer.SetTimeout(func() {

	// 	log.Info("监听信号中")
	// }, 1000)
	// go func() {
	// 	<-signalChan
	// 	log.Info("正在退出程序中...")
	// 	defer wg.Done()

	// 	StopApp()

	// 	os.Exit(0)
	// }()
	// wg.Wait()
	log.Info(ncommon.IfElse(runtime.GOOS == "windows",
		"Updated successfully!", "准备执行更新程序"))
	// log.Info("准备执行更新程序")

	// if err = exec.Command(copyRunFilePath,
	// 	"-copy-update-file",
	// ).Start(); err != nil {
	// 	log.Error(err)
	// }
	// log.Info("更新成功!")

	os.Exit(0)
	return nil
}

func DeleteUpgradeFile() {
	path, _ := os.Executable()

	upgradePath := filepath.Join(filepath.Dir(path), "./upgrade")
	switch sysType {
	case "windows":
		upgradePath += ".exe"
	}
	// log.Info("开始删除临时文件", nfile.IsExists(copyRunFilePath))
	if !nfile.IsExists(upgradePath) {
		return
	}
	if err := nfile.Remove(upgradePath); err != nil {
		log.Error(err)
		return
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

// 仅升级程序可用
func FinalUpgrade(flagUpdateRestart bool) {
	log.Info("开始执行更新程序", flagUpdateRestart)

	pargs := strings.Split(os.Getenv("PAPP_ARGS"), "_,_")[1:]

	path, _ := os.Executable()

	pathDir := filepath.Dir(path)
	rootPath := filepath.Join(pathDir, ncommon.IfElse(strings.LastIndex(pathDir, "bin") == len(pathDir)-3, "..", "."))
	log.Info(rootPath)
	unzipPath := filepath.Join(rootPath, "./_update_temp")

	tempZipPath := filepath.Join(rootPath, "./_update.zip")
	log.Info(unzipPath, nfile.IsExists(unzipPath))

	log.Info(path)
	// StopApp()
	log.Info(tempZipPath)
	if !nfile.IsExists(unzipPath) {
		log.Error("解压路径不存在")
		return
	}
	// 3.3 替换文件
	if err := nfile.CopyFilter(
		unzipPath,
		rootPath,
		func(file fs.FileInfo, oldPath, newPath string) bool {
			// log.Info("-> copy " + file.Name())
			return true
		},
	); err != nil {
		log.Error(err)
		return
	}
	if err := nfile.Remove(unzipPath); err != nil {
		log.Error(err)
		return
	}
	if err := nfile.Remove(tempZipPath); err != nil {
		log.Error(err)
		return
	}
	log.Info("Updated successfully!")

	// 看是否需要启动程序
	// 需要看端口等，继承上级的
	if flagUpdateRestart {
		log.Info("需要在这里启动程序")

		// OpenApp()

		os.Setenv("APP_PPID", nstrings.ToString(os.Getpid()))

		// file := netListener.File() // this returns a Dup()
		// cmd := exec.Command(executableFilePath, []string{executableFilePath, "-no-browser"}...)
		// cmd.Stdout = os.Stdout
		// cmd.Stderr = os.Stderr
		// cmd.ExtraFiles = []*os.File{}
		// err := cmd.Start()
		// if err != nil {
		// 	log.Error(err)
		// }

		// switch sysType {
		// case "linux":
		executableFilePath := filepath.Join(filepath.Dir(path), "./"+conf.SVCConfig.Name)
		switch sysType {
		case "windows":
			executableFilePath += ".exe"
		}
		process, err := os.StartProcess(executableFilePath, append([]string{"-no-browser"}, pargs...), &os.ProcAttr{
			Dir: filepath.Dir(path),
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

		// process.Wait()
		log.Error("process", process)
		// case "windows":
		// 	executableFilePath := filepath.Join(filepath.Dir(path), "./bin/"+conf.SVCConfig.Name+"-core")
		// 	switch sysType {
		// 	case "windows":
		// 		executableFilePath += ".exe"
		// 	}
		// 	cmd := exec.Command(executableFilePath, []string{"-no-browser"}...)
		// 	// 命令的错误输出和标准输出都连接到同一个管道
		// 	stdout, err := cmd.StdoutPipe()
		// 	cmd.Stderr = cmd.Stdout

		// 	if err != nil {
		// 		log.Error(err)
		// 		return
		// 	}

		// 	if err = cmd.Start(); err != nil {
		// 		log.Error(err)
		// 		return
		// 	}
		// 	// 从管道中实时获取输出并打印到终端
		// 	for {
		// 		tmp := make([]byte, 1024)
		// 		_, err := stdout.Read(tmp)
		// 		t := string(tmp)
		// 		fmt.Print("t", t)

		// 		if err != nil {
		// 			break
		// 		}
		// 	}

		// 	if err = cmd.Wait(); err != nil {
		// 		log.Error(err)
		// 		return
		// 	}
		// }
		log.Info("结束")

	}

	// wg := sync.WaitGroup{}
	// wg.Add(1)
	// ntimer.SetTimeout(func() {
	// 	log.Info("结束")
	// 	wg.Done()
	// }, 1000)

	// wg.Wait()
	// go os.Exit(1)

	// runFilePath := filepath.Join(filepath.Dir(path), "./"+conf.SVCConfig.Name)

	// if err := exec.Command(runFilePath,
	// 	"-delete-temp-run-file",
	// ).Start(); err != nil {
	// 	log.Error(err)
	// }
	// os.Exit(1)

}
