import { Store } from '../deps.ts'

export const store = new Store({
	name: '.depcache',
	path: Deno.dir('home') || Deno.dir('cache') || '.dep'
})
export const state: {
	dep?: {
		name: string
		version: string
	},
	cwd?: string
	subcmd?: string
} = {}
