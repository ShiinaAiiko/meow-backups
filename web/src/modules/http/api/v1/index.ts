import { protoRoot, PARAMS, Request } from '../../../../protos'
import store from '../../../../store'
import axios from 'axios'
import { getUrl } from '..'
import { tokenApi } from './token'
import { appApi } from './app'

export const v1 = {
	token: tokenApi(),
	app: appApi(),
}
