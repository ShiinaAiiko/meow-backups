import { baselog } from 'nyanyajs-log'
import * as Ion from 'ion-sdk-js/lib/connector'
// import { config } from 'process'
baselog.Info('Env:', process.env.NODE_ENV)

let localhostUrl = window.location.origin

let version = ''
let serverApi = {
	url: localhostUrl,
}
let nsocketio = {
	url: localhostUrl,
}

let sakiui = {
	jsurl: '',
	esmjsurl: '',
}
let meowApps = {
	jsurl: '',
	esmjsurl: '',
}

let origin = window.location.origin

if (origin === 'file://') {
	origin = window.location.href.split('build/')[0] + 'build'
}

// console.log('origin', origin)

interface Config {
	version: typeof version
	serverApi: typeof serverApi
	nsocketio: typeof nsocketio
	sakiui: typeof sakiui
	meowApps: typeof meowApps
}
// import configJson from './config.test.json'
try {
	let configJson: Config = require('./config.temp.json')
	let pkg = require('../package.json')
	console.log('configJson', configJson)
	if (configJson) {
		version = pkg.version
		// sakisso = configJson.sakisso
		serverApi = configJson.serverApi
		nsocketio = configJson.nsocketio

		serverApi.url === 'localhost' && (serverApi.url = localhostUrl)
		nsocketio.url === 'localhost' && (nsocketio.url = localhostUrl)
		console.log(serverApi)
		// staticPathDomain = configJson.staticPathDomain
		// networkTestUrl = configJson.networkTestUrl || configJson.serverApi.apiUrl
		sakiui = configJson.sakiui
		meowApps = configJson.meowApps
	}
} catch (error) {
	console.log('未添加配置文件.')
	console.log(error)
}
export { version, serverApi, sakiui, nsocketio, origin, meowApps }
