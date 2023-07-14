import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, {
	ActionParams,
	RootState,
	appSlice,
	backupsSlice,
	methods,
} from '.'
// import { WebStorage } from './ws'
import { WebStorage, NRequest, SAaSS, NEventListener } from '@nyanyajs/utils'
import { storage } from './storage'
import { getI18n } from 'react-i18next'

import { nsocketio, version, origin } from '../config'
import { protoRoot } from '../protos'
import { api } from '../modules/http/api'

export const R = new NRequest()

export const saass = new SAaSS({})

export const modeName = 'config'

export const eventListener = new NEventListener()

export const configMethods = {
	Init: createAsyncThunk(modeName + '/Init', async (_, thunkAPI) => {
		// 获取配置
		store.dispatch(methods.config.getDeviceType())
		store.dispatch(
			configSlice.actions.setAppearanceMode(
				((await storage.systemConfig.get('appearanceMode')) || 'system') as any
			)
		)

		store.dispatch(
			backupsSlice.actions.setSort(
				((await storage.systemConfig.get('backupSort')) || 'Name') as any
			)
		)
		// setSort
	}),
	getDeviceType: createAsyncThunk(
		modeName + '/getDeviceType',
		(_, thunkAPI) => {
			console.log('getDeviceType', document.body.offsetWidth)

			if (document.body.offsetWidth <= 768) {
				thunkAPI.dispatch(configSlice.actions.setDeviceType('Mobile'))
				return
			}
			if (
				document.body.offsetWidth <= 1024 &&
				document.body.offsetWidth > 768
			) {
				thunkAPI.dispatch(configSlice.actions.setDeviceType('Pad'))
				return
			}
			thunkAPI.dispatch(configSlice.actions.setDeviceType('PC'))
		}
	),
}

export let platform: 'Electron' | 'Web' =
	window &&
	window.process &&
	window.process.versions &&
	window.process.versions['electron']
		? 'Electron'
		: 'Web'

export let eventTarget = new EventTarget()

type DeviceType = 'Mobile' | 'Pad' | 'PC'
type AppearanceMode = 'black' | 'dark' | 'light' | 'system'
export let deviceType: DeviceType | undefined

let initialState = {
	layout: {
		backIcon: false,
		showCenter: false,
		centerTitle: {
			title: '',
			subtitle: '',
		},
	},
	saassConfig: {
		parameters: {
			imageResize: {
				normal: '?x-saass-process=image/resize,900,70',
				avatar: '?x-saass-process=image/resize,160,70',
				full: '?x-saass-process=image/resize,1920,70',
			},
		},
	},
	pageConfig: {
		disableChangeValue: false,
		settingPage: {
			settingType: '',
		},
		indexPage: {
			mobile: {
				showNotesListPage: true,
				showCategoryListPage: true,
				showPageListPage: false,
				showPageContentPage: false,
			},
		},
	},
	isDev: process.env.NODE_ENV === 'development',
	networkStatus: window.navigator.onLine,
	origin: origin,
	language: '',
	appearanceMode: 'system' as AppearanceMode,
	deviceType,
	sync: false,
	backup: {
		storagePath: '',
		backupAutomatically: false,
		automaticBackupFrequency: '-1',
		keepBackups: '-1',
		maximumStorageSpace: 512 * 1024 * 1024,
		lastBackupTime: 0,
	},
	platform,
	status: {
		noteInitStatus: false,
		sakiUIInitStatus: false,
		syncStatus: false,
		loginModalStatus: false,
		restarting: false,
	},
	socketIoConfig: {
		// uri: 'http://192.168.0.103:15301',
		uri: nsocketio.url,
		opt: {
			reconnectionDelay: 2000,
			reconnectionDelayMax: 5000,
			secure: false,
			autoConnect: true,
			rejectUnauthorized: false,
			transports: ['websocket'],
		},
	},
	general: {
		automaticStart: false,
	},
	modal: {
		addBackup: false,
		backup: undefined as protoRoot.backups.IBackupItem | undefined,
		path: false,
		terminalCommand: false,
	},
	version: version,
	newVersion: '',
}

export const configSlice = createSlice({
	name: modeName,
	initialState: initialState,
	reducers: {
		setLanguage: (
			state,
			params: ActionParams<{
				language: string
			}>
		) => {
			state.language = params.payload.language
			// console.log('state.language', state.language)
			if (state.language === 'system') {
				const languages = ['zh-CN', 'zh-TW', 'en-US']
				if (languages.indexOf(navigator.language) >= 0) {
					getI18n().changeLanguage(navigator.language)
				} else {
					switch (navigator.language.substring(0, 2)) {
						case 'zh':
							getI18n().changeLanguage('zh-CN')
							break
						case 'en':
							getI18n().changeLanguage('en-US')
							break

						default:
							getI18n().changeLanguage('en-US')
							break
					}
				}
			} else {
				getI18n().changeLanguage(state.language)
			}
			storage.systemConfig.setSync('language', state.language)
		},
		setSync: (state, params: ActionParams<boolean>) => {
			state.sync = params.payload
			storage.systemConfig.setSync('sync', JSON.stringify(params.payload))
		},
		setModalUpdateBackup: (
			state,
			params: ActionParams<{
				bool: boolean
				backup: typeof state.modal.backup
			}>
		) => {
			state.modal.addBackup = params.payload.bool
			state.modal.backup = params.payload.backup
		},
		setModalAddBackup: (state, params: ActionParams<boolean>) => {
			state.modal.addBackup = params.payload
			params.payload && (state.modal.backup = undefined)
		},
		setSettingType: (state, params: ActionParams<string>) => {
			state.pageConfig.settingPage.settingType = params.payload
		},
		setDisableChangeValue: (state, params: ActionParams<boolean>) => {
			state.pageConfig.disableChangeValue = params.payload
			params.payload &&
				setTimeout(() => {
					store.dispatch(configSlice.actions.setDisableChangeValue(false))
				}, 300)
		},

		setHeaderCenter: (state, params: ActionParams<boolean>) => {
			state.layout.showCenter = params.payload
			console.log('setHeaderCenter', state.layout.showCenter)
		},
		setHeaderCenterTitle: (
			state,
			params: ActionParams<{
				title: string
				subtitle: string
			}>
		) => {
			state.layout.centerTitle = params.payload
		},
		setDeviceType: (state, params: ActionParams<DeviceType>) => {
			state.deviceType = params.payload
		},
		setLayoutBackIcon: (state, params: ActionParams<boolean>) => {
			state.layout.backIcon = params.payload
		},

		setStatus: (
			state,
			params: ActionParams<{
				type:
					| 'noteInitStatus'
					| 'sakiUIInitStatus'
					| 'syncStatus'
					| 'loginModalStatus'
				v: boolean
			}>
		) => {
			state.status[params.payload.type] = params.payload.v
		},
		setBackup: (
			state: any,
			params: ActionParams<{
				type: keyof typeof initialState.backup
				v: any
			}>
		) => {
			state.backup[params.payload.type] = params.payload.v
			switch (params.payload.type) {
				case 'storagePath':
					storage.systemConfig.setSync('backupStoragePath', params.payload.v)
					break
				case 'backupAutomatically':
					storage.systemConfig.setSync(
						'backupAutomatically',
						JSON.stringify(params.payload.v)
					)
					break

				case 'keepBackups':
					storage.systemConfig.setSync('keepBackups', params.payload.v)
					break

				case 'automaticBackupFrequency':
					storage.systemConfig.setSync(
						'automaticBackupFrequency',
						params.payload.v
					)
					break

				default:
					break
			}
		},
		setAutomaticStart: (state, params: ActionParams<boolean>) => {
			state.general.automaticStart = params.payload
		},
		setNetworkStatus: (state, params: ActionParams<boolean>) => {
			state.networkStatus = params.payload
		},
		setVersion: (state, params: ActionParams<string>) => {
			state.version = params.payload
		},
		setNewVersion: (state, params: ActionParams<string>) => {
			state.newVersion = params.payload
		},

		setAppearanceMode: (state, params: ActionParams<AppearanceMode>) => {
			state.appearanceMode = params.payload
			document.body.classList.remove(
				'system-mode',
				'black-mode',
				'dark-mode',
				'light-mode'
			)

			document.body.classList.add(state.appearanceMode + '-mode')

			localStorage.setItem('appearanceMode', state.appearanceMode)
			storage.systemConfig.set('appearanceMode', state.appearanceMode)
			//       let media = window.matchMedia('(prefers-color-scheme: dark)');
			// let callback = (e) => {
			//     let prefersDarkMode = e.matches;
			//     if (prefersDarkMode) {
			//         // 搞事情
			//     }
			// };
			// if (typeof media.addEventListener === 'function') {
			//     media.addEventListener('change', callback);
			// } else if (typeof media.addListener === 'function') {
			//     media.addListener(callback);
			// }
		},
		setRestarting: (state, params: ActionParams<boolean>) => {
			state.status.restarting = params.payload
		},
		setModalPath: (state, params: ActionParams<boolean>) => {
			state.modal.path = params.payload
		},
		setModalTerminalCommand: (state, params: ActionParams<boolean>) => {
			state.modal.terminalCommand = params.payload
		},
	},
})
