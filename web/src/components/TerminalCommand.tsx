import React, { useEffect, useState } from 'react'

import { useSelector, useDispatch } from 'react-redux'
import store, {
	RootState,
	AppDispatch,
	useAppDispatch,
	methods,
	configSlice,
	userSlice,
	appSlice,
} from '../store'
import './TerminalCommand.scss'
import { bindEvent } from '../modules/bindEvent'

import moment from 'moment'

import { alert, snackbar } from '@saki-ui/core'
// console.log(sakiui.bindEvent)
import { storage } from '../store/storage'
import { useTranslation } from 'react-i18next'
import { api } from '../modules/http/api'

const TerminalCommandComponent = () => {
	const { t, i18n } = useTranslation('terminalCommand')
	const app = useSelector((state: RootState) => state.app)
	const config = useSelector((state: RootState) => state.config)

	const dispatch = useDispatch<AppDispatch>()
	// const [menuType, setMenuType] = useState('Appearance')
	// const [menuType, setMenuType] = useState(type || 'Account')
	const [closeIcon, setCloseIcon] = useState(true)
	const [showItemPage, setShowItemPage] = useState(false)
	const [terminalCommand, setTerminalCommand] = useState<
		{
			name: string
			desc: string
		}[]
	>([])
	useEffect(() => {
		if (config.pageConfig.settingPage.settingType) {
			if (config.deviceType === 'Mobile') {
				setCloseIcon(false)
				setShowItemPage(true)
			}
		} else {
		}
		// setMenuType(type || 'Account')
	}, [config.pageConfig.settingPage.settingType])

	useEffect(() => {
		setTerminalCommand([
			{
				name: '-port',
				desc: t('setPort') + ' (3031)',
			},
			{
				name: '-config',
				desc: t('setConfigFilePath') + ' (./config.json)',
			},
			{
				name: '-debug',
				desc: t('setDebug') + ' (false)',
			},
			{
				name: '-no-browser',
				desc: t('disableAutomaticOpenBrowser') + ' (false)',
			},
			{
				name: '-no-console',
				desc: t('disableTerminalOutput') + ' (false)',
			},
			{
				name: '-open-autostart',
				desc: t('setUpautostart') + ' (false)',
			},
			{
				name: '-close-autostart',
				desc: t('turnOffAutostart') + ' (false)',
			},
			{
				name: '-is-autostart',
				desc: t('isAutostart') + ' (false)',
			},
			{
				name: '-install-service',
				desc:
					t('installService').replace(
						'{appName}',
						t('appTitle', {
							ns: 'common',
						})
					) + ' (false)',
			},
			{
				name: '-uninstall-service',
				desc:
					t('uninstallService').replace(
						'{appName}',
						t('appTitle', {
							ns: 'common',
						})
					) + ' (false)',
			},
			{
				name: '-start-autostart',
				desc: t('startSystemService') + ' (false)',
			},
			{
				name: '-stop',
				desc:
					t('quitApp').replace(
						'{appName}',
						t('appTitle', {
							ns: 'common',
						})
					) + ' (false)',
			},
			{
				name: '-static-path',
				desc: t('setStaticPath') + ' (./static)',
			},
			{
				name: '-default-user',
				desc:
					t('defaultUser').replace(
						'{appName}',
						t('appTitle', {
							ns: 'common',
						})
					) + ' (false)',
			},
		])
	}, [i18n.language])

	return (
		<saki-modal
			ref={bindEvent({
				close() {},
			})}
			width='100%'
			max-width={config.deviceType === 'Mobile' ? 'auto' : '620px'}
			max-height={config.deviceType === 'Mobile' ? 'auto' : '600px'}
			mask
			border-radius={config.deviceType === 'Mobile' ? '0px' : ''}
			border={config.deviceType === 'Mobile' ? 'none' : ''}
			mask-closable='false'
			background-color='#fff'
			visible={config.modal.terminalCommand}
		>
			<div className={'terminal-command-component ' + config.deviceType}>
				<div className='path-header'>
					<saki-modal-header
						border
						back-icon={!closeIcon}
						close-icon={closeIcon}
						ref={bindEvent({
							close() {
								dispatch(configSlice.actions.setModalTerminalCommand(false))
							},
							back() {
								console.log('back')
								store.dispatch(configSlice.actions.setSettingType(''))
								// setMenuType('')
								setCloseIcon(true)
								setShowItemPage(false)
							},
						})}
						title={t('title')}
					/>
				</div>
				<div className='path-main'>
					<saki-title margin='10px 0 12px 0' level='4' color='default'>
						<span>{t('availableTerminalCommands')}</span>
					</saki-title>
					<saki-scroll-view mode='Auto'>
						<div className='path-m-info'>
							{terminalCommand.map((v) => {
								return (
									<div key={v.name}>
										<div>
											<span>{v.name}</span>
										</div>
										<span>{v.desc}</span>
									</div>
								)
							})}
						</div>
					</saki-scroll-view>
				</div>
			</div>
		</saki-modal>
	)
}

export default TerminalCommandComponent
