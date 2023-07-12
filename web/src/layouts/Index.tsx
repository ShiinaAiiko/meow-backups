import React, { useEffect, useState } from 'react'
import {
	RouterProps,
	useLocation,
	useNavigate,
	useParams,
	useSearchParams,
} from 'react-router-dom'
import './Index.scss'
import { Header, Settings, Login } from '../components'
import AddBackupComponent from '../components/AddBackup'
import PathComponent from '../components/Path'
import TerminalCommandComponent from '../components/TerminalCommand'
import { bindEvent } from '../modules/bindEvent'

import { useTranslation } from 'react-i18next'
import { Debounce, deepCopy } from '@nyanyajs/utils'
import { v5 as uuidv5, v4 as uuidv4 } from 'uuid'

import { api } from '../modules/http/api'

import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	storageSlice,
	configSlice,
	userSlice,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'
import { client } from '../store/nsocketio'
import { alert } from '@saki-ui/core'
import { Query } from '../modules/methods'
import axios from 'axios'

let timer: NodeJS.Timer
let timerCount = 0

const IndexLayout = ({ children }: RouterProps) => {
	const [debounce] = useState(new Debounce())
	const [getRemoteDataDebounce] = useState(new Debounce())
	const { t, i18n } = useTranslation('common')
	const dispatch = useDispatch<AppDispatch>()
	const [openSettingModal, setOpenSettingModal] = useState(false)
	// const [openSettingType, setOpenSettingType] = useState('')

	const nsocketio = useSelector((state: RootState) => state.nsocketio)
	const deviceToken = useSelector((state: RootState) => state.deviceToken)
	const config = useSelector((state: RootState) => state.config)
	const apiUrl = useSelector((state: RootState) => state.api.apiUrl)

	const appStatus = useSelector((state: RootState) => state.config.status)
	const user = useSelector((state: RootState) => state.user)

	const [hideLoading, setHideLoading] = useState(false)
	const [loadProgressBar, setLoadProgressBar] = useState(false)
	const [progressBar, setProgressBar] = useState(0.01)
	// const [progressBar, setProgressBar] = useState(0.01)

	const history = useNavigate()
	const location = useLocation()
	const [searchParams] = useSearchParams()

	const [startAlert, setStartAlert] = useState({
		s: 0,
		a: alert({
			title: t('connecting'),
			content: t('appConnecting').replace('{appName}', t('appTitle')),
		}),
	})
	const [restartingAlert, setRestartingAlert] = useState({
		s: 0,
		a: alert({
			title: t('restarting'),
			content: t('appRestarting').replace('{appName}', t('appTitle')),
		}),
	})

	const [quitAlert, setQuitAlert] = useState({
		s: 0,
		a: alert({
			title: t('closed'),
			content: t('appClosed').replace('{appName}', t('appTitle')),
		}),
	})

	useEffect(() => {
		dispatch(methods.config.Init()).unwrap()
		debounce.increase(async () => {
			// dispatch(methods.sso.Init()).unwrap()
			testUrl()

			await dispatch(methods.deviceToken.init())
			// dispatch(methods.nsocketio.Init())
			// dispatch(methods.user.Init()).unwrap()

			// dispatch(methods.appearance.Init()).unwrap()
			// dispatch(methods.notes.Init())
			// dispatch(methods.notes.GetLocalData())

			// console.log('config.deviceType getDeviceType', config)
		}, 50)

		// setTimeout(() => {
		// 	setOpenSettingModal(true)
		// }, 1000)
		// store.dispatch(storageSlice.actions.init())
	}, [])

	useEffect(() => {
		if (nsocketio.status === 'success') {
			dispatch(configSlice.actions.setRestarting(false))
			if (config.status.restarting) {
				restartingAlert.s === 1 && restartingAlert.a.close()
				restartingAlert.s = 0
			} else {
				quitAlert.s === 1 && quitAlert.a.close()
				quitAlert.s = 0
			}
			dispatch(methods.app.getSystemConfig())
		}
		if (nsocketio.status === 'fail') {
			if (config.status.restarting) {
				restartingAlert.s === 0 && restartingAlert.a.open()
				restartingAlert.s = 1
			} else {
				quitAlert.s === 0 && quitAlert.a.open()
				quitAlert.s = 1
			}
			testUrl()
		}
	}, [nsocketio.status])

	useEffect(() => {
		if (appStatus.sakiUIInitStatus) {
			startAlert.s === 0 && startAlert.a.open()
			startAlert.s = 1
		}
		if (appStatus.sakiUIInitStatus && nsocketio.status === 'success') {
			setTimeout(() => {
				startAlert.a.close()
			}, 300)
		}
	}, [nsocketio.status, appStatus.sakiUIInitStatus])

	useEffect(() => {
		if (deviceToken.isLogin) {
			dispatch(methods.nsocketio.Init())
		}
	}, [deviceToken.isLogin])

	// useEffect(() => {
	// 	// if (!config.networkStatus) {
	// 	// 	dispatch(userSlice.actions.setInit(false))
	// 	// }
	// 	if (config.networkStatus && notes.isInit) {
	// 		dispatch(methods.user.Init()).unwrap()
	// 	}
	// }, [config.networkStatus])

	// useEffect(() => {
	// 	// console.log('监听同步开启了', notes.isInit, config.sync)
	// 	if (config.sync && user.isLogin && notes.isInit) {
	// 		console.log('监听同步开启了')
	// 		dispatch(methods.notes.GetRemoteData()).unwrap()
	// 	}
	// }, [config.sync])

	useEffect(() => {
		if (user.isInit) {
			progressBar < 1 &&
				setProgressBar(progressBar + 0.2 >= 1 ? 1 : progressBar + 0.2)
		}
		if (
			user.isInit &&
			user.isLogin &&
			(location.pathname === '/' || location.pathname.indexOf('/m') === 0)
		) {
			dispatch(methods.nsocketio.Init()).unwrap()
		} else {
			dispatch(methods.nsocketio.Close()).unwrap()
		}
	}, [user.isInit, user.isLogin])

	useEffect(() => {
		if (appStatus.sakiUIInitStatus && loadProgressBar) {
			console.log('progressBar', progressBar)
			progressBar < 1 &&
				setTimeout(() => {
					console.log('progressBar', progressBar)
					setProgressBar(1)
				}, 500)
		}
		// console.log("progressBar",progressBar)
	}, [loadProgressBar, appStatus.sakiUIInitStatus])

	const testUrl = async () => {
		timerCount++
		try {
			const res = await axios({
				url: apiUrl,
				method: 'HEAD',
			})
			// console.log('testUrl', res)
			// if (timerCount > 1) {
			if (timerCount > 12 * 10) {
				window.location.reload()
			}
			clearInterval(timer)
			timerCount = 0
		} catch (error) {
			// console.error(error)
			if (!timer) {
				timer = setInterval(() => {
					testUrl()
				}, 5 * 1000)
			}
		}
	}

	return (
		<div className='index-layout'>
			<saki-base-style></saki-base-style>
			<Login />
			<saki-init
				ref={bindEvent({
					mounted(e) {
						console.log('mounted', e)
						store.dispatch(
							configSlice.actions.setStatus({
								type: 'sakiUIInitStatus',
								v: true,
							})
						)
						store.dispatch(methods.config.getDeviceType())
						// setProgressBar(progressBar + 0.2 >= 1 ? 1 : progressBar + 0.2)
						// setProgressBar(.6)
					},
				})}
			></saki-init>
			<div
				onTransitionEnd={() => {
					console.log('onTransitionEnd')
					// setHideLoading(true)
				}}
				className={
					'il-loading active ' +
					// (!(appStatus.noteInitStatus && appStatus.sakiUIInitStatus)
					// 	? 'active '
					// 	: '') +
					(hideLoading ? 'hide' : '')
				}
			>
				{/* <div className='loading-animation'></div>
				<div className='loading-name'>
					{t('appTitle', {
						ns: 'common',
					})}
				</div> */}
				<div className='loading-logo'>
					<img src={config.origin + '/icons/256x256.png'} alt='' />
				</div>
				{/* <div>progressBar, {progressBar}</div> */}
				<div className='loading-progress-bar'>
					<saki-linear-progress-bar
						ref={bindEvent({
							loaded: () => {
								console.log('progress-bar', progressBar)
								setProgressBar(0)
								setTimeout(() => {
									progressBar < 1 &&
										setProgressBar(
											progressBar + 0.2 >= 1 ? 1 : progressBar + 0.2
										)
								}, 0)
								setLoadProgressBar(true)
							},
							transitionEnd: (e: CustomEvent) => {
								console.log('progress-bar', e)
								if (e.detail === 1) {
									const el: HTMLDivElement | null =
										document.querySelector('.il-loading')
									if (el) {
										const animation = el.animate(
											[
												{
													opacity: 1,
												},
												{
													opacity: 0,
												},
											],
											{
												duration: 500,
												iterations: 1,
											}
										)
										animation.onfinish = () => {
											el.style.display = 'none'
											setHideLoading(true)
										}
									}
								}
							},
						})}
						max-width='280px'
						transition='width 1s'
						width='100%'
						height='10px'
						progress={progressBar}
						border-radius='5px'
					></saki-linear-progress-bar>
				</div>
			</div>
			<Header
				onSettings={(type: string) => {
					console.log('onSettings', type)
					// setOpenSettingType(type)
					store.dispatch(configSlice.actions.setSettingType(type))
					setOpenSettingModal(true)
				}}
			/>
			{nsocketio.status !== 'success' && config.deviceType === 'Mobile' ? (
				<div className='il-connection-error'>
					<saki-animation-loading
						type='rotateEaseInOut'
						width='20px'
						height='20px'
						border='3px'
						border-color='var(--default-color)'
					/>
					<span
						style={{
							color: '#555',
						}}
					>
						{t('connecting', {
							ns: 'common',
						})}
					</span>
				</div>
			) : (
				''
			)}
			<div className='il-main'>{children}</div>
			<Settings
				visible={openSettingModal}
				// type={openSettingType}
				onClose={() => {
					setOpenSettingModal(false)
				}}
			/>
			<AddBackupComponent />
			<PathComponent />
			<TerminalCommandComponent />
		</div>
	)
}

export default IndexLayout
