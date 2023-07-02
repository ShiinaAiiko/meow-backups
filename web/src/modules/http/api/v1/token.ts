import { protoRoot, PARAMS, Request } from '../../../../protos'
import store from '../../../../store'
import axios from 'axios'
import { getUrl } from '..'

export const tokenApi = () => {
	return {
		async getToken(params: protoRoot.token.GetToken.IRequest) {
			const { apiNames } = store.getState().api
			return await Request<protoRoot.token.GetToken.IResponse>(
				{
					method: 'POST',
					// config: requestConfig,
					data: PARAMS<protoRoot.token.GetToken.IRequest>(
						params,
						protoRoot.token.GetToken.Request
					),
					url: getUrl(apiNames.v1.baseUrl, apiNames.v1.getToken),
				},
				protoRoot.token.GetToken.Response
			)
		},
	}
}
