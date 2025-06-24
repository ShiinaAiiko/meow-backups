package conf

var (
	Version   = "v1.0.0"
	Platform  = "linux-amd64-x64"
	GitRev    = ""
	BuildTime = ""

	// 构建的时候植入
	// VersionApiUrl = "http://192.168.204.132:16100"
	VersionDownloadUrl = "http://192.168.204.132:16100/api/v1/share?path=/meow-backups&sid=FqZY6hzQNb&pwd="
	// VersionSid         = "FqZY6hzQNb"
)
