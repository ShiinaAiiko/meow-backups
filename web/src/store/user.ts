import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams, methods, storageSlice, RootState } from '.'
import { UserAgent } from '@nyanyajs/utils/dist/userAgent'
import nyanyajs from '@nyanyajs/utils'

// import { WebStorage } from './ws'
import { storage } from './storage'
import { getI18n } from 'react-i18next'

import { stringify } from 'querystring'
import { resolve } from 'path'
import { nanoid } from 'nanoid'
import { client } from './sso'

export const modeName = 'user'

export const userMethods = {
	Init: createAsyncThunk<
		void,
		void,
		{
			state: RootState
		}
	>(modeName + '/Init', async (_, thunkAPI) => {
		// 获取配置
		// console.log(await storage.config.get('language'))
		// thunkAPI.dispatch(userSlice.actions.setInit(false))
		const { user, config } = thunkAPI.getState()
		console.log('校验token是否有效')
		const token = await storage.global.get('token')
		const deviceId = await storage.global.get('deviceId')
		const userInfo = await storage.global.get('userInfo')
		if (token) {
			thunkAPI.dispatch(
				userSlice.actions.login({
					token: token,
					deviceId: deviceId,
					userInfo: userInfo,
				})
			)
			// 检测网络状态情况
			await thunkAPI
				.dispatch(
					methods.user.checkToken({
						token,
						deviceId,
					})
				)
				.unwrap()
		} else {
			thunkAPI.dispatch(userSlice.actions.logout({}))
		}
		thunkAPI.dispatch(userSlice.actions.setInit(true))
	}),
	checkToken: createAsyncThunk(
		modeName + '/checkToken',
		async (
			{
				token,
				deviceId,
			}: {
				token: string
				deviceId: string
			},
			thunkAPI
		) => {
			try {
				const res = await client?.checkToken({
					token,
					deviceId,
				})
				console.log('res checkToken', res)
				if (res) {
					// console.log('登陆成功')
					thunkAPI.dispatch(
						userSlice.actions.login({
							token: res.token,
							deviceId: res.deviceId,
							userInfo: res.userInfo,
						})
					)
				} else {
					thunkAPI.dispatch(userSlice.actions.logout({}))
				}
			} catch (error) {}
		}
	),
}

export type UserInfo = {
	uid: string
	username: string
	email: string
	phone: string
	nickname: string
	avatar: string
	bio: string
	city: string[]
	gender: -1 | 1 | 2 | 3 | 4 | 5
	birthday: string
	status: -1 | 0 | 1
	additionalInformation: {
		[k: string]: any
	}
	appData: {
		[k: string]: any
	}
	creationTime: number
	lastUpdateTime: number
	lastSeenTime: number
}

export let userInfo: UserInfo = {
	uid: '',
	username: '',
	email: '',
	phone: '',
	nickname: '',
	avatar: '',
	bio: '',
	city: [],
	gender: -1,
	birthday: '',
	status: -1,
	additionalInformation: {},
	appData: {},
	creationTime: -1,
	lastUpdateTime: -1,
	lastSeenTime: -1,
}
export let userAgent = nyanyajs.userAgent(window.navigator.userAgent)
export const userSlice = createSlice({
	name: modeName,
	initialState: {
		userAgent: {
			...userAgent,
		},
		token: '',
		deviceId: '',
		userInfo,
		isLogin: false,
		isInit: false,
	},
	reducers: {
		setInit: (state, params: ActionParams<boolean>) => {
			state.isInit = params.payload
		},
		login: (
			state,
			params: ActionParams<{
				token: string
				deviceId: string
				userInfo: UserInfo
			}>
		) => {
			const { token, deviceId, userInfo } = params.payload
			state.token = token || ''
			state.deviceId = deviceId || ''
			state.userInfo = userInfo || Object.assign({}, userInfo)
			state.isLogin = !!token
			if (token) {
				storage.global.setSync('token', token)
				storage.global.setSync('deviceId', deviceId)
				storage.global.setSync('userInfo', userInfo)
			}
			setTimeout(() => {
				store.dispatch(storageSlice.actions.init(userInfo.uid))
			})
			// store.dispatch(userSlice.actions.init({}))
		},
		logout: (state, _) => {
			storage.global.delete('token')
			storage.global.delete('deviceId')
			storage.global.delete('userInfo')
			state.token = ''
			state.deviceId = ''
			state.userInfo = Object.assign({}, userInfo)
			state.isLogin = false
		},
	},
})
