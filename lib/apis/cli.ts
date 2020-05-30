import { requestDep } from '../utils/request.ts'
import { store } from '../store.ts'

export const checkCli = async (lastUpdateCheck: number): Promise<any> => {
	return new Promise((resolve, reject) => {
		let pending = false

		requestDep({
			url: '/cli/check',
			query: lastUpdateCheck ? { lastUpdateCheck } : { initial: 1 }
		})
			.then(async (res) => {
				pending = true
				await store.set('lastUpdateCheck', Date.now())
				resolve(await res?.json())
			})
			.catch((e) => {
				reject(e)
			})

		setTimeout(() => !pending && reject(new Error('interrupted')), 3000)
	})
}
