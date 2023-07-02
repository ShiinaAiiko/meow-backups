package routerV1

import (
	controllersV1 "github.com/ShiinaAiiko/meow-backups/controllers/v1"
	"github.com/ShiinaAiiko/meow-backups/services/middleware"
)

func (r Routerv1) InitApp() {
	c := new(controllersV1.AppController)

	role := middleware.RoleMiddlewareOptions{
		BaseUrl: r.BaseUrl,
	}

	protoOption := middleware.RoleOptionsType{
		Authorize:          true,
		RequestEncryption:  false,
		ResponseEncryption: false,
		CheckAppId:         false,
		ResponseDataType:   "protobuf",
	}

	r.Group.GET(
		role.SetRole(apiUrl["getSystemConfig"], &protoOption),
		c.GetSystemConfig)

	r.Group.GET(
		role.SetRole(apiUrl["getAppSummaryInfo"], &protoOption),
		c.GetAppSummaryInfo)

	r.Group.POST(
		role.SetRole(apiUrl["updateSystemConfig"], &protoOption),
		c.UpdateSystemConfig)

	r.Group.POST(
		role.SetRole(apiUrl["quit"], &protoOption),
		c.Quit)

	r.Group.POST(
		role.SetRole(apiUrl["restart"], &protoOption),
		c.Restart)

	r.Group.GET(
		role.SetRole(apiUrl["checkForUpdates"], &protoOption),
		c.CheckForUpdates)
}
