import { Store } from '../deps.ts'

const getCachePath = () => {
	const dirhome = Deno.dir('home')
	const dircache = !dirhome && Deno.dir('cache')

	if (dirhome) {
		return dirhome
	}
	else if (dircache) {
		return `${dircache}/deno-dep`
	}
	else {
		return '.dep'
	}
}

export const store = new Store({
	name: '.depcache',
	path: getCachePath()
})
export const state: {
	dep?: {
		name: string
		version: string
	},
	cwd?: string
	subcmd?: string
} = {}
