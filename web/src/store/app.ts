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
import { alert, progressBar, snackbar } from '@saki-ui/core'
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
	checkForUpdates: createAsyncThunk<
		void,
		{
			alertModal: boolean
		},
		{
			state: RootState
		}
	>(modeName + '/checkForUpdates', async ({ alertModal }, thunkAPI) => {
		const res = await api.v1.app.checkForUpdates({
			type: 'CheckForUpdates',
		})
		console.log('检测更新', res)
		if (res.code === 200 && res.data.status === 1) {
			thunkAPI.dispatch(appSlice.actions.setNewVersionDownloadProgress(0))
			thunkAPI.dispatch(
				configSlice.actions.setNewVersion(res.data.version || '')
			)
			alertModal && thunkAPI.dispatch(storeMethods.app.update())
		} else {
			thunkAPI.dispatch(configSlice.actions.setNewVersion(''))

			alertModal &&
				snackbar({
					message: '已是最新版本',
					horizontal: 'center',
					vertical: 'top',
					autoHideDuration: 2000,
					backgroundColor: 'var(--saki-default-color)',
					color: '#fff',
				}).open()
		}
	}),
	getSystemConfig: createAsyncThunk<
		void,
		void,
		{
			state: RootState
		}
	>(modeName + '/getSystemConfig', async (_, thunkAPI) => {
		const res = await api.v1.app.getSystemConfig({})
		console.log('getSystemConfig res', res)
		if (res.code === 200) {
			thunkAPI.dispatch(slice.actions.setSystemConfig(res.data))
			thunkAPI.dispatch(
				configSlice.actions.setVersion(res.data.version?.split(' ')?.[0] || '')
			)
			thunkAPI.dispatch(
				configSlice.actions.setAppearanceMode(
					(res.data.appearance || 'system') as any
				)
			)
			thunkAPI.dispatch(
				configSlice.actions.setLanguage({
					language: res.data.language || 'system',
				})
			)
			thunkAPI.dispatch(
				configSlice.actions.setAutomaticStart(res.data.automaticStart || false)
			)
			thunkAPI.dispatch(
				storeMethods.app.checkForUpdates({
					alertModal: false,
				})
			)
		}
	}),
	update: createAsyncThunk<
		void,
		void,
		{
			state: RootState
		}
	>(modeName + '/update', async (_, thunkAPI) => {
		const { config } = thunkAPI.getState()
		// console.log(config)
		alert({
			title: t('newVersionAvailable', {
				ns: 'common',
			}),
			content: t('newVersionContentTip', {
				ns: 'common',
			}).replace('{version}', config.newVersion),
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
	modeName,
}
