package controllersV1

import (
	"github.com/ShiinaAiiko/meow-backups/api"
	conf "github.com/ShiinaAiiko/meow-backups/config"
)

var (
	log            = conf.Log
	namespace      = api.Namespace[api.ApiVersion]
	routeEventName = api.EventName[api.ApiVersion]["routeEventName"]
)
