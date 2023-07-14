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

export const sortList = [
	'Name',
	'CreateTime',
	'LastBackupTime',
	'NextBackupTime',
]

const state = {
	isNewUpdate: false,
	list: [] as protoRoot.backups.IBackupItem[],
	sort: 'Name' as 'Name' | 'CreateTime' | 'LastBackupTime' | 'NextBackupTime',
}

export const slice = createSlice({
	name: modeName,
	initialState: state,
	reducers: {
		setIsNewUpdate: (state, params: ActionParams<boolean>) => {
			state.isNewUpdate = params.payload
		},
		setSort: (state, params: ActionParams<(typeof state)['sort']>) => {
			state.sort = params.payload

			storage.systemConfig.setSync('backupSort', params.payload)
			setTimeout(() => {
				store.dispatch(
					slice.actions.setList({
						list: store.getState().backups.list,
					})
				)
			}, 0)
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
			// console.log('state.list', state.list)
			state.list.sort((a, b) => {
				switch (state.sort) {
					case 'CreateTime':
						return Number(b.createTime) - Number(a.createTime)

					case 'LastBackupTime':
						return Number(b.lastBackupTime) - Number(a.lastBackupTime)

					case 'NextBackupTime':
						return Number(a.status) < 0
							? 1
							: Number(a.lastBackupTime) +
									Number(a.interval) -
									(Number(b.lastBackupTime) + Number(b.interval))

					default:
						return (a.name || '').localeCompare(b.name || '')
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
