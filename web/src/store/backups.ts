import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import md5 from 'blueimp-md5'
import store, { ActionParams, RootState } from '.'
import { WebStorage, userAgent } from '@nyanyajs/utils'

import { storage } from './storage'
import { api } from '../modules/http/api'
import { protoRoot } from '../protos'

export const modeName = 'backups'

export const methods = {}

export const slice = createSlice({
	name: modeName,
	initialState: {
		isNewUpdate: false,
		list: [] as protoRoot.backups.IBackupItem[],
	},
	reducers: {
		setIsNewUpdate: (state, params: ActionParams<boolean>) => {
			state.isNewUpdate = params.payload
		},
		setList: (
			state,
			params: ActionParams<{
				list: protoRoot.backups.IBackupItem[]
			}>
		) => {
			const { list } = params.payload
			state.list = list.map((v) => {
				return {
					...v,
					isPathExists: v.isPathExists || false,
					ignore: v.ignore || false,
					compress: v.compress || false,
					compressVolumeSize: v.compressVolumeSize || 0,
					interval: v.interval || 0,
					maximumStorageSize: v.maximumStorageSize || 0,
					status: v.status !== undefined ? v.status : -1,
					lastBackupTime: v.lastBackupTime || 0,
					localFolderStatus: {
						...v.localFolderStatus,
						files: v.localFolderStatus?.files || 0,
						folders: v.localFolderStatus?.folders || 0,
						size: v.localFolderStatus?.size || 0,
					},
				}
			})
		},
	},
})

export default {
	slice,
	methods,
	modeName,
}
