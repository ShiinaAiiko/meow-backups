package controllersV1

import (
	"github.com/ShiinaAiiko/meow-backups/protos"
	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/ShiinaAiiko/meow-backups/services/response"
	"github.com/cherrai/nyanyago-utils/nstrings"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type TokenController struct {
}

func (fc *TokenController) GetToken(c *gin.Context) {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	res.Code = 200
	// log.Info("------GetToken------")

	// 2、获取参数
	data := new(protos.GetToken_Request)
	var err error
	if err = protos.DecodeBase64(c.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.Call(c)
		return
	}

	log.Info(data)

	// 3、检测是否需要用户名和密码
	// 暂时默认不需要
	if data.Username != "" || data.Password != "" {
		res.Errors(err)
		res.Code = 10004
		res.Call(c)
		return
	}
	// 4、生成deviceId和Token、并进行绑定

	deviceId := nstrings.StringOr(c.GetString("deviceId"), uuid.NewString())
	token := uuid.NewString()
	if err := methods.CreateDeviceToken(deviceId, token); err != nil {
		res.Errors(err)
		res.Code = 10004
		res.Call(c)
		return
	}
	responseData := protos.GetToken_Response{
		DeviceId: deviceId,
		Token:    token,
	}
	res.Data = protos.Encode(&responseData)
	res.Call(c)
}
