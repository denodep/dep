const DEFAULT_SPINNER_CHARS = '⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏'
const DEFAULT_INTERVAL = 60

export default class Spinner {
	stdout: typeof Deno.stdout
	id?: number | null
	interval: number
	frames: string[]
	text: string
	current = 0

	constructor(stdout?: typeof Deno.stdout, chars?: string, interval?: number) {
		this.stdout = stdout || Deno.stdout
		this.interval = interval || DEFAULT_INTERVAL
		this.frames = (chars || DEFAULT_SPINNER_CHARS).split('')
		this.text = ''
	}

	setText(text: string) {
		this.text = text
	}

	start() {
		this.current = 0
		this.render()
	}

	stop() {
		if (this.id) {
			clearTimeout(this.id)
			this.id = null
		}

		this.clearLine()
	}

	clearLine(replacedMsg = '') {
		Deno.stdout.writeSync(new TextEncoder().encode('\x1b[2K\r' + replacedMsg))
	}

	render() {
		if (this.id) {
			clearTimeout(this.id)
		}

		this.clearLine(`${this.frames[this.current]} ${this.text}`)
		this.current = ++this.current % this.frames.length
		this.id = setTimeout(() => this.render(), this.interval)
	}
}
