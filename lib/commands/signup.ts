import { Command, Ask } from '../../deps.ts'
import logger from '../utils/logger.ts'
import Spinner from '../utils/spinner.ts'
import { isEmpty, validateUsername, validateEmail, validatePassword } from '../utils/validator.ts'
import { signUp } from '../helpers/account_helper.ts'
import { wrap } from '../lifecycles/hooks.ts'

const execSignupAsk = async (ask: Ask): Promise<any> => {
	const answers = await ask.prompt([{
		name: 'username',
		type: 'input',
		validate: (val) => {
			if (isEmpty(val)) {
				throw new Error('Username is required')
			}
			return validateUsername(val)
		}
	}, {
		name: 'email',
		type: 'input',
		validate: (val) => {
			if (isEmpty(val)) {
				throw new Error('Email is required')
			}
			return validateEmail(val)
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

	return answers
}

export const action = async (command: Command) => {
	const spinner = new Spinner()
	const ask = new Ask()

	const data = await execSignupAsk(ask)

	spinner.setText('registering...')
	spinner.start()

	try {
		await signUp(data)
	}
	catch (e) {
		throw new Error(`Failed to signup: ${e.message}`)
	}

	spinner.stop()

	logger.success('Registration complete.')
	logger.info(`We've send a verification email to ${data.email}, please check your inbox and verify your email address.`)
}

export const command = new Command('signup')
	.description('Sign up for a depjs.com account.')
	.action(wrap(action))
