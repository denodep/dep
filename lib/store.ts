import { Store } from '../deps.ts'

const getCachePath = () => {
	const dirhome = Deno.env.get('HOME')
	const dircache = !dirhome && Deno.env.get('XDG_CACHE_HOME') || Deno.env.get('LOCALAPPDATA')

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
