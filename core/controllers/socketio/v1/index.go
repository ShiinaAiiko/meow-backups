package socketIoControllersV1

import (
	"github.com/ShiinaAiiko/meow-backups/api"
	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/protos"
	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/ShiinaAiiko/meow-backups/services/response"
	"github.com/ShiinaAiiko/meow-backups/typings"
	"github.com/cherrai/nyanyago-utils/nsocketio"
	"github.com/pasztorpisti/qs"
)

var (
	log              = conf.Log
	namespace        = api.Namespace[api.ApiVersion]
	routeEventName   = api.EventName[api.ApiVersion]["routeEventName"]
	requestEventName = api.EventName[api.ApiVersion]["requestEventName"]
)

type BaseController struct {
}

func (bc *BaseController) Connect(e *nsocketio.EventInstance) error {
	log.Info("/ => 正在进行连接.")
	// Conn := e.Conn()

	c := e.ConnContext()

	var res response.ResponseProtobufType

	// fmt.Println(msgRes)
	defer func() {
		// fmt.Println("Error middleware.2222222222222")
		if err := recover(); err != nil {
			log.Info(err)
			res.Code = 10001
			res.Data = err.(error).Error()
			c.Emit(routeEventName["error"], res.GetResponse())
			go c.Close()
		}
	}()
	// s.SetContext("dsdsdsd")
	// 申请一个房间

	query := new(typings.SocketEncryptionQuery)

	err := qs.Unmarshal(query, c.Conn.URL().RawQuery)

	if err != nil {
		res.Code = 10002
		res.Data = err.Error()
		c.Emit(routeEventName["error"], res.GetResponse())
		go c.Close()
		return err
	}

	// log.Info("query", query)

	queryData := new(protos.RequestType)
	// queryData.DeviceId

	if err = protos.DecodeBase64(query.Data, queryData); err != nil {
		// log.Info("Decryption", err)
		res.Code = 10009
		res.Data = err.Error()
		c.Emit(routeEventName["error"], res.GetResponse())
		go c.Close()

		return err
	}
	// log.Info("queryData", queryData)

	// if !methods.CheckAppId(queryData.AppId) {
	// 	res.Code = 10017
	// 	c.Emit(routeEventName["error"], res.GetResponse())
	// 	go c.Close()
	// 	return errors.New(res.Msg)
	// }

	// ua := new(sso.UserAgent)
	// copier.Copy(ua, queryData.UserAgent)

	if err = methods.VerifyDeviceToken(queryData.DeviceId, queryData.Token); err != nil {
		res.Code = 10004
		res.Data = err.Error()
		c.Emit(routeEventName["error"], res.GetResponse())
		go c.Close()

		return err
	}
	log.Info("------" + queryData.DeviceId + " 登录成功------")
	// 	c.SetSessionCache("loginTime", getUser.LoginInfo.LoginTime)
	// 	c.SetSessionCache("appId", queryData.AppId)
	// 	c.SetSessionCache("userInfo", getUser.UserInfo)
	c.SetSessionCache("deviceId", queryData.DeviceId)
	c.SetSessionCache("token", queryData.Token)
	// 	c.SetSessionCache("userAgent", ua)
	// 	c.SetTag("Uid", getUser.UserInfo.Uid)
	// 	c.SetTag("DeviceId", queryData.DeviceId)

	return nil
}

func (bc *BaseController) Disconnect(e *nsocketio.EventInstance) error {
	log.Info("/ => 已经断开了")

	// c := e.ConnContext()
	// msc := methods.SocketConn{
	// 	Conn: c,
	// }

	// // 1、检测其他设备是否登录
	// sc := e.ServerContext()

	// getConnContext := sc.GetConnContextByTag(namespace["base"], "Uid", c.GetTag("Uid"))
	// // log.Info("当前ID", c.ID())
	// // log.Info("有哪些设备在线", getConnContext)

	// // 2、遍历设备实例、告诉对方下线了
	// onlineDeviceList, onlineDeviceListMap := msc.GetOnlineDeviceList(getConnContext)

	// deviceId := c.GetSessionCache("deviceId")
	// if deviceId == nil {
	// 	return nil
	// }
	// currentDevice := onlineDeviceListMap[deviceId.(string)]

	// for _, cctx := range getConnContext {
	// 	deviceId := cctx.GetTag("DeviceId")
	// 	// log.Info(deviceId)

	// 	if deviceId == c.GetSessionCache("deviceId") {
	// 		// log.Info("乃是自己也")
	// 		continue
	// 	}
	// 	// userAesKey1 := conf.EncryptionClient.GetUserAesKeyByDeviceId(conf.Redisdb, deviceId)

	// 	if userAesKey := conf.EncryptionClient.GetUserAesKeyByDeviceId(conf.Redisdb, deviceId); userAesKey != nil {
	// 		// log.Info("userAesKey SendJoinAnonymousRoomMessage", userAesKey)

	// 		var res response.ResponseProtobufType
	// 		res.Code = 200

	// 		res.Data = protos.Encode(&protos.OtherDeviceOffline_Response{
	// 			CurrentDevice:    currentDevice,
	// 			OnlineDeviceList: onlineDeviceList,
	// 		})

	// 		eventName := routeEventName["otherDeviceOffline"]
	// 		responseData := res.Encryption(userAesKey.AESKey, res.GetResponse())
	// 		cctx.Emit(eventName, responseData)
	// 		// if isEmit := cctx.Emit(eventName, responseData); isEmit {
	// 		// 	// 发送成功或存储到数据库
	// 		// } else {
	// 		// 	// 存储到数据库作为离线数据
	// 		// }
	// 	}

	// }

	return nil
}
