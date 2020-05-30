import { Command } from '../../deps.ts'
import { ManifestFile } from '../helpers/manifest_helper.ts'
import { execDenoRun } from '../utils/cmds.ts'
import { wrap } from '../lifecycles/hooks.ts'

export const action = async (command: Command, args: string[]) => {
	const specifiedFile = args && args[0]
	const manifest = new ManifestFile()
	const isExists = manifest.exists

	if (!isExists) {
		throw new Error('No pkg.json file found. Run `dep init` to create.')
	}

	await manifest.load()

	if (!manifest.data) {
		throw new Error('Malformed pkg.json file.')
	}
	else if (!specifiedFile && !manifest.data.main) {
		throw new Error('Entry file is not provided.')
	}

	await execDenoRun(manifest.data, specifiedFile)
}

export const command = new Command('start')
	.description('Start a deno program with automatically generated flags.')
	.usage('[file]')
	.action(wrap(action))
