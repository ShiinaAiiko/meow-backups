package socketioRouter

import (
	socketIoControllersV1 "github.com/ShiinaAiiko/meow-backups/controllers/socketio/v1"
	"github.com/cherrai/nyanyago-utils/nlog"
)

var (
	Log = nlog.New()
)

// 一对一聊天
func (v *V1) InitBackup() {
	midS := v.Server
	r := v.Router
	R := midS.Router
	c := new(socketIoControllersV1.BackupController)
	v.Server.OnConnect(r.Backup, c.Connect)
	v.Server.OnDisconnect(r.Backup, c.Disconnect)

	R(r.Backup, requestEventName["updateBackup"], c.UpdateBackup)
	R(r.Backup, requestEventName["addBackup"], c.AddBackup)
	R(r.Backup, requestEventName["getBackups"], c.GetBackups)
	R(r.Backup, requestEventName["updateBackupStatus"], c.UpdateBackupStatus)
	R(r.Backup, requestEventName["backupNow"], c.BackupNow)
	R(r.Backup, requestEventName["deleteBackup"], c.DeleteBackup)
	// R(r.Chat, requestEventName["sendMessage"], c.SendMessage)
	// R(r.Chat, requestEventName["editMessage"], c.EditMessage)
	// R(r.Chat, requestEventName["startCalling"], c.StartCalling)
	// R(r.Chat, requestEventName["hangup"], c.Hangup)
	// R(r.Chat, requestEventName["callReconnect"], c.CallReconnect)

	// R(r.Chat, "PostChatMessage", socketIoControllersV1.PostChatMessage)
	// R(r.Chat, "StartCalling", socketIoControllersV1.StartCalling)
	// R(r.Chat, "Hangup", socketIoControllersV1.Hangup)
	// R(r.Chat, "DeleteDialog", socketIoControllersV1.DeleteDialog)
	// R(r.Chat, "GetUnreadChatRecords", socketIoControllersV1.GetUnreadChatRecords)
	// R(r.Chat, "GetAllUnreadCount", socketIoControllersV1.GetAllUnreadCount)
	// R(r.Chat, "ReadChatRecords", socketIoControllersV1.ReadChatRecords)
	// R(r.Chat, "GetChatRecordsReadStatus", socketIoControllersV1.GetChatRecordsReadStatus)
	// R(r.Chat, "GetChatRecords", socketIoControllersV1.GetChatRecords)

	// v.Server.OnConnect(r.Chat, socketIoControllersV1.NewChatConnect)
	// v.Server.OnDisconnect(r.Chat, socketIoControllersV1.ChatDisconnect)

	// server.OnEvent("/chat", "msg", func(s socketio.Conn, msg string) string {
	// 	s.SetContext(msg)
	// 	fmt.Println("=====chat====>", msg)
	// 	return "recv " + msg
	// })
	// friends := new(controllersV1.FriendsController)

	// v.Group.POST("/friends/add", friends.AddFriend)
	// v.Group.POST("/friendsLog/agree", friends.AgreeFriend)
	// v.Group.POST("/friendsLog/disagree", friends.DisagreeFriend)
	// v.Group.GET("/friendsLog/list/receive", friends.GetReceivedFriendsLogList)
	// v.Group.GET("/friendsLog/list/send", friends.GetReceivedFriendsLogList)
	// v.Group.GET("/friends/profile", friends.GetFriendProfile)
	// v.Group.GET("/friends/list", friends.GetFriendsList)
	// v.Group.POST("/friends/delete", friends.DeleteFriends)
	// v.Group.GET("/friends/search", friends.SearchPeopleList)

}
