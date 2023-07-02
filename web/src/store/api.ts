import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams } from '.'
// import { WebStorage } from './ws'
import { WebStorage } from '@nyanyajs/utils'
import { storage } from './storage'
import { getI18n } from 'react-i18next'

import { stringify } from 'querystring'
import { resolve } from 'path'
import { nanoid } from 'nanoid'
import { serverApi } from '../config'

export const modeName = 'api'

export const apiMethods = {
	Init: createAsyncThunk(modeName + '/Init', async (_, thunkAPI) => {
		// 获取配置
	}),
}

export const apiSlice = createSlice({
	name: modeName,
	initialState: {
		apiUrl: serverApi.url,
		apiNames: {
			v1: {
				baseUrl: '/api/v1',
				// token
				getToken: '/token/getToken',

				// app
				getSystemConfig: '/app/systemConfig/get',
				updateSystemConfig: '/app/systemConfig/update',
				getAppSummaryInfo: '/app/appSummaryInfo/get',
				quit: '/app/quit',
				restart: '/app/restart',
				checkForUpdates: '/app/checkForUpdates',
			},
		},
		NSocketIoEventNames: {
			v1: {
				Error: 'Error',
				OtherDeviceOnline: 'OtherDeviceOnline',
				OtherDeviceOffline: 'OtherDeviceOffline',
				OnForceOffline: 'OnForceOffline',

				backupTaskUpdate: 'BackupTaskUpdate',
				checkForUpdates: 'CheckForUpdates',

				addBackup: 'AddBackup',
				getBackups: 'GetBackups',
				getAppSummaryInfo: 'GetAppSummaryInfo',
				updateBackupStatus: 'UpdateBackupStatus',
				backupNow: 'BackupNow',
				deleteBackup: 'DeleteBackup',
				getBackup: 'GetBackup',
				updateBackup: 'UpdateBackup',
			},
		},
	},
	reducers: {},
})
