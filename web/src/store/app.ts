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
	configSlice,
	methods as storeMethods,
} from '.'
import { WebStorage, userAgent } from '@nyanyajs/utils'
import { ResponseData } from '@nyanyajs/utils/dist/nrequest'

import { storage, storageMethods } from './storage'
import { api } from '../modules/http/api'
import { protoRoot } from '../protos'
import { alert, progressBar } from '@saki-ui/core'
import i18n from '../modules/i18n/i18n'

const t = i18n.t

export const modeName = 'app'

export const methods = {
	getAppSummaryInfo: createAsyncThunk(
		modeName + '/getAppSummaryInfo',
		async (_, thunkAPI) => {
			const res = await api.v1.app.getAppSummaryInfo({})
			console.log('getAppSummaryInfo res', res)
			if (res.code === 200) {
				thunkAPI.dispatch(slice.actions.setAppSummaryInfo(res.data))
				thunkAPI.dispatch(backupsSlice.actions.setIsNewUpdate(false))
			}
		}
	),
	getSystemConfig: createAsyncThunk(
		modeName + '/getSystemConfig',
		async (_, thunkAPI) => {
			const res = await api.v1.app.getSystemConfig({})
			console.log('getSystemConfig res', res)
			if (res.code === 200) {
				store.dispatch(slice.actions.setSystemConfig(res.data))
				store.dispatch(
					configSlice.actions.setAppearanceMode(
						(res.data.appearance || 'system') as any
					)
				)
				store.dispatch(
					configSlice.actions.setLanguage({
						language: res.data.language || 'system',
					})
				)
				store.dispatch(
					configSlice.actions.setAutomaticStart(
						res.data.automaticStart || false
					)
				)
				thunkAPI.dispatch(storeMethods.app.checkForUpdates())
			}
		}
	),

	checkForUpdates: createAsyncThunk(
		modeName + '/checkForUpdates',
		async (_, thunkAPI) => {
			const res = await api.v1.app.checkForUpdates({
				type: 'CheckForUpdates',
			})
			console.log('检测更新', res)
			if (res.code === 200) {
				if (res.data.status === 1) {
					thunkAPI.dispatch(appSlice.actions.setNewVersionDownloadProgress(0))
					thunkAPI.dispatch(
						configSlice.actions.setNewVersion(res.data.version || '')
					)
				}
			}
		}
	),
	update: createAsyncThunk(modeName + '/update', async (_, thunkAPI) => {
		const { config } = store.getState()
		alert({
			title: t('newVersionAvailable', {
				ns: 'common',
			}),
			content: t('newVersionContentTip', {
				ns: 'common',
			}).replace('{version}', config.version),
			cancelText: t('cancel', {
				ns: 'common',
			}),
			confirmText: t('update', {
				ns: 'common',
			}),
			onCancel() {},
			async onConfirm() {
				thunkAPI.dispatch(appSlice.actions.setNewVersionDownloadProgress(0))
				const res = await api.v1.app.checkForUpdates({
					type: 'DownloadUpdate',
				})
				console.log('检测更新', res)
				if (res.code === 200) {
					if (res.data.status === 1) {
						thunkAPI.dispatch(
							configSlice.actions.setNewVersion(res.data.version || '')
						)
					}
				}
				// const pb = progressBar()
				// pb.open()
				// pb.setProgress({
				// 	progress: 0,
				// })
			},
		}).open()

		// const res = await api.v1.app.checkForUpdates({
		//   type: 'CheckForUpdates',
		// })
		// console.log('检测更新', res)
		// if (res.code === 200) {
		//   if (res.data.status === 1) {
		//     thunkAPI.dispatch(configSlice.actions.setNewVersion(res.data.version || ''))
		//   }
		// }
	}),
}

export const slice = createSlice({
	name: modeName,
	initialState: {
		appSummaryInfo: {} as protoRoot.app.GetAppSummaryInfo.IResponse,
		systemConfig: {} as protoRoot.app.GetSystemConfig.IResponse,
		newVersionDownloadProgress: 0,
	},
	reducers: {
		setAppSummaryInfo: (
			state,
			params: ActionParams<protoRoot.app.GetAppSummaryInfo.IResponse>
		) => {
			state.appSummaryInfo = params.payload
		},
		setSystemConfig: (
			state,
			params: ActionParams<protoRoot.app.GetSystemConfig.IResponse>
		) => {
			state.systemConfig = params.payload
		},
		setNewVersionDownloadProgress: (state, params: ActionParams<number>) => {
			state.newVersionDownloadProgress = params.payload
		},
	},
})

export default {
	slice,
	methods,
	modeName,
}
