import qs from 'qs'
import { FileItem, FolderItem } from '@nyanyajs/utils/dist/saass'
import { alert, snackbar } from '@saki-ui/core'
import i18n from './i18n/i18n'
import { api } from './http/api'
import store, { configSlice } from '../store'
const t = i18n.t

export const Query = (
	url: string,
	query: {
		[k: string]: string
	},
	searchParams: URLSearchParams
) => {
	let obj: {
		[k: string]: string
	} = {}
	searchParams.forEach((v, k) => {
		obj[k] = v
	})
	let o = Object.assign(obj, query)
	let s = qs.stringify(
		Object.keys(o).reduce(
			(fin, cur) => (o[cur] !== '' ? { ...fin, [cur]: o[cur] } : fin),
			{}
		)
	)
	return url + (s ? '?' + s : '')
}
