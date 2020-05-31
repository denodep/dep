import { Command } from '../../deps.ts'
import logger from '../utils/logger.ts'
import {  ManifestFile } from '../helpers/manifest_helper.ts'
import { ImportMapFile } from '../helpers/importmap_helper.ts'
import { wrap } from '../lifecycles/hooks.ts'

export const action = async (command: Command, args: string[]) => {
	if (!args || !args.length) {
		logger.error('Missing list of packages to remove.\n')
		command.help()
		Deno.exit(1)
	}

	const uniquePkgNameList = [...new Set(args)]
	const removedPkgLen = args.length - uniquePkgNameList.length

	if (removedPkgLen) {
		logger.warn(`Ignored duplicate packages (${removedPkgLen})`)
	}

	const manifest = new ManifestFile()
	const isExists = manifest.exists

	if (!isExists) {
		throw new Error('No pkg.json file found. Run `dep init` to create.')
	}

	await manifest.load()

	const importMap = new ImportMapFile(manifest.data?.importmap)

	await importMap.load()

	const removed = manifest.removeDependency(uniquePkgNameList)

	if (!removed.length) {
		return
	}

	importMap.removePackage(uniquePkgNameList)

	await manifest.save()
	await importMap.save()

	logger.success(`Removed ${removed.length} ${removed.length > 1 ? 'dependencies' : 'dependency'}`)
}

export const command = new Command('remove')
	.description('Remove a dependency.')
	.usage('[packages ...] [flags]')
	.action(wrap(action))
