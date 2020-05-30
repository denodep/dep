import { Command } from '../../deps.ts'
import logger from '../utils/logger.ts'
import { Package } from '../types.ts'
import { parsePackageName } from '../helpers/package_helper.ts'
import {  ManifestFile } from '../helpers/manifest_helper.ts'
import { ImportMapFile } from '../helpers/importmap_helper.ts'
import { execDenoCache } from '../utils/cmds.ts'
import Spinner from '../utils/spinner.ts'
import { wrap } from '../lifecycles/hooks.ts'

export const action = async (command: Command, args: string[]) => {
	if (!args || !args.length) {
		logger.error('Missing list of packages to add to your project.\n')
		command.help()
		Deno.exit(1)
	}

	const uniquePkgNameList = [...new Set(args)]
	const removedPkgLen = args.length - uniquePkgNameList.length
	const spinner = new Spinner()
	const pkgList: Package[] = []

	if (removedPkgLen) {
		logger.warn(`Ignored duplicate packages (${removedPkgLen})`)
	}

	logger.info('Resolving packages...')

	spinner.start()

	for (const name of uniquePkgNameList) {
		spinner.setText(name)
		pkgList.push(await parsePackageName(name))
	}

	spinner.stop()

	const manifest = new ManifestFile()
	const isExists = manifest.exists

	isExists ? await manifest.load() : manifest.create()

	const importMap = new ImportMapFile(manifest.data?.importmap)

	await importMap.load()

	const added = manifest.addDependency(pkgList)
	importMap.addPackage(pkgList)

	// set importmap in pkg.json
	if (!manifest.data?.importmap) {
		manifest.set('importmap', importMap.fileName)
	}

	await manifest.save()
	await importMap.save()

	if (!isExists) {
		logger.info(`pkg.json is automatically generated.`)
	}

	logger.success(`Added ${added.length} new ${added.length > 1 ? 'dependencies' : 'dependency'}`)

	// cache all new dependencies
	if (command.cache) {
		try {
			await execDenoCache(pkgList)
		}
		catch (e) {
			logger.warn(`Failed to cache: ${e.message}`)
		}
	}
}

export const command = new Command('add')
	.description('Add a package dependency.')
	.usage('[packages ...] [flags]')
	.option('--no-cache', 'add dependencies without automatic caching')
	.action(wrap(action))
