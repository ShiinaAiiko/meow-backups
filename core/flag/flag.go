package flagconfig

import (
	"flag"
	"fmt"
	"github.com/cherrai/nyanyago-utils/narrays"
	"os"
	"path/filepath"
	"runtime"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/chai2010/winsvc"
)

var (
	log = conf.Log

	appPath string

	flagPort       = flag.Int("port", 30301, "Set port")
	flagStaticPath = flag.String("static-path", "./static", "Set static path")
	// flagUser       = flag.String("u", "root", "Set username")
	flagDebug     = flag.Bool("debug", false, "Set debug")
	flagNoBrowser = flag.Bool("no-browser", false, "Disable open browser")
	// flagNoConsole        = flag.Bool("no-console", false, "Disable console")
	// flagOpenAutoStart    = flag.Bool("open-autostart", false, "Open autostart")
	// flagCloseAutoStart   = flag.Bool("close-autostart", false, "Close autostart")
	// flagStartService     = flag.Bool("start-service", false, "Start service")
	// flagInstallService   = flag.Bool("install-service", false, "Install service")
	// flagUninstallService = flag.Bool("uninstall-service", false, "Uninstall service")
	// flagStop             = flag.Bool("stop", false, "Quit Meow Backups")
	flagDefalutUser = flag.Bool("default-user", false, "Defalut username")

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
	var err error

	switch runtime.GOOS {
	case "windows":
		if appPath, err = winsvc.GetAppPath(); err != nil {
			log.Error(err)
		}
		log.Info("change to current dir", appPath, err)
		if err := os.Chdir(filepath.Dir(appPath)); err != nil {
			log.Error(err)
		}
	case "linux":

	}
	log.Info(*flagPort)
	log.Info(os.Args)
	if narrays.Includes(os.Args, "-u") {
		os.Args = os.Args[narrays.Index(os.Args, "-u")+2:]
	}
	log.Info(flag.Args())
	flag.Parse()

	conf.Config.DefaultUser = *flagDefalutUser
	// conf.Config.Port = methods.GetValidPort(*flagPort)
	log.Info(*flagPort)
	log.Info(os.Args)
	log.Info(flag.Args())
	conf.Config.Port = *flagPort
	// conf.Config.Server.Mode = ncommon.IfElse(*flagDebug, "debug", "release")\
	conf.Config.Debug = *flagDebug
	// conf.Config.Server.Mode = "release"
	conf.Config.NoBrowser = *flagNoBrowser
	conf.StaticPath = *flagStaticPath
}
