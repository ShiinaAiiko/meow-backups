package controllersV1

import (
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"syscall"

	"github.com/ShiinaAiiko/meow-backups/api"
	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/protos"
	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/ShiinaAiiko/meow-backups/services/response"
	"github.com/ShiinaAiiko/meow-backups/services/update"
	"github.com/cherrai/nyanyago-utils/narrays"
	"github.com/cherrai/nyanyago-utils/ncommon"
	"github.com/cherrai/nyanyago-utils/nint"
	"github.com/cherrai/nyanyago-utils/nsocketio"
	"github.com/cherrai/nyanyago-utils/nstrings"
	"github.com/cherrai/nyanyago-utils/ntimer"
	"github.com/cherrai/nyanyago-utils/validation"
	"github.com/gin-gonic/gin"
)

type AppController struct {
}

func downloadProgressEmit(progress *int, version string) {
	var res response.ResponseProtobufType
	res.Code = 200

	conn := nsocketio.ConnContext{
		ServerContext: conf.SocketIO,
	}
	responseData := &protos.CheckForUpdates_Response{
		Status:           2,
		DownloadProgress: float32(*progress),
		Version:          version,
	}
	responseData.DownloadProgress = float32(*progress) / 100

	res.Data = protos.Encode(responseData)

	conn.BroadcastToRoom(api.Namespace[api.ApiVersion]["backup"],
		"watchBackupStatus",
		api.EventName[api.ApiVersion]["routeEventName"]["checkForUpdates"],
		res.GetResponse())
}

func (fc *AppController) CheckForUpdates(c *gin.Context) {

	// 1、初始化返回体
	var res response.ResponseProtobufType
	res.Code = 200
	log.Info("CheckForUpdates")

	// 2、获取参数
	data := new(protos.CheckForUpdates_Request)
	var err error
	if err = protos.DecodeBase64(c.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
		validation.Parameter(&data.Type, validation.Enum([]string{
			"CheckForUpdates", "DownloadUpdate", "Install",
		}), validation.Type("string"), validation.Required()),
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}
	log.Info(data)

	responseData := &protos.CheckForUpdates_Response{
		Status:           -1,
		DownloadProgress: 0,
		Version:          "",
	}
	// responseData := &protos.CheckForUpdates_Response{
	// 	Status:           1,
	// 	DownloadProgress: float32(nint.ToInt64(matchArr[len(matchArr)-1])),
	// 	Version:          ncommon.IfElse(len(matchArr) >= 0, matchArr[len(matchArr)-1], ""),
	// }

	switch data.Type {
	case "Install":
		go func() {
			log.Info("-install-restart")
			// 让守护程序来进行安装执行安装恒旭，而非core库，监听打印
			if err = update.StartUpdate(true); err != nil {
				res.Errors(err)
				res.Code = 10001
				res.Call(c)
				return
			}
			methods.StopApp()
		}()

	case "DownloadUpdate":
		log.Info("开始更新")

		version, err := update.CheckForUpdates()
		if err != nil {
			res.Errors(err)
			res.Code = 10001
			res.Call(c)
			return
		}
		log.Info(version)
		// log.Info("version", version)
		if version.Version != conf.Version {
			responseData.Status = 2
			responseData.Version = version.Version
		}

		// 1 开始下载
		log.Info("开始下载")

		progress := 0

		t := ntimer.SetInterval(func() {
			downloadProgressEmit(&progress, version.Version)
		}, 500)
		go func() {
			if err = update.DownloadUpdate(version, func(p int) {
				progress = p
				if p == 100 {
					t.Stop()
					downloadProgressEmit(&progress, version.Version)
				}
			}); err != nil {
				t.Stop()
			}
		}()

	case "CheckForUpdates":
		// 发现了新版本<(.*?)>
		version, err := update.CheckForUpdates()
		if err != nil {
			if err.Error() == "already the latest version" {
				responseData.Version = conf.Version
				responseData.Status = -1
				res.Data = protos.Encode(responseData)
				res.Call(c)
				return
			}
			res.Errors(err)
			res.Code = 10001
			res.Call(c)
			return
		}
		// log.Info("version", version)
		if version.Version != conf.Version {
			responseData.Version = version.Version
			responseData.Status = 1
		}

	}

	res.Data = protos.Encode(responseData)
	res.Call(c)
}

func (fc *AppController) GetSystemConfig(c *gin.Context) {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	res.Code = 200
	// log.Info("------GetSystemConfig------")

	// 2、获取参数
	data := new(protos.GetSystemConfig_Request)
	var err error
	if err = protos.DecodeBase64(c.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}

	// systemConfig := typings.SystremConfig{
	// 	AutomaticStart: false,
	// 	Language:       "system",
	// 	Appearance:     "system",
	// }
	systemConfig := map[string]interface{}{}

	systemConfig["automaticStart"] = false
	systemConfig["language"] = "system"
	systemConfig["appearance"] = "system"

	scVal, err := conf.ConfigFS.Get("systemConfig")
	// log.Warn("systemConfig", scVal, err)
	if scVal != nil && err == nil {
		sc := scVal.Value().((map[string]interface{}))
		// sc := scVal.Value().((map[string]interface{}))
		// systemConfig.AutomaticStart = sc["automaticStart"].(bool)
		// systemConfig.Language = sc["language"].(string)
		// systemConfig.Appearance = sc["appearance"].(string)
		systemConfig["language"] = sc["language"]
		systemConfig["appearance"] = sc["appearance"]
		// automaticStart = systemConfig["AutomaticStart"].(bool)

		systemConfig["automaticStart"] = methods.IsAutoStart()
	}
	if err = conf.ConfigFS.Set("systemConfig", systemConfig, 0); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}

	startTime, _ := conf.ConfigFS.Get("startTime")
	res.Data = protos.Encode(&protos.GetSystemConfig_Response{
		// Language:       systemConfig.Language,
		// Appearance:     systemConfig.Appearance,
		// AutomaticStart: systemConfig.AutomaticStart,
		Language:       systemConfig["language"].(string),
		Appearance:     systemConfig["appearance"].(string),
		AutomaticStart: systemConfig["automaticStart"].(bool),
		Os:             runtime.GOOS,
		Version:        conf.Version + " " + runtime.GOOS + " (" + nstrings.ToString(32<<(^uint(0)>>63)) + "-bit " + runtime.GOARCH + ")",
		GithubUrl:      "https://github.com/ShiinaAiiko/meow-backups",
		StartTime:      nint.ToInt64(startTime.Value()),
		Path: &protos.GetSystemConfig_Response_Path{
			Home:     conf.HomePath,
			Config:   conf.ConfigFolderPath,
			Database: conf.DatabasePath,
		},
	})
	res.Call(c)
}

func (fc *AppController) Quit(c *gin.Context) {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	res.Code = 200
	res.Call(c)
	go func() {
		methods.StopApp()
		os.Exit(0)
	}()
}

func (fc *AppController) Restart(c *gin.Context) {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	res.Code = 200
	log.Info("Restart")
	res.Call(c)
	go func() {
		log.Error("正在重启程序...", os.Args)
		log.Info("-restart")
		path, err := os.Executable()
		if err != nil {
			log.Error(err)
		}
		// 下面这个不兼容windows
		switch runtime.GOOS {
		case "linux":
			if err := syscall.Exec(path, os.Args, os.Environ()); err != nil {
				log.Error(err)
			}
		case "windows":
			os.Setenv("APP_PPID", nstrings.ToString(os.Getpid()))

			// log.Info("2121212222222222")
			process, err := os.StartProcess(path, os.Args, &os.ProcAttr{
				Dir:   filepath.Dir(path),
				Files: []*os.File{os.Stdin, os.Stdout, os.Stderr},
				Env:   os.Environ(),
				Sys:   &syscall.SysProcAttr{},
			})
			// log.Info("2121212222222222", nil)
			// log.Info("process", process)
			// log.Error("process", process)
			// log.Info("process", process)

			if err != nil {
				log.Error(err)
				return
			}

			log.Error("process", process)
			os.Exit(0)
		}
	}()
}

func (fc *AppController) UpdateSystemConfig(c *gin.Context) {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	res.Code = 200
	// log.Info("------UpdateSystemConfig------")

	// 2、获取参数
	data := new(protos.UpdateSystemConfig_Request)
	var err error
	if err = protos.DecodeBase64(c.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
		validation.Parameter(&data.Language, validation.Enum([]string{
			"zh-CN", "zh-TW", "en-US", "system",
		}), validation.Type("string"), validation.Required()),
		validation.Parameter(&data.Appearance, validation.Enum([]string{
			"black", "dark", "light", "system",
		}), validation.Type("string"), validation.Required()),
		validation.Parameter(&data.AutomaticStart, validation.Type("string")),
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}

	systemConfig := map[string]interface{}{}
	// systemConfig["automaticStart"] = data.AutomaticStart
	systemConfig["language"] = data.Language
	systemConfig["appearance"] = data.Appearance

	sc, err := conf.ConfigFS.Get("systemConfig")
	if err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}
	if sc != nil {
		tsc := sc.Value().(map[string]interface{})
		systemConfig["automaticStart"] = tsc["automaticStart"].(bool)
	}

	if data.AutomaticStart != "" {
		systemConfig["automaticStart"] = data.AutomaticStart == "true"

		switch runtime.GOOS {
		case "windows":
			cmd := exec.Command("../meow-backups",
				ncommon.IfElse(data.AutomaticStart == "true",
					"-open-autostart", "-close-autostart"))
			err := cmd.Start()
			if err != nil {
				log.Error(err)
			}

			systemConfig["automaticStart"] = methods.IsAutoStart()
		case "linux":
			log.Info("设置自启功能")
			if data.AutomaticStart == "true" {
				err := methods.OpenAutoStart()
				if err != nil {
					log.Error(err)
					res.Errors(err)
					res.Code = 10002
					res.Call(c)
					return
				}
			} else {
				err := methods.CloseAutoStart()
				if err != nil {
					log.Error(err)
					res.Errors(err)
					res.Code = 10002
					res.Call(c)
					return
				}
			}
			systemConfig["automaticStart"] = methods.IsAutoStart()
			// if systemConfig.AutomaticStart {
			// 	// p, err := os.Executable()
			// 	// if err != nil {
			// 	// 	log.Error(err)
			// 	// }
			// 	// if err := syscall.Exec(path, []string{
			// 	// 	"-open-autostart",
			// 	// }, os.Environ()); err != nil {
			// 	// 	log.Error(err)
			// 	// }

			// 	// log.Info("path", path)
			// 	out, err := exec.Command("sudo", "/home/shiina_aiiko/Workspace/Development/@Aiiko/ShiinaAiikoDevWorkspace/@OpenSourceProject/shiina_aiiko/meow-backups/build/meow-backups", "-open-autostart").CombinedOutput()
			// 	if err != nil {
			// 		log.Error("cmd.Run() failed with %s\n", err)
			// 	}
			// 	log.Info("out", string(out))
			// 	// methods.OpenAutoStart()
			// } else {
			// 	methods.CloseAutoStart()
			// }
		default:
		}

	}
	if err = conf.ConfigFS.Set("systemConfig", systemConfig, 0); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}
	// systray.Quit()
	conf.TraybarEvent.Dispatch("UpdateMenu", "")
	res.Data = protos.Encode(&protos.UpdateSystemConfig_Response{})
	res.Call(c)
}

func (fc *AppController) GetAppSummaryInfo(c *gin.Context) {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	res.Code = 200
	// log.Info("------GetToken------")

	// 2、获取参数
	data := new(protos.GetAppSummaryInfo_Request)
	var err error
	if err = protos.DecodeBase64(c.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}

	lastBackupTime := int64(0)
	backups, err := conf.BackupsFS.Values()
	if err != nil {
		res.Errors(err)
		res.Code = 10001
		res.Call(c)
		return
	}

	localFolderStatus := &protos.FolderStatus{
		Files:   0,
		Folders: 0,
		Size:    0,
	}

	backupFolderStatus := &protos.FolderStatus{
		Files:   0,
		Folders: 0,
		Size:    0,
	}

	paths := []string{}

	// log.Info("backups", backups)
	for _, v := range backups {
		backup := v.Value()
		if backup.LastBackupTime != 0 && lastBackupTime < backup.LastBackupTime {
			lastBackupTime = backup.LastBackupTime
		}

		if !narrays.Includes(paths, backup.Path) && backup.LocalFolderStatus != nil {
			paths = append(paths, backup.Path)
			localFolderStatus.Files += backup.LocalFolderStatus.Files
			localFolderStatus.Folders += backup.LocalFolderStatus.Folders
			localFolderStatus.Size += backup.LocalFolderStatus.Size

		}

		if !narrays.Includes(paths, backup.BackupPath) && backup.BackupFolderStatus != nil {
			paths = append(paths, backup.BackupPath)
			backupFolderStatus.Files += backup.BackupFolderStatus.Files
			backupFolderStatus.Folders += backup.BackupFolderStatus.Folders
			backupFolderStatus.Size += backup.BackupFolderStatus.Size

		}

	}

	deviceTokens := conf.DeviceTokenFS.Keys()
	if err != nil {
		res.Errors(err)
		res.Code = 10001
		res.Call(c)
		return
	}

	conn := nsocketio.ConnContext{
		ServerContext: conf.SocketIO,
	}
	conns := conn.GetAllConnContextInRoom(namespace["backup"], "watchBackupStatus")
	// log.Info("conns", conns, conn.Namespace())
	// startTime, _ := conf.ConfigFS.Get("startTime")
	res.Data = protos.Encode(&protos.GetAppSummaryInfo_Response{
		LocalFolderStatus:       localFolderStatus,
		BackupFolderStatus:      backupFolderStatus,
		LastBackupTime:          lastBackupTime,
		CurrentOnlineDevices:    nint.ToInt64(len(conns)),
		HistoricalOnlineDevices: nint.ToInt64(len(deviceTokens)),
		// Version:                 "v1.0.0, " + runtime.GOOS + " (" + nstrings.ToString(32<<(^uint(0)>>63)) + "-bit " + runtime.GOARCH + ")",
		// GithubUrl:               "https://github.com/ShiinaAiiko/meow-backups",
		// StartTime:               nint.ToInt64(startTime),
	})
	res.Call(c)
}
