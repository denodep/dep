import { Store } from '../deps.ts'

export const store = new Store({
	name: '.depcache',
	path: Deno.dir('home') || import.meta.url.replace(/^file:\/\//, '').replace(/lib\/store\.ts$/, '')
})
export const state: {
	dep?: {
		name: string
		version: string
	},
	cwd?: string
	subcmd?: string
} = {}
