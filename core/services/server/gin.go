package server

import (
	"strconv"

	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/routers"
	"github.com/ShiinaAiiko/meow-backups/services/middleware"
	"github.com/cherrai/nyanyago-utils/ncommon"

	"github.com/gin-gonic/gin"
)

var log = conf.Log

var GinRouter *gin.Engine

func Init() {
	// gin.SetMode(conf.Config.Server.Mode)
	// Router = gin.New()

	gin.SetMode(ncommon.IfElse(conf.Config.Debug, "debug", "release"))
	GinRouter = gin.New()

	InitSocketIO()
	InitGin()
	run()
}

func InitGin() {
	// 处理跨域
	GinRouter.Use(middleware.Cors([]string{"*"}))
	GinRouter.NoMethod(func(ctx *gin.Context) {
		ctx.String(200, "Meow Whisper!\nNot method.")
	})
	GinRouter.NoRoute(func(ctx *gin.Context) {
		ctx.String(200, "喵呜！\n你也叫喵呜！\n呜！你也叫！\n--"+conf.SVCConfig.Name)
	})
	GinRouter.Use(middleware.CheckRouteMiddleware())
	GinRouter.Use(middleware.RoleMiddleware())
	GinRouter.Use(middleware.Params())
	GinRouter.Use(middleware.StaticFSMiddleware(conf.StaticPath))
	// 处理返回值
	GinRouter.Use(middleware.Response())
	// 请求时间中间件
	GinRouter.Use(middleware.RequestTime())
	// 错误中间件
	GinRouter.Use(middleware.Error())
	// 处理解密加密
	GinRouter.Use(middleware.Encryption())
	GinRouter.Use(middleware.Authorize())
	// midArr := [...]gin.HandlerFunc{GinMiddleware("*"), middleware.Authorize()}
	// fmt.Println(midArr)
	// for _, midFunc := range midArr {
	// 	//fmt.Println(index, "\t",value)
	// 	GinRouter.Use(midFunc)
	// }

	routers.InitRouter(GinRouter)

}

func run() {
	log.Info("Gin Http server created successfully. Listening at :" + strconv.Itoa(conf.Config.Port))
	if err := GinRouter.Run(":" + strconv.Itoa(conf.Config.Port)); err != nil {
		log.Error("failed run app: ", err)

		// time.AfterFunc(500*time.Millisecond, func() {
		// 	run(router)
		// })
	}
}
