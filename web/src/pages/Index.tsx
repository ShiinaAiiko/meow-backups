import React, { useEffect, useState } from 'react'
import { RouterProps } from 'react-router-dom'
import logo from '../logo.svg'
import { Helmet } from 'react-helmet-async'
import './Index.scss'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	configSlice,
	backupsSlice,
} from '../store'
import { useSelector, useDispatch } from 'react-redux'
import moment from 'moment'
import { prompt, alert, snackbar, bindEvent } from '@saki-ui/core'
import { useTranslation } from 'react-i18next'
import { deepCopy, Debounce, byteConvert } from '@nyanyajs/utils'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { eventListener, eventTarget } from '../store/config'
import { nsocketio } from '../config'
import socketApi from '../modules/socketio/api'
import { protoRoot } from '../protos'

const IndexPage = () => {
	const [debounce] = useState(new Debounce())
	const [getAppSummaryInfoDebounce] = useState(new Debounce())
	const { t, i18n } = useTranslation('indexPage')
	const config = useSelector((state: RootState) => state.config)
	const app = useSelector((state: RootState) => state.app)
	const backups = useSelector((state: RootState) => state.backups)
	const nsocketio = useSelector((state: RootState) => state.nsocketio)
	const deviceToken = useSelector((state: RootState) => state.deviceToken)
	const user = useSelector((state: RootState) => state.user)

	const dispatch = useDispatch<AppDispatch>()

	const [showId, setShowId] = useState('')
	const [timeNow, setTimeNow] = useState(0)

	useEffect(() => {
		debounce.increase(async () => {
			if (deviceToken.isLogin && nsocketio.status === 'success') {
				getAppSummaryInfo()
				getBackups()

				!timeNow &&
					setInterval(() => {
						console.log(3)
						// console.log(nextBackupTime - new Date().getTime())
						setTimeNow(new Date().getTime())
					}, 1000)
			}
		}, 50)
	}, [deviceToken.isLogin, nsocketio.status])

	useEffect(() => {
		backups.isNewUpdate &&
			getAppSummaryInfoDebounce.increase(() => {
				getAppSummaryInfo()
			}, 3000)
	}, [backups.isNewUpdate])

	const getBackups = async () => {
		const res = await socketApi.v1.GetBackups({})
		console.log('GetBackups', res)
		if (res.code === 200) {
			res.data?.list?.length &&
				dispatch(
					backupsSlice.actions.setList({
						list: res.data.list,
					})
				)
		}
	}
	const getAppSummaryInfo = async () => {
		await dispatch(methods.app.getAppSummaryInfo())
	}

	const GetStartTime = () => {
		const timestamp =
			Math.floor(timeNow / 1000) - Number(app.systemConfig?.startTime)

		const d = Math.floor(timestamp / 3600 / 24)
		const h = Math.floor(timestamp / 3600) % 24
		const m = Math.floor(timestamp / 60) % 60
		const s = Math.floor(timestamp % 60)
		return <span>{d + 'd ' + h + 'h ' + m + 'm ' + s + 's'}</span>
	}

	const GetNextBackupTime = ({
		nextBackupTime,
	}: {
		nextBackupTime: number
	}) => {
		const timestamp = Math.floor((nextBackupTime - timeNow) / 1000)

		const h = Math.floor(timestamp / 3600) % 24
		const m = Math.floor(timestamp / 60) % 60
		const s = Math.floor(timestamp % 60)
		return <span>{h + 'h ' + m + 'm ' + s + 's'}</span>
	}

	return (
		<>
			<Helmet>
				<title>
					{t('appTitle', {
						ns: 'common',
					})}
				</title>
			</Helmet>

			<saki-scroll-view mode='Auto'>
				<div className={'index-page ' + config.deviceType}>
					<div className='ip-left'>
						<saki-title level='3' font-weight='400' font-size='24px'>
							{t('backupTask', {
								ns: 'indexPage',
							})}{' '}
							({backups.list.length})
						</saki-title>
						{backups.list.length ? (
							<div className='ip-l-list'>
								{backups.list
									// .concat(list)
									.map((v, i) => {
										const sid = String(v.id)
										const lastBackupTime = !v.lastBackupTime
											? t('neverBackedUp')
											: moment(Number(v.lastBackupTime) * 1000).format(
													'YYYY-MM-DD HH:mm:ss'
											  )
										const nextBackupTime = !v.lastBackupTime
											? t('neverBackedUp')
											: moment(
													(Number(v.lastBackupTime) + Number(v.interval)) * 1000
											  ).format('YYYY-MM-DD HH:mm:ss')
										return (
											<div
												key={sid}
												className={
													'ip-l-l-item ' + (showId === sid ? 'show' : 'hide')
												}
											>
												<div
													onClick={() => {
														setShowId(showId === sid ? '' : sid)
													}}
													className='item-header'
												>
													<div className='item-h-name'>
														<saki-icon
															widht={'18px'}
															height={'18px'}
															color='#333'
															margin='0 8px 0 0'
															type={
																v.type === 'Folder' ? 'FolderFill' : 'FileFill'
															}
														/>
														<span className='text-two-elipsis'>{v.name}</span>
													</div>
													<div className={'item-h-right '}>
														<div className={'item-h-status'}>
															<span
																className={
																	'status-text ' +
																	i18n.language +
																	(!v.deleteOldDataWhenSizeExceeds &&
																	Number(v.backupFolderStatus?.size) >=
																		Number(v.maximumStorageSize) * 1024 * 1024
																		? ' pause'
																		: v.status === 1
																		? ' normal'
																		: v.status === 0
																		? ' backingup'
																		: ' pause')
																}
																style={{
																	...(i18n.language === 'en-US' &&
																	!v.deleteOldDataWhenSizeExceeds &&
																	Number(v.backupFolderStatus?.size) >=
																		Number(v.maximumStorageSize) * 1024 * 1024
																		? {
																				fontSize: '12px',
																		  }
																		: {}),
																	whiteSpace: 'nowrap',
																}}
															>
																{!v.deleteOldDataWhenSizeExceeds &&
																Number(v.backupFolderStatus?.size) >=
																	Number(v.maximumStorageSize) * 1024 * 1024
																	? t('maximumSizeOfBackupFolderExceeded')
																	: v.status === 1
																	? t('backupCompleted')
																	: v.status === 0
																	? t('backingup') +
																	  ` (${
																			Math.round(
																				(v.backupProgress || 0) * 10000
																			) / 100
																	  }%)`
																	: t('paused', {
																			ns: 'indexPage',
																	  })}
															</span>
															{v.status === 1 ? (
																<div
																	title={
																		t('nextBackupTime') + ' ' + nextBackupTime
																	}
																	className='countdown-text'
																>
																	<saki-icon
																		margin='0 2px 0 0'
																		width='12px'
																		height='12px'
																		type='Countdown'
																	></saki-icon>
																	<span>
																		{GetNextBackupTime({
																			nextBackupTime:
																				(Number(v.lastBackupTime) +
																					Number(v.interval)) *
																				1000,
																		})}
																	</span>
																	{/* <span>15:39:30</span> */}
																</div>
															) : (
																''
															)}
														</div>
														<saki-icon
															widht={'14px'}
															height={'14px'}
															color='#999'
															type='Bottom'
														/>
													</div>
												</div>
												<div className='item-main'>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>{t('taskID')}</div>
														<div title={v.id || ''} className='item-m-s-value'>
															{v.id}
														</div>
													</div>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>
															{t('localPath')}
														</div>
														<div
															title={v.path || ''}
															className={
																'item-m-s-value  ' +
																(!v.isPathExists ? 'notExist' : '')
															}
														>
															{!v.isPathExists ? (
																<saki-icon
																	title={t('pathDoesNotExist')}
																	type='Detail'
																></saki-icon>
															) : (
																''
															)}
															<span className='text-two-elipsis'>{v.path}</span>
														</div>
													</div>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>
															{t('backupPath')}
														</div>
														<div
															title={v.backupPath || ''}
															className='item-m-s-value text-two-elipsis'
														>
															{v.backupPath}
														</div>
													</div>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>
															{t('localState')}
														</div>
														<div className='item-m-s-value'>
															<saki-icon type='File'></saki-icon>
															<span>
																{Number(v.localFolderStatus?.files) || 0}
															</span>
															<saki-icon type='Folder'></saki-icon>
															<span>
																{Number(v.localFolderStatus?.folders) || 0}
															</span>
															<saki-icon type='CloudStorage'></saki-icon>
															<span>
																{byteConvert(
																	Number(v.localFolderStatus?.size) || 0
																)}
															</span>
														</div>
													</div>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>
															{t('backupState')}
														</div>
														<div className='item-m-s-value'>
															<saki-icon type='File'></saki-icon>
															<span>
																{Number(v.backupFolderStatus?.files) || 0}
															</span>
															<saki-icon type='Folder'></saki-icon>
															<span>
																{Number(v.backupFolderStatus?.folders) || 0}
															</span>
															<saki-icon type='CloudStorage'></saki-icon>
															<span>
																{byteConvert(
																	Number(v.backupFolderStatus?.size) || 0
																)}
															</span>
														</div>
													</div>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>
															{t('backupSizeLimit')}
														</div>
														<div className='item-m-s-value'>
															{byteConvert(
																(Number(v.maximumStorageSize) || 0) *
																	1024 *
																	1024
															)}{' '}
															·{' '}
															{v.deleteOldDataWhenSizeExceeds
																? t('deleteOldDataIsEnabled')
																: t('deleteOldDataIsDisabled')}
														</div>
													</div>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>
															{t('ignorePatterns')}
														</div>
														<div className='item-m-s-value'>
															{v.ignore ? t('enabled') : t('disabled')}
														</div>
													</div>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>
															{t('compressPatterns')}
														</div>
														<div className='item-m-s-value'>
															{v.compress ? t('enabled') : t('disabled')}
														</div>
													</div>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>
															{t('lastBackupTime')}
														</div>
														<div
															title={lastBackupTime}
															className='item-m-s-value'
														>
															{lastBackupTime}
														</div>
													</div>
													<div className='item-m-subitem'>
														<div className='item-m-s-name'>
															{t('nextBackupTime')}
														</div>
														<div
															title={t('nextBackupTime') + ' ' + nextBackupTime}
															className='item-m-s-value'
														>
															{nextBackupTime}
														</div>
													</div>
													<div className='item-m-buttons'>
														<saki-button
															ref={bindEvent({
																tap: async () => {
																	// if (v.status === 0) {
																	// 	snackbar({
																	// 		message: '正在备份中...不可更改状态',
																	// 		horizontal: 'center',
																	// 		vertical: 'top',
																	// 		autoHideDuration: 2000,
																	// 		backgroundColor:
																	// 			'var(--saki-default-color)',
																	// 		color: '#fff',
																	// 	}).open()
																	// 	return
																	// }
																	const res =
																		await socketApi.v1.UpdateBackupStatus({
																			id: v.id,
																			status: v.status !== -1 ? -1 : 1,
																		})
																	if (res.code === 200) {
																		dispatch(
																			backupsSlice.actions.setList({
																				list: backups.list.map((sv) => {
																					if (sv.id === v.id) {
																						return {
																							...sv,
																							status: v.status !== -1 ? -1 : 1,
																						}
																					}
																					return sv
																				}),
																			})
																		)
																	}
																},
															})}
															height='32px'
															padding='0 20px'
															margin='0 0 0 10px'
															border-radius='16px'
															type='Normal'
															border='1px solid #ccc'
														>
															<span className='text-elipsis'>
																{v.status !== -1
																	? t('pause', {
																			ns: 'indexPage',
																	  })
																	: t('resume', {
																			ns: 'indexPage',
																	  })}
															</span>
														</saki-button>
														<saki-button
															ref={bindEvent({
																tap: async () => {
																	const res = await socketApi.v1.BackupNow({
																		id: v.id,
																	})
																	if (res.code === 200) {
																		snackbar({
																			message: '正在备份中...',
																			horizontal: 'center',
																			vertical: 'top',
																			autoHideDuration: 2000,
																			backgroundColor:
																				'var(--saki-default-color)',
																			color: '#fff',
																		}).open()

																		dispatch(
																			backupsSlice.actions.setList({
																				list: backups.list.map((sv) => {
																					if (sv.id === v.id) {
																						return {
																							...sv,
																							status: 0,
																							backupProgress: 0,
																						}
																					}
																					return sv
																				}),
																			})
																		)
																	}
																},
															})}
															height='32px'
															padding='0 20px'
															margin='0 0 0 10px'
															border-radius='16px'
															type='Normal'
															border='1px solid #ccc'
															disabled={
																v.status === 0 ||
																(!v.deleteOldDataWhenSizeExceeds &&
																	Number(v.backupFolderStatus?.size) >=
																		Number(v.maximumStorageSize) * 1024 * 1024)
															}
														>
															<span className='text-elipsis'>
																{t('backupNow', {
																	ns: 'indexPage',
																})}
															</span>
														</saki-button>
														<saki-button
															ref={bindEvent({
																tap: () => {
																	dispatch(
																		configSlice.actions.setModalUpdateBackup({
																			bool: true,
																			backup: v,
																		})
																	)
																},
															})}
															height='32px'
															padding='0 20px'
															margin='0 0 0 10px'
															border-radius='16px'
															type='Normal'
															color='var(--saki-default-color)'
															border='1px solid var(--saki-default-color)'
														>
															<span className='text-elipsis'>
																{t('edit', {
																	ns: 'indexPage',
																})}
															</span>
														</saki-button>
													</div>
												</div>
											</div>
										)
									})}
							</div>
						) : (
							<div className='ip-l-none'>等待添加任务中。。。</div>
						)}
					</div>
					<div className='ip-right'>
						<div className='ip-r-buttons'>
							<saki-button
								ref={bindEvent({
									tap: () => {
										dispatch(configSlice.actions.setModalAddBackup(true))
									},
								})}
								height='44px'
								padding='0 50px'
								border-radius='23px'
								type='Primary'
								disabled-dark
								font-size='18px'
								color={config.appearanceMode === 'dark' ? '#000' : '#fff'}
							>
								<span className='text-elipsis'>
									{t('createBackup', {
										ns: 'indexPage',
									})}
								</span>
							</saki-button>
						</div>

						<saki-title
							margin='20px 0 0'
							level='3'
							font-weight='400'
							font-size='24px'
						>
							{t('currentDevice')}
						</saki-title>

						<div className='ip-r-current-device'>
							<div className='ip-r-cd-item'>
								<div className='ip-r-cd-i-name'>{t('localStateTotal')}</div>
								<div className='ip-r-cd-i-value'>
									<saki-icon type='File'></saki-icon>
									<span>
										{Number(app.appSummaryInfo?.localFolderStatus?.files) || 0}
									</span>
									<saki-icon type='Folder'></saki-icon>
									<span>
										{Number(app.appSummaryInfo?.localFolderStatus?.folders) ||
											0}
									</span>
									<saki-icon type='CloudStorage'></saki-icon>
									<span>
										{byteConvert(
											Number(app.appSummaryInfo?.localFolderStatus?.size) || 0
										)}
									</span>
								</div>
							</div>
							<div className='ip-r-cd-item'>
								<div className='ip-r-cd-i-name'>{t('backupStateTotal')}</div>
								<div className='ip-r-cd-i-value'>
									<saki-icon type='File'></saki-icon>
									<span>
										{Number(app.appSummaryInfo?.backupFolderStatus?.files) || 0}
									</span>
									<saki-icon type='Folder'></saki-icon>
									<span>
										{Number(app.appSummaryInfo?.backupFolderStatus?.folders) ||
											0}
									</span>
									<saki-icon type='CloudStorage'></saki-icon>
									<span>
										{byteConvert(
											Number(app.appSummaryInfo?.backupFolderStatus?.size) || 0
										)}
									</span>
								</div>
							</div>
							<div className='ip-r-cd-item'>
								<div className='ip-r-cd-i-name'>{t('lastBackupTime')}</div>
								<div className='ip-r-cd-i-value'>
									{!app.appSummaryInfo?.lastBackupTime
										? t('neverBackedUp')
										: moment(
												Number(app.appSummaryInfo?.lastBackupTime) * 1000
										  ).format('YYYY-MM-DD HH:mm:ss')}
								</div>
							</div>
							<div className='ip-r-cd-item'>
								<div className='ip-r-cd-i-name'>{t('loggedInDevice')}</div>
								{/* `当前在线${app.appSummaryInfo?.currentOnlineDevices}个设备/曾有${app.appSummaryInfo?.historicalOnlineDevices}个设备登录` */}
								<div
									title={t('onlineDeviceTip')
										.replace(
											'{num1}',
											String(app.appSummaryInfo?.currentOnlineDevices)
										)
										.replace(
											'{num2}',
											String(app.appSummaryInfo?.historicalOnlineDevices)
										)}
									className='ip-r-cd-i-value'
								>
									{app.appSummaryInfo?.currentOnlineDevices +
										'/' +
										app.appSummaryInfo?.historicalOnlineDevices}
								</div>
							</div>
							<div className='ip-r-cd-item'>
								<div className='ip-r-cd-i-name'>{t('startedTime')}</div>
								<div className='ip-r-cd-i-value'>{GetStartTime()}</div>
							</div>
							<div className='ip-r-cd-item'>
								<div className='ip-r-cd-i-name'>
									{t('version', {
										ns: 'common',
									})}
								</div>
								<div className='ip-r-cd-i-value'>
									{app.systemConfig?.version}

									{config.newVersion ? (
										<saki-button
											ref={bindEvent({
												tap: () => {
													dispatch(methods.app.update())
												},
											})}
											margin='0 0 0 6px'
											padding='0'
											bg-color='#f6f6f6'
											border='none'
										>
											<saki-title level='4' color='default'>
												<span>
													New
													{/* {t('newVersionAvailable', {
													ns: 'common',
												})} */}
												</span>
											</saki-title>
										</saki-button>
									) : (
										''
									)}
								</div>
							</div>
							<div className='ip-r-cd-item'>
								<div className='ip-r-cd-i-name'>Github</div>
								<div className='ip-r-cd-i-value'>
									<a
										style={{
											display: 'inherit',
										}}
										href={app.systemConfig?.githubUrl || ''}
										target='_blank'
									>
										<saki-icon
											width='22px'
											height='22px'
											color='#231F20'
											type='Github'
										></saki-icon>
										{/* {'github.com/ShiinaAiiko/meow-backups'} */}
									</a>
								</div>
							</div>
						</div>
					</div>
				</div>
			</saki-scroll-view>
		</>
	)
}

export default IndexPage
