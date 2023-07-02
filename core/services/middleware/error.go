package middleware

import (
	"reflect"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/services/response"

	"github.com/gin-gonic/gin"
)

var (
	log = conf.Log
)

func Error() gin.HandlerFunc {
	return func(c *gin.Context) {
		// roles := c.MustGet("roles").(*RoleOptionsType)
		defer func() {
			// fmt.Println("Error middleware.2222222222222")
			// fmt.Println("roles1", roles)
			// fmt.Println("Error mid getRoles", roles.ResponseDataType)
			if err := recover(); err != nil {
				log.FullCallChain("<"+c.Request.URL.Path+">"+" Gin Error: "+err.(error).Error(), "Error")

				var res response.ResponseProtobufType
				res.Code = 10001
				switch reflect.TypeOf(err).String() {
				case "string":
					res.Error = err.(string)
					break
				case "*errors.errorString":
					res.Error = err.(error).Error()
					break
				case "runtime.errorString":
					res.Error = err.(error).Error()
					break

				}
				res.Call(c)
				c.Abort()
			}
		}()
		c.Next()
	}
}
