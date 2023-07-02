package socketioRouter

import (
	"github.com/ShiinaAiiko/meow-backups/api"
	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/routers/socketioRouter/v1"
)

var namespace = api.Namespace[api.ApiVersion]
var eventName = api.EventName[api.ApiVersion]

func InitRouter() {
	// fmt.Println(conf.SocketIoServer)

	rv1 := socketioRouter.V1{
		Server: conf.SocketIO,
		Router: socketioRouter.RouterV1{
			Base:   namespace["base"],
			Backup: namespace["backup"],
		},
	}
	rv1.Init()
}
