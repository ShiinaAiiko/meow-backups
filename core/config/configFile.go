package conf

import (
	"encoding/json"
	"os"
	"path/filepath"

	"github.com/ShiinaAiiko/meow-backups/typings"
	"github.com/cherrai/nyanyago-utils/ncommon"
)

var (
	Config = &typings.Config{
		Port:       30301,
		Debug:      true,
		StaticPath: "./static",
	}
)

func CreateConfig() {
	// 1、获取之前的配置文件
	path, _ := os.Executable()
	dirPath := filepath.Dir(path)

	oldConfig := GetConfigMap(filepath.Join(dirPath, "./config.json"))
	// log.Info("oldConfig", oldConfig)

	// 2、获取目标配置文件

	targetConfig := GetConfigMap(ncommon.IfElse(
		BuildTime == "", filepath.Join(dirPath, "./config.dev.json"), filepath.Join(dirPath, "./config/config.pro.json"),
	))
	// log.Info("targetConfig", targetConfig)

	// 3、融合数据

	for k, v := range targetConfig {
		_, ok := oldConfig[k]

		// log.Info(ok, k)
		if !ok {
			oldConfig[k] = v
		}
	}
	// log.Info("oldConfig", oldConfig)

	// 4、写入数据
	writeConfigFile(filepath.Join(dirPath, "./config.json"), oldConfig)
}

func writeConfigFile(configPath string, data map[string]interface{}) {
	f, err := os.Create(configPath)
	if err != nil {
		log.Error(err)
		return
	}
	err = f.Chmod(0600)
	if err != nil {
		log.Error(err)
		return
	}
	defer f.Close()

	jsonByte, err := json.MarshalIndent(data, "", "  ")
	if err != nil {
		log.Error(err)
		return
	}
	f.Write(jsonByte)
}

func GetConfigMap(configPath string) map[string]interface{} {
	conf := map[string]interface{}{}
	jsonFile, err := os.Open(configPath)
	if err != nil {
		// log.Error("Error:", err)
		return conf
	}

	defer jsonFile.Close()
	decoder := json.NewDecoder(jsonFile)

	//Decode从输入流读取下一个json编码值并保存在v指向的值里

	if err = decoder.Decode(&conf); err != nil {
		log.Error("Error:", err)
		return conf
	}
	return conf
}

func GetConfig(configPath string) error {
	jsonFile, err := os.Open(configPath)
	if err != nil {
		log.Error("Error:", err)
		return err
	}

	defer jsonFile.Close()
	decoder := json.NewDecoder(jsonFile)

	conf := new(typings.Config)
	//Decode从输入流读取下一个json编码值并保存在v指向的值里

	if err = decoder.Decode(&conf); err != nil {
		log.Error("Error:", err)
		return err
	}
	Config = conf
	return nil
}
