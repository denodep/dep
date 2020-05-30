import { store, state } from '../store.ts'
import { getDeviceInfo } from '../utils/device.ts'

const getSubCommand = () => {
	for (const cmd of Deno.args) {
		if (/^[a-z]+/.test(cmd)) {
			return cmd
		}
	}
}

export const init = async (pkg: {
	name: string
	version: string
}) => {
	const { name, version } = pkg
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
	state.dep = {
		name,
		version
	}
}
