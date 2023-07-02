package routers

import (
	"github.com/ShiinaAiiko/meow-backups/api"
	conf "github.com/ShiinaAiiko/meow-backups/config"
	routerV1 "github.com/ShiinaAiiko/meow-backups/routers/v1"

	"github.com/gin-gonic/gin"
)

func InitRouter(r *gin.Engine) {
	r.GET("/socket.io/*any", gin.WrapH(conf.SocketIO.Server))
	r.POST("/socket.io/*any", gin.WrapH(conf.SocketIO.Server))
	// r.StaticFS("/static", http.Dir("./static"))
	// r.StaticFile("/index.html", "./static/index.html")
	// r.StaticFile("/", "./static/index.html")

	api := api.ApiUrls[api.ApiVersion]
	rv1 := routerV1.Routerv1{
		Engine:  r,
		BaseUrl: api["versionPrefix"],
	}

	rv1.Init()
}
