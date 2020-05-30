import { Command } from '../../deps.ts'
import logger from '../utils/logger.ts'
import { exit } from './exit.ts'

export const wrap = (action: any) => {
	return async (cmd: Command, args: string[]) => {
		let exitCode = 0

		try {
			await action(cmd, args)
		}
		catch (e) {
			logger.error(e.message)
			exitCode = 1
		}

		await exit(exitCode)
	}
}
