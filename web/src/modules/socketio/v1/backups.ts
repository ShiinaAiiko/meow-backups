import * as proto from '../../../protos'
import * as coding from '../../../protos/socketioCoding'
import protoRoot from '../../../protos/proto'
import store from '../../../store'
import { client } from '../../../store/nsocketio'
import { RSA, AES } from '@nyanyajs/utils'
import { NRequest } from '@nyanyajs/utils'

const { ParamsEncode, ResponseDecode } = NRequest.protobuf
const P = ParamsEncode
const R = ResponseDecode
// import { e2eeDecryption, e2eeEncryption } from '../common'
export const Backups = () => {
  const { nsocketio, api } = store.getState()
  const { namespace } = nsocketio
  const { NSocketIoEventNames } = api
  return {
    async DeleteBackup(params: protoRoot.backups.DeleteBackup.IRequest) {
      return R<protoRoot.backups.DeleteBackup.IResponse>(
        (await client?.emit({
          namespace: namespace.backup,
          eventName: NSocketIoEventNames.v1.deleteBackup,
          params: P<protoRoot.backups.DeleteBackup.IRequest>(
            params,
            protoRoot.backups.DeleteBackup.Request
          ),
        })) as any,
        protoRoot.backups.DeleteBackup.Response
      )
    },
    async BackupNow(params: protoRoot.backups.BackupNow.IRequest) {
      return R<protoRoot.backups.BackupNow.IResponse>(
        (await client?.emit({
          namespace: namespace.backup,
          eventName: NSocketIoEventNames.v1.backupNow,
          params: P<protoRoot.backups.BackupNow.IRequest>(
            params,
            protoRoot.backups.BackupNow.Request
          ),
        })) as any,
        protoRoot.backups.BackupNow.Response
      )
    },
    async UpdateBackupStatus(
      params: protoRoot.backups.UpdateBackupStatus.IRequest
    ) {
      return R<protoRoot.backups.UpdateBackupStatus.IResponse>(
        (await client?.emit({
          namespace: namespace.backup,
          eventName: NSocketIoEventNames.v1.updateBackupStatus,
          params: P<protoRoot.backups.UpdateBackupStatus.IRequest>(
            params,
            protoRoot.backups.UpdateBackupStatus.Request
          ),
        })) as any,
        protoRoot.backups.UpdateBackupStatus.Response
      )
    },
    async GetBackups(params: protoRoot.backups.GetBackups.IRequest) {
      console.log("GetBackups", params)
      const res = (await client?.emit({
        namespace: namespace.backup,
        eventName: NSocketIoEventNames.v1.getBackups,
        params: P<protoRoot.backups.GetBackups.IRequest>(
          params,
          protoRoot.backups.GetBackups.Request
        ),
      })) as any
      console.log("GetBackups res", res)

      return R<protoRoot.backups.GetBackups.IResponse>(
        res,
        protoRoot.backups.GetBackups.Response
      )
    },
    async UpdateBackup(params: protoRoot.backups.UpdateBackup.IRequest) {
      return R<protoRoot.backups.UpdateBackup.IResponse>(
        (await client?.emit({
          namespace: namespace.backup,
          eventName: NSocketIoEventNames.v1.updateBackup,
          params: P<protoRoot.backups.UpdateBackup.IRequest>(
            params,
            protoRoot.backups.UpdateBackup.Request
          ),
        })) as any,
        protoRoot.backups.UpdateBackup.Response
      )
    },
    async AddBackup(params: protoRoot.backups.AddBackup.IRequest) {
      return R<protoRoot.backups.AddBackup.IResponse>(
        (await client?.emit({
          namespace: namespace.backup,
          eventName: NSocketIoEventNames.v1.addBackup,
          params: P<protoRoot.backups.AddBackup.IRequest>(
            params,
            protoRoot.backups.AddBackup.Request
          ),
        })) as any,
        protoRoot.backups.AddBackup.Response
      )
    },
  }
}
