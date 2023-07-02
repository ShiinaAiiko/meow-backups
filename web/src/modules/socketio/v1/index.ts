import store from '../../../store'
import * as coding from '../../../protos/socketioCoding'
import * as proto from '../../../protos'
import protoRoot from '../../../protos/proto'
import * as nyanyalog from 'nyanyajs-log'
import { Backups } from './backups'
export const v1 = {
	...Backups(),
}
export default v1
