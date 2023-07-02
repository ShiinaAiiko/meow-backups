package conf

import (
	"github.com/ShiinaAiiko/meow-backups/protos"
	"github.com/ShiinaAiiko/meow-backups/typings"
	"github.com/cherrai/nyanyago-utils/fileStorageDB"
)

var (
	// ConfigFS      *fileStorage.FileStorage[fileStorage.H]
	// DeviceTokenFS *fileStorage.FileStorage[*typings.DeviceTokenInfo]
	// BackupsFS     *fileStorage.FileStorage[*protos.BackupItem]

	ConfigFS      *fileStorageDB.Model[fileStorageDB.H]
	DeviceTokenFS *fileStorageDB.Model[*typings.DeviceTokenInfo]
	BackupsFS     *fileStorageDB.Model[*protos.BackupItem]
)

func initFS() {
	// if runtime.GOOS == "windows" {
	// 	home := os.Getenv("HOMEDRIVE") + os.Getenv("HOMEPATH")
	// 	if home == "" {
	// 		home = os.Getenv("USERPROFILE")
	// 	}
	// }

	db, err := fileStorageDB.Open(DatabasePath)
	if err != nil {
		log.Error(err)
	}

	ConfigFS, err = fileStorageDB.CreateModel[fileStorageDB.H](db, "config")
	if err != nil {
		log.Error(err)
		return
	}

	DeviceTokenFS, err = fileStorageDB.CreateModel[*typings.DeviceTokenInfo](db, "deviceToken")
	if err != nil {
		log.Error(err)
		return
	}

	BackupsFS, err = fileStorageDB.CreateModel[*protos.BackupItem](db, "backups")
	if err != nil {
		log.Error(err)
		return
	}

	// ConfigFS = fileStorage.New[fileStorage.H](&fileStorage.FileStorageOptions{
	// 	Label:       "config",
	// 	StoragePath: DatabasePath,
	// })
	// DeviceTokenFS = fileStorage.New[*typings.DeviceTokenInfo](&fileStorage.FileStorageOptions{
	// 	Label:       "deviceToken",
	// 	StoragePath: DatabasePath,
	// })
	// BackupsFS = fileStorage.New[*protos.BackupItem](&fileStorage.FileStorageOptions{
	// 	Label:       "backups",
	// 	StoragePath: DatabasePath,
	// })
}

// ntimer.SetTimeout(func() {
// 	user, _ := user.Current()
// 	type A struct {
// 		CC string
// 	}
// 	systemConfig := fileStorage.New[string](&fileStorage.FileStorageOptions{
// 		Label:       "systemConfig",
// 		StoragePath: path.Join(user.HomeDir, "/.config/meow-backups/s"),
// 	})
// 	log.Info(systemConfig)

// 	// systemConfig.Set("ce1s", "cesaaaaaaaa", 0)
// 	// systemConfig.Set("ces", "cesaaaaaaaa", 5000*time.Second)

// 	// systemConfig.Set("ces3", &A{
// 	// 	CC: "sasa3",
// 	// }, 5000*time.Second)
// 	// log.Info(systemConfig.Get("ces"))
// 	// vvvv, _ := systemConfig.Get("ces3")
// 	// log.Info(vvvv, vvvv.CC)
// 	log.Info(systemConfig.Keys())
// 	log.Info(systemConfig.Values())
// 	// systemConfig.Delete("ces")
// }, 1000)
