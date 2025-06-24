import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
	'zh-CN': {
		common: {
			appTitle: '喵备份',
			language: '多语言',
			openDevtools: '开发者工具',
			quit: '退出',
			restart: '重启',

			quitModalTitle: '退出提示',
			quitModalContent: '确定想退出主程序?',

			logout: '注销',
			cancel: '取消',
			add: '添加',
			create: '创建',
			// 1
			update: '更新',
			remove: '移除',
			// 1
			rename: '重命名',
			copy: '复制',
			delete: '删除',

			// 1
			removedSuccessfully: '删除成功!',
			updatedSuccessfully: '更新成功!',
			createdSuccessfully: '创建成功!',
			// 1

			saveAs: '另存',
			download: '下载',

			turnOff: '关闭',
			turnOn: '开启',
			// 1
			version: '版本',
			checkForUpdates: '检测更新',
			newVersionAvailable: '新版本可用',
			newVersionContentTip: '已发现{version}版本可用，是否下载更新？',
			newVersionDownloadedTip: '新版本已下载，需要重启。 现在重启？',
			connecting: '正在连接',
			appConnecting: '{appName} 正在连接...',
			restarting: '正在重启',
			appRestarting: '{appName} 正在重启...',
			closed: '已关闭',
			appClosed: '{appName} 已关闭',

			// 1
		},
		indexPage: {
			// 1
			backupTask: '备份任务',
			createBackup: '创建备份',
			paused: '已暂停',
			pause: '暂停',
			resume: '继续',
			backupNow: '立即备份',
			edit: '选项',
			taskID: '任务ID',
			localPath: '本地路径',
			backupPath: '备份路径',
			localState: '本地占用',
			backupState: '备份占用',
			backupSizeLimit: '备份容量限制',
			filterMode: '过滤模式',
			compressMode: '压缩模式',
			lastBackupTime: '最后备份时间',
			nextBackupTime: '下次备份时间',
			pathDoesNotExist: '路径不存在',
			enabled: '启用',
			disabled: '禁用',
			deleteOldDataIsEnabled: '已启用删除老数据',
			deleteOldDataIsDisabled: '已禁用删除老数据',
			backupCompleted: '备份完成',
			backingup: '备份中',
			maximumSizeOfBackupFolderExceeded: '已超出最大备份容量',
			neverBackedUp: '从未备份',
			startedTime: '启动时间',
			loggedInDevice: '在线设备',
			localStateTotal: '本地占用 (汇总)',
			backupStateTotal: '备份占用 (汇总)',
			currentDevice: '当前设备',
			onlineDeviceTip: '当前在线{num1}个设备/曾有{num2}个设备登录',

			// add backup
			addBackup: '添加备份',
			editBackup: '编辑备份',
			general: '常规',
			taskName: '任务名',
			fileOrFolderPathToBeBackedUp: '即将备份的文件/文件夹路径',
			backupControl: '备份控制',
			backupInterval: '备份间隔 (秒)',
			backupFolderMaximumStorageSize: '备份文件夹最大存储容量 (MB)',
			deleteOldDataTip:
				'备份文件夹总容量超过此值后，每次备份都会删除过去的数据',
			enbleDeleteOldData: '启用删除老数据',
			ignorePatterns: '忽略模式',
			enableIgnorePatterns: '启用忽略模式',
			ignorePatternsIsEnabled: '已启用忽略模式',
			// 请输入忽略规则，每行一条。
			enterIgnoreRuleOnePerLine: '请输入忽略规则，每行一条',
			invertThisCondition: '反转条件（即：不排除）',
			singleLevelWildcard: '单级通配符（仅匹配单层文件夹）',
			multiLevelWildcard: '多级通配符（可匹配多层文件夹）',
			editing: '正在编辑',
			advanced: '高级',
			compressPatterns: '压缩模式',
			enableCompressPatterns: '启用压缩模式',
			compressPatternsIsEnabled: '已启用压缩模式',
			compressionSuffix: '压缩后缀',
			removeTask: '删除任务',
			deleteBackupTaskTip: '您确定删除该备份任务吗？',
			backupTaskNameRequired: '备份任务名称为必填项',
			localPathRequired: '本地路径为必填项',
			backupPathRequired: '备份路径为必填项d',

			sortName: '根据名称',
			sortCreateTime: '最近创建',
			sortLastBackupTime: '最近备份',
			sortNextBackupTime: '下次备份',

			backupAll: '全部备份',
			pauseAll: '全部暂停',
			actions: '操作',
			// 1
		},
		settings: {
			account: '帐号',
			title: '设置',
			general: '常规',
			language: '多语言',
			appearance: '外表',
			modes: '模式',

			automaticStart: '开机自启',

			light: '浅色模式',
			black: '黑色模式',
			dark: '暗黑模式',
			system: '随系统变化',

			shortcut: '快捷键',

			about: '关于',

			useTerminal: '请使用终端操作',
		},
		path: {
			title: '路径',
			usingPathTip: '{appName} 正在使用的路径:',
			home: '用户主目录',
			config: '配置目录',
			database: '数据目录',
		},
		terminalCommand: {
			title: '终端命令',
			availableTerminalCommands: '可用终端命令:',
			setPort: '设置端口',
			setConfigFilePath: '设置配置文件路径',
			setDebug: '启用调试模式',
			disableAutomaticOpenBrowser: '禁用自动打开浏览器',
			disableTerminalOutput: '禁用终端输出',
			setUpautostart: '设置开机自启',
			turnOffAutostart: '关闭开机自启',
			isAutostart: '检测是否开启自启',
			installService: '将 {appName} 安装于系统服务',
			uninstallService: '将 {appName} 卸载于系统服务',
			startSystemService: '启动系统服务',
			quitApp: '关闭 {appName}',
			setStaticPath: '设置 Web GUI 静态资源目录',
			defaultUser: '使用默认系统用户名启动 {appName}',
		},
	},
	'zh-TW': {
		common: {
			appTitle: '喵備份',
			language: '多語言',
			openDevtools: '開發者工具',
			quit: '退出',
			restart: '重啟',

			quitModalTitle: '退出提示',
			quitModalContent: '確定想退出主程序?',

			logout: '登出',
			cancel: '取消',
			add: '添加',
			create: '創建',
			// 1
			update: '更新',
			remove: '移除',
			// 1
			rename: '改名',
			copy: '复制',
			delete: '刪除',

			// 1
			removedSuccessfully: '删除成功!',
			updatedSuccessfully: '更新成功!',
			createdSuccessfully: '創建成功!',
			// 1

			saveAs: '另存',
			download: '下載',

			turnOff: '關閉',
			turnOn: '開啟',
			// 1
			version: '版本',
			checkForUpdates: '檢測更新',
			newVersionAvailable: '新版本可用',
			newVersionContentTip: '已發現版本{ version }可用，您要下載更新嗎？',
			newVersionDownloadedTip: '新版本已下載，需要重啟。 現在重啟？',
			connecting: '正在連接',
			appConnecting: '{appName} 正在連接...',
			restarting: '正在重啟',
			appRestarting: '{appName} 正在重啟...',
			closed: '已關閉',
			appClosed: '{appName} 已關閉',
			// 1
		},
		indexPage: {
			// 1
			backupTask: '備份任務',
			createBackup: '創建備份',
			pause: '暫停',
			paused: '已暫停',
			resume: '繼續',
			backupNow: '立即備份',
			edit: '編輯',
			taskID: '任務ID',
			localPath: '本地路徑',
			backupPath: '備份路徑',
			localState: '本地狀態',
			backupState: '備份狀態',
			backupSizeLimit: '備份大小限制',
			lastBackupTime: '上次備份時間',
			nextBackupTime: '下次備份時間',
			pathDoesNotExist: '路徑不存在',
			enabled: '啟用',
			disabled: '禁用',
			deleteOldDataIsEnabled: '刪除舊數據已啟用',
			deleteOldDataIsDisabled: '刪除舊數據已禁用',
			backupCompleted: '備份完成',
			backingup: '正在備份',
			maximumSizeOfBackupFolderExceeded: '超出備份文件夾的最大容量',
			neverBackedUp: '從未備份過',
			startedTime: '正常運行時間',
			loggedInDevice: '已登錄設備',
			localStateTotal: '本地狀態（總計）',
			backupStateTotal: '備份狀態（總計）',
			currentDevice: '當前設備',
			onlineDeviceTip: '{num1}當前在線設備/{num2}歷史設備',

			// 添加備份
			addBackup: '添加備份',
			editBackup: '編輯備份',
			general: '一般',
			taskName: '任務名稱',
			fileOrFolderPathToBeBackedUp: '要備份的文件/文件夾路徑',
			backupControl: '備份控制',
			backupInterval: '備份間隔（秒）',
			backupFolderMaximumStorageSize: '備份文件夾最大存儲大小(MB)',
			deleteOldDataTip: '總備份大小超過此值後，每次備份都會刪除過去的數據',
			enbleDeleteOldData: '啟用刪除舊數據',
			ignorePatterns: '忽略模式',
			enableIgnorePatterns: '啟用忽略模式',
			ignorePatternsIsEnabled: '忽略模式已啟用',
			enterIgnoreRuleOnePerLine: '請輸入忽略規則，每行一條。',
			invertThisCondition: '反轉此條件（即：不排除）',
			singleLevelWildcard: '單級通配符 (匹配單級目錄)',
			multiLevelWildcard: '多級通配符 (匹配多級目錄)',
			editing: '編輯',
			advanced: '高級',
			compressPatterns: '壓縮模式',
			enableCompressPatterns: '啟用壓縮模式',
			compressPatternsIsEnabled: '壓縮模式已啟用',
			CompressionSuffix: '壓縮後綴',
			removeTask: '刪除任務',
			deleteBackupTaskTip: '確定刪除該備份任務嗎？',
			backupTaskNameRequired: '備份任務名稱為必填項',
			localPathRequired: '需要本地路徑',
			backupPathRequired: '需要備份路徑',

			sortName: '根據名稱',
			sortCreateTime: '最近創建',
			sortLastBackupTime: '最近備份',
			sortNextBackupTime: '下一次備份',

			backupAll: '全部備份',
			pauseAll: '全部暫停',
			actions: '操作',
			// 1
		},
		settings: {
			title: '設置',
			account: '帳戶',
			general: '一般',
			language: '多語言',
			appearance: '外表',
			modes: '模式',

			automaticStart: '開機自啟',

			light: '淺色模式',
			black: '黑色模式',
			dark: '暗黑模式',
			system: '隨系統變化',

			shortcut: '快捷鍵',

			about: '關於',

			useTerminal: '請使用終端操作',
		},
		path: {
			title: '路径',
			usingPathTip: '{appName} 正在使用路徑：',
			home: '用戶主頁',
			config: '配置目錄',
			database: '數據庫目錄',
		},
		terminalCommand: {
			title: '終端命令',
			availableTerminalCommands: '可用的終端命令：',
			setPort: '設置端口',
			setConfigFilePath: '設置配置文件路徑',
			setDebug: '啟用調試模式',
			disableAutomaticOpenBrowser: '禁用自動打開瀏覽器',
			disableTerminalOutput: '禁用終端輸出',
			setUpautostart: '設置自動啟動',
			turnOffAutostart: '關閉自動啟動',
			isAutostart: '檢測是否開啟自啟',
			installService: '從系統服務安裝 {appName}',
			uninstallService: '從系統服務中卸載 {appName}',
			startSystemService: '啟動系統服務',
			quitApp: '退出{appName}',
			setStaticPath: '設置Web GUI靜態資源目錄',
			defaultUser: '使用默認系統用戶名啟動 {appName}',
		},
	},
	'en-US': {
		common: {
			appTitle: 'Meow Backups',
			language: 'Language',
			openDevtools: 'Open devtools',
			quit: 'Quit',
			restart: 'Restart',

			quitModalTitle: 'Quit prompt',
			quitModalContent: 'Are you sure you want to exit the main program?',

			logout: 'Logout',
			cancel: 'Cancel',
			add: 'Add',
			create: 'Create',
			// 1
			update: 'Update',
			remove: 'Remove',
			// 1
			rename: 'Rename',
			copy: 'Copy',
			delete: 'Delete',

			// 1
			removedSuccessfully: 'Removed successfully!',
			updatedSuccessfully: 'Updated successfully!',
			createdSuccessfully: 'Created successfully!',
			// 1

			saveAs: 'Save as',
			download: 'Download',

			turnOff: 'Turn off',
			turnOn: 'Turn on',
			// 1
			version: 'Version',
			checkForUpdates: 'Check for Updates',
			newVersionAvailable: 'New version available',
			newVersionContentTip:
				'Version {version} has been found available, do you want to download the update?',
			newVersionDownloadedTip:
				'The new version has been downloaded and needs to be restarted. Restart now?',
			connecting: 'connecting',
			appConnecting: '{appName} is connecting...',
			restarting: 'Restarting',
			appRestarting: '{appName} is restarting...',
			closed: 'Closed',
			appClosed: '{appName} is closed.',
			// 1
		},
		indexPage: {
			// 1
			backupTask: 'Backup Task',
			createBackup: 'Create Backup',
			pause: 'Pause',
			paused: 'Paused',
			resume: 'Resume',
			backupNow: 'Backup Now',
			edit: 'Edit',
			taskID: 'Task ID',
			localPath: 'Local Path',
			backupPath: 'Backup Path',
			localState: 'Local State',
			backupState: 'Backup State',
			backupSizeLimit: 'Backup Size Limit',
			lastBackupTime: 'Last Backup Time',
			nextBackupTime: 'Next Backup Time',
			pathDoesNotExist: 'Path does not exist',
			enabled: 'Enabled',
			disabled: 'Disabled',
			deleteOldDataIsEnabled: 'Delete old data is enabled',
			deleteOldDataIsDisabled: 'Delete old data is disabled',
			backupCompleted: 'Backup Completed',
			backingup: 'Backing up',
			maximumSizeOfBackupFolderExceeded:
				'Maximum size of Backup folder exceeded',
			neverBackedUp: 'Never backed up',
			startedTime: 'Uptime',
			loggedInDevice: 'Logged in device',
			localStateTotal: 'Local State (Total)',
			backupStateTotal: 'Backup State (Total)',
			currentDevice: 'Current Device',
			onlineDeviceTip:
				'{num1} currently online device/{num2} historical devices',

			// add backup
			addBackup: 'Add Backup',
			editBackup: 'Edit Backup',
			general: 'General',
			taskName: 'Task Name',
			fileOrFolderPathToBeBackedUp: 'The file/folder path to be backed up',
			backupControl: 'Backup Control',
			backupInterval: 'Backup Interval (seconds)',
			backupFolderMaximumStorageSize: 'Backup folder maximum storage size (MB)',
			deleteOldDataTip:
				'After the total backup size exceeds this value, each backup will delete past data',
			enbleDeleteOldData: 'Enable delete old data',
			ignorePatterns: 'Ignore patterns',
			enableIgnorePatterns: 'Enable ignore patterns',
			ignorePatternsIsEnabled: 'Ignore patterns is enabled',
			// 请输入忽略规则，每行一条。
			enterIgnoreRuleOnePerLine: 'Enter ignore rule, one per line',
			invertThisCondition: 'Invert this condition (ie: do not exclude)',
			singleLevelWildcard:
				'Single level wildcard (Match single-level directories)',
			multiLevelWildcard:
				'Multi level wildcard (Match multi-level directories)',
			editing: 'Editing',
			advanced: 'Advanced',
			compressPatterns: 'Compress patterns',
			enableCompressPatterns: 'Enable compress patterns',
			compressPatternsIsEnabled: 'Compress patterns is enabled',
			compressionSuffix: 'Compression suffix',
			removeTask: 'Remove Task',
			deleteBackupTaskTip: 'Are you sure to remove this backup task?',
			backupTaskNameRequired: 'Backup task name is required',
			localPathRequired: 'Local path is required',
			backupPathRequired: 'Backup path is required',

			sortName: 'By name',
			sortCreateTime: 'Recently created',
			sortLastBackupTime: 'Recent backup',
			sortNextBackupTime: 'Next backup',

			backupAll: 'Backup All',
			pauseAll: 'Pause All',
			actions: 'Actions',
			// 1
		},
		settings: {
			title: 'Settings',
			account: 'Account',
			general: 'General',
			language: 'Language',
			appearance: 'Appearance',
			modes: 'Modes',

			automaticStart: 'Automatic start',

			light: 'Light',
			black: 'Black',
			dark: 'Dark',
			system: 'Use system setting',

			shortcut: 'Keyboard Shortcut',

			about: 'About ',

			useTerminal: 'Please use terminal',
		},
		// 1
		path: {
			title: 'Path',
			usingPathTip: '{appName} is using the path:',
			home: 'User Home',
			config: 'Configuration Directory',
			database: 'Database Directory',
		},
		terminalCommand: {
			title: 'Terminal command',
			availableTerminalCommands: 'Available terminal commands:',
			setPort: 'Set port',
			setConfigFilePath: 'Set configuration file path',
			setDebug: 'Enable debug mode',
			disableAutomaticOpenBrowser: 'Disable automatic browser opening',
			disableTerminalOutput: 'Disable Terminal Output',
			setUpautostart: 'Set up autostart',
			turnOffAutostart: 'Turn off autostart',
			isAutostart: 'Check if autostart is enabled',
			installService: 'Install {appName} from system services',
			uninstallService: 'Uninstall {appName} from system services',
			startSystemService: 'Start system service',
			quitApp: 'Quit {appName}',
			setStaticPath: 'Set Web GUI static resource directory',
			defaultUser: 'Start {appName} with the default system username',
		},
		// 1
	},
}

i18n
	.use(initReactI18next) // passes i18n down to react-i18next
	.init({
		resources,
		ns: ['common'],
		defaultNS: 'common',
		fallbackLng: 'zh-CN',
		lng: 'zh-CN',
		// fallbackLng: 'en-US',
		// lng: 'en-US',

		keySeparator: false, // we do not use keys in form messages.welcome

		interpolation: {
			escapeValue: false, // react already safes from xss
		},
	})

export default i18n
