import { protoRoot, PARAMS, Request } from '../../../../protos'
import store, { appSlice, configSlice, methods } from '../../../../store'
import axios from 'axios'
import { getUrl } from '..'

export const appApi = () => {
	return {
		async getSystemConfig(params: protoRoot.app.GetSystemConfig.IRequest) {
			const { apiNames } = store.getState().api
			return await Request<protoRoot.app.GetSystemConfig.IResponse>(
				{
					method: 'GET',
					data: PARAMS<protoRoot.app.GetSystemConfig.IRequest>(
						params,
						protoRoot.app.GetSystemConfig.Request
					),
					url: getUrl(apiNames.v1.baseUrl, apiNames.v1.getSystemConfig),
				},
				protoRoot.app.GetSystemConfig.Response
			)
		},
		async updateSystemConfig(
			params: protoRoot.app.UpdateSystemConfig.IRequest
		) {
			const { api, app } = store.getState()
			const { apiNames } = api
			const p = {
				language: params.language || app.systemConfig.language || 'systrem',
				appearance:
					params.appearance || app.systemConfig.appearance || 'systrem',
				automaticStart: params.hasOwnProperty('automaticStart')
					? String(params.automaticStart)
					: '',
			}
			const res = await Request<protoRoot.app.UpdateSystemConfig.IResponse>(
				{
					method: 'POST',
					data: PARAMS<protoRoot.app.UpdateSystemConfig.IRequest>(
						p,
						protoRoot.app.UpdateSystemConfig.Request
					),
					url: getUrl(apiNames.v1.baseUrl, apiNames.v1.updateSystemConfig),
				},
				protoRoot.app.UpdateSystemConfig.Response
			)

			console.log('updateSystemConfig', res, p)
			if (res.code === 200) {
				store.dispatch(
					appSlice.actions.setSystemConfig({
						...app.systemConfig,
						...p,
						automaticStart: Boolean(
							params.hasOwnProperty('automaticStart')
								? params.automaticStart
								: app.systemConfig.automaticStart
						),
					})
				)
				store.dispatch(
					configSlice.actions.setAppearanceMode(
						(p.appearance || 'system') as any
					)
				)
				store.dispatch(
					configSlice.actions.setLanguage({
						language: p.language || 'system',
					})
				)
				store.dispatch(
					configSlice.actions.setAutomaticStart(
						Boolean(
							params.hasOwnProperty('automaticStart')
								? params.automaticStart
								: app.systemConfig.automaticStart
						)
					)
				)
			}

			return res
		},
		async getAppSummaryInfo(params: protoRoot.app.GetAppSummaryInfo.IRequest) {
			const { apiNames } = store.getState().api
			return await Request<protoRoot.app.GetAppSummaryInfo.IResponse>(
				{
					method: 'GET',
					data: PARAMS<protoRoot.app.GetAppSummaryInfo.IRequest>(
						params,
						protoRoot.app.GetAppSummaryInfo.Request
					),
					url: getUrl(apiNames.v1.baseUrl, apiNames.v1.getAppSummaryInfo),
				},
				protoRoot.app.GetAppSummaryInfo.Response
			)
		},
		async quit() {
			const { apiNames } = store.getState().api
			return await Request<protoRoot.app.Quit.IResponse>(
				{
					method: 'POST',
					data: PARAMS<protoRoot.app.Quit.IRequest>(
						{},
						protoRoot.app.Quit.Request
					),
					url: getUrl(apiNames.v1.baseUrl, apiNames.v1.quit),
				},
				protoRoot.app.Quit.Response
			)
		},
		async restart() {
			const { apiNames } = store.getState().api
			return await Request<protoRoot.app.Restart.IResponse>(
				{
					method: 'POST',
					data: PARAMS<protoRoot.app.Restart.IRequest>(
						{},
						protoRoot.app.Restart.Request
					),
					url: getUrl(apiNames.v1.baseUrl, apiNames.v1.restart),
				},
				protoRoot.app.Restart.Response
			)
		},
		async checkForUpdates(params: protoRoot.app.CheckForUpdates.IRequest) {
			const { apiNames } = store.getState().api
			return await Request<protoRoot.app.CheckForUpdates.IResponse>(
				{
					method: 'GET',
					data: PARAMS<protoRoot.app.CheckForUpdates.IRequest>(
						params,
						protoRoot.app.CheckForUpdates.Request
					),
					url: getUrl(apiNames.v1.baseUrl, apiNames.v1.checkForUpdates),
				},
				protoRoot.app.CheckForUpdates.Response
			)
		},
	}
}
