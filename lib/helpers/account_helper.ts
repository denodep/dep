import * as api from '../apis/account.ts'
import { store } from '../store.ts'
import logger from '../utils/logger.ts'

const calcExpires = (expiresIn: number) => {
	return expiresIn && Date.now() + (expiresIn - 300) * 1000
}

const setPreSignData = async (data: any) => {
	const { username, preAccessToken } = data

	await store.delete(['accessToken', 'refreshToken', 'expires'])

	if (username && preAccessToken) {
		await store.set({
			username,
			preAccessToken
		})
	}
}

const initiateAuth = async (fn: () => any) => {
	let ret

	try {
		ret = await fn()
	}
	catch (e) {
		if (e.data) {
			await setPreSignData(e.data)
		}

		throw e
	}

	const { username, accessToken, expiresIn, refreshToken } = ret

	await store.delete('preAccessToken')

	await store.set({
		username,
		accessToken,
		expires: calcExpires(expiresIn),
		refreshToken
	})
}

export const signIn = async (body: any) => {
	await initiateAuth(() => api.signIn(body))
}

export const signUp = async (body: any) => {
	await setPreSignData(await api.signUp(body))
}

export const signOut = async () => {
	const accessToken = await store.get('accessToken')

	if (accessToken) {
		try {
			await api.signOut()
		} catch (e) {
			logger.debug('Sign out without server.')
		}
	}

	await store.delete(['username', 'preAccessToken', 'accessToken', 'refreshToken', 'expires'])
}

export const checkAndRefreshToken = async () => {
	const { refreshToken, expires } = await store.toObject()

	if (expires > Date.now()) {
		return
	}

	const { accessToken, expiresIn } = await api.refreshToken(refreshToken)

	await store.set({
		accessToken,
		expires: calcExpires(expiresIn)
	})
}

export const syncConfirmation = async () => {
	await initiateAuth(api.syncConfirmation)
}
