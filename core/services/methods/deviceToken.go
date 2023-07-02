package methods

import (
	"errors"
	"time"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/typings"
)

func CreateDeviceToken(deviceId, token string) error {
	dt := typings.DeviceTokenInfo{
		DeviceId:  deviceId,
		Token:     token,
		LoginTime: time.Now().Unix(),
	}
	return conf.DeviceTokenFS.Set(dt.DeviceId, &dt, 3600*24*time.Second)
}

func VerifyDeviceToken(deviceId, token string) error {
	dt, err := conf.DeviceTokenFS.Get(deviceId)
	if err != nil {
		return err
	}

	if dt.Value().Token != token {
		return errors.New("device token verification failed")
	}
	return nil
}
