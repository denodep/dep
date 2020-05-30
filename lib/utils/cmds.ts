import { exec } from '../../deps.ts'
import logger from './logger.ts'
import { Package, Manifest } from '../types.ts'
import { UNSTABLE_FLAGS } from '../constants.ts'

const execute = (cmd: string) => {
	logger.debug(`exec: ${cmd}`)
	return exec(cmd)
}

export const execDenoCache = async (pkgs: Package[]) => {
	const urls = pkgs
		.filter(({main}) => !!main)
		.map(({main, urlPrefix}) => `${urlPrefix}${main}`)

	return urls.length && await execute(`deno cache ${urls.join(' ')}`)
}

export const execDenoRun = async (manifest: Manifest, file?: string) => {
	const { importmap, permissions, main } = manifest
	const flagList: string[] = []
	let flagMap = {
		...permissions
	}
	let isUnstable = false

	file = file || main

	if (flagMap.all) {
		flagMap = {
			all: flagMap.all
		}
	}

	for (const key in flagMap) {
		const scopes = flagMap[key]

		if (!scopes) {
			continue
		}

		if (!isUnstable && UNSTABLE_FLAGS.includes(key)) {
			isUnstable = true
		}

		const val = Array.isArray(scopes) ? scopes.join(',') : (typeof scopes === 'string' ? scopes : '')

		flagList.push(`--allow-${key}` + (val ? '=' + val : ''))
	}

	if (importmap) {
		flagList.push(`--importmap=${importmap}`)
		isUnstable = true
	}

	if (isUnstable) {
		flagList.push('--unstable')
	}

	const cmd = `deno run ${flagList.join(' ')} ${file}`
	const process = Deno.run({
		cmd: cmd.split(' '),
		stdout: 'inherit'
	})

	logger.info(cmd)

	await process.status()

	process.close()
	return process
}
