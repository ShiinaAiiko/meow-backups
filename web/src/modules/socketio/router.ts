import store, { appSlice, backupsSlice } from '../../store'
import { protoRoot, socketio } from '../../protos'
import socketApi from './api'
import md5 from 'blueimp-md5'
import nyanyalog from 'nyanyajs-log'
import { RSA, DiffieHellman, deepCopy } from '@nyanyajs/utils'
// import { e2eeDecryption } from './common'
// import { getDialogRoomUsers } from '../../store/modules/chat/methods'

import { NRequest } from '@nyanyajs/utils'
import { client } from '../../store/nsocketio'
import { alert } from '@saki-ui/core'
import i18n from '../i18n/i18n'
import { appApi } from '../http/api/v1/app'
import { api as httpApi } from '../http/api'

const { ParamsEncode, ResponseDecode } = NRequest.protobuf
const P = ParamsEncode
const R = ResponseDecode
const t = i18n.t

export const createSocketioRouter = {
	createRouter() {
		const { nsocketio, api, config } = store.getState()
		if (!client) return
		// const state = store.state
		const namespace = nsocketio.namespace
		const NSocketIoEventNames = api.NSocketIoEventNames
		// // console.log(deepCopy(client), namespace, namespace.base)

		client
			?.routerGroup(namespace.base)
			.router({
				eventName: NSocketIoEventNames.v1.Error,
				func: (response) => {
					console.log('Socket.io Error', response)
					switch (response.data.code) {
						case 10009:
							// store.state.event.eventTarget.dispatchEvent(
							// 	new Event('initEncryption')
							// )
							break
						case 10004:
							// store.state.event.eventTarget.dispatchEvent(new Event('initLogin'))
							break

						default:
							break
					}
				},
			})
			.router({
				eventName: NSocketIoEventNames.v1.OtherDeviceOnline,
				func: (response) => {
					console.log('OtherDeviceOnline', response)
				},
			})
			.router({
				eventName: NSocketIoEventNames.v1.OtherDeviceOffline,
				func: (response) => {
					console.log('OtherDeviceOffline', response)
				},
			})
			.router({
				eventName: NSocketIoEventNames.v1.OnForceOffline,
				func: (response) => {
					console.log('OnForceOffline', response)
				},
			})

		client
			?.routerGroup(namespace.backup)
			.router({
				eventName: NSocketIoEventNames.v1.backupTaskUpdate,
				func: socketio.ResponseDecode<protoRoot.backups.BackupTaskUpdate.IResponse>(
					(res) => {
						console.log(
							'BackupTaskUpdate',
							res,
							res.data.backup?.backupProgress
						)
						console.log('------BackupTaskUpdate------')
						const { backups } = store.getState()
						store.dispatch(
							backupsSlice.actions.setList({
								list: backups.list.map((sv) => {
									if (sv.id === res.data.backup?.id) {
										return {
											...sv,
											...res.data.backup,
											status: res.data.backup?.status || 0,
											backupProgress: res.data.backup?.backupProgress || 0,
										}
									}
									return sv
								}),
							})
						)
						store.dispatch(backupsSlice.actions.setIsNewUpdate(true))
					},
					protoRoot.backups.BackupTaskUpdate.Response
				),
			})
			.router({
				eventName: NSocketIoEventNames.v1.checkForUpdates,
				func: socketio.ResponseDecode<protoRoot.app.CheckForUpdates.IResponse>(
					(res) => {
						console.log('checkForUpdates', res.data.downloadProgress)
						if (res.code === 200) {
							store.dispatch(
								appSlice.actions.setNewVersionDownloadProgress(
									Number(res.data.downloadProgress) * 100
								)
							)
              if (res.data.downloadProgress === 1) {
								alert({
									title: t('newVersionAvailable', {
										ns: 'common',
									}),
									content: t('newVersionDownloadedTip', {
										ns: 'common',
									}),
									cancelText: t('cancel', {
										ns: 'common',
									}),
									confirmText: t('restart', {
										ns: 'common',
									}),
									onCancel() {},
									async onConfirm() {
										store.dispatch(
											appSlice.actions.setNewVersionDownloadProgress(0)
                    )
                    
                    
                    const res = await httpApi.v1.app.checkForUpdates({
                      type: 'Install',
                    })
                    console.log('InstallApp', res)
									},
								}).open()
							}
						}
					},
					protoRoot.app.CheckForUpdates.Response
				),
			})
	},
}
export default createSocketioRouter
