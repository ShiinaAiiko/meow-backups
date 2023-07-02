import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams, RootState, methods as storeMethods } from '.'
import { WebStorage, userAgent } from '@nyanyajs/utils'

import { storage } from './storage'
import { api } from '../modules/http/api'

export const modeName = 'deviceToken'

export const methods = {
	init: createAsyncThunk(modeName + '/init', async (_, thunkAPI) => {
		console.log('initDeviceToken')
		const deviceId = await storage.global.get('deviceId')
		const token = await storage.global.get('token')

		thunkAPI.dispatch(
			slice.actions.login({
				deviceId,
				token,
				isLogin: false,
			})
		)
		await thunkAPI.dispatch(methods.getDeviceToken())
	}),
	getDeviceToken: createAsyncThunk(
		modeName + '/getDeviceToken',
		async (_, thunkAPI) => {
			console.log('getDeviceToken')

			const res = await api.v1.token.getToken({
				username: '',
				password: '',
			})
			console.log('getToken res', res)
			if (res.code === 200) {
				thunkAPI.dispatch(
					slice.actions.login({
						deviceId: res.data.deviceId as string,
						token: res.data.token as string,
						isLogin: true,
					})
				)
				await storage.global.set('deviceId', res.data.deviceId, 21 * 3600 * 24)
				await storage.global.set('token', res.data.token, 21 * 3600 * 24)

				// await thunkAPI.dispatch(storeMethods.app.getSystemConfig())
			}
		}
	),
}

export const slice = createSlice({
	name: modeName,
	initialState: {
		token: '',
		deviceId: '',
		userAgent: userAgent(window.navigator.userAgent),
		isLogin: false,
	},
	reducers: {
		login: (
			state,
			params: ActionParams<{
				deviceId: string
				token: string
				isLogin: boolean
			}>
		) => {
			const { deviceId, token, isLogin } = params.payload
			state.deviceId = deviceId
			state.token = token
			state.isLogin = isLogin
		},
	},
})

export default {
	slice,
	methods,
	modeName,
}
