package flagconfig

import (
	"flag"
	"fmt"
	"os"
	"path/filepath"
	"runtime"

	"github.com/cherrai/nyanyago-utils/ncommon"
	"github.com/cherrai/nyanyago-utils/nfile"
	"github.com/cherrai/nyanyago-utils/nstrings"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/ShiinaAiiko/meow-backups/services/update"
)

var (
	log     = conf.Log
	sysType = runtime.GOOS
	appPath string

	flagConfigFilePath = flag.String("config", "./config.json", "Set config file path")
	flagPort           = flag.Int("port", 30301, "Set port")
	flagStaticPath     = flag.String("static-path", "./static", "Set static path")
	flagDebug          = flag.Bool("debug", false, "Set debug")
	flagNoBrowser      = flag.Bool("no-browser", false, "Disable open browser")
	flagNoConsole      = flag.Bool("no-console", false, "Disable console")
	flagDefalutUser    = flag.Bool("default-user", false, "Defalut username")

	flagVersion   = flag.Bool("version", false, "Get version code")
	flagPlatform  = flag.Bool("platform", false, "Get platform")
	flagGitRev    = flag.Bool("gitRev", false, "Get git rev")
	flagBuildTime = flag.Bool("build-time", false, "Get build time")
	// flagFinalUpgrade    = flag.Bool("final-upgrade", false, "Final Upgrade Process")
	flagUpdate          = flag.Bool("update", false, "Update meow backups")
	flagCheckForUpdates = flag.Bool("check-update", false, "Check for Updates")
	flagUpdateRestart   = flag.Bool("update-restart", false, "Update and restart")

	flagOpenAutoStart    = flag.Bool("open-autostart", false, "Open autostart")
	flagIsAutoStart      = flag.Bool("is-autostart", false, "Is autostart enabled?")
	flagCloseAutoStart   = flag.Bool("close-autostart", false, "Close autostart")
	flagStartService     = flag.Bool("start-service", false, "Start service")
	flagInstallService   = flag.Bool("install-service", false, "Install service")
	flagUninstallService = flag.Bool("uninstall-service", false, "Uninstall service")
	flagStop             = flag.Bool("stop", false, "Quit Meow Backups")

	// flagServiceName = flag.String("service-name", "hello-winsvc", "Set service name")
	// flagServiceDesc = flag.String("service-desc", "hello windows service", "Set service description")

	// flagServiceInstall   = flag.Bool("service-install", false, "Install service")
	// flagServiceUninstall = flag.Bool("service-remove", false, "Remove service")
	// flagServiceStart     = flag.Bool("service-start", false, "Start service")
	// flagServiceStop      = flag.Bool("service-stop", false, "Stop service")

	flagHelp = flag.Bool("help", false, "Show usage and exit.")
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

	// change to current dir
	// var err error

	// switch sysType {
	// case "windows":
	// 	if appPath, err = winsvc.GetAppPath(); err != nil {
	// 		log.Error(err)
	// 	}
	// 	// log.Info("change to current dir", appPath, err)
	// 	if err := os.Chdir(filepath.Dir(appPath)); err != nil {
	// 		log.Error(err)
	// 	}
	// case "linux":

	// }

	// ex, err := os.Executable()
	// if err != nil {
	// 	log.Error(err)
	// }
	// exPath := filepath.Dir(ex)
	// log.Info(exPath)
}

func FlagParse() bool {
	flag.Parse()
	path, _ := os.Executable()
	dirPath := filepath.Dir(path)
	configFilePath := filepath.Join(dirPath, *flagConfigFilePath)
	if nfile.IsExists(configFilePath) && *flagConfigFilePath != "" {
		if err := conf.GetConfig(configFilePath); err != nil {
			log.Error(err)
			return false
		}
	}
	log.Info(*flagConfigFilePath)
	log.Info(configFilePath)
	log.Info(conf.Config)
	log.Info(conf.Config.Port)
	log.Info(conf.Config.Debug)
	log.Info(*flagPort)
	log.Info(*flagDebug)
	// log.Info(*flagPort, conf.Config.Port, ncommon.IfElse(*flagPort != 30301,
	// 	*flagPort, conf.Config.Port))
	conf.Config.Port = ncommon.IfElse(*flagPort != 30301,
		*flagPort, conf.Config.Port)
	// log.Info(*flagPort, conf.Config.Port, ncommon.IfElse(*flagPort != 30301,
	// 	*flagPort, conf.Config.Port))
	conf.Config.StaticPath = nstrings.StringOr(ncommon.IfElse(*flagStaticPath != "./config.json",
		*flagStaticPath, conf.Config.StaticPath), "./config.json")
	conf.Config.Debug = ncommon.IfElse(*flagDebug,
		*flagDebug, conf.Config.Debug)
	conf.Config.NoBrowser = ncommon.IfElse(*flagNoBrowser,
		*flagNoBrowser, conf.Config.NoBrowser)
	conf.Config.NoConsole = ncommon.IfElse(*flagNoConsole,
		*flagNoConsole, conf.Config.NoConsole)
	conf.Config.DefaultUser = ncommon.IfElse(*flagDefalutUser,
		*flagDefalutUser, conf.Config.DefaultUser)

	log.Info(conf.Config)
	log.Info(conf.Config.Port)
	log.Info(conf.Config.Debug)
	switch sysType {
	case "windows":
		// log.Info("看看这是什么", winsvc.InServiceMode(), winsvc.IsAnInteractiveSession())
	case "linux":

	}
	// log.Info("*flagCopyUpdateFile", flag.Args(), *flagFinalUpgrade)

	// if *flagFinalUpgrade {
	// 	update.FinalUpgrade(*flagUpdateRestart)
	// 	return false
	// } else {
	// 	update.DeleteUpgradeFile()
	// }
	update.DeleteUpgradeFile()

	if *flagVersion {
		log.Println(os.Stdout, conf.Version)
		return false
	}
	if *flagPlatform {
		log.Println(os.Stdout, conf.Platform)
		return false
	}
	if *flagGitRev {
		log.Println(os.Stdout, conf.GitRev)
		return false
	}
	if *flagBuildTime {
		log.Println(os.Stdout, conf.BuildTime)
		return false
	}

	if *flagCheckForUpdates {
		version, err := update.CheckForUpdates()
		if err != nil {
			log.Error(err)
		}
		log.Println(os.Stdout, "发现了新版本<"+version.Version+">")
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
		update.StartUpdate(*flagUpdateRestart)
		methods.StopApp()
		return false
	}

	if conf.Config.NoConsole {
		methods.NoConsoleRunApp()
		return false
	}

	if *flagOpenAutoStart {
		methods.OpenAutoStart()
		return false
	}

	if *flagIsAutoStart {
		if methods.IsAutoStart() {
			log.Println(os.Stdout, "enabled")
		} else {
			log.Println(os.Stdout, "disabled")
		}

		return false
	}
	if *flagCloseAutoStart {
		methods.CloseAutoStart()
		return false
	}
	if *flagStartService {
		methods.StartService()
		return false
	}
	if *flagStop {
		methods.StopApp()
		return false
	}
	if *flagInstallService {
		methods.InstallService()
		return false
	}
	if *flagUninstallService {
		methods.UninstallService()
		return false
	}
	return true
}
