import {
	createSlice,
	createAsyncThunk,
	combineReducers,
	configureStore,
} from '@reduxjs/toolkit'
import exp from 'constants'
// import thunk from 'redux-thunk'
import { useDispatch } from 'react-redux'
import { storageMethods, storageSlice } from './storage'
import deviceToken, { slice as deviceTokenSlice } from './deviceToken'
import app, { slice as appSlice } from './app'
import backups, { slice as backupsSlice } from './backups'
import { configMethods, configSlice } from './config'
import { userMethods, userSlice } from './user'
import { apiMethods, apiSlice } from './api'
import { nsocketioMethods, nsocketioSlice } from './nsocketio'
import { ssoMethods, ssoSlice } from './sso'

export interface ActionParams<T = any> {
	type: string
	payload: T
}

const rootReducer = combineReducers({
	storage: storageSlice.reducer,
	config: configSlice.reducer,
	user: userSlice.reducer,
	api: apiSlice.reducer,
	nsocketio: nsocketioSlice.reducer,
	sso: ssoSlice.reducer,
	deviceToken: deviceToken.slice.reducer,
	backups: backups.slice.reducer,
	app: app.slice.reducer,
})

const store = configureStore({
	reducer: rootReducer,
	middleware: (getDefaultMiddleware) =>
		getDefaultMiddleware({
			serializableCheck: false,
		}),
})

export {
	userSlice,
	nsocketioSlice,
	storageSlice,
	configSlice,
	ssoSlice,
	deviceTokenSlice,
	backupsSlice,
	appSlice,
}
export const methods = {
	storage: storageMethods,
	config: configMethods,
	user: userMethods,
	api: apiMethods,
	nsocketio: nsocketioMethods,
	sso: ssoMethods,
	deviceToken: deviceToken.methods,
	backups: backups.methods,
	app: app.methods,
}

// console.log(store.getState())

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>()

export default store
