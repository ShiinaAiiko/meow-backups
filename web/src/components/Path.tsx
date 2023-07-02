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
import './Path.scss'
import { bindEvent } from '../modules/bindEvent'

import moment from 'moment'

import { alert, snackbar } from '@saki-ui/core'
// console.log(sakiui.bindEvent)
import { storage } from '../store/storage'
import { useTranslation } from 'react-i18next'
import { api } from '../modules/http/api'

const PathComponent = () => {
	const { t, i18n } = useTranslation('path')
	const app = useSelector((state: RootState) => state.app)
	const config = useSelector((state: RootState) => state.config)

	const dispatch = useDispatch<AppDispatch>()
	// const [menuType, setMenuType] = useState('Appearance')
	// const [menuType, setMenuType] = useState(type || 'Account')
	const [closeIcon, setCloseIcon] = useState(true)
	const [showItemPage, setShowItemPage] = useState(false)
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
			visible={config.modal.path}
		>
			<div className={'path-component ' + config.deviceType}>
				<div className='path-header'>
					<saki-modal-header
						border
						back-icon={!closeIcon}
						close-icon={closeIcon}
						ref={bindEvent({
							close() {
								dispatch(configSlice.actions.setModalPath(false))
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
						<span>
							{t('usingPathTip').replace(
								'{appName}',
								t('appTitle', {
									ns: 'common',
								})
							)}
						</span>
					</saki-title>
					<div className='path-m-info'>
						{Object.keys(Object(app.systemConfig.path)).map((v) => {
							return (
								<div key={v}>
									<div>
										<span>{t(v)}</span>
									</div>
									<span>{(app.systemConfig.path as any)[v]}</span>
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</saki-modal>
	)
}

export default PathComponent
