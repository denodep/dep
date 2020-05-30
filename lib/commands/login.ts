import { Command, Ask } from '../../deps.ts'
import logger from '../utils/logger.ts'
import Spinner from '../utils/spinner.ts'
import { isEmpty, validateUsername, validateEmail, validatePassword } from '../utils/validator.ts'
import { signIn } from '../helpers/account_helper.ts'
import { wrap } from '../lifecycles/hooks.ts'

const execLoginAsk = async (ask: Ask): Promise<any> => {
	const { username, password } = await ask.prompt([{
		name: 'username',
		// message: 'username (or email)',
		suffix: ':',
		type: 'input',
		validate: async (val) => {
			if (isEmpty(val)) {
				throw new Error('Username is required')
			}
			return val.split('@').length === 2 ? validateEmail(val) : validateUsername(val.toLowerCase())
		}
	}, {
		name: 'password',
		type: 'input',
		validate: (val) => {
			if (isEmpty(val)) {
				throw new Error('Password is required')
			}
			return validatePassword(val)
		}
	}])

	return {
		username: username.toLowerCase(),
		password
	}
}

export const action = async (command: Command) => {
	const spinner = new Spinner()
	const ask = new Ask()

	const data = await execLoginAsk(ask)

	spinner.setText('logging in...')
	spinner.start()

	try {
		await signIn(data)
	}
	catch (e) {
		throw new Error(`Failed to login: ${e.message}`)
	}

	spinner.stop()

	logger.success('Logged in.')
}

export const command = new Command('login')
	.description('Log in to depjs.com.')
	.action(wrap(action))
