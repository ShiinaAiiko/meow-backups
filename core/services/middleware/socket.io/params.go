package socketioMiddleware

import (
	"github.com/ShiinaAiiko/meow-backups/services/response"
	"github.com/cherrai/nyanyago-utils/nsocketio"
)

func Params() nsocketio.HandlerFunc {
	return func(e *nsocketio.EventInstance) (err error) {
		var res response.ResponseProtobufType
		res.Code = 10001
		enDataMap := e.GetParamsMap("data")
		enProtobufData := enDataMap["data"].(string)

		e.Set("data", enProtobufData)
		e.Next()
		return
	}
}
