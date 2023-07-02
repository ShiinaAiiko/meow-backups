import React, { useEffect, useRef, useState } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	configSlice,
	userSlice,
	backupsSlice,
} from '../store'
import './AddBackup.scss'
import { bindEvent } from '../modules/bindEvent'

import { v4 as uuidv4 } from 'uuid'
import moment from 'moment'

import { alert, snackbar } from '@saki-ui/core'
// console.log(sakiui.bindEvent)
import { storage } from '../store/storage'
import { useTranslation } from 'react-i18next'
import { randomUUID } from 'crypto'
import socketApi from '../modules/socketio/api'
import { log } from 'console'
import { eventListener } from '../store/config'
import { title } from 'process'

const AddBackupComponent = () => {
	const { t, i18n } = useTranslation('indexPage')
	const config = useSelector((state: RootState) => state.config)
	const backups = useSelector((state: RootState) => state.backups)

	const dispatch = useDispatch<AppDispatch>()
	// const [menuType, setMenuType] = useState('Appearance')
	// const [menuType, setMenuType] = useState(type || 'Account')

	const [activeTabLabel, setActiveTabLabel] = useState('general')

	const [id, setId] = useState(uuidv4())
	const [name, setName] = useState('')
	const [nameErr, setNameErr] = useState('')
	const [path, setPath] = useState('')
	const [pathErr, setPathErr] = useState('')
	// const pathInputRef = useRef<HTMLInputElement>()
	const [backupPath, setBackupPath] = useState('')
	const [backupPathErr, setBackupPathErr] = useState('')
	const [ignore, setIgnore] = useState(false)
	const [deleteOldDataWhenSizeExceeds, setDeleteOldDataWhenSizeExceeds] =
		useState(false)

	const [ignoreText, setIgnoreText] = useState('')
	const [interval, setInterval] = useState(86400)
	const [maximumStorageSize, setMaximumStorageSize] = useState(10240)
	const [compress, setCompress] = useState(false)
	const [compressVolume, setCompressVolume] = useState(false)
	const [compressVolumeSize, setCompressVolumeSize] = useState(0)
	const [compressSuffixDropdown, setCompressSuffixDropdown] = useState(false)
	const [compressSuffix, setCompressSuffix] = useState('.zip')
	const [status, setStatus] = useState(1)
	const [compressSuffixList] = useState([
		{
			value: '.zip',
		},
	])

	useEffect(() => {
		if (config.modal.addBackup) {
			const b = config.modal.backup
			setActiveTabLabel('general')
			if (b) {
				setId(b.id || '')
				setName(b.name || '')
				setPath(b.path || '')
				setBackupPath(b.backupPath || '')
				setIgnore(b.ignore || false)
				setIgnoreText(b.ignoreText || '')
				setDeleteOldDataWhenSizeExceeds(b.deleteOldDataWhenSizeExceeds || false)
				setInterval(Number(b.interval))
				setMaximumStorageSize(Number(b.maximumStorageSize) || 10240)
				setCompress(b.compress || false)
				setCompressVolume(Number(b.compressVolumeSize) >= 0 || false)
				setCompressVolumeSize(Number(b.compressVolumeSize) || 0)
				setCompressSuffix(b.compressSuffix || '.zip')
				setStatus(Number(b.status) || 1)
			} else {
				setId(uuidv4())
				setName('')
				setPath('')
				setBackupPath('')
				setIgnore(false)
				setIgnoreText('')
				setDeleteOldDataWhenSizeExceeds(false)
				setInterval(86400)
				setMaximumStorageSize(10240)
				setCompress(false)
				setCompressVolume(false)
				setCompressVolumeSize(0)
				setCompressSuffix('.zip')
				setStatus(1)
			}
			setCompressSuffixDropdown(false)

			setNameErr('')
			setPathErr('')
			setBackupPathErr('')
		}
	}, [config.modal.addBackup])

	const createBackup = async () => {
		setNameErr(!name ? t('backupTaskNameRequired') : '')
		setPathErr(!path ? t('localPathRequired') : '')
		setBackupPathErr(!backupPath ? t('backupPathRequired') : '')

		if (!name || !path || !backupPath) {
			return
		}

		if (config.modal.backup) {
		}

		let obj = {
			id,
			name,
			path,
			backupPath,
			ignore,
			ignoreText,
			compress,
			compressSuffix,
			compressVolumeSize,
			interval,
			maximumStorageSize,
			deleteOldDataWhenSizeExceeds,
		}
		const res = config.modal.backup
			? await socketApi.v1.UpdateBackup(obj)
			: await socketApi.v1.AddBackup(obj)
		console.log('createBackup', res, obj)
		if (res.code === 200) {
			if (config.modal.backup?.id) {
				dispatch(
					backupsSlice.actions.setList({
						list: backups.list.map((sv) => {
							if (sv.id === config.modal.backup?.id) {
								return {
									...config.modal.backup,
									...res.data.backup,
									isPathExists: res.data.backup?.isPathExists || false,
									compress: res.data.backup?.compress || false,
									ignore: res.data.backup?.ignore || false,
									compressVolumeSize: res.data.backup?.compressVolumeSize || 0,
									interval: res.data.backup?.interval || 0,
									maximumStorageSize: res.data.backup?.maximumStorageSize || 0,
									status: res.data.backup?.status || -1,
									lastBackupTime: res.data.backup?.lastBackupTime || 0,
									deleteOldDataWhenSizeExceeds:
										res.data.backup?.deleteOldDataWhenSizeExceeds || false,
								}
							}
							return sv
						}),
					})
				)
			} else {
				res.data.backup &&
					dispatch(
						backupsSlice.actions.setList({
							list: backups.list.concat([res.data.backup]),
						})
					)
      }
			snackbar({
				message: config.modal.backup
					? t('updatedSuccessfully', {
							ns: 'common',
					  })
					: t('createdSuccessfully', {
							ns: 'common',
					  }),
				horizontal: 'center',
				vertical: 'top',
				autoHideDuration: 2000,
				backgroundColor: 'var(--saki-default-color)',
				color: '#fff',
			}).open()
			dispatch(configSlice.actions.setModalAddBackup(false))
		} else {
			if (res.code === 10022) {
				setPathErr(t('pathDoesNotExist'))
			}
			snackbar({
				message: res.error || res.msg,
				horizontal: 'center',
				vertical: 'top',
				autoHideDuration: 2000,
				closeIcon: true,
			}).open()
		}
	}

	return (
		<saki-modal
			ref={bindEvent({
				close() {},
			})}
			width='100%'
			// height='100%'
			max-width={config.deviceType === 'Mobile' ? '100%' : '620px'}
			// max-height={config.deviceType === 'Mobile' ? '100%' : '600px'}
			mask
			border-radius={config.deviceType === 'Mobile' ? '0px' : ''}
			border={config.deviceType === 'Mobile' ? 'none' : ''}
			mask-closable='false'
			background-color='#fff'
			visible={config.modal.addBackup}
		>
			<div className={'add-backup-component ' + config.deviceType}>
				<div className='add-backup-header'>
					<saki-modal-header
						ref={bindEvent({
							close() {
								dispatch(configSlice.actions.setModalAddBackup(false))
							},
						})}
						title={
							config.modal.backup
								? `${t('editBackup')} (${config.modal.backup.name})`
								: t('addBackup')
						}
					></saki-modal-header>
				</div>
				<div className='add-backup-main'>
					<saki-tabs
						type='Flex'
						// header-background-color='rgb(245, 245, 245)'
						header-max-width='740px'
						// header-border-bottom='none'
						header-padding='0 10px'
						active-tab-label={activeTabLabel}
						ref={bindEvent({
							tap: (e) => {
								console.log('tap', e)
								// setOpenDropDownMenu(false)
								setActiveTabLabel(e.detail.label)
							},
						})}
					>
						<saki-tabs-item
							font-size='14px'
							label='general'
							name={t('general')}
						>
							<saki-scroll-view mode='Auto'>
								<div className='abm-general'>
									<saki-title margin='10px 0 12px 0' level='5' color='default'>
										<span>{t('taskID')}</span>
									</saki-title>
									<span>{id}</span>
									<saki-input
										ref={bindEvent({
											changevalue: (e) => {
												setName(e.detail)
											},
										})}
										value={name}
										error={nameErr}
										placeholder={`* ${t('taskName')}`}
										height='56px'
										margin='10px 0 0'
										placeholder-animation='MoveUp'
									></saki-input>
									<div className='abm-g-path'>
										<saki-input
											ref={bindEvent({
												changevalue: (e) => {
													setPath(e.detail)
												},
											})}
											value={path}
											error={pathErr}
											placeholder={`* ${t('localPath')} (${t(
												'fileOrFolderPathToBeBackedUp'
											)})`}
											height='56px'
											margin='10px 0 0'
											placeholder-animation='MoveUp'
										></saki-input>
										{/* <saki-button
											ref={bindEvent({
												tap: () => {
													;(pathInputRef.current as any).setAttribute(
														'webkitdirectory',
														true
													)
													pathInputRef.current?.click()
												},
											})}
											margin='0 0 0 10px'
											padding='8px 20px'
											type='Normal'
										>
											<span className='text-elipsis'>选择</span>
										</saki-button>
										<input
											ref={pathInputRef as any}
											className='path-input'
											type='file'
											// webkitdirectory
											onChange={(e) => {
												console.log(e)
											}}
										/> */}
									</div>
									<div className='abm-g-path'>
										<saki-input
											ref={bindEvent({
												changevalue: (e) => {
													setBackupPath(e.detail)
												},
											})}
											value={backupPath}
											error={backupPathErr}
											placeholder={'* ' + t('backupPath')}
											height='56px'
											margin='10px 0 0'
											placeholder-animation='MoveUp'
										></saki-input>
										{/* <saki-button
											ref={bindEvent({
												tap: () => {
													dispatch(configSlice.actions.setModalAddBackup(true))
												},
											})}
											margin='0 0 0 10px'
											padding='8px 20px'
											type='Normal'
										>
											<span className='text-elipsis'>选择</span>
										</saki-button> */}
									</div>
								</div>
							</saki-scroll-view>
						</saki-tabs-item>
						<saki-tabs-item
							font-size='14px'
							label='interval'
							name={t('backupControl')}
						>
							<div className='abm-interval'>
								<saki-input
									ref={bindEvent({
										changevalue: (e) => {
											setInterval(Number(e.detail))
										},
									})}
									value={interval}
									placeholder={t('backupInterval')}
									height='56px'
									margin='10px 0 0'
									placeholder-animation='MoveUp'
									type='Number'
								></saki-input>
								<saki-input
									ref={bindEvent({
										changevalue: (e) => {
											setMaximumStorageSize(Number(e.detail))
										},
									})}
									value={maximumStorageSize}
									placeholder={t('backupFolderMaximumStorageSize')}
									height='56px'
									margin='10px 0 0'
									placeholder-animation='MoveUp'
									type='Number'
								></saki-input>
								<saki-title margin='6px 0 10px 0' level='4' color='#666'>
									<span>{t('deleteOldDataTip')}</span>
								</saki-title>
								<saki-row margin='20px 0 0 0' justify-content='flex-start'>
									<saki-switch
										ref={bindEvent({
											change: (e) => {
												setDeleteOldDataWhenSizeExceeds(
													!deleteOldDataWhenSizeExceeds
												)
											},
										})}
										value={deleteOldDataWhenSizeExceeds}
									></saki-switch>
									<span
										style={{
											margin: '0 0 0 10px',
										}}
									>
										{deleteOldDataWhenSizeExceeds
											? t('deleteOldDataIsEnabled')
											: t('enbleDeleteOldData')}
									</span>
								</saki-row>
							</div>
						</saki-tabs-item>
						<saki-tabs-item
							font-size='14px'
							label='ignore'
							name={t('ignorePatterns')}
						>
							<div className='abm-ignore'>
								<saki-row margin='10px 0 0 0' justify-content='flex-start'>
									<saki-switch
										ref={bindEvent({
											change: (e) => {
												if (config.modal.backup?.type === 'File') {
													setIgnore(false)
													return
												}
												setIgnore(!ignore)
											},
										})}
										value={ignore}
									></saki-switch>
									<span
										style={{
											margin: '0 0 0 10px',
										}}
									>
										{ignore
											? t('ignorePatternsIsEnabled')
											: t('enableIgnorePatterns')}
									</span>
								</saki-row>

								{ignore ? (
									<>
										<div className='abm-i-text'>
											<saki-richtext
												ref={bindEvent(
													{
														clearvalue: (e) => {
															console.log('clearvalue', e)
														},
														handlers: (e) => {},
														changevalue: async (e) => {
															console.log('eeee', e)
															setIgnoreText(e.detail.content)
														},
														pressenter: (e) => {
															console.log('pressenter', e)
														},
													},
													(e: any) => {
														// setRichtextEl(e)
														e?.setToolbar?.({
															container: [],
														})
													}
												)}
												theme='snow'
												toolbar='false'
												editor-padding='10px 20px'
												font-size='14px'
												border-radius='0'
												min-length='0'
												border='1px solid #ccc'
												max-length='10000'
												value={ignoreText.replace(/\n/g, '<br/>')}
												placeholder={t('enterIgnoreRuleOnePerLine')}
											/>
										</div>
										<div className='abm-i-info'>
											<div>
												<div>
													<span>!</span>
												</div>
												<span>{t('invertThisCondition')}</span>
											</div>
											<div>
												<div>
													<span>*</span>
												</div>
												<span>{t('singleLevelWildcard')}</span>
											</div>
											<div>
												<div>
													<span>**</span>
												</div>
												<span>{t('multiLevelWildcard')}</span>
											</div>
										</div>
										{path ? (
											<p
												style={{
													wordBreak: 'break-all',
												}}
											>
												{t('editing')}：
												{path + (path.substring(0, 1) === '/' ? '/' : '\\')}
												.mbignore
											</p>
										) : (
											''
										)}
									</>
								) : (
									''
								)}
							</div>
						</saki-tabs-item>
						<saki-tabs-item
							font-size='14px'
							label='advanced'
							name={t('advanced')}
						>
							<div className='abm-advanced'>
								<saki-row margin='10px 0 0 0' justify-content='flex-start'>
									<saki-switch
										ref={bindEvent({
											change: (e) => {
												setCompress(!compress)
											},
										})}
										value={compress}
									></saki-switch>
									<span
										style={{
											margin: '0 0 0 10px',
										}}
									>
										{compress
											? t('compressPatternsIsEnabled')
											: t('enableCompressPatterns')}
									</span>
								</saki-row>

								{compress ? (
									<>
										<saki-title
											margin='10px 0 10px 0'
											level='4'
											color='default'
										>
											<span>{t('compressionSuffix')}</span>
										</saki-title>
										<saki-row
											margin='10px 0 0 0'
											align-items='center'
											justify-content='flex-start'
										>
											<saki-dropdown
												visible={compressSuffixDropdown}
												floating-direction='Left'
												z-index='1000'
												ref={bindEvent({
													close: () => {
														setCompressSuffixDropdown(false)
													},
												})}
											>
												<saki-button
													border='1px solid #ccc'
													bg-hover-color='transparent'
													bg-active-color='transparent'
													padding='4px 10px'
													ref={bindEvent({
														tap: () => {
															console.log('自动备份频率')
															setCompressSuffixDropdown(true)
														},
													})}
												>
													<span
														style={{
															margin: '0 14px 0 0',
														}}
														className='name'
													>
														{compressSuffix}
													</span>
													<svg
														className='icon'
														viewBox='0 0 1024 1024'
														version='1.1'
														xmlns='http://www.w3.org/2000/svg'
														p-id='51874'
														width='16'
														height='16'
														fill='#999'
													>
														<path
															d='M228.266667 347.733333h569.6c14.933333 0 25.6 4.266667 27.733333 12.8 4.266667 8.533333 0 17.066667-10.666667 27.733334l-281.6 281.6c-4.266667 4.266667-12.8 8.533333-19.2 8.533333-8.533333 0-14.933333-2.133333-19.2-8.533333l-281.6-281.6c-10.666667-10.666667-14.933333-21.333333-10.666666-27.733334 0-8.533333 8.533333-12.8 25.6-12.8z'
															p-id='51875'
														></path>
													</svg>
												</saki-button>
												<div slot='main'>
													<saki-menu
														ref={bindEvent({
															selectvalue: async (e) => {
																console.log(e.detail.value)
																setCompressSuffix(e.detail.value)
																setCompressSuffixDropdown(false)
															},
														})}
													>
														{compressSuffixList.map((v, i) => {
															return (
																<saki-menu-item
																	key={v.value}
																	width={'100px'}
																	padding='10px 18px'
																	value={v.value}
																>
																	<div className='note-item'>
																		<span className='text-elipsis'>
																			{v.value}
																		</span>
																	</div>
																</saki-menu-item>
															)
														})}
													</saki-menu>
												</div>
											</saki-dropdown>
										</saki-row>

										{/* <saki-row margin='16px 0 0 0' justify-content='flex-start'>
											<saki-switch
												ref={bindEvent({
													change: (e) => {
														setCompressVolume(!compressVolume)
														if (!compressVolume && compressVolumeSize === 0) {
														} else {
															setCompressVolumeSize(0)
														}
													},
												})}
												value={compressVolume}
											></saki-switch>
											<span
												style={{
													margin: '0 0 0 10px',
												}}
											>
												{compressVolume ? '已开启压缩分卷' : '开启压缩分卷'}
											</span>
										</saki-row>

										{compressVolume ? (
											<>
												<saki-input
													ref={bindEvent({
														changevalue: (e) => {
															console.log(e)
															setCompressVolumeSize(Number(e.detail))
														},
													})}
													value={compressVolumeSize}
													placeholder='压缩分卷大小 (MB)'
													height='56px'
													margin='10px 0 0'
													placeholder-animation='MoveUp'
													type='Number'
												></saki-input>
											</>
										) : (
											''
										)} */}
									</>
								) : (
									''
								)}

								{config.modal.backup ? (
									<saki-row margin='20px 0 0 0' justify-content='center'>
										<saki-button
											ref={bindEvent({
												tap: async () => {
													alert({
														content: t('deleteBackupTaskTip'),
														title: t('removeTask'),
														confirmText: t('delete', {
															ns: 'common',
														}),
														cancelText: t('cancel', {
															ns: 'common',
														}),
														onConfirm: async () => {
															const res = await socketApi.v1.DeleteBackup({
																id,
															})
															if (res.code === 200) {
																dispatch(
																	backupsSlice.actions.setList({
																		list: backups.list.filter((sv) => {
																			return sv.id !== config.modal.backup?.id
																		}),
																	})
																)
																dispatch(
																	configSlice.actions.setModalAddBackup(false)
																)
																snackbar({
																	message: t('removedSuccessfully'),
																	horizontal: 'center',
																	vertical: 'top',
																	autoHideDuration: 2000,
																	backgroundColor: 'var(--saki-default-color)',
																	color: '#fff',
																}).open()
															}
														},
													}).open()
												},
											})}
											padding='8px 20px'
											type='Primary'
											disabled-dark
											color={config.appearanceMode === 'dark' ? '#000' : '#fff'}
										>
											<span className='text-elipsis'>{t('removeTask')}</span>
										</saki-button>
									</saki-row>
								) : (
									''
								)}
							</div>
						</saki-tabs-item>
					</saki-tabs>
					<div className='abm-buttons'>
						<div className='abm-b-left'>
							{config.modal.backup ? (
								<saki-row>
									<saki-button
										ref={bindEvent({
											tap: async () => {
												const res = await socketApi.v1.UpdateBackupStatus({
													id,
													status: status !== -1 ? -1 : 1,
												})
												if (res.code === 200) {
													setStatus(status !== -1 ? -1 : 1)
													// 更新列表状态
													const backup = {
														...config.modal.backup,
														status: status !== -1 ? -1 : 1,
													}
													dispatch(
														configSlice.actions.setModalUpdateBackup({
															bool: true,
															backup,
														})
													)
													dispatch(
														backupsSlice.actions.setList({
															list: backups.list.map((sv) => {
																if (sv.id === backup.id) {
																	return backup
																}
																return sv
															}),
														})
													)
												}
											},
										})}
										padding='8px 20px'
										type='Normal'
										color='var(--saki-default-color)'
										border='1px solid var(--saki-default-color)'
									>
										<span className='text-elipsis'>
											{status === 1 ? t('pause') : t('resume')}
										</span>
									</saki-button>
									{/* <saki-switch
									ref={bindEvent({
										change: (e) => {
											setStatus(e.detail ? 1 : 0)
										},
									})}
									value={status === 1}
								></saki-switch>
								<span
									style={{
										margin: '0 0 0 10px',
									}}
								>
									{status === 1 ? '正常' : '已暂停'}
								</span> */}
								</saki-row>
							) : (
								''
							)}
						</div>
						<div className='abm-b-right'>
							<saki-button
								ref={bindEvent({
									tap: () => {
										dispatch(configSlice.actions.setModalAddBackup(false))
									},
								})}
								padding='8px 20px'
								type='Normal'
							>
								<span className='text-elipsis'>
									{t('cancel', {
										ns: 'common',
									})}
								</span>
							</saki-button>
							<saki-button
								ref={bindEvent({
									tap: () => {
										createBackup()
									},
								})}
								margin='0 0 0 10px'
								padding='8px 20px'
								type='Primary'
								disabled-dark
								color={config.appearanceMode === 'dark' ? '#000' : '#fff'}
							>
								<span className='text-elipsis'>
									{config.modal.backup
										? t('update', {
												ns: 'common',
										  })
										: t('create', {
												ns: 'common',
										  })}
								</span>
							</saki-button>
						</div>
					</div>
				</div>
			</div>
		</saki-modal>
	)
}

export default AddBackupComponent
