package routerV1

import (
	controllersV1 "github.com/ShiinaAiiko/meow-backups/controllers/v1"
	"github.com/ShiinaAiiko/meow-backups/services/middleware"
)

func (r Routerv1) IniToken() {
	c := new(controllersV1.TokenController)

	role := middleware.RoleMiddlewareOptions{
		BaseUrl: r.BaseUrl,
	}

	protoOption := middleware.RoleOptionsType{
		Authorize:          false,
		RequestEncryption:  false,
		ResponseEncryption: false,
		CheckAppId:         false,
		ResponseDataType:   "protobuf",
	}

	r.Group.POST(
		role.SetRole(apiUrl["getToken"], &protoOption),
		c.GetToken)

}
