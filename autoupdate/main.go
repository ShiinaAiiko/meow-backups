package main

import (
	"fmt"
	"time"

	"github.com/jpillora/overseer"
	"github.com/jpillora/overseer/fetcher"
)

const version = "v0.1"

// 控制自升级
func main() {
	fmt.Println(version)
	overseer.Run(overseer.Config{
		Program:          actualMain,
		TerminateTimeout: 10 * time.Second,
		Fetcher: &fetcher.HTTP{
			URL:      "http://192.168.204.129:30302/selfupgrade",
			Interval: 1 * time.Second,
		},
		PreUpgrade: preUpgrade,
	})
	overseer.Restart()
	// mainWithSelfUpdate()
}

// 升级前的动作，参数是下载的程序的临时位置，如果返回 error，则不升级
func preUpgrade(tempBinaryPath string) error {
	fmt.Printf("download binary path: %s\n", tempBinaryPath)
	return nil
}

// 这里一般写是实际的业务，此示例是不断打印 version
func actualMain(state overseer.State) {
	for {
		fmt.Printf("%s: current version: %s\n", time.Now().Format("2006-01-02 15:04:05"), version)
		time.Sleep(3 * time.Second)
	}
}
