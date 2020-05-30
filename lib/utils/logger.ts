const enum LoggerLevel {
	DEBUG = 0,
	VERBOSE,
	INFO,
	SUCCESS,
	WARN,
	ERROR
}

const LEVEL_NAME_MAP = {
	[LoggerLevel.DEBUG]: 'debug',
	[LoggerLevel.VERBOSE]: 'verbose',
	[LoggerLevel.INFO]: 'info',
	[LoggerLevel.SUCCESS]: 'success',
	[LoggerLevel.WARN]: 'warning',
	[LoggerLevel.ERROR]: 'error'
}

const LEVEL_COLOR_MAP = {
	[LoggerLevel.DEBUG]: '93m',
	[LoggerLevel.VERBOSE]: '37m',
	[LoggerLevel.INFO]: '34m',
	[LoggerLevel.SUCCESS]: '32m',
	[LoggerLevel.WARN]: '33m',
	[LoggerLevel.ERROR]: '31;1m'
}

class Logger {
	isDebugging: boolean
	isVerbose: boolean

	constructor(opts: {
		verbose?: boolean
		debug?: boolean
	}) {
		this.isDebugging = !!opts.debug
		this.isVerbose = !!opts.verbose
	}

	private log(level: LoggerLevel, msg: string) {
		this.print(`\x1b[${LEVEL_COLOR_MAP[level]}${LEVEL_NAME_MAP[level]}\x1b[0m ${msg}\n`)
	}

	print(msg: string) {
		Deno.stdout.writeSync(new TextEncoder().encode(msg + ''))
	}

	// levels below
	debug(...args: any) {
		if (this.isDebugging) {
			this.log(LoggerLevel.DEBUG, args.map((a: any) => typeof a === 'string' ? a : JSON.stringify(a, null, 2)).join('\n'))
		}
	}

	verbose(msg: string) {
		if (this.isVerbose) {
			this.log(LoggerLevel.VERBOSE, msg)
		}
	}

	info(msg: string) {
		this.log(LoggerLevel.INFO, msg)
	}

	success(msg: string) {
		this.log(LoggerLevel.SUCCESS, msg)
	}

	warn(msg: string) {
		this.log(LoggerLevel.WARN, msg)
	}

	error(msg: string) {
		this.log(LoggerLevel.ERROR, msg)
	}
}

const logger = new Logger({
	debug: Deno.args.includes('--debug'),
	verbose: Deno.args.includes('--verbose')
})

export const autospace = (label: string, value: string, columns = 50) => {
	const spaces = columns - label.length
	return `${label}${' '.repeat(spaces > 0 ? spaces : 1)}${value}`
}

export default logger
