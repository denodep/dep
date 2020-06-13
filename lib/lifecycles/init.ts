import { store, state } from '../store.ts'
import { getDeviceInfo } from '../utils/device.ts'

// cannot import pkg.json directly, deno removed support for JSON imports #5037
// https://github.com/denoland/deno/pull/5037
const getDepVersion = () => {
	const importUrl = import.meta.url
	const match = /\/dep\@(?:v?)([0-9]+[0-9a-z\-\.]+)\//.exec(importUrl)

	if (match) {
		return match[1]
	}
	else if (importUrl.startsWith('file://')) {
		const pkgUrl = importUrl.replace(/^file:\/\//, '').replace(/lib\/lifecycles\/init\.ts$/, '') + 'pkg.json'
		const pkg = JSON.parse(new TextDecoder().decode(Deno.readFileSync(pkgUrl)))
		return pkg.version
	}

	return 'unknown'
}

const getSubCommand = () => {
	for (const cmd of Deno.args) {
		if (/^[a-z]+/.test(cmd)) {
			return cmd
		}
	}
}

export const init = async () => {
	const dep = {
		name: 'dep',
		version: getDepVersion()
	}
	const subcmd = getSubCommand()
	const cwd = Deno.cwd()
	let { udid, fpi } = await store.toObject()

	if (!udid || !fpi) {
		[udid, fpi] = await getDeviceInfo()

		await store.set({
			udid,
			fpi
		})
	}

	state.cwd = cwd
	state.subcmd = subcmd
	state.dep = dep

	return dep
}
