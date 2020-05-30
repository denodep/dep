import { requestDep } from '../utils/request.ts'

export const signIn = async (body: any) => {
	const res = await requestDep({
		method: 'POST',
		url: `/signin`,
		body
	})

	return res?.json()
}

export const signUp = async (body: any) => {
	const res = await requestDep({
		method: 'POST',
		url: `/signup`,
		body
	})

	return res?.json()
}

export const signOut = async () => {
	await requestDep({
		method: 'POST',
		url: `/signout`
	})
}

export const refreshToken = async (refreshToken: string) => {
	const res = await requestDep({
		url: `/refreshToken`,
		query: {
			token: refreshToken
		}
	})

	return res?.json()
}

export const syncConfirmation = async () => {
	const res = await requestDep({
		url: `/confirmation`
	})

	return res?.json()
}
