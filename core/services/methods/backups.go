package methods

import (
	"archive/zip"
	"bufio"
	"io"
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	"github.com/ShiinaAiiko/meow-backups/api"
	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/protos"
	"github.com/ShiinaAiiko/meow-backups/services/response"
	"github.com/cherrai/nyanyago-utils/narrays"
	"github.com/cherrai/nyanyago-utils/ncommon"
	"github.com/cherrai/nyanyago-utils/nfile"
	"github.com/cherrai/nyanyago-utils/nsocketio"
	"github.com/cherrai/nyanyago-utils/ntimer"
	"github.com/pkg/errors"
)

var (
	scheduledBackupTimerMap = map[string]*ntimer.Timer{}
	backupPathMap           = map[string]string{}
)

func FormatBackupItem(bi *protos.BackupItem) (*protos.BackupItem, error) {
	isPathExists := false
	typeStr := "Folder"
	s, err := os.Stat(bi.Path)

	if os.IsNotExist(err) || s == nil {
		isPathExists = false
	} else {
		isPathExists = true
		typeStr = ncommon.IfElse(s.IsDir(), "Folder", "File")
	}

	bi.Type = typeStr
	bi.IsPathExists = isPathExists

	if bi.Ignore {
		if bi.Type == "File" {
			return nil, errors.New("only folders can use filter mode")
		}
		mbIgnoreFilePath := filepath.Join(bi.Path, ".mbignore")

		if nfile.IsExists(mbIgnoreFilePath) {
			bps, err := os.Stat(mbIgnoreFilePath)
			if err != nil {
				return nil, err
			}
			// log.Info(bps.ModTime().Unix(), bi.LastUpdateTime)
			if bps.ModTime().Unix() > bi.LastUpdateTime {
				fileBuffer, err := ioutil.ReadFile(mbIgnoreFilePath)
				if err != nil {
					return nil, err
				}
				bi.IgnoreText = string(fileBuffer)
			}
		}
		if bi.IgnoreText != "" {
			mbIgnoreFile, err := os.Create(mbIgnoreFilePath)
			if err != nil {
				return nil, err
			}
			defer mbIgnoreFile.Close()
			mbIgnoreFile.Write([]byte(bi.IgnoreText))
			err = os.Chmod(mbIgnoreFilePath, 0600)
			if err != nil {
				return nil, err
			}
		}
	}

	if bi.CreateTime == 0 {
		bi.CreateTime = time.Now().Unix()
	}
	bi.LastUpdateTime = time.Now().Unix()
	// log.Info(bi.LastUpdateTime)

	bps, err := os.Stat(bi.BackupPath)
	if os.IsNotExist(err) || bps == nil {
		err = os.MkdirAll(bi.BackupPath, os.ModePerm)
		if err != nil {
			return nil, err
		}
	}
	go UpdateBackupStats(bi)
	return bi, nil
}

func UpdateBackupStats(bi *protos.BackupItem) {
	defer func() {
		if r := recover(); r != nil {
			log.Error(r)
		}
	}()
	// ignoreMatches := []string{}
	// includesMatches := []string{}
	// ignoreTextItemArr := strings.Split(bi.IgnoreText, "\n")

	// for _, v := range ignoreTextItemArr {
	// 	if v != "" && v[0:1] == "!" {
	// 		includesMatches = append(includesMatches, v[1:])
	// 	}
	// }

	// if err := MatchPath(bi.Path, strings.Split(bi.IgnoreText, "\n"), &ignoreMatches); err != nil {
	// 	log.Error(err)
	// 	return
	// }
	// p1 := []string{}
	// p2 := []string{}
	pfs, err := nfile.GetFileStats(bi.Path, func(p string, info fs.FileInfo) bool {
		// log.Info(p, !narrays.Includes(ignoreMatches, p))
		// if !narrays.Includes(ignoreMatches, p) {
		// 	p1 = append(p1, strings.Replace(p, bi.Path, "", -1))
		// }
		return true
		// return !narrays.Includes(ignoreMatches, p)
	})
	// log.Error("{matches}", ignoreMatches)
	if err == nil {
		bi.LocalFolderStatus = &protos.FolderStatus{
			Files:   pfs.Files,
			Folders: pfs.Folders,
			Size:    pfs.Size,
		}
	}

	// for _, v := range includesMatches {
	// 	ignoreMatches := []string{}
	// 	if err := MatchPath(filepath.Join(bi.Path, v), strings.Split(bi.IgnoreText, "\n"), &ignoreMatches); err != nil {
	// 		log.Error(err)
	// 		return
	// 	}
	// 	pfs, err := nfile.GetFileStats(filepath.Join(bi.Path, v), func(p string, info fs.FileInfo) bool {
	// 		// log.Info(p, !narrays.Includes(ignoreMatches, p))

	// 		// if !narrays.Includes(ignoreMatches, p) {
	// 		// 	p1 = append(p1, strings.Replace(p, bi.Path, "", -1))
	// 		// }
	// 		return !narrays.Includes(ignoreMatches, p)
	// 	})
	// 	if err == nil {
	// 		bi.LocalFolderStatus.Files += pfs.Files
	// 		bi.LocalFolderStatus.Folders += pfs.Folders
	// 		bi.LocalFolderStatus.Size += pfs.Size
	// 	}
	// }

	bpfs, err := nfile.GetFileStats(bi.BackupPath, func(p string, info fs.FileInfo) bool {
		// p2 = append(p2, p)
		// p2 = append(p2, strings.Replace(p, filepath.Join(bi.BackupPath, "2023-06-24_05-31-05", "meow-monitor"), "", -1))
		return true
	})
	if err == nil {
		bi.BackupFolderStatus = &protos.FolderStatus{
			Files:   bpfs.Files,
			Folders: bpfs.Folders,
			Size:    bpfs.Size,
		}
	}

	conf.BackupsFS.Set(bi.Id, bi, 0)
	var res response.ResponseProtobufType
	res.Code = 200
	res.Data = protos.Encode(&protos.BackupTaskUpdate_Response{
		Backup: bi,
	})

	conn := nsocketio.ConnContext{
		ServerContext: conf.SocketIO,
	}

	conn.BroadcastToRoom(api.Namespace[api.ApiVersion]["backup"],
		"watchBackupStatus",
		api.EventName[api.ApiVersion]["routeEventName"]["backupTaskUpdate"],
		res.GetResponse())

	// log.Error("wawawawawawawa")

	// log.Info(len(p1))
	// log.Info(len(p2))
	// for _, v := range p1 {
	// 	if !narrays.Includes(p2, v) {
	// 		log.Info(v)
	// 	}
	// 	// log.Info(v, narrays.Includes(p2, v))
	// }
}

func ScheduledBackup() {
	backups, err := conf.BackupsFS.Values()
	if err != nil {
		log.Error(err)
		return
	}
	for _, v := range backups {
		ScheduledBackupItem(v.Value())
	}

	// 每2分钟强制执行一次，以防休眠问题
	ntimer.SetTimeout(func() {
		ScheduledBackup()
	}, 60*2*1000)
}

func ScheduledBackupItem(bi *protos.BackupItem) {
	ClearScheduledBackupItem(bi)
	log.Error(bi)
	log.Error(bi.Status)
	if bi.Status == 0 {
		PauseBackup(bi)
		return
	}
	if bi.Status == 1 && bi.LastBackupTime+bi.Interval < time.Now().Unix() {
		go BackupNow(bi)
		return
	}
	scheduledBackupTimerMap[bi.Id] = ntimer.SetTimeout(func() {
		backupVal, err := conf.BackupsFS.Get(bi.Id)
		if err != nil {
			log.Error(err)
			return
		}
		backup := backupVal.Value()
		if backup.Status == 1 && backup.LastBackupTime+backup.Interval < time.Now().Unix() {
			go BackupNow(backup)
		} else {
			if backup.Status != -1 {
				ScheduledBackupItem(backup)
			}
		}
	}, bi.Interval*1000)
}

func ClearScheduledBackupItem(bi *protos.BackupItem) {
	if scheduledBackupTimerMap[bi.Id] != nil {
		scheduledBackupTimerMap[bi.Id].Stop()
		scheduledBackupTimerMap[bi.Id] = nil
	}
}

func EmitMessage(bi *protos.BackupItem) {
	var res response.ResponseProtobufType
	res.Code = 200
	res.Data = protos.Encode(&protos.BackupTaskUpdate_Response{
		Backup: bi,
	})

	conn := nsocketio.ConnContext{
		ServerContext: conf.SocketIO,
	}

	conn.BroadcastToRoom(api.Namespace[api.ApiVersion]["backup"],
		"watchBackupStatus",
		api.EventName[api.ApiVersion]["routeEventName"]["backupTaskUpdate"],
		res.GetResponse())
}

func PauseBackup(bi *protos.BackupItem) error {
	// 删除文件
	// log.Error("PauseBackup backupPathMap[bi.Id]",
	// 	backupPathMap[bi.Id], backupPathMap[bi.Id] != "",
	// )
	if backupPathMap[bi.Id] != "" || bi.Status == 0 {
		backupPath := backupPathMap[bi.Id]
		backupPathMap[bi.Id] = ""
		// log.Warn("backupPathMap[bi.Id]", backupPathMap[bi.Id])
		bi.BackupProgress = 0
		if bi.Status == 0 {
			bi.Status = 1
		}
		conf.BackupsFS.Set(bi.Id, bi, 0)
		ScheduledBackupItem(bi)
		EmitMessage(bi)

		log.Info("已暂停备份")
		if backupPath != "" {
			return nfile.Remove(backupPath)
		}
	}
	return nil
}

func BackupNow(bi *protos.BackupItem) {
	ClearScheduledBackupItem(bi)
	log.Info(bi)
	if bi.Status == -1 {
		log.Info("暂停着呢")
		return
	}
	// if bi.Status == 0 {
	// 	log.Info("正在备份呢")
	// 	return
	// }
	log.Info("开始备份", bi)
	var err error

	if !nfile.IsExists(bi.BackupPath) {
		err = os.MkdirAll(bi.BackupPath, os.ModePerm)
		if err != nil {
			log.Error(err)
		}
	}

	ignoreMatches := []string{}
	includesMatches := []string{}
	ignoreTextItemArr := strings.Split(bi.IgnoreText, "\n")

	for _, v := range ignoreTextItemArr {
		if v != "" && v[0:1] == "!" {
			includesMatches = append(includesMatches, v[1:])
		}
	}

	err = MatchPath(bi.Path, ignoreTextItemArr, &ignoreMatches)
	if err != nil {
		log.Error(err)
		return
	}

	if err = DeleteOldData(bi, ignoreMatches); err != nil {
		log.Error(err)
		bi.Status = -1
		bi.BackupProgress = 0
		conf.BackupsFS.Set(bi.Id, bi, 0)
		EmitMessage(bi)
		return
	}

	pfs, err := nfile.GetFileStats(bi.Path, func(p string, info fs.FileInfo) bool {
		// log.Info(p, !narrays.Includes(matches, p))
		return !narrays.Includes(ignoreMatches, p)
	})
	if err != nil {
		log.Error(err)
		return
	}
	log.Info(pfs, err)

	bi.Status = 0
	bi.BackupProgress = 0
	conf.BackupsFS.Set(bi.Id, bi, 0)
	EmitMessage(bi)

	// 当前备份容量
	cSize := int64(0)

	var t *ntimer.Timer
	errorTime := 0
	t = ntimer.SetInterval(func() {
		// log.Error("backupPathMap", backupPathMap[bi.Id], 1, backupPathMap[bi.Id] == "", 2)
		if backupPathMap[bi.Id] == "" {
			t.Stop()
			return
		}

		if errorTime >= 10 {
			bi.Status = -1
			bi.BackupProgress = 0
			conf.BackupsFS.Set(bi.Id, bi, 0)

			backupPathMap[bi.Id] = ""
			ScheduledBackupItem(bi)
			EmitMessage(bi)
			t.Stop()
			return
		}
		if cSize == 0 {
			errorTime += 1
		} else {
			errorTime = 0
		}
		bp := float32(cSize) / float32(pfs.Size)
		log.Info(cSize, pfs.Size, bp)
		if bp >= 1 {
			bi.LastBackupTime = time.Now().Unix()
			bi.Status = 0
			bi.BackupProgress = 1
			log.Info("备份结束了。", t, includesMatches)
			go UpdateBackupStats(bi)
			t.Stop()
			ntimer.SetTimeout(func() {
				cSize = 0
				bi.Status = 1
				bi.BackupProgress = 0
				conf.BackupsFS.Set(bi.Id, bi, 0)

				backupPathMap[bi.Id] = ""
				ScheduledBackupItem(bi)
				EmitMessage(bi)
			}, 1000)
		} else {
			bi.BackupProgress = bp
			bi.Status = 0
		}
		conf.BackupsFS.Set(bi.Id, bi, 0)
		EmitMessage(bi)
	}, 1000)

	// 非压缩内容
	if !bi.Compress {
		// log.Info(narrays.Deduplication(matches))
		backupPath := filepath.Join(bi.BackupPath, time.Now().Format("2006-01-02_15-04-05"))
		backupPathMap[bi.Id] = backupPath
		err = Copy(bi.Path, backupPath, &ignoreMatches, &cSize, bi.Id)
		if err != nil {
			errorTime = 10
			log.Error(err)
			return
		}

		log.Info("includesMatches", includesMatches)
		for _, v := range includesMatches {
			err = Copy(filepath.Join(bi.Path, v), filepath.Join(backupPath, filepath.Base(bi.Path), v[0:strings.LastIndex(v, filepath.Base(v))]), &ignoreMatches, &cSize, bi.Id)
			if err != nil {
				errorTime = 10
				log.Error(err)
				return
			}
		}
	} else {
		// 压缩
		backupPath := filepath.Join(bi.BackupPath, time.Now().Format("2006-01-02_15-04-05")) + ".zip"
		backupPathMap[bi.Id] = backupPath
		err = Zip(bi.Path, backupPath, &ignoreMatches, &includesMatches, &cSize, bi.Id)
		log.Info("copy ", err)
		if err != nil {
			errorTime = 10
			log.Error(err)
			return
		}
	}

}

func DeleteOldData(bi *protos.BackupItem, ignoreMatches []string) error {
	// 检测文件夹容量是否溢出
	bpfs, err := nfile.GetFileStats(bi.BackupPath, func(p string, info fs.FileInfo) bool {
		return !narrays.Includes(ignoreMatches, p)
	})
	if err != nil {
		log.Error(err)
		return err
	}

	log.Info(bpfs.Size, bi.MaximumStorageSize*1024*1024)
	log.Info(bpfs.Size >= bi.MaximumStorageSize*1024*1024)
	if bpfs.Size >= bi.MaximumStorageSize*1024*1024 {
		log.Error("容量已超出!")
		if !bi.DeleteOldDataWhenSizeExceeds {
			return errors.New("size exceeded, backup paused")
		}
		// 开始删除老数据
		files, err := ioutil.ReadDir(bi.BackupPath)
		if err != nil {
			log.Error(err)
			return err
		}
		sizeExceeds := bpfs.Size - bi.MaximumStorageSize*1024*1024
		s := int64(0)
		sArr := []string{}
		log.Info(files)
		sort.SliceStable(files, func(i, j int) bool {
			return files[i].ModTime().Unix() < files[j].ModTime().Unix()
		})
		for _, v := range files {
			log.Info(v.Name(), v.Size(), v.ModTime())
			if v.IsDir() {
				vfs, err := nfile.GetFileStats(filepath.Join(bi.BackupPath, v.Name()), func(p string, info fs.FileInfo) bool {
					return !narrays.Includes(ignoreMatches, p)
				})
				if err != nil {
					log.Error(err)
					return err
				}
				s += vfs.Size
			} else {
				s += v.Size()
			}
			sArr = append(sArr, filepath.Join(bi.BackupPath, v.Name()))
			if s > sizeExceeds {
				log.Info("到这里就已经可以删除了")

				break
			}
		}

		log.Info("sArr", sArr)

		for _, v := range sArr {
			nfile.Remove(v)
		}
	}

	return nil
}

func Copy(formPath, toDirPath string, ignore *([]string), cSize *int64, backupId string) error {
	if backupPathMap[backupId] == "" {
		return errors.New("pause backup")
	}
	if !nfile.IsExists(formPath) {
		return nil
	}
	formStat, err := os.Stat(formPath)
	if err != nil {
		return err
	}
	if err = os.MkdirAll(toDirPath, os.ModePerm); err != nil {
		return err
	}
	toPath := filepath.Join(toDirPath, formStat.Name())
	*cSize += formStat.Size()
	if formStat.IsDir() {
		if err = os.MkdirAll(toPath, formStat.Mode()); err != nil {
			return err
		}

		files, err := ioutil.ReadDir(formPath)
		if err != nil {
			return err
		}
		for _, v := range files {
			if narrays.Includes(*ignore, filepath.Join(formPath, v.Name())) {
				// log.Info(v.Name(), "即将过滤掉")
				continue
			}
			err = Copy(filepath.Join(formPath, v.Name()), toPath, ignore, cSize, backupId)
			if err != nil {
				return err
			}
		}

	} else {

		if narrays.Includes(*ignore, formPath) {
			return nil
		}

		formFile, err := os.Open(formPath)
		if err != nil {
			return err
		}
		defer formFile.Close()

		bufReader := bufio.NewReader(formFile)

		toDirFile, err := os.Create(toPath)
		if err != nil {
			return err
		}
		defer toDirFile.Close()
		toDirFile.Chmod(formStat.Mode())

		if _, err = io.Copy(toDirFile, bufReader); err != nil {
			return err
		}
	}
	return nil
}

func MatchPath(p string, ignoreRule []string, pathSlice *([]string)) (err error) {
	// log.Info("=========", p)
	if narrays.Includes(*pathSlice, p) {
		return nil
	}
	formStat, err := os.Stat(p)
	if err != nil {
		return err
	}

	for _, v := range ignoreRule {
		if v == "" {
			continue
		}
		matches, err := filepath.Glob(filepath.Join(p, v))
		if err != nil {
			return err
		}
		// log.Info(v, 1, 2, matches, 3, err)
		*pathSlice = narrays.Deduplication(append(*pathSlice, matches...))
		// 如果开头是** 则下面的是全局
		if len(v) >= 2 && v[0:2] == "**" {
			if formStat.IsDir() {
				files, err := ioutil.ReadDir(p)
				if err != nil {
					return err
				}

				for _, sv := range files {
					err := MatchPath(filepath.Join(p, sv.Name()), []string{v}, pathSlice)
					if err != nil {
						return err
					}
				}
			}
		}

		// 如果中间是**，则是在**之前路径下的全局
		// log.Info(strings.Index(v, "**") > 0)
		if strings.Index(v, "**") > 0 {

			sPath := v[0:strings.Index(v, "**")]
			err := MatchPath(filepath.Join(p, sPath), []string{v[strings.Index(v, "**"):]}, pathSlice)
			if err != nil {
				return err
			}
		}
	}
	return err
}

func Zip(formPath, toPath string, ignore *([]string), includesMatches *([]string), cSize *int64, backupId string) error {
	if backupPathMap[backupId] == "" {
		return errors.New("pause backup")
	}

	var err error
	if isAbs := filepath.IsAbs(formPath); !isAbs {
		formPath, err = filepath.Abs(formPath) // 将传入路径直接转化为绝对路径
		if err != nil {
			return err
		}
	}
	//创建zip包文件
	zipfile, err := os.Create(toPath)
	if err != nil {
		return err
	}

	defer func() {
		if err := zipfile.Close(); err != nil {
			log.Error("*File close error: %s, file: %s", err.Error(), zipfile.Name())
		}
	}()

	//创建zip.Writer
	zw := zip.NewWriter(zipfile)

	defer func() {
		if err := zw.Close(); err != nil {
			log.Error("zipwriter close error: %s", err.Error())
		}
	}()

	info, err := os.Stat(formPath)
	if err != nil {
		return err
	}

	var baseDir string
	if info.IsDir() {
		baseDir = filepath.Base(formPath)
	}

	var zipFunc func(p string, fn func(path string, file fs.FileInfo) bool) error
	zipFunc = func(p string, fn func(path string, file fs.FileInfo) bool) error {
		if backupPathMap[backupId] == "" {
			return errors.New("pause backup")
		}
		if !nfile.IsExists(p) {
			return nil
		}
		info, err := os.Stat(p)
		if err != nil {
			return err
		}

		if !fn(p, info) {
			return nil
		}
		//创建文件头
		header, err := zip.FileInfoHeader(info)
		if err != nil {
			return err
		}

		if baseDir != "" {
			header.Name = filepath.Join(baseDir, strings.TrimPrefix(p, formPath))
		}

		if info.IsDir() {
			header.Name += "/"
		} else {
			header.Method = zip.Deflate
		}
		*cSize += info.Size()

		//写入文件头信息
		writer, err := zw.CreateHeader(header)
		if err != nil {
			return err
		}

		if info.IsDir() {
			fs, err := ioutil.ReadDir(p)
			if err != nil {
				return err
			}
			for _, v := range fs {
				zipFunc(filepath.Join(p, v.Name()), fn)
				if err != nil {
					return err
				}
			}
			return nil
		}
		//写入文件内容
		file, err := os.Open(p)
		if err != nil {
			return err
		}

		defer func() {
			if err := file.Close(); err != nil {
				log.Error("*File close error: %s, file: %s", err.Error(), file.Name())
			}
		}()
		_, err = io.Copy(writer, file)

		return err
	}

	err = zipFunc(formPath, func(path string, file fs.FileInfo) bool {
		return !narrays.Includes(*ignore, path)
	})
	if err != nil {
		return err
	}

	for _, v := range *includesMatches {
		err = zipFunc(filepath.Join(formPath, v), func(path string, file fs.FileInfo) bool {
			return !narrays.Includes(*ignore, path)
		})
		if err != nil {
			return err
		}
	}

	// err = filepath.Walk(source, func(p string, info os.FileInfo, err error) error {

	// })

	return nil
}
