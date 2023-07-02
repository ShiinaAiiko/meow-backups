package methods

import (
	"net"
	"os/exec"
	"runtime"

	"github.com/cherrai/nyanyago-utils/nstrings"
)

func CheckPort(port int) error {
	resultChan := make(chan error)
	go func() {
		defer func() {
			if err := recover(); err != nil {
				// log.Error(err)
				resultChan <- err.(error)
			} else {
				resultChan <- nil
			}
		}()
		l, _ := net.Listen("tcp", "localhost:"+nstrings.ToString(port))

		l.Close()
	}()

	return <-resultChan
}

func GetValidPort(port int) int {
	err := CheckPort(port)

	if err != nil {
		return GetValidPort(port + 1)
	}
	return port
}

func OpenUrl(url string) {
	sysType := runtime.GOOS

	if sysType == "windows" {
		// 有GUI调用
		exec.Command(`cmd`, `/c`, `start`, url).Start()
	}
	if sysType == "linux" {
		// 有GUI调用
		exec.Command(`xdg-open`, url).Start()
	}
	if sysType == "darwin" {
		// 有GUI调用
		exec.Command(`open`, url).Start()
	}
}
