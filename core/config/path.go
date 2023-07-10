package conf

import (
	"io/ioutil"
	"os"
	"os/exec"
	"os/user"
	"path/filepath"
	"runtime"

	"github.com/cherrai/nyanyago-utils/ncommon"
	"github.com/cherrai/nyanyago-utils/nfile"
)

var (
	HomePath         = ""
	ConfigFolderPath = ""
	DatabasePath     = ""
	StaticPath       = ""
)

func initPath() bool {
	u, _ := user.Current()
	HomePath = u.HomeDir
	log.Info("HomeDir", HomePath)
	// log.Error(os.Args)

	// 检测用户名
	if !Config.DefaultUser {
		switch runtime.GOOS {
		case "linux":
			p, err := os.Executable()
			if err != nil {
				log.Error(err)
			}

			// log.Info(p, path.Dir(p))
			userConfigFilePath := filepath.Join(filepath.Dir(p), "user")
			if nfile.IsExists(userConfigFilePath) {
				fileBuffer, err := ioutil.ReadFile(userConfigFilePath)
				if err != nil {
					log.Error(err)
					return false
				}
				if string(fileBuffer) != "" {
					// log.Info(string(fileBuffer))
					cu, err := user.Lookup(string(fileBuffer))
					if err != nil {
						log.Error(err)
						return false
					} else {
						if cu.Username != u.Username {
							HomePath = cu.HomeDir
							// HomeDir = cu.HomeDir
							// log.Info("用户名不一样")

							createUserConfigFile(userConfigFilePath, cu.Username)
							args := append([]string{
								"-u", string(fileBuffer), p,
							}, os.Args[1:]...)
							// log.Warn("args", args)
							cmd := exec.Command("sudo", args...)
							cmd.Stdout = os.Stdout
							cmd.Stderr = os.Stderr

							// uid, _ := strconv.Atoi(cu.Uid)
							// gid, _ := strconv.Atoi(cu.Gid)

							// log.Info(uid, gid)
							// cdl := &syscall.Credential{
							// 	Uid: uint32(uid),
							// 	Gid: uint32(gid),
							// }
							// cmd.SysProcAttr = &syscall.SysProcAttr{
							// 	Credential: cdl,
							// }

							err = cmd.Run()
							if err != nil {
								log.Error(err)
								return false
							}
							return false
						}
					}
				} else {
					createUserConfigFile(userConfigFilePath, u.Username)
				}
			} else {
				createUserConfigFile(userConfigFilePath, u.Username)
			}
		}
	}

	switch runtime.GOOS {
	case "windows":
		ConfigFolderPath = filepath.Join(HomePath, "/AppData/Local/"+SVCConfig.Name+ncommon.IfElse(Config.Debug, "-debug", ""))
	default:
		ConfigFolderPath = filepath.Join(HomePath, "/.config/"+SVCConfig.Name+ncommon.IfElse(Config.Debug, "-debug", ""))
	}
	DatabasePath = filepath.Join(ConfigFolderPath, "./s/fs.db")
	// log.Warn("DatabasePath", DatabasePath)
	return true
}

func createUserConfigFile(userConfigFilePath, username string) {
	f, err := os.Create(userConfigFilePath)
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
	f.Write([]byte(username))
}
