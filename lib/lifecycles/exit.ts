import { store, state } from '../store.ts'
import logger from '../utils/logger.ts'
import { checkCli } from '../apis/cli.ts'
import { UPDATE_CHECK_DEBOUNCE } from '../constants.ts'

const CHECK_UPDATE_EXCLUDE_CMDS = ['start', 'pack']

const checkUpdate = async () => {
	const { lastUpdateCheck = 0 } = await store.toObject()
	let ret

	if (Date.now() - lastUpdateCheck < UPDATE_CHECK_DEBOUNCE) {
		logger.debug('check cli update passed')
		return
	}

	try {
		ret = await checkCli(lastUpdateCheck)
	}
	catch (e) {
		logger.verbose(`Cannot connect to the server: ${e.message}`)
	}

	if (!ret) {
		return
	}

	if (ret.latestVersion) {
		logger.warn(`Your current version of Dep is out of date. The latest version is ${ret.latestVersion}, while you're on ${state.dep?.version}.`)
	}

	if (ret.notice) {
		logger.info(ret.notice)
	}
}

export const exit = async (code: number) => {
	if (!code && (!state.subcmd || !CHECK_UPDATE_EXCLUDE_CMDS.includes(state.subcmd))) {
		await checkUpdate()
	}

	logger.debug(`exit ${code}`)
	Deno.exit(code)
}
