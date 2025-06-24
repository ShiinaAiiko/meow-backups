package traybar

import (
	"os"
	"runtime"
	"strings"
	"syscall"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/ShiinaAiiko/meow-backups/traybar/icon"
	"github.com/cherrai/nyanyago-utils/neventListener"
	"github.com/cherrai/nyanyago-utils/nstrings"
	"github.com/getlantern/systray"
	"github.com/shirou/gopsutil/process"
)

var (
	log       = conf.Log
	language  = "en-US"
	languages = map[string]map[string]string{
		"zh-CN": {
			"appTitle": "喵备份",
			"openApp":  "打开 {{appTitle}}",
			"quit":     "退出",
			"quitApp":  "退出 {{appTitle}}",
		},
		"zh-TW": {
			"appTitle": "喵備份",
			"openApp":  "打開 {{appTitle}}",
			"quit":     "退出",
			"quitApp":  "退出 {{appTitle}}",
		},
		"en-US": {
			"appTitle": "Meow Backups",
			"openApp":  "Open {{appTitle}}",
			"quit":     "Quit",
			"quitApp":  "Quit {{appTitle}}",
		},
	}
	mOpen *systray.MenuItem
	mQuit *systray.MenuItem
)

func Install() {
	log.Info("systray install")

	// systray.Quit()
	go systray.Run(onReady, onExit)
}
func t(key string) string {
	return languages[language][key]
}
func SetTitle(title string) {
	if title == "" {
		systray.SetTitle("")
		// systray.SetTitle(t("appTitle"))
	} else {
		systray.SetTitle(title)
	}
}
func UpdateMenu() {
	scVal, err := conf.ConfigFS.Get("systemConfig")
	if scVal != nil && err == nil {
		sc := scVal.Value().((map[string]interface{}))
		if sc["lang"] != nil {
			language = sc["lang"].(string)
		}

	}
	systray.SetTitle("")
	// systray.SetTitle(t("appTitle"))
	systray.SetTooltip(t("appTitle"))
	openApp := strings.Replace(t("openApp"), "{{appTitle}}", t("appTitle"), -1)
	mOpen.SetTitle(openApp)
	mOpen.SetTooltip(openApp)
	quitApp := strings.Replace(t("quitApp"), "{{appTitle}}", t("appTitle"), -1)
	mQuit.SetTitle(t("quit"))
	mQuit.SetTooltip(quitApp)
}
func onReady() {
	log.Info("onReady")
	systray.SetIcon(icon.Data)
	// "Open Meow Backups"
	mOpen = systray.AddMenuItem("", "")
	mQuit = systray.AddMenuItem("", "")
	UpdateMenu()

	conf.TraybarEvent = neventListener.New[neventListener.H]()

	conf.TraybarEvent.On("UpdateMenu", func(_ neventListener.H) {
		UpdateMenu()
	})
	conf.TraybarEvent.On("SetTitle", func(value neventListener.H) {
		SetTitle(value.(string))
	})
	// log.Info("mQuit", mQuit)
	// Sets the icon of a menu item. Only available on Mac and Windows.
	// mQuit.SetIcon(icon.Data)
	go func() {
		for {
			select {
			case <-mOpen.ClickedCh:
				methods.OpenUrl("http://127.0.0.1:" + nstrings.ToString(conf.Config.Port))

			case <-mQuit.ClickedCh:
				// systray.Quit()
				log.Info("Quit2 now...")
				log.Warn("Killed the process with pid " + nstrings.ToString(os.Getpid()))
				p, err := process.NewProcess(int32(os.Getpid()))
				if err != nil {
					log.Error(err)
				}
				p.SendSignal(syscall.SIGINT)
				switch runtime.GOOS {
				case "windows":
					p.Kill()
				case "linux":
				}

				return
			}
			// case <-mChange.ClickedCh:
			// 	mChange.SetTitle("I've Changed")
			// case <-mChecked.ClickedCh:
			// 	if mChecked.Checked() {
			// 		mChecked.Uncheck()
			// 		mChecked.SetTitle("Unchecked")
			// 	} else {
			// 		mChecked.Check()
			// 		mChecked.SetTitle("Checked")
			// 	}
			// case <-mEnabled.ClickedCh:
			// 	mEnabled.SetTitle("Disabled")
			// 	mEnabled.Disable()
			// case <-mUrl.ClickedCh:
			// 	open.Run("https://www.getlantern.org")
			// case <-subMenuBottom2.ClickedCh:
			// 	panic("panic button pressed")
			// case <-subMenuBottom.ClickedCh:
			// 	toggle()
			// case <-mToggle.ClickedCh:
			// 	toggle()
		}
	}()
}

func onExit() {
	log.Info("onExit")
	// clean up here
}
