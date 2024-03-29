package middleware

import (
	"encoding/json"

	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/ShiinaAiiko/meow-backups/services/response"

	sso "github.com/cherrai/saki-sso-go"

	"github.com/gin-gonic/gin"
)

func Authorize() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Log.Info("------Authorize------")
		if _, isWsServer := c.Get("WsServer"); isWsServer {
			c.Next()
			return
		}
		res := response.ResponseProtobufType{}
		res.Code = 10004

		roles := new(RoleOptionsType)
		getRoles, isRoles := c.Get("roles")
		if isRoles {
			roles = getRoles.(*RoleOptionsType)
		}

		if isRoles && roles.Authorize {
			// 解析用户数据
			var token string
			var deviceId string
			// var userAgent *sso.UserAgent

			if roles.ResponseDataType == "protobuf" {
				token = c.GetString("token")
				deviceId = c.GetString("deviceId")
				// ua, exists := c.Get("userAgent")
				// if !exists {
				// 	res.Call(c)
				// 	c.Abort()
				// 	return
				// }
				// userAgent = ua.(*sso.UserAgent)
				// } else {
				// 	if roles.RequestEncryption {
				// 		if roles.ResponseDataType == "protobuf" {
				// 			token = c.GetString("token")
				// 			deviceId = c.GetString("deviceId")

				// 			ua, exists := c.Get("userAgent")
				// 			if !exists {
				// 				res.Call(c)
				// 				c.Abort()
				// 				return
				// 			}
				// 			userAgent = ua.(*sso.UserAgent)
				// 		} else {
				// 			switch c.Request.Method {
				// 			case "GET":
				// 				token = c.Query("token")
				// 				deviceId = c.Query("deviceId")

				// 			case "POST":
				// 				token = c.PostForm("token")
				// 				deviceId = c.PostForm("deviceId")
				// 			default:
				// 				break
				// 			}
				// 		}
				// 	} else {
				// 		switch c.Request.Method {
				// 		case "GET":
				// 			token = c.Query("token")
				// 			deviceId = c.Query("deviceId")

				// 		case "POST":
				// 			token = c.PostForm("token")
				// 			deviceId = c.PostForm("deviceId")
				// 		default:
				// 			break
				// 		}
				// 	}
			}
			// log.Info(token, deviceId)

			// 暂时全部开放
			if roles.isHttpServer {
				if token == "" {
					res.Call(c)
					c.Abort()
					return
				}

				if err := methods.VerifyDeviceToken(deviceId, token); err != nil {
					res.Code = 10004
					res.Errors(err)
					res.Call(c)
					c.Abort()
					return
				}
			}
		}
		c.Next()
	}
}

func ConvertResponseJson(jsonStr []byte) (sso.UserInfo, error) {
	var m sso.UserInfo
	err := json.Unmarshal([]byte(jsonStr), &m)
	if err != nil {
		log.Info("Unmarshal with error: %+v\n", err)
		return m, err
	}
	return m, nil
}
