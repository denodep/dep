import { Package } from '../types.ts'
import { DENO_BASE_URL, STD_VERSION_CHECK_DEBOUNCE } from '../constants.ts'
import { getRepoContents } from '../apis/github.ts'
import { store } from '../store.ts'
import logger from '../utils/logger.ts'

export const getDenoStdRepoHTTPUrl = (pkg: Package) => {
	const { name, tag } = pkg

	return `${DENO_BASE_URL}/std${tag ? '@' + tag : ''}/${name}`
}

export const getDenoStdPackageUrlPrefix = (pkg: Package) => {
	return getDenoStdRepoHTTPUrl(pkg) + '/'
}

export const fetchVersionOfDenoStd = async (ref = 'master') => {
	const { stdLatestVersion, lastStdVersionCheck = 0 } = await store.toObject()

	if (stdLatestVersion && Date.now() - lastStdVersionCheck < STD_VERSION_CHECK_DEBOUNCE) {
		logger.debug('fetch std version passed')
		return stdLatestVersion
	}

	const { type, content, encoding } = await getRepoContents('denoland', 'deno', 'std/version.ts', ref) || {}

	if (type !== 'file' || encoding !== 'base64') {
		logger.warn('Failed to fetch deno std version')
		return null
	}

	const match = /VERSION\s*=\s*["']([0-9\.]+)["']/.exec(atob(content))
	const version = match && match[1]

	await store.set({
		stdLatestVersion: version || stdLatestVersion,
		lastStdVersionCheck: Date.now()
	})

	return version
}
