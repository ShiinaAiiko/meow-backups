package typings

type SystremConfig struct {
	Language       string
	Appearance     string
	AutomaticStart bool
}

type Config struct {
	Port        int
	StaticPath  string
	Debug       bool
	NoBrowser   bool
	NoConsole   bool
	DefaultUser bool
}

type Server struct {
	Port int
	Cors struct {
		AllowOrigins []string
	}
	// mode: release debug
	Mode      string
	NoBrowser bool
}
type SecretChatToken struct {
	Issuer string
	Key    string
	AesKey string
}
type SAaSS struct {
	AppId      string
	AppKey     string
	BaseUrl    string
	ApiVersion string
	Auth       struct {
		Duration int64
	}
}
type Sso struct {
	Host   string
	AppId  string
	AppKey string
}
type Redis struct {
	Addr     string
	Password string
	DB       int
}
type Mongodb struct {
	Currentdb struct {
		Name string
		Uri  string
	}
	Ssodb struct {
		Name string
		Uri  string
	}
}
type AppListItem struct {
	AppId  string
	AppKey string
	Name   string
}

type Turn struct {
	Address string
	Auth    struct {
		Secret   string
		Duration int64
	}
}
