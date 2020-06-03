import { Command } from '../../deps.ts'
import logger from '../utils/logger.ts'
import { wrap } from '../lifecycles/hooks.ts'
import { store } from '../store.ts'

export const action = async (command: Command) => {
	const username = await store.get('username')

	if (username) {
		logger.info(username)
	}
	else {
		logger.warn('This command requires you to be logged in.')
	}
}

export const command = new Command('whoami')
	.description('Print the dep username.')
	.action(wrap(action))
