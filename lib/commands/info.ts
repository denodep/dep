import { Command } from '../../deps.ts'
import logger from '../utils/logger.ts'
import { wrap } from '../lifecycles/hooks.ts'
import { getPackageDetails } from '../apis/pkg.ts'

export const action = async (command: Command, args: any[]) => {
	let data

	try {
		data = await getPackageDetails(args[0])
	}
	catch (e) {
		throw new Error('Package not found.')
	}

	console.info(data)
	logger.success(`Fetched \x1b[34;1m${data.name}\x1b[0;35;3m@${data.version}.`)
}

export const command = new Command('info')
	.description('Show information about a package.')
	.action(wrap(action))
