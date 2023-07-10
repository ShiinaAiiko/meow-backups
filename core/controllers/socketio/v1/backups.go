package socketIoControllersV1

import (
	conf "github.com/ShiinaAiiko/meow-backups/config"
	"github.com/ShiinaAiiko/meow-backups/protos"
	"github.com/ShiinaAiiko/meow-backups/services/methods"
	"github.com/ShiinaAiiko/meow-backups/services/response"
	"github.com/cherrai/nyanyago-utils/nfile"
	"github.com/cherrai/nyanyago-utils/nint"
	"github.com/cherrai/nyanyago-utils/nsocketio"
	"github.com/cherrai/nyanyago-utils/validation"
)

type BackupController struct {
}

func (bc *BackupController) Connect(e *nsocketio.EventInstance) error {
	log.Info("/backup => 正在进行连接.")
	conn := e.ConnContext()
	// 加入房间
	conn.JoinRoomWithNamespace("watchBackupStatus")
	return nil
}

func (bc *BackupController) Disconnect(e *nsocketio.EventInstance) error {
	log.Info("/backup => 已经断开了")

	return nil
}

func (cc *BackupController) DeleteBackup(e *nsocketio.EventInstance) error {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	// log.Info("/Backup => DeleteBackup")
	res.Code = 200

	// 2、获取参数
	data := new(protos.DeleteBackup_Request)
	var err error
	if err = protos.DecodeBase64(e.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}
	// log.Info(data)

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
		validation.Parameter(&data.Id, validation.Type("string"), validation.Required()),
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}
	// 4、检测是否存在
	backup, err := conf.BackupsFS.Get(data.Id)
	if err != nil || backup == nil {
		res.Errors(err)
		res.Code = 10020
		res.CallSocketIo(e)
		return err
	}

	conf.BackupsFS.Delete(data.Id)

	res.CallSocketIo(e)

	return nil
}

func (cc *BackupController) BackupNow(e *nsocketio.EventInstance) error {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	// log.Info("/Backup => BackupNow")
	res.Code = 200

	// 2、获取参数
	data := new(protos.BackupNow_Request)
	var err error
	if err = protos.DecodeBase64(e.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
		validation.Parameter(&data.Id, validation.Type("string"), validation.Required()),
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}

	// 4、检测是否存在
	backupVal, err := conf.BackupsFS.Get(data.Id)
	if err != nil {
		res.Errors(err)
		res.Code = 10020
		res.CallSocketIo(e)
		return err
	}
	backup := backupVal.Value()

	backup.Status = 1
	backup.BackupProgress = 0
	conf.BackupsFS.Set(data.Id, backup, 0)

	if err = methods.PauseBackup(backup); err != nil {
		res.Errors(err)
		res.Code = 10001
		res.CallSocketIo(e)
		return err
	}
	go methods.BackupNow(backup)

	res.CallSocketIo(e)
	return nil
}

func (cc *BackupController) UpdateBackupStatus(e *nsocketio.EventInstance) error {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	// log.Info("/Backup => UpdateBackupStatus")
	res.Code = 200

	// 2、获取参数
	data := new(protos.UpdateBackupStatus_Request)
	var err error
	if err = protos.DecodeBase64(e.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}
	// log.Info(data)

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
		validation.Parameter(&data.Id, validation.Type("string"), validation.Required()),
		validation.Parameter(&data.Status, validation.Type("int64"), validation.Enum([]int64{1, -1}), validation.Required()),
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}
	// 4、检测是否存在
	backupVal, err := conf.BackupsFS.Get(data.Id)
	if err != nil {
		res.Errors(err)
		res.Code = 10020
		res.CallSocketIo(e)
		return err
	}
	backup := backupVal.Value()

	switch data.Status {
	case 1:
		backup.Status = 1
	case -1:
		backup.Status = -1
	}
	if err = methods.PauseBackup(backup); err != nil {
		res.Errors(err)
		res.Code = 10001
		res.CallSocketIo(e)
		return err
	}

	conf.BackupsFS.Set(data.Id, backup, 0)

	switch data.Status {
	case 1:
		methods.ScheduledBackupItem(backup)
	case -1:
		methods.ClearScheduledBackupItem(backup)
	}
	res.CallSocketIo(e)

	return nil
}

// func (cc *BackupController) GetAppSummaryInfo(e *nsocketio.EventInstance) error {
// 	conn := e.ConnContext()
// 	// 1、初始化返回体
// 	var res response.ResponseProtobufType
// 	log.Info("/Backup => GetAppSummaryInfo")
// 	res.Code = 200

// 	// 2、获取参数
// 	data := new(protos.GetAppSummaryInfo_Request)
// 	var err error
// 	if err = protos.DecodeBase64(e.GetString("data"), data); err != nil {
// 		res.Errors(err)
// 		res.Code = 10002
// 		res.CallSocketIo(e)
// 		return err
// 	}
// 	log.Info(data)

// 	// 3、校验参数
// 	if err = validation.ValidateStruct(
// 		data,
// 	); err != nil {
// 		res.Errors(err)
// 		res.Code = 10002
// 		res.CallSocketIo(e)
// 		return err
// 	}
// 	log.Info(data)

// 	lastBackupTime := int64(0)
// 	backups, err := conf.BackupsFS.Values()

// 	localFolderStatus := &protos.FolderStatus{
// 		Files:   0,
// 		Folders: 0,
// 		Size:    0,
// 	}

// 	backupFolderStatus := &protos.FolderStatus{
// 		Files:   0,
// 		Folders: 0,
// 		Size:    0,
// 	}

// 	paths := []string{}

// 	log.Info("backups", backups)
// 	for _, v := range backups {
// 		if v.Value.LastBackupTime != 0 && lastBackupTime < v.Value.LastBackupTime {
// 			lastBackupTime = v.Value.LastBackupTime
// 		}

// 		if !narrays.Includes(paths, v.Value.Path) {
// 			paths = append(paths, v.Value.Path)
// 			localFolderStatus.Files += v.Value.LocalFolderStatus.Files
// 			localFolderStatus.Folders += v.Value.LocalFolderStatus.Folders
// 			localFolderStatus.Size += v.Value.LocalFolderStatus.Size

// 		}

// 		if !narrays.Includes(paths, v.Value.BackupPath) {
// 			paths = append(paths, v.Value.BackupPath)
// 			backupFolderStatus.Files += v.Value.BackupFolderStatus.Files
// 			backupFolderStatus.Folders += v.Value.BackupFolderStatus.Folders
// 			backupFolderStatus.Size += v.Value.BackupFolderStatus.Size

// 		}

// 	}
// 	log.Info(backups, err != nil)

// 	deviceTokens, err := conf.DeviceTokenFS.Keys()
// 	if err != nil {
// 		res.Errors(err)
// 		res.Code = 10001
// 		res.CallSocketIo(e)
// 		return err
// 	}

// 	conns := conn.GetAllConnContextInRoomWithNamespace("watchBackupStatus")

// 	startTime, _ := conf.ConfigFS.Get("startTime")
// 	res.Data = protos.Encode(&protos.GetAppSummaryInfo_Response{
// 		LocalFolderStatus:       localFolderStatus,
// 		BackupFolderStatus:      backupFolderStatus,
// 		LastBackupTime:          lastBackupTime,
// 		CurrentOnlineDevices:    nint.ToInt64(len(conns)),
// 		HistoricalOnlineDevices: nint.ToInt64(len(deviceTokens)),
// 		Version:                 "v1.0.0, " + runtime.GOOS + " (" + nstrings.ToString(32<<(^uint(0)>>63)) + "-bit " + runtime.GOARCH + ")",
// 		GithubUrl:               "https://github.com/ShiinaAiiko/meow-backups",
// 		StartTime:               nint.ToInt64(startTime),
// 	})
// 	// log.Info("res.Data ", res.Data)
// 	res.CallSocketIo(e)

// 	return nil
// }

func (cc *BackupController) GetBackups(e *nsocketio.EventInstance) error {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	// log.Info("/Backup => GetBackups")
	res.Code = 200

	// 2、获取参数
	data := new(protos.GetBackups_Request)
	var err error
	if err = protos.DecodeBase64(e.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}
	// log.Info(data)

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}
	// log.Info(data)

	backups, err := conf.BackupsFS.Values()
	// log.Info(backups, err != nil)
	if err != nil {
		res.Errors(err)
		res.Code = 10001
		res.CallSocketIo(e)
		return err
	}
	if len(backups) == 0 {
		res.Code = 10006
		res.CallSocketIo(e)
		return err
	}

	list := [](*protos.BackupItem){}
	for _, v := range backups {
		backup := v.Value()
		bi, err := methods.FormatBackupItem(backup)
		if err != nil {
			res.Errors(err)
			res.Code = 10001
			res.CallSocketIo(e)
			return err
		}
		conf.BackupsFS.Set(bi.Id, bi, 0)
		list = append(list, bi)
	}

	res.Data = protos.Encode(&protos.GetBackups_Response{
		List:  list,
		Total: nint.ToInt64(len(list)),
	})
	// log.Info("res.Data ", res.Data)
	res.CallSocketIo(e)

	return nil
}

func (cc *BackupController) UpdateBackup(e *nsocketio.EventInstance) error {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	// log.Info("/Backup => UpdateBackup")
	res.Code = 200

	// 2、获取参数
	data := new(protos.UpdateBackup_Request)
	var err error
	if err = protos.DecodeBase64(e.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}
	// log.Info(data)

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
		validation.Parameter(&data.Id, validation.Type("string"), validation.Required()),
		validation.Parameter(&data.Name, validation.Type("string"), validation.Required()),
		validation.Parameter(&data.Path, validation.Type("string"), validation.Required()),
		validation.Parameter(&data.BackupPath, validation.Type("string"), validation.Required()),
		// validation.Parameter(&data.Ignore, validation.Type("bool"), validation.Required()),
		// validation.Parameter(&data.IgnoreText, validation.Type("string"), validation.Required()),
		// validation.Parameter(&data.Compress, validation.Type("bool"), validation.Required()),
		// validation.Parameter(&data.CompressSuffix, validation.Enum([]string{".zip"}), validation.Type("string"), validation.Required()),
		// validation.Parameter(&data.CompressVolumeSize, validation.Type("int64")),
		validation.Parameter(&data.Interval, validation.Greater(0), validation.Type("int64"), validation.Required()),
		validation.Parameter(&data.MaximumStorageSize, validation.Greater(0), validation.Type("int64"), validation.Required()),
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}

	if data.Compress {
		if err = validation.ValidateStruct(
			data,
			validation.Parameter(&data.CompressSuffix, validation.Enum([]string{".zip"}), validation.Type("string"), validation.Required()),
			validation.Parameter(&data.CompressVolumeSize, validation.Type("int64")),
		); err != nil {
			res.Errors(err)
			res.Code = 10002
			res.CallSocketIo(e)
			return err
		}
	}

	if !nfile.IsExists(data.Path) {
		res.Errors(err)
		res.Code = 10022
		res.CallSocketIo(e)
		return nil
	}

	// 4、检测是否存在
	backupVal, err := conf.BackupsFS.Get(data.Id)
	if err != nil {
		res.Errors(err)
		res.Code = 10020
		res.CallSocketIo(e)
		return err
	}
	backup := backupVal.Value()

	if backup.Status == 0 {
		res.Errors(err)
		res.Code = 10021
		res.CallSocketIo(e)
		return err
	}

	bi, err := methods.FormatBackupItem(&protos.BackupItem{
		Id:                           data.Id,
		Name:                         data.Name,
		Path:                         data.Path,
		BackupPath:                   data.BackupPath,
		Ignore:                       data.Ignore,
		IgnoreText:                   data.IgnoreText,
		Compress:                     data.Compress,
		CompressSuffix:               data.CompressSuffix,
		CompressVolumeSize:           data.CompressVolumeSize,
		Interval:                     data.Interval,
		MaximumStorageSize:           data.MaximumStorageSize,
		Status:                       backup.Status,
		CreateTime:                   backup.CreateTime,
		LastUpdateTime:               backup.LastUpdateTime,
		LastBackupTime:               backup.LastBackupTime,
		BackupProgress:               backup.BackupProgress,
		DeleteOldDataWhenSizeExceeds: data.DeleteOldDataWhenSizeExceeds,
	})
	if err != nil {
		res.Errors(err)
		res.Code = 10001
		res.CallSocketIo(e)
		return err
	}
	// log.Info(data.Interval, backup.Interval)

	if backup.Status == 1 && data.Interval != backup.Interval {
		methods.ScheduledBackupItem(bi)
	}
	conf.BackupsFS.Set(bi.Id, bi, 0)

	res.Data = protos.Encode(&protos.UpdateBackup_Response{
		Backup: bi,
	})
	// log.Info("res.Data ", res.Data)
	res.CallSocketIo(e)

	return nil
}

func (cc *BackupController) AddBackup(e *nsocketio.EventInstance) error {
	// 1、初始化返回体
	var res response.ResponseProtobufType
	// log.Info("/Backup => AddBackup")
	res.Code = 200

	// 2、获取参数
	data := new(protos.AddBackup_Request)
	var err error
	if err = protos.DecodeBase64(e.GetString("data"), data); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}
	// log.Info(data)

	// 3、校验参数
	if err = validation.ValidateStruct(
		data,
		validation.Parameter(&data.Id, validation.Type("string"), validation.Required()),
		validation.Parameter(&data.Name, validation.Type("string"), validation.Required()),
		validation.Parameter(&data.Path, validation.Type("string"), validation.Required()),
		validation.Parameter(&data.BackupPath, validation.Type("string"), validation.Required()),
		// validation.Parameter(&data.Ignore, validation.Type("bool"), validation.Required()),
		// validation.Parameter(&data.IgnoreText, validation.Type("string"), validation.Required()),
		// validation.Parameter(&data.Compress, validation.Type("bool"), validation.Required()),
		// validation.Parameter(&data.CompressSuffix, validation.Enum([]string{".zip"}), validation.Type("string"), validation.Required()),
		// validation.Parameter(&data.CompressVolumeSize, validation.Type("int64")),
		validation.Parameter(&data.Interval, validation.Type("int64"), validation.Required()),
		validation.Parameter(&data.MaximumStorageSize, validation.Type("int64"), validation.Required()),
	); err != nil {
		res.Errors(err)
		res.Code = 10002
		res.CallSocketIo(e)
		return err
	}

	if data.Compress {
		if err = validation.ValidateStruct(
			data,
			validation.Parameter(&data.CompressSuffix, validation.Enum([]string{".zip"}), validation.Type("string"), validation.Required()),
			validation.Parameter(&data.CompressVolumeSize, validation.Type("int64")),
		); err != nil {
			res.Errors(err)
			res.Code = 10002
			res.CallSocketIo(e)
			return err
		}
	}

	if !nfile.IsExists(data.Path) {
		res.Errors(err)
		res.Code = 10022
		res.CallSocketIo(e)
		return nil
	}

	bi, err := methods.FormatBackupItem(&protos.BackupItem{
		Id:                           data.Id,
		Name:                         data.Name,
		Path:                         data.Path,
		BackupPath:                   data.BackupPath,
		Ignore:                       data.Ignore,
		IgnoreText:                   data.IgnoreText,
		Compress:                     data.Compress,
		CompressSuffix:               data.CompressSuffix,
		CompressVolumeSize:           data.CompressVolumeSize,
		Interval:                     data.Interval,
		MaximumStorageSize:           data.MaximumStorageSize,
		Status:                       1,
		DeleteOldDataWhenSizeExceeds: data.DeleteOldDataWhenSizeExceeds,
	})
	if err != nil {
		res.Errors(err)
		res.Code = 10001
		res.CallSocketIo(e)
		return err
	}
	conf.BackupsFS.Set(bi.Id, bi, 0)

	res.Data = protos.Encode(&protos.AddBackup_Response{
		Backup: bi,
	})
	// log.Info("res.Data ", res.Data)
	res.CallSocketIo(e)

	go methods.BackupNow(bi)

	return nil
}
