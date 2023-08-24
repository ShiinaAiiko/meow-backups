package api

var Namespace = map[string](map[string]string){
	"v1": {
		"base":   "/",
		"backup": "/backup",
	},
}

var EventName = map[string](map[string](map[string]string)){
	"v1": {
		"routeEventName": {
			// App
			"error":              "Error",
			"otherDeviceOnline":  "OtherDeviceOnline",
			"otherDeviceOffline": "OtherDeviceOffline",
			"forceOffline":       "ForceOffline",

			"backupTaskUpdate": "BackupTaskUpdate",
			"checkForUpdates":  "CheckForUpdates",

			"getLog": "GetLog",
		},
		"requestEventName": {
			// backup
			"addBackup":          "AddBackup",
			"getBackups":         "GetBackups",
			"getAppSummaryInfo":  "GetAppSummaryInfo",
			"updateBackupStatus": "UpdateBackupStatus",
			"backupNow":          "BackupNow",
			"deleteBackup":       "DeleteBackup",
			"getBackup":          "GetBackup",
			"updateBackup":       "UpdateBackup",
		},
	},
}
