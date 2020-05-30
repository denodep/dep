import { Command } from '../../deps.ts'
import logger from '../utils/logger.ts'
import { signOut } from '../helpers/account_helper.ts'
import { wrap } from '../lifecycles/hooks.ts'

export const action = async (command: Command) => {
	await signOut()

	logger.success('Cleared login credentials.')
}

export const command = new Command('logout')
	.description('Clear login credentials.')
	.action(wrap(action))
