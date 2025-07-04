import React, { useEffect, useState } from 'react'
import { bindEvent } from '../modules/bindEvent'

import { useSelector, useDispatch } from 'react-redux'
import { useLocation, useNavigate } from 'react-router-dom'
import store, {
  RootState,
  AppDispatch,
  useAppDispatch,
  methods,
  configSlice,
  userSlice,
} from '../store'
import './Header.scss'
import { useTranslation } from 'react-i18next'
import { prompt, alert, snackbar, progressBar } from '@saki-ui/core'
import { eventTarget } from '../store/config'
import { SyncOff } from './Icon'
import { Query } from '../modules/methods'
import { api } from '../modules/http/api'

const HeaderComponent = ({
  onSettings,
}: {
  onSettings: (type: string) => void
}) => {
  const { t, i18n } = useTranslation('index-header')
  const config = useSelector((state: RootState) => state.config)
  const nsocketio = useSelector((state: RootState) => state.nsocketio)
  const appStatus = useSelector((state: RootState) => state.config.status)
  const user = useSelector((state: RootState) => state.user)
  const app = useSelector((state: RootState) => state.app)

  const [noteContextMenuEl, setNoteContextMenuEl] = useState<any>()
  const [openDropDownMenu, setOpenDropDownMenu] = useState(false)
  const [openAddDropDownMenu, setOpenAddDropDownMenu] = useState(false)
  const [openSettingDropDownMenu, setOpenSettingDropDownMenu] = useState(false)
  const [openUserDropDownMenu, setOpenUserDropDownMenu] = useState(false)
  const [showBackIcon, setShowBackIcon] = useState(false)

  const [historyLength, setHistoryLength] = useState(0)

  const dispatch = useDispatch<AppDispatch>()

  const location = useLocation()
  const history = useNavigate()

  useEffect(() => {
    console.log(
      'location',
      location.pathname === '/m' || location.pathname === '/m/p'
    )
    if (location.pathname === '/m' || location.pathname === '/m/p') {
      dispatch(configSlice.actions.setHeaderCenter(false))
    } else {
      dispatch(configSlice.actions.setHeaderCenter(true))
    }
    // if (location.pathname === '/') {
    // 	dispatch(configSlice.actions.setHeaderCenter(true))
    // }
    if (
      location.pathname === '/m/n' ||
      location.pathname === '/m/c' ||
      location.pathname === '/m/p'
    ) {
      setShowBackIcon(true)
    } else {
      setShowBackIcon(false)
    }
    setHistoryLength(historyLength + 1)
  }, [location])

  return (
    <div className='header-component'>
      <div
        className='new-version-progress'
        style={{
          width: app.newVersionDownloadProgress + '%',
        }}
      ></div>
      <div className='qv-h-left'>
        <saki-transition
          animation-duration={500}
          class-name='header-left'
          in={showBackIcon}
        >
          <div className='close'>
            <saki-button
              ref={bindEvent({
                tap: (e) => {
                  // eventTarget.dispatchEvent(new Event('back'))

                  console.log('historyLength', historyLength)
                  if (window.history.length === 1 || historyLength === 1) {
                    history?.('/m', {
                      replace: true,
                    })
                    return
                  }
                  history(-1)
                },
              })}
              type='CircleIconGrayHover'
            >
              <svg
                className='close-icon'
                viewBox='0 0 1024 1024'
                version='1.1'
                xmlns='http://www.w3.org/2000/svg'
                p-id='1580'
              >
                <path
                  d='M395.21518 513.604544l323.135538-312.373427c19.052938-18.416442 19.052938-48.273447 0-66.660212-19.053961-18.416442-49.910737-18.416442-68.964698 0L291.75176 480.290811c-19.052938 18.416442-19.052938 48.273447 0 66.660212l357.633237 345.688183c9.525957 9.207709 22.01234 13.796214 34.497699 13.796214 12.485359 0 24.971741-4.588505 34.466999-13.82896 19.052938-18.416442 19.052938-48.242747 0-66.660212L395.21518 513.604544z'
                  p-id='1581'
                ></path>
              </svg>
            </saki-button>
          </div>
        </saki-transition>
        <saki-transition
          animation-duration={500}
          class-name='header-left'
          in={!showBackIcon}
        >
          <div className='logo text-elipsis'>
            {showBackIcon ? (
              ''
            ) : (
              <div
                className='logo-info'
                title={t('appTitle', {
                  ns: 'common',
                })}
              >
                <img src={config.origin + '/icons/256x256.png'} alt='' />
                <span className='text-elipsis'>
                  {t('appTitle', {
                    ns: 'common',
                  })}
                </span>
              </div>
            )}
          </div>
        </saki-transition>
      </div>
      {config.layout.showCenter ? <div className='qv-h-center'></div> : ''}
      <div className='qv-h-right'>
        {nsocketio.status !== 'success' && config.deviceType !== 'Mobile' ? (
          <div className='qv-h-r-connecting'>
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
        <div
          style={{
            margin: '0 4px 0 0',
          }}
        >
          <meow-apps-dropdown
            ref={bindEvent({
              openUrl: (e) => {
                switch (config.platform) {
                  case 'Electron':
                    const { shell } = window.require('electron')
                    shell.openExternal(e.detail)
                    break
                  case 'Web':
                    window.open(e.detail, '_blank')
                    break

                  default:
                    break
                }
              },
            })}
            disable-open-web-page
            language={i18n.language}
          />
        </div>
        <saki-dropdown
          visible={openSettingDropDownMenu}
          floating-direction='Left'
          ref={bindEvent({
            close: (e) => {
              setOpenSettingDropDownMenu(false)
            },
          })}
        >
          <div className='qv-h-r-setting'>
            <saki-button
              ref={bindEvent({
                tap: (e) => {
                  setOpenSettingDropDownMenu(true)
                },
              })}
              type='CircleIconGrayHover'
              font-size='13px'
            >
              {appStatus.syncStatus ? (
                <svg
                  className='icon loading'
                  viewBox='0 0 1024 1024'
                  version='1.1'
                  xmlns='http://www.w3.org/2000/svg'
                  p-id='2593'
                >
                  <path
                    d='M511.4 866.2c-11.6 0-23.3-0.6-34.9-1.7l-0.7-0.1-6.9-1h-1.4c-5.5 0-10.5-0.8-15.8-1.6l-2.4-0.4h-0.1c-0.2 0-0.4-0.1-0.5-0.1-0.4-0.1-0.8-0.2-1.1-0.3-0.8-0.2-1.9-0.5-3.3-0.6-1.5-0.4-2.9-0.7-4.2-1-0.7-0.1-1.4-0.3-2.1-0.5-1.5-0.4-2.8-0.7-4-0.9-0.9-0.2-1.7-0.4-2.3-0.5l-0.9-0.2-0.9-0.2c-6.5-1.1-12.7-2.7-19.3-4.9-1.6-0.6-3-1-4.2-1.4-0.4-0.1-0.9-0.2-1.3-0.4l-0.9-0.3-1-0.2c-0.5-0.1-1.7-0.4-3.6-1l-0.7-0.2-0.7-0.2c-7.8-2-14.9-4.9-21.4-7.7l-6.8-3.5-0.7-0.3c-39.3-16.6-76-41.9-106.3-73.1l-1-1-0.7-0.8c-2.6-3-5.3-6-8.3-8.9-0.9-1-1.8-2-2.7-2.9-3-3.3-5.9-6.3-8.4-9.7l-0.4-0.6-0.5-0.5c-1.2-1.3-1.5-1.8-1.6-1.9l-0.3-0.4-0.6-0.8c-0.4-0.6-1.1-1.5-2-2.6l-0.5-0.6c-3.8-4.6-7.8-9.7-12-15.9l-0.4-0.6-0.3-0.4c0-0.1-0.1-0.2-0.2-0.3l-0.7-1.5-0.9-1.4c-37.7-56.5-58.7-121.8-60.7-189l-0.6-18.5H96L196 353l100 152.5h-65.7l0.8 19.9c2.5 59.6 23.6 116.6 61.2 164.7l0.2 0.2 0.2 0.3c0.9 1.7 2 3.5 3.7 5.2 22.6 26.6 48.8 48.7 78 65.9l4.5 2.6h1c5.8 3.7 11.9 6.8 19.7 10.1l3.3 1.4c6 2.5 12.3 5.2 18.7 7.1l1.9 0.6 1.9 0.2c0.3 0 1.5 0.2 4.1 1.3l0.6 0.3 0.6 0.2c5.4 2 10.7 3.1 16.6 4.3l1.9 0.4h0.1c1.2 0.2 2.4 0.4 3.5 0.6 0.5 0.1 1.1 0.2 1.6 0.3 0.6 0.1 1.5 0.2 1.8 0.3l1.1 0.4 1.2 0.2c2.8 0.6 5.6 0.8 8.6 1.1l3 0.3c1.6 0.2 3.1 0.3 4.2 0.5l1.9 0.4h1c0.7 0.1 1.3 0.2 2 0.3 1.7 0.3 3.8 0.6 6.1 0.6h0.1c8.3 0.9 17 1.4 26.5 1.4 56.6 0 112.9-17.8 158.7-50.1l0.3-0.1 1.1-0.8c6.5-4.5 13.4-6.8 20.3-6.8 2.3 0 4.2 0.1 5.8 0.5 7.7 1.4 15.1 5 22.6 11l0.7 1c11.3 16.5 7.4 38.6-8.8 50.4-58.8 42.2-128.2 64.5-201.2 64.5zM723.5 522.1H789l-0.8-19.9c-2.5-60.3-24.4-118.9-61.8-165.2v-1.3l-4.4-5.3c-27.2-32.7-62.1-59-101-76.3l-3.6-1.8c-5.1-2.6-10.5-4.4-15.2-5.9l-1.8-0.6c-1.5-0.6-2.9-1.1-4.1-1.4l-5.6-2.3-8-2c-3.4-1-7.2-1.9-11.3-2.6h-0.1c-0.5-0.2-1-0.4-1.4-0.5l-0.3-0.1-0.3-0.1c-0.4-0.1-0.8-0.2-1.1-0.3-1.4-0.4-3.7-1.1-6.7-1.2l-18.8-3.1-7.9-1.1h-0.4c-8.9-0.8-18-1.2-27-1.2-56.6 0-112.9 17.8-158.7 50.1l-0.3 0.1-1.1 0.7c-6.5 4.5-13.4 6.8-20.3 6.8-2.3 0-4.2-0.1-5.8-0.5-9.6-1.8-17.5-7-22.8-15l-0.1-0.2c-11.2-16.5-7.4-38.6 8.8-50.3 58.5-41.8 128.1-63.8 201.1-63.8h5.4c9 0 18.3 0 27.3 1l1.1 0.1h1.1c0.8 0 1.7 0.1 2.8 0.3 0.6 0.1 1.2 0.1 1.8 0.2h0.3c1.5 0.2 3.3 0.4 5.4 0.5 3.1 0.7 6.1 0.9 8.6 1.1 1 0.1 1.9 0.2 2.9 0.3 1.6 0.2 3.1 0.3 4.2 0.5l1.9 0.4h1.1l2.3 0.8h1.1c0.3 0 0.6 0.1 1 0.1l12.1 3.1 22.3 6.4 9.4 3.1 23.9 8.9 1.5 1.5 3.3 0.7 0.2 0.1 1.6 0.7c50 21.7 94.8 55.8 129.4 98.5l0.6 0.8 2.7 2.7c5 5.9 9.4 11.4 13.6 17.2v1.3l3.2 4.8c37.9 57.1 58.9 122.6 61 189.4l0.6 18.3 18.3 0.2c1.1 0 27.2 0.2 39.3 0.2 5.2 0 6.2 0 7.1-0.1l0.7-0.1h0.4C919 534.1 861 622.5 827.4 673.7L723.5 522.1z'
                    fill=''
                    p-id='2594'
                  ></path>
                </svg>
              ) : (
                <svg
                  className='icon'
                  viewBox='0 0 1024 1024'
                  version='1.1'
                  xmlns='http://www.w3.org/2000/svg'
                  p-id='2434'
                >
                  <path
                    d='M983.692462 642.006807l-74.844613-63.989288c3.542264-21.710651 5.370529-43.878369 5.37053-66.046086s-1.828265-44.335435-5.37053-66.046086l74.844613-63.989287a36.599587 36.599587 0 0 0 10.626793-40.221838l-1.0284-2.970931a507.046544 507.046544 0 0 0-91.070468-157.573621l-2.056798-2.399598a36.702427 36.702427 0 0 0-40.107572-10.855326l-92.898733 33.023043c-34.279975-28.10958-72.559281-50.277297-113.923785-65.817552l-17.939854-97.126598a36.62244 36.62244 0 0 0-29.480779-29.366512l-3.085198-0.571333c-59.532891-10.741059-122.150979-10.741059-181.68387 0l-3.085197 0.571333a36.62244 36.62244 0 0 0-29.480779 29.366512l-18.054121 97.583664a402.058405 402.058405 0 0 0-113.123919 65.58902l-93.584333-33.251577a36.565307 36.565307 0 0 0-40.107571 10.855326l-2.056798 2.399598a509.651822 509.651822 0 0 0-91.070468 157.573621l-1.0284 2.970931c-5.141996 14.283323-0.914133 30.280645 10.626793 40.221838l75.758745 64.674887c-3.542264 21.482118-5.256263 43.421302-5.256263 65.24622 0 21.939184 1.713999 43.878369 5.256263 65.24622L40.079005 641.778274a36.599587 36.599587 0 0 0-10.626793 40.221838l1.0284 2.970931c20.682252 57.590359 51.305697 110.724321 91.070468 157.57362l2.056798 2.399599a36.702427 36.702427 0 0 0 40.107571 10.855325l93.584333-33.251576c34.051442 27.995313 72.102215 50.163031 113.123919 65.58902l18.054121 97.583663a36.62244 36.62244 0 0 0 29.480779 29.366512l3.085197 0.571333a513.514032 513.514032 0 0 0 181.68387 0l3.085198-0.571333a36.62244 36.62244 0 0 0 29.480779-29.366512l17.939854-97.126597a399.933047 399.933047 0 0 0 113.923785-65.817553l92.898733 33.023043a36.565307 36.565307 0 0 0 40.107572-10.855325l2.056798-2.399599c39.764772-46.963566 70.388216-99.983262 91.070468-157.57362l1.0284-2.970931c5.141996-14.05479 0.914133-30.052112-10.626793-39.993305zM827.718574 459.408804c2.856665 17.254254 4.34213 34.965575 4.34213 52.676896s-1.485466 35.422641-4.34213 52.676896l-7.541595 45.8209 85.357139 73.016348a422.820644 422.820644 0 0 1-48.677565 84.100206L750.817162 730.106344l-35.879707 29.480779c-27.309714 22.396251-57.704625 39.993305-90.613402 52.334096l-43.535569 16.340121-20.453719 110.838587a431.356358 431.356358 0 0 1-97.126597 0l-20.453718-111.06712-43.192769-16.568655c-32.565977-12.340791-62.846622-29.937845-89.927803-52.219829l-35.879707-29.595046-106.724991 37.936507c-19.425319-26.167048-35.651174-54.390894-48.677565-84.100207l86.271272-73.701947-7.427328-45.706634c-2.742398-17.025721-4.227864-34.622775-4.227864-51.991296 0-17.482787 1.371199-34.965575 4.227864-51.991296l7.427328-45.706634-86.271272-73.701947c12.912124-29.823579 29.252246-57.933159 48.677565-84.100207l106.724991 37.936506 35.879707-29.595045c27.081181-22.281984 57.361826-39.879038 89.927803-52.219829l43.307035-16.340122 20.453719-111.06712c32.10891-3.656531 64.90342-3.656531 97.126597 0l20.453719 110.838587 43.535568 16.340122c32.79451 12.340791 63.303688 29.937845 90.613402 52.334095l35.879708 29.480779 106.039391-37.593706c19.425319 26.167048 35.651174 54.390894 48.677565 84.100206L820.291246 413.816437l7.427328 45.592367zM512 299.549852c-111.06712 0-201.109189 90.042069-201.109189 201.109189s90.042069 201.109189 201.109189 201.10919 201.109189-90.042069 201.109189-201.10919-90.042069-201.109189-201.109189-201.109189z m90.499135 291.608325A127.521509 127.521509 0 0 1 512 628.637616c-34.165709 0-66.274619-13.36919-90.499135-37.479439A127.521509 127.521509 0 0 1 384.021425 500.659041c0-34.165709 13.36919-66.274619 37.47944-90.499135C445.725381 385.93539 477.834291 372.680466 512 372.680466c34.165709 0 66.274619 13.254924 90.499135 37.47944A127.521509 127.521509 0 0 1 639.978575 500.659041c0 34.165709-13.36919 66.274619-37.47944 90.499136z'
                    p-id='2435'
                  ></path>
                </svg>
              )}
            </saki-button>
          </div>
          <div slot='main'>
            <saki-menu
              ref={bindEvent({
                selectvalue: async (e) => {
                  console.log(e.detail.value)
                  switch (e.detail.value) {
                    case 'Setting':
                      switch (config.deviceType) {
                        case 'Mobile':
                          onSettings?.('')
                          break

                        default:
                          onSettings?.('General')
                          break
                      }
                      break
                    case 'OpenDevTools':
                      break
                    case 'Restart':
                      const res = await api.v1.app.restart()
                      if (res.code === 200) {
                        dispatch(configSlice.actions.setRestarting(true))
                      }
                      break
                    case 'Path':
                      dispatch(configSlice.actions.setModalPath(true))
                      break
                    case 'TerminalCommand':
                      dispatch(
                        configSlice.actions.setModalTerminalCommand(true)
                      )
                      break

                    case 'Quit':
                      alert({
                        title: t('quitModalTitle', {
                          ns: 'common',
                        }),
                        content: t('quitModalContent', {
                          ns: 'common',
                        }),
                        cancelText: t('cancel', {
                          ns: 'common',
                        }),
                        confirmText: t('quit', {
                          ns: 'common',
                        }),
                        onCancel() { },
                        onConfirm() {
                          api.v1.app.quit()
                        },
                      }).open()
                      break
                    case 'login':
                      store.dispatch(
                        configSlice.actions.setStatus({
                          type: 'loginModalStatus',
                          v: true,
                        })
                      )
                      break

                    default:
                      break
                  }
                  setOpenSettingDropDownMenu(false)
                },
              })}
            >
              <saki-menu-item padding='10px 18px' value={'Setting'}>
                <div className='qv-h-r-u-item'>
                  <svg
                    className='icon'
                    viewBox='0 0 1024 1024'
                    version='1.1'
                    xmlns='http://www.w3.org/2000/svg'
                    p-id='2434'
                  >
                    <path
                      d='M983.692462 642.006807l-74.844613-63.989288c3.542264-21.710651 5.370529-43.878369 5.37053-66.046086s-1.828265-44.335435-5.37053-66.046086l74.844613-63.989287a36.599587 36.599587 0 0 0 10.626793-40.221838l-1.0284-2.970931a507.046544 507.046544 0 0 0-91.070468-157.573621l-2.056798-2.399598a36.702427 36.702427 0 0 0-40.107572-10.855326l-92.898733 33.023043c-34.279975-28.10958-72.559281-50.277297-113.923785-65.817552l-17.939854-97.126598a36.62244 36.62244 0 0 0-29.480779-29.366512l-3.085198-0.571333c-59.532891-10.741059-122.150979-10.741059-181.68387 0l-3.085197 0.571333a36.62244 36.62244 0 0 0-29.480779 29.366512l-18.054121 97.583664a402.058405 402.058405 0 0 0-113.123919 65.58902l-93.584333-33.251577a36.565307 36.565307 0 0 0-40.107571 10.855326l-2.056798 2.399598a509.651822 509.651822 0 0 0-91.070468 157.573621l-1.0284 2.970931c-5.141996 14.283323-0.914133 30.280645 10.626793 40.221838l75.758745 64.674887c-3.542264 21.482118-5.256263 43.421302-5.256263 65.24622 0 21.939184 1.713999 43.878369 5.256263 65.24622L40.079005 641.778274a36.599587 36.599587 0 0 0-10.626793 40.221838l1.0284 2.970931c20.682252 57.590359 51.305697 110.724321 91.070468 157.57362l2.056798 2.399599a36.702427 36.702427 0 0 0 40.107571 10.855325l93.584333-33.251576c34.051442 27.995313 72.102215 50.163031 113.123919 65.58902l18.054121 97.583663a36.62244 36.62244 0 0 0 29.480779 29.366512l3.085197 0.571333a513.514032 513.514032 0 0 0 181.68387 0l3.085198-0.571333a36.62244 36.62244 0 0 0 29.480779-29.366512l17.939854-97.126597a399.933047 399.933047 0 0 0 113.923785-65.817553l92.898733 33.023043a36.565307 36.565307 0 0 0 40.107572-10.855325l2.056798-2.399599c39.764772-46.963566 70.388216-99.983262 91.070468-157.57362l1.0284-2.970931c5.141996-14.05479 0.914133-30.052112-10.626793-39.993305zM827.718574 459.408804c2.856665 17.254254 4.34213 34.965575 4.34213 52.676896s-1.485466 35.422641-4.34213 52.676896l-7.541595 45.8209 85.357139 73.016348a422.820644 422.820644 0 0 1-48.677565 84.100206L750.817162 730.106344l-35.879707 29.480779c-27.309714 22.396251-57.704625 39.993305-90.613402 52.334096l-43.535569 16.340121-20.453719 110.838587a431.356358 431.356358 0 0 1-97.126597 0l-20.453718-111.06712-43.192769-16.568655c-32.565977-12.340791-62.846622-29.937845-89.927803-52.219829l-35.879707-29.595046-106.724991 37.936507c-19.425319-26.167048-35.651174-54.390894-48.677565-84.100207l86.271272-73.701947-7.427328-45.706634c-2.742398-17.025721-4.227864-34.622775-4.227864-51.991296 0-17.482787 1.371199-34.965575 4.227864-51.991296l7.427328-45.706634-86.271272-73.701947c12.912124-29.823579 29.252246-57.933159 48.677565-84.100207l106.724991 37.936506 35.879707-29.595045c27.081181-22.281984 57.361826-39.879038 89.927803-52.219829l43.307035-16.340122 20.453719-111.06712c32.10891-3.656531 64.90342-3.656531 97.126597 0l20.453719 110.838587 43.535568 16.340122c32.79451 12.340791 63.303688 29.937845 90.613402 52.334095l35.879708 29.480779 106.039391-37.593706c19.425319 26.167048 35.651174 54.390894 48.677565 84.100206L820.291246 413.816437l7.427328 45.592367zM512 299.549852c-111.06712 0-201.109189 90.042069-201.109189 201.109189s90.042069 201.109189 201.109189 201.10919 201.109189-90.042069 201.109189-201.10919-90.042069-201.109189-201.109189-201.109189z m90.499135 291.608325A127.521509 127.521509 0 0 1 512 628.637616c-34.165709 0-66.274619-13.36919-90.499135-37.479439A127.521509 127.521509 0 0 1 384.021425 500.659041c0-34.165709 13.36919-66.274619 37.47944-90.499135C445.725381 385.93539 477.834291 372.680466 512 372.680466c34.165709 0 66.274619 13.254924 90.499135 37.47944A127.521509 127.521509 0 0 1 639.978575 500.659041c0 34.165709-13.36919 66.274619-37.47944 90.499136z'
                      p-id='2435'
                    ></path>
                  </svg>
                  <span>
                    {t('title', {
                      ns: 'settings',
                    })}
                  </span>
                </div>
              </saki-menu-item>
              {config.platform === 'Electron' ? (
                <>
                  <saki-menu-item padding='10px 18px' value={'OpenDevTools'}>
                    <div className='qv-h-r-u-item'>
                      <svg
                        className='icon'
                        viewBox='0 0 1025 1024'
                        version='1.1'
                        xmlns='http://www.w3.org/2000/svg'
                        p-id='7990'
                      >
                        <path
                          d='M293.0688 755.2c-12.0832 0-24.2688-4.2496-33.9968-12.9024L0 512l273.4592-243.0976C294.5536 250.2144 326.912 252.0064 345.7024 273.152c18.7904 21.1456 16.896 53.504-4.2496 72.2944L154.112 512l172.9536 153.7024c21.1456 18.7904 23.04 51.1488 4.2496 72.2944C321.2288 749.4144 307.1488 755.2 293.0688 755.2zM751.0528 755.0976 1024.512 512l-259.072-230.2976c-21.1456-18.7904-53.504-16.896-72.2432 4.2496-18.7904 21.1456-16.896 53.504 4.2496 72.2944L870.4 512l-187.3408 166.5024c-21.1456 18.7904-23.04 51.1488-4.2496 72.2944C688.896 762.2144 702.976 768 717.056 768 729.1392 768 741.3248 763.7504 751.0528 755.0976zM511.5392 827.648l102.4-614.4c4.6592-27.904-14.1824-54.272-42.0864-58.9312-28.0064-4.7104-54.3232 14.1824-58.88 42.0864l-102.4 614.4c-4.6592 27.904 14.1824 54.272 42.0864 58.9312C455.5264 870.1952 458.2912 870.4 461.1072 870.4 485.6832 870.4 507.392 852.6336 511.5392 827.648z'
                          p-id='7991'
                        ></path>
                      </svg>
                      <span>
                        {t('openDevtools', {
                          ns: 'common',
                        })}
                      </span>
                    </div>
                  </saki-menu-item>
                </>
              ) : (
                ''
              )}
              <saki-menu-item padding='10px 18px' value={'Quit'}>
                <div className='qv-h-r-u-item'>
                  <saki-icon
                    margin='0 6px 0 0'
                    color='#666'
                    type='Quit'
                  ></saki-icon>
                  <span>
                    {t('quit', {
                      ns: 'common',
                    }) +
                      ' ' +
                      t('appTitle', {
                        ns: 'common',
                      })}
                  </span>
                </div>
              </saki-menu-item>
              <saki-menu-item padding='10px 18px' value={'Restart'}>
                <div className='qv-h-r-u-item'>
                  <saki-icon
                    width='17px'
                    height='17px'
                    margin='0 6px 0 -1px'
                    color='#666'
                    type='Refresh'
                  ></saki-icon>
                  <span>
                    {t('restart', {
                      ns: 'common',
                    }) +
                      ' ' +
                      t('appTitle', {
                        ns: 'common',
                      })}
                  </span>
                </div>
              </saki-menu-item>
              <saki-menu-item
                border-top='1px solid #ccc'
                padding='10px 18px'
                value={'Path'}
              >
                <div className='qv-h-r-u-item'>
                  <svg
                    className='icon'
                    viewBox='0 0 1024 1024'
                    version='1.1'
                    xmlns='http://www.w3.org/2000/svg'
                    p-id='13351'
                  >
                    <path
                      d='M435.4 871.7c-6.6-0.8-12.4-5.1-15.1-11.2l-36.1-81.9c-14.4-32.6-46.2-53-81.2-53-3.2 0-6.5 0.2-9.8 0.5l-89 9.7c-6.6 0.7-13.2-2.1-17.2-7.5-17.7-23.5-32.6-49.2-44.1-76.2-2.7-6.2-1.9-13.4 2.1-18.7l52.9-72.3c23-31.4 23-73.6 0-105L145 383.8c-3.9-5.4-4.7-12.5-2.1-18.7 11.5-27 26.4-52.6 44.1-76.2 4-5.3 10.6-8.2 17.2-7.5l89 9.7c38.7 4.2 75.3-16.9 91-52.5l36.1-81.9c2.7-6.1 8.5-10.4 15.1-11.2 14.5-1.7 29.3-2.6 44.1-2.6 14.7 0 29.5 0.9 44.1 2.6 6.6 0.8 12.4 5.1 15.1 11.2l36.1 81.9c15.7 35.6 52.3 56.7 91 52.5l89-9.7c6.6-0.7 13.2 2.2 17.2 7.5 17.7 23.5 32.6 49.2 44.1 76.2 2.6 6.2 1.8 13.4-2.1 18.7l-53 72.1c-23 31.4-23 73.6 0 105l14.8 20.3h86.8l-45.1-61.6c-4.9-6.7-4.9-15.7 0-22.3l52.9-72.3c18.5-25.2 22.3-58.8 10-87.6-13.8-32.2-31.4-62.7-52.5-90.8-18.8-24.9-49.7-38.4-80.7-35l-89 9.7c-8.2 0.9-16-3.6-19.3-11.2l-36.1-81.9C590.2 99.6 563 79.5 532 75.8c-17.3-2.1-34.9-3.1-52.4-3.1s-35.1 1-52.4 3.1c-31.1 3.7-58.2 23.8-70.8 52.4l-36.1 81.9c-3.3 7.6-11.1 12.1-19.3 11.2l-89-9.7c-31-3.4-61.9 10-80.7 35-21.1 28.1-38.8 58.6-52.5 90.8-12.3 28.8-8.5 62.4 10 87.6l52.9 72.3c4.9 6.7 4.9 15.7 0 22.3l-52.9 72.3c-18.5 25.2-22.3 58.8-10 87.6 13.8 32.2 31.4 62.7 52.5 90.8 16.9 22.4 43.5 35.5 71.2 35.5 3.2 0 6.3-0.2 9.5-0.5l89-9.7c8.2-0.9 16 3.6 19.3 11.2l36.1 81.9c12.6 28.6 39.8 48.7 70.8 52.4 17.3 2.1 34.9 3.1 52.4 3.1 5.2 0 10.4-0.1 15.6-0.3V874c-5.2 0.2-10.4 0.3-15.6 0.3-14.9 0-29.7-0.9-44.2-2.6z'
                      p-id='13352'
                    ></path>
                    <path
                      d='M359.7 505c0-66.9 54.4-121.3 121.3-121.3S602.3 438.1 602.3 505c0 28.9-10.1 55.4-27 76.2h81.2c10.2-23.4 15.9-49.1 15.9-76.2 0-105.5-85.8-191.3-191.3-191.3-105.5 0-191.3 85.8-191.3 191.3 0 105.5 85.8 191.3 191.3 191.3 4.7 0 9.4-0.2 14.1-0.5v-70.3c-4.6 0.5-9.3 0.8-14.1 0.8-67 0-121.4-54.4-121.4-121.3z'
                      p-id='13353'
                    ></path>
                    <path
                      d='M923 636.6H586.5c-19.3 0-35 15.7-35 35s15.7 35 35 35H923c19.3 0 35-15.7 35-35s-15.7-35-35-35zM923 759H586.5c-19.3 0-35 15.7-35 35s15.7 35 35 35H923c19.3 0 35-15.7 35-35s-15.7-35-35-35zM923 881.5H586.5c-19.3 0-35 15.7-35 35s15.7 35 35 35H923c19.3 0 35-15.7 35-35 0-19.4-15.7-35-35-35z'
                      p-id='13354'
                    ></path>
                  </svg>
                  <span>
                    {t('title', {
                      ns: 'path',
                    })}
                  </span>
                </div>
              </saki-menu-item>

              <saki-menu-item padding='10px 18px' value={'TerminalCommand'}>
                <div className='qv-h-r-u-item'>
                  <saki-icon
                    margin='0 6px 0 0'
                    color='#666'
                    type='Terminal'
                  ></saki-icon>
                  <span>
                    {t('title', {
                      ns: 'terminalCommand',
                    })}
                  </span>
                </div>
              </saki-menu-item>
            </saki-menu>
          </div>
        </saki-dropdown>

        <saki-dropdown
          style={{
            display: user.isLogin ? 'block' : 'none',
          }}
          visible={openUserDropDownMenu}
          floating-direction='Left'
          ref={bindEvent({
            close: (e) => {
              setOpenUserDropDownMenu(false)
            },
          })}
        >
          <div
            onClick={() => {
              onSettings?.('Account')
              // setOpenUserDropDownMenu(!openUserDropDownMenu)
            }}
            className='qv-h-r-user'
          >
            <saki-avatar
              ref={bindEvent({
                tap: () => {
                  // onSettings?.()
                  // store.dispatch(userSlice.actions.logout({}))
                },
              })}
              className='qv-h-r-u-avatar'
              width='34px'
              height='34px'
              border-radius='50%'
              nickname={user.userInfo.nickname}
              src={user.userInfo.avatar}
              alt=''
            />
          </div>
          <div slot='main'>
            <saki-menu
              ref={bindEvent({
                selectvalue: async (e) => {
                  console.log(e.detail.value)
                  switch (e.detail.value) {
                    case 'Setting':
                      onSettings?.('')
                      break

                    default:
                      break
                  }
                  setOpenUserDropDownMenu(false)
                },
              })}
            >
              <saki-menu-item
                width='150px'
                padding='10px 18px'
                value={'Logout'}
              >
                <div className='qv-h-r-u-item'>
                  <svg
                    className='icon'
                    viewBox='0 0 1024 1024'
                    version='1.1'
                    xmlns='http://www.w3.org/2000/svg'
                    p-id='3480'
                  >
                    <path
                      d='M835.669333 554.666667h-473.173333A42.453333 42.453333 0 0 1 320 512a42.666667 42.666667 0 0 1 42.474667-42.666667h473.173333l-161.813333-161.834666a42.666667 42.666667 0 0 1 60.330666-60.330667l234.666667 234.666667a42.666667 42.666667 0 0 1 0 60.330666l-234.666667 234.666667a42.666667 42.666667 0 0 1-60.330666-60.330667L835.669333 554.666667zM554.666667 42.666667a42.666667 42.666667 0 1 1 0 85.333333H149.525333C137.578667 128 128 137.578667 128 149.482667v725.034666C128 886.4 137.6 896 149.525333 896H554.666667a42.666667 42.666667 0 1 1 0 85.333333H149.525333A106.816 106.816 0 0 1 42.666667 874.517333V149.482667A106.773333 106.773333 0 0 1 149.525333 42.666667H554.666667z'
                      fill=''
                      p-id='3481'
                    ></path>
                  </svg>
                  <span>
                    {t('logout', {
                      ns: 'common',
                    })}
                  </span>
                </div>
              </saki-menu-item>
            </saki-menu>
          </div>
        </saki-dropdown>
      </div>
    </div>
  )
}

export default HeaderComponent
