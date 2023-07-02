package conf

import (
	"time"

	"github.com/cherrai/nyanyago-utils/nlog"
	"github.com/kardianos/service"
)

var (
	// SSO   *sso.SakiSSO
	// SAaSS *saass.SAaSS

	SVCConfig = &service.Config{
		Name:        "meow-backups",
		DisplayName: "meow-backups",
		Description: "meow-backups<Shiina Aiiko>",
	}

	// SSOList map[string]*sso.SakiSSO = map[string]*sso.SakiSSO{}
	Log = nlog.New()
	// Log = nlog.Nil()
)

var log = Log

// func GetSSO(appId string) *sso.SakiSSO {
// 	return SSOList[appId]
// }

func Init() bool {
	// log.Info("user.HomeDir", u.Username, u.HomeDir)

	// log.Info(user.Lookup("shiina_aiiko"))
	if !initPath() {
		return false
	}
	initFS()

	ConfigFS.Set("startTime", time.Now().Unix(), 0)

	// path, err := os.Executable()
	// if err != nil {
	// 	log.Error(err)
	// }

	// log.Info("path", path)
	// out, err := exec.Command("sudo", path, "-open-autostart").CombinedOutput()
	// if err != nil {
	// 	log.Error("cmd.Run() failed with %s\n", err)
	// }
	// log.Info("out", string(out))
	return true
}
