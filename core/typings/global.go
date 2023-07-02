package typings

type M map[string]interface{}

type DeviceTokenInfo struct {
	DeviceId  string `json:"deviceId"`
	Token     string `json:"token"`
	LoginTime int64  `json:"loginTime"`
}
