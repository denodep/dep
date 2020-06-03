import { Command } from '../deps.ts'
import { init } from './lifecycles/init.ts'
import { command as addCmd} from './commands/add.ts'
import { command as removeCmd} from './commands/remove.ts'
import { command as initCmd} from './commands/init.ts'
import { command as infoCmd} from './commands/info.ts'
import { command as signupCmd} from './commands/signup.ts'
import { command as loginCmd} from './commands/login.ts'
import { command as logoutCmd} from './commands/logout.ts'
import { command as packCmd} from './commands/pack.ts'
import { command as publishCmd} from './commands/publish.ts'
import { command as startCmd} from './commands/start.ts'
import { command as whoamiCmd} from './commands/whoami.ts'

// cannot import pkg.json directly, deno removed support for JSON imports #5037
// https://github.com/denoland/deno/pull/5037
const pkgUrl = import.meta.url.replace(/^file:\/\//, '').replace(/lib\/cli\.ts$/, '') + 'pkg.json'
const pkg = JSON.parse(new TextDecoder().decode(Deno.readFileSync(pkgUrl)))
const program = new Command(pkg.name)

await init(pkg)

// set global options
program
	.version(pkg.version, '-v, --version')
	.usage('[command] [flags]')
	.option('--cwd <cwd>', `working directory to use (default: ${Deno.cwd()})`)
	.option('--verbose', 'output verbose messages on internal operations')
	.option('--debug', 'output debugging messages')

	// add sub commands
	.addCommand(addCmd)
	.addCommand(removeCmd)
	.addCommand(initCmd)
	.addCommand(infoCmd)
	.addCommand(signupCmd)
	.addCommand(loginCmd)
	.addCommand(logoutCmd)
	.addCommand(packCmd, { hidden: true })
	.addCommand(publishCmd)
	.addCommand(startCmd)
	.addCommand(whoamiCmd)

	// parse args
	.parse(Deno.args)
