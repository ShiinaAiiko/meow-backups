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
import './Settings.scss'
import { bindEvent } from '../modules/bindEvent'

import moment from 'moment'

import { alert, snackbar } from '@saki-ui/core'
// console.log(sakiui.bindEvent)
import { storage } from '../store/storage'
import { getI18n, useTranslation } from 'react-i18next'
import { api } from '../modules/http/api'
import app from '../store/app'

const SettingsComponent = ({
  visible,
  onClose,
}: {
  visible: boolean
  onClose: () => void
}) => {
  const { t, i18n } = useTranslation('settings')
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
        close() {
          onClose?.()
        },
      })}
      width='100%'
      height='100%'
      max-width={config.deviceType === 'Mobile' ? 'auto' : '620px'}
      max-height={config.deviceType === 'Mobile' ? 'auto' : '600px'}
      mask
      border-radius={config.deviceType === 'Mobile' ? '0px' : ''}
      border={config.deviceType === 'Mobile' ? 'none' : ''}
      mask-closable='false'
      background-color='#fff'
      visible={visible}
    >
      <div className={'settings-component ' + config.deviceType}>
        <div className='settings-header'>
          <saki-modal-header
            border
            back-icon={!closeIcon}
            close-icon={closeIcon}
            ref={bindEvent({
              close() {
                onClose?.()
              },
              back() {
                console.log('back')
                store.dispatch(configSlice.actions.setSettingType(''))
                // setMenuType('')
                setCloseIcon(true)
                setShowItemPage(false)
              },
            })}
            title={
              config.deviceType === 'Mobile'
                ? showItemPage
                  ? t(
                    config.pageConfig.settingPage.settingType?.toLocaleLowerCase()
                  )
                  : t('title')
                : t('title')
            }
          />
        </div>
        <div className='settings-main'>
          {config.deviceType === 'Mobile' ? (
            <>
              <div className='settings-m-list-page'>
                <SettingsNavList
                  menuType={''}
                  onMenuType={(menuType: string) => {
                    store.dispatch(configSlice.actions.setSettingType(menuType))
                    // setMenuType(menuType)
                    setCloseIcon(false)
                    setShowItemPage(true)
                  }}
                ></SettingsNavList>
              </div>
              <div
                className={
                  'settings-m-item-page ' + (showItemPage ? 'active' : '')
                }
              >
                <SettingsItemList
                  menuType={config.pageConfig.settingPage.settingType}
                ></SettingsItemList>
              </div>
            </>
          ) : (
            <>
              <div
                className={'settings-m-left ' + (showItemPage ? 'active' : '')}
              >
                <SettingsNavList
                  menuType={config.pageConfig.settingPage.settingType}
                  onMenuType={(menuType: string) => {
                    // setMenuType(menuType)
                    store.dispatch(configSlice.actions.setSettingType(menuType))
                  }}
                ></SettingsNavList>
              </div>
              <div className='settings-m-main'>
                <SettingsItemList
                  menuType={config.pageConfig.settingPage.settingType}
                ></SettingsItemList>
              </div>
            </>
          )}
        </div>
      </div>
    </saki-modal>
  )
}

const SettingsItemList = ({ menuType }: { menuType: string }) => {
  return (
    <>
      <General show={menuType === 'General'} />
      <Language show={menuType === 'Language'} />
      <Appearance show={menuType === 'Appearance'} />
      <About show={menuType === 'About'} />
    </>
  )
}

const SettingsNavList = ({
  menuType,
  onMenuType,
}: {
  menuType: string
  onMenuType: (menuType: string) => void
}) => {
  const { t, i18n } = useTranslation('settings')

  const config = useSelector((state: RootState) => state.config)

  return (
    <saki-menu
      ref={bindEvent({
        selectvalue(e) {
          onMenuType(e.detail.value)
        },
      })}
    >
      <saki-menu-item
        active={menuType === 'General'}
        padding='16px 12px'
        value='General'
      >
        <div className='settings-menu-item'>
          <svg
            className='icon'
            viewBox='0 0 1024 1024'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            p-id='2150'
          >
            <path
              d='M924.8 625.7l-65.5-56c3.1-19 4.7-38.4 4.7-57.8s-1.6-38.8-4.7-57.8l65.5-56c10.1-8.6 13.8-22.6 9.3-35.2l-0.9-2.6c-18.1-50.5-44.9-96.9-79.7-137.9l-1.8-2.1c-8.6-10.1-22.5-13.9-35.1-9.5l-81.3 28.9c-30-24.6-63.5-44-99.7-57.6l-15.7-85c-2.4-13.1-12.7-23.3-25.8-25.7l-2.7-0.5c-52.1-9.4-106.9-9.4-159 0l-2.7 0.5c-13.1 2.4-23.4 12.6-25.8 25.7l-15.8 85.4c-35.9 13.6-69.2 32.9-99 57.4l-81.9-29.1c-12.5-4.4-26.5-0.7-35.1 9.5l-1.8 2.1c-34.8 41.1-61.6 87.5-79.7 137.9l-0.9 2.6c-4.5 12.5-0.8 26.5 9.3 35.2l66.3 56.6c-3.1 18.8-4.6 38-4.6 57.1 0 19.2 1.5 38.4 4.6 57.1L99 625.5c-10.1 8.6-13.8 22.6-9.3 35.2l0.9 2.6c18.1 50.4 44.9 96.9 79.7 137.9l1.8 2.1c8.6 10.1 22.5 13.9 35.1 9.5l81.9-29.1c29.8 24.5 63.1 43.9 99 57.4l15.8 85.4c2.4 13.1 12.7 23.3 25.8 25.7l2.7 0.5c26.1 4.7 52.8 7.1 79.5 7.1 26.7 0 53.5-2.4 79.5-7.1l2.7-0.5c13.1-2.4 23.4-12.6 25.8-25.7l15.7-85c36.2-13.6 69.7-32.9 99.7-57.6l81.3 28.9c12.5 4.4 26.5 0.7 35.1-9.5l1.8-2.1c34.8-41.1 61.6-87.5 79.7-137.9l0.9-2.6c4.5-12.3 0.8-26.3-9.3-35zM788.3 465.9c2.5 15.1 3.8 30.6 3.8 46.1s-1.3 31-3.8 46.1l-6.6 40.1 74.7 63.9c-11.3 26.1-25.6 50.7-42.6 73.6L721 702.8l-31.4 25.8c-23.9 19.6-50.5 35-79.3 45.8l-38.1 14.3-17.9 97c-28.1 3.2-56.8 3.2-85 0l-17.9-97.2-37.8-14.5c-28.5-10.8-55-26.2-78.7-45.7l-31.4-25.9-93.4 33.2c-17-22.9-31.2-47.6-42.6-73.6l75.5-64.5-6.5-40c-2.4-14.9-3.7-30.3-3.7-45.5 0-15.3 1.2-30.6 3.7-45.5l6.5-40-75.5-64.5c11.3-26.1 25.6-50.7 42.6-73.6l93.4 33.2 31.4-25.9c23.7-19.5 50.2-34.9 78.7-45.7l37.9-14.3 17.9-97.2c28.1-3.2 56.8-3.2 85 0l17.9 97 38.1 14.3c28.7 10.8 55.4 26.2 79.3 45.8l31.4 25.8 92.8-32.9c17 22.9 31.2 47.6 42.6 73.6L781.8 426l6.5 39.9z'
              p-id='2151'
            ></path>
            <path
              d='M512 326c-97.2 0-176 78.8-176 176s78.8 176 176 176 176-78.8 176-176-78.8-176-176-176z m79.2 255.2C570 602.3 541.9 614 512 614c-29.9 0-58-11.7-79.2-32.8C411.7 560 400 531.9 400 502c0-29.9 11.7-58 32.8-79.2C454 401.6 482.1 390 512 390c29.9 0 58 11.6 79.2 32.8C612.3 444 624 472.1 624 502c0 29.9-11.7 58-32.8 79.2z'
              p-id='2152'
            ></path>
          </svg>
          <span className='name'>{t('general')}</span>
        </div>
      </saki-menu-item>
      <saki-menu-item
        active={menuType === 'Language'}
        padding='16px 12px'
        value='Language'
      >
        <div className='settings-menu-item'>
          <svg
            className='icon'
            viewBox='0 0 1024 1024'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            p-id='6662'
            width={'18px'}
            height={'18px'}
          >
            <path
              d='M726 352L492 928h94.48l48.98-116h181.08l48.98 116H960z m-53.38 372L726 559.7 779.38 724zM544 640c-0.5-0.38-41.18-31.54-90.84-85.34 79.16-107.28 124-229.22 142.3-286.66H704V180H428V96h-88v84H64v88h438.5c-19.04 53.9-54.1 139-107.58 216.72-65.36-86.88-94.28-151.76-94.66-152.44L286 304l-76 44 13.74 27.72c1.78 3.12 34.38 75.8 109.42 173.14 1.84 2.42 3.7 4.78 5.56 7.14-99.44 113.72-178.3 158.18-179.32 158.94L128 736l46 72 38.6-22.94c4.4-3.34 82.66-48 184-161.56 49.04 52.56 86.44 81.66 88.6 83.34L510 724z'
              p-id='6663'
            ></path>
          </svg>
          <span className='name'>{t('language')}</span>
        </div>
      </saki-menu-item>
      <saki-menu-item
        active={menuType === 'Appearance'}
        padding='16px 12px'
        value='Appearance'
      >
        <div className='settings-menu-item'>
          <svg
            className='icon'
            width={'16px'}
            height={'16px'}
            viewBox='0 0 1024 1024'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            p-id='5208'
          >
            <path
              d='M106.096424 807.407299c1.399953 1.099963 3.599879 0.199993 3.799872-1.599946 0.29999-3.099896 0.59998-6.299788 0.699977-9.49968 0.499983-10.699639 1.899936-21.399279 4.299855-31.998921 0.199993-0.89997-0.199993-1.899936-0.89997-2.399919-11.499612-7.799737-19.199353-23.999191-18.299383-40.898622 1.19996-21.699269 13.799535-49.298339 27.699066-61.397931 11.499612-9.899666 29.399009-9.299687 43.598531 0.199994 0.999966 0.699976 2.299922 0.499983 2.999899-0.399987 7.299754-8.499714 15.299484-16.89943 23.899195-25.099154 36.598767-34.798827 71.597587-54.198173 75.497455-56.298103l19.099357-10.399649c0.699976-0.399987 1.099963-1.099963 1.199959-1.899936 1.299956-16.299451 7.799737-31.198949 18.899363-42.598565 15.899464-16.299451 39.098682-23.499208 63.697853-19.699336 5.199825 0.799973 10.39965 2.099929 15.599475 3.899869 1.499949 0.499983 3.099896-0.699976 3.099895-2.299923-0.799973-25.099154 11.999596-42.198578 19.59934-52.298237l1.399953-1.899936c0.099997-0.099997 0.099997-0.199993 0.199993-0.199993l1.599946-1.699943C461.884434 399.221056 539.981802 321.223684 619.979106 243.126316c1.499949-1.499949 0.399987-4.099862-1.699943-3.999865-18.499377 1.19996-40.398639-4.199858-57.298069-15.399481-25.699134-17.099424-45.898453-46.798423-44.698493-66.097772 1.299956-19.399346 32.098918-43.898521 68.397695-54.398167 36.398773-10.599643 71.49759-2.899902 77.997371 17.099424 6.499781 20.099323 12.699572 47.998382 14.099525 62.2979v0.099997c0.199993 1.999933 2.499916 2.899902 3.899868 1.499949 69.197668-66.897745 134.295474-128.49567 176.194062-165.994406 1.399953-1.19996 0.89997-3.399885-0.899969-3.999865-127.795693-38.398706-311.889489 4.899835-493.783359 81.89724C92.696876 210.427418-38.298709 451.519293 9.79967 652.312526c15.899464 66.297766 49.198342 117.596037 96.296754 155.094773z m235.292071-588.080181c16.799434-12.999562 48.498366-14.999494 70.297631-4.599845 21.799265 10.499646 39.798659 31.898925 40.198645 47.698393 0.199993 15.699471-13.599542 33.098885-30.598969 38.598699-17.099424 5.499815-38.698696 9.49968-48.198375 8.699707-9.49968-0.799973-27.399077-16.199454-39.798659-33.998854-12.399582-17.899397-8.699707-43.398537 8.099727-56.3981z m-171.894207 74.597486c0.499983-0.29999 1.099963-0.499983 1.599946-0.399986l7.799737 0.999966 8.099727 0.999966c0.399987 0.099997 0.799973 0.199993 1.099963 0.499984 30.898959 23.999191 55.298136 53.798187 54.098177 66.697752-1.099963 12.999562-12.799569 28.899026-25.899127 35.398807-13.099559 6.499781-35.398807 5.499815-49.498332-2.199926-14.299518-7.699741-25.899127-29.499006-25.899127-48.298372 0-18.599373 12.799569-42.398571 28.599036-53.698191z m-91.39692 183.9938c11.099626-18.39938 33.998854-28.099053 50.498298-21.599272s25.999124 40.298642 20.899296 74.997472c-5.199825 34.698831-20.699302 61.097941-34.398841 58.598025-13.899532-2.499916-32.398908-21.099289-41.198611-41.498601-8.799703-20.399313-6.899767-52.098244 4.199858-70.497624zM830.772002 444.119543c-2.499916-2.599912-4.699842-5.099828-6.699774-7.599744-0.999966-1.19996-2.799906-1.19996-3.699876 0.099996-10.09966 13.799535-20.099323 27.399077-29.998989 40.698629-0.799973 1.099963-0.499983 2.699909 0.699977 3.399885 14.299518 8.29972 25.199151 19.999326 30.798962 34.498838 18.499377 47.798389-25.299147 109.096323-97.796704 136.995383-29.798996 11.499612-59.797985 15.499478-85.997102 12.999562-0.59998-0.099997-1.099963 0.099997-1.599946 0.399986-12.999562 9.19969-29.998989 18.09939-51.098278 19.59934-1.699943 0.099997-2.699909 1.899936-1.899936 3.399885 6.199791 11.699606 9.79967 23.899195 10.799636 35.89879 0.099997 0.999966 0.699976 1.799939 1.599946 1.999933 17.49941 5.599811 29.299013 15.599474 23.199218 31.398942-1.099963 2.799906 0 0-5.499814 10.399649l-5.399818 10.299653s0 0.099997-0.099997 0.099997c-7.899734 18.299383-24.499174 34.098851-37.198746 35.698797-11.299619 1.299956-28.299046-1.099963-39.898656-5.399818-1.599946-0.59998-3.199892 0.59998-3.099895 2.299922 1.099963 21.999259-1.799939 43.098548-8.8997 62.89788-0.59998 1.599946 0.799973 3.299889 2.499915 3.099896 3.999865-0.59998 8.099727-1.19996 12.199589-1.79994C817.272457 832.00647 1003.966165 645.912742 1019.26565 585.114791c6.299788-25.099154 12.999562-56.798086-27.999057-99.496647-40.898622-42.398571-109.296317 11.599609-160.494591-41.498601z'
              p-id='5209'
            ></path>
            <path
              d='M288.390281 613.213844s-132.695528 72.09757-137.795356 184.993765c-5.199825 112.896195-112.996192 194.993428-148.894982 205.293082-35.89879 10.299653 524.082338 33.498871 484.383675-206.993024-0.099997-0.499983-0.29999-0.999966-0.699976-1.299956l-196.993361-181.993867zM534.98197 689.811263c20.399313 19.799333 25.599137 47.698393 11.59961 62.097907-14.099525 14.499511-41.998585 10.09966-62.497894-9.699673l-135.295441-128.995653c-20.399313-19.799333-25.599137-47.698393-11.599609-62.097907 14.099525-14.499511 41.998585-10.09966 62.497894 9.699673l135.29544 128.995653z m469.284185-678.377138c-36.598767-24.799164-69.497658-2.599912-83.797176 5.499814-0.099997 0-0.099997 0.099997-0.099997 0.099997-42.698561 28.699033-345.888343 323.389101-477.783898 459.584511l-0.199993 0.199994c-16.099457 21.499275-26.899093 38.398706 50.698292 115.896094 65.497793 65.497793 96.096761 61.297934 129.195645 32.998888 0.099997 0 0.099997-0.099997 0.199994-0.099997 55.398133-55.49813 290.690203-383.487076 377.587275-508.58286 14.199521-20.499309 43.498534-78.897341 4.199858-105.596441z'
              p-id='5210'
            ></path>
          </svg>
          <span className='name'>{t('appearance')}</span>
        </div>
      </saki-menu-item>
      <saki-menu-item
        active={menuType === 'About'}
        padding='16px 12px'
        value='About'
      >
        <div className='settings-menu-item'>
          <svg
            className='icon'
            width={'16px'}
            height={'16px'}
            viewBox='0 0 1024 1024'
            version='1.1'
            xmlns='http://www.w3.org/2000/svg'
            p-id='23126'
          >
            <path
              d='M511.250625 414.911719a46.545031 46.545031 0 0 1 46.545031 46.545031l0.162908 283.575604a46.545031 46.545031 0 0 1-93.090063 0l-0.162907-283.575604a46.545031 46.545031 0 0 1 46.545031-46.545031z m-50.012636-136.53985a50.035909 50.035909 0 0 1 100.071817 0l0.18618 1.512714a50.035909 50.035909 0 0 1-100.071817 0zM511.995345 1024a508.178653 508.178653 0 0 1-293.233697-93.299515 46.405396 46.405396 0 0 1-34.210598-44.683231l-0.418906-4.305415a46.405396 46.405396 0 0 1 80.592722-31.557531 420.534359 420.534359 0 1 0-132.653339-160.161453l-7.540295 7.540295a46.545031 46.545031 0 0 1 29.020827 43.077426l0.442177 4.328688a46.428669 46.428669 0 0 1-91.088626 12.776611A511.995345 511.995345 0 1 1 511.995345 1024z'
              p-id='23127'
            ></path>
          </svg>
          <span className='name'>
            {t('about', {
              ns: 'settings',
            })}
          </span>
        </div>
      </saki-menu-item>
    </saki-menu>
  )
}

const SettingsItem = ({
  title,
  subtitle,
  main,
}: {
  title?: () => JSX.Element
  subtitle?: () => JSX.Element
  main?: () => JSX.Element
}) => {
  return (
    <div className='settings-item-component '>
      <div className='pi-title'>{title?.()}</div>
      <div className='pi-subtitle'>
        <slot name='subtitle'>{subtitle?.()}</slot>
      </div>
      <div className='pi-main'>
        <slot name='main'>{main?.()}</slot>
      </div>
    </div>
  )
}

const Language = ({ show }: { show: boolean }) => {
  const { t, i18n } = useTranslation('settings')
  const language = useSelector((state: RootState) => state.config.language)

  const dispatch = useDispatch<AppDispatch>()
  // useEffect(() => {
  // 	setMode(appearance.mode)
  // }, [appearance.mode])

  useEffect(() => { }, [language])

  const [languages, setLanguages] = useState([
    {
      value: 'zh-CN',
      content: '中文(简体) - Chinese(Simplified)',
    },
    {
      value: 'zh-TW',
      content: '中文(繁體) - Chinese(Traditional)',
    },
    {
      value: 'en-US',
      content: 'English - English',
    },
  ])
  return (
    <div
      style={{
        display: show ? 'block' : 'none',
      }}
    >
      <SettingsItem
        subtitle={() => <div>{t('language')}</div>}
        main={() => (
          <saki-checkbox
            ref={bindEvent({
              async selectvalue(e) {
                dispatch(
                  configSlice.actions.setLanguage({
                    language: e.detail.value,
                  })
                )

                api.v1.app.updateSystemConfig({
                  language: e.detail.value,
                  lang: getI18n().language
                })
              },
            })}
            value={language}
            flex-direction='Column'
            type='Radio'
          >
            <saki-checkbox-item padding='14px 0' value='system'>
              {t('system')}
            </saki-checkbox-item>
            {languages.map((v, i) => {
              return (
                <saki-checkbox-item key={i} padding='14px 0' value={v.value}>
                  {v.content}
                </saki-checkbox-item>
              )
            })}
          </saki-checkbox>
        )
        }
      ></SettingsItem >
    </div >
  )
}

const Appearance = ({ show }: { show: boolean }) => {
  const { t, i18n } = useTranslation('settings')
  const mode = useSelector((state: RootState) => state.config.appearanceMode)

  const dispatch = useDispatch<AppDispatch>()
  return (
    <div
      style={{
        display: show ? 'block' : 'none',
      }}
    >
      <SettingsItem
        subtitle={() => <div>{t('modes')}</div>}
        main={() => (
          <saki-checkbox
            ref={bindEvent({
              async selectvalue(e) {
                console.log(e.detail.value)

                dispatch(configSlice.actions.setAppearanceMode(e.detail.value))

                api.v1.app.updateSystemConfig({
                  appearance: e.detail.value,
                })
              },
            })}
            value={mode}
            flex-direction='Column'
            type='Radio'
          >
            <saki-checkbox-item padding='14px 0' value='light'>
              {t('light')}
            </saki-checkbox-item>
            <saki-checkbox-item padding='14px 0' value='black'>
              {t('black')}
            </saki-checkbox-item>
            <saki-checkbox-item padding='14px 0' value='dark'>
              {t('dark')}
            </saki-checkbox-item>
            <saki-checkbox-item padding='14px 0' value='system'>
              {t('system')}
            </saki-checkbox-item>
          </saki-checkbox>
        )}
      ></SettingsItem>
    </div>
  )
}

const General = ({ show }: { show: boolean }) => {
  const { t, i18n } = useTranslation('settings')
  const ref = React.useRef<HTMLInputElement>(null)
  const app = useSelector((state: RootState) => state.app)
  const automaticStart = useSelector(
    (state: RootState) => state.config.general.automaticStart
  )

  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.setAttribute('directory', '')
      ref.current.setAttribute('webkitdirectory', '')
    }
  }, [ref])
  return (
    <div
      style={{
        display: show ? 'block' : 'none',
      }}
    >
      <SettingsItem
        subtitle={() => (
          <div>
            {t('automaticStart', {
              ns: 'settings',
            })}
          </div>
        )}
        main={() => (
          <div className='auto-close-window-after-copy'>
            <span>
              {t('automaticStart', {
                ns: 'settings',
              })}
            </span>
            {/* {app.systemConfig.Os === 'linux' ? (
							<saki-button
								ref={bindEvent({
									tap: () => {
										dispatch(configSlice.actions.setModalTerminalCommand(true))
									},
								})}
								border='none'
							>
								<saki-title level='4' color='default'>
									<span>{t('useTerminal')}</span>
								</saki-title>
							</saki-button>
						) : ( */}
            <saki-switch
              ref={bindEvent({
                change: (e) => {
                  dispatch(configSlice.actions.setAutomaticStart(e.detail))

                  api.v1.app.updateSystemConfig({
                    automaticStart: e.detail,
                  })
                },
              })}
              height='24px'
              value={automaticStart}
              disabled={app.systemConfig.Os === 'linux'}
            ></saki-switch>
            {/* )} */}
          </div>
        )}
      ></SettingsItem>

      {/* <input ref={ref} type='file' /> */}
    </div>
  )
}

const About = ({ show }: { show: boolean }) => {
  const { t, i18n } = useTranslation('settings')
  const config = useSelector((state: RootState) => state.config)
  const app = useSelector((state: RootState) => state.app)

  const dispatch = useDispatch<AppDispatch>()
  return (
    <div
      style={{
        display: show ? 'block' : 'none',
      }}
      className='setting-about-page'
    >
      <div className='version-info'>
        <img src={config.origin + '/icons/256x256.png'} alt='' />
        <div className='version-code'>
          <span>Version {app.systemConfig.version}</span>

          <saki-button
            ref={bindEvent({
              tap: async () => {
                console.log('检测更新', config.newVersion, config.version)
                if (
                  !config.newVersion ||
                  config.newVersion === config.version
                ) {
                  await dispatch(
                    methods.app.checkForUpdates({
                      alertModal: true,
                    })
                  )
                } else {
                  dispatch(methods.app.update())
                }
              },
            })}
            margin='0 0 0 6px'
            border='none'
          >
            <saki-title level='4' color='default'>
              <span>
                {config.newVersion
                  ? t('newVersionAvailable', {
                    ns: 'common',
                  })
                  : t('checkForUpdates', {
                    ns: 'common',
                  })}
              </span>
            </saki-title>
          </saki-button>
        </div>
      </div>

      <SettingsItem
        subtitle={() => (
          <div>
            {t('about') +
              t('appTitle', {
                ns: 'common',
              })}
          </div>
        )}
        main={() => (
          <div className='about-links'>
            <saki-button
              ref={bindEvent({
                tap: () => {
                  let url =
                    'https://github.com/ShiinaAiiko/meow-backups/releases'
                  switch (config.platform) {
                    case 'Electron':
                      const { shell } = window.require('electron')
                      shell.openExternal(url)
                      break
                    case 'Web':
                      window.open(url)
                      break

                    default:
                      break
                  }
                },
              })}
              border='none'
              padding='0'
              bg-hover-color='transparent'
              bg-active-color='transparent'
            >
              <div className='settings-link'>
                <svg
                  aria-hidden='true'
                  viewBox='0 0 16 16'
                  version='1.1'
                  width='26'
                  height='26'
                  data-view-component='true'
                  className='icon'
                >
                  <path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z'></path>
                </svg>
                <span>Github</span>
              </div>
            </saki-button>
          </div>
        )}
      ></SettingsItem>
    </div>
  )
}

export default SettingsComponent
