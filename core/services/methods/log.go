package methods

func InitLog() {
	log.Log(func(l []byte) {
		// if conf.SocketIO == nil {
		// 	return
		// }
		// var res response.ResponseProtobufType
		// res.Code = 200
		// res.Data = protos.Encode(&protos.GetLog_Response{
		// 	Log: string(l),
		// })

		// conn := nsocketio.ConnContext{
		// 	ServerContext: conf.SocketIO,
		// }
		// conn.BroadcastToRoom(api.Namespace[api.ApiVersion]["backup"],
		// 	"watchBackupStatus",
		// 	api.EventName[api.ApiVersion]["routeEventName"]["getLog"],
		// 	res.GetResponse())
	})
}
