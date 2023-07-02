package api

var ApiVersion = "v1"

var ApiUrls = map[string](map[string]string){
	"v1": {
		"versionPrefix": "/api/v1",
		// token
		"getToken": "/token/getToken",

		// app
		"getSystemConfig":    "/app/systemConfig/get",
		"updateSystemConfig": "/app/systemConfig/update",
		"getAppSummaryInfo":  "/app/appSummaryInfo/get",
		"quit":               "/app/quit",
		"restart":            "/app/restart",
		"checkForUpdates":    "/app/checkForUpdates",
	},
}
