import { Command, Ask } from '../../deps.ts'
import logger from '../utils/logger.ts'
import { state } from '../store.ts'
import { ManifestFile } from '../helpers/manifest_helper.ts'
import { MANIFEST_INIT_VERSION, MANIFEST_INIT_LICENSE } from '../constants.ts'
import { Manifest } from '../types.ts'
import { omitBy } from '../utils/misc.ts'
import { findAndReadImportMap } from '../helpers/importmap_helper.ts'
import { wrap } from '../lifecycles/hooks.ts'
import { validatePackageName, validatePackageVersion } from '../utils/validator.ts'

export const action = async (command: Command) => {
	const { cwd = Deno.cwd() } = state
	const manifest = new ManifestFile()
	const isExists = manifest.exists

	if (isExists) {
		await manifest.load()
	}

	const defaults: Manifest = manifest.data || {
		name: cwd.split('/').pop(),
		version: MANIFEST_INIT_VERSION,
		license: MANIFEST_INIT_LICENSE
	}
	const defRepository = defaults.repository && (typeof defaults.repository === 'string' ? defaults.repository : defaults.repository.url)
	const defAuthor = defaults.author && (typeof defaults.author === 'string' ? defaults.author : defaults.author.name)

	const ask = new Ask()

	const answers = await ask.prompt([{
		name: 'name',
		type: 'input',
		default: defaults.name,
		validate: validatePackageName
	}, {
		name: 'version',
		type: 'input',
		default: defaults.version,
		validate: validatePackageVersion
	}, {
		name: 'description',
		type: 'input',
		default: defaults.description
	}, {
		name: 'main',
		type: 'input',
		message: 'entry point',
		suffix: ':',
		default: defaults.main || 'mod.ts'
	}, {
		name: 'repository',
		type: 'input',
		message: 'repository url',
		suffix: ':',
		default: defRepository
	}, {
		name: 'author',
		type: 'input',
		default: defAuthor
	}, {
		name: 'license',
		type: 'input',
		default: defaults.license
	}])

	omitBy(answers, (val) => !val)

	if (isExists) {
		if (answers.repository && answers.repository === defRepository) {
			delete answers.repository
		}

		if (answers.author && answers.author === defAuthor) {
			delete answers.author
		}

		manifest.set(answers)
	}
	else {
		const importMap = await findAndReadImportMap(cwd)

		if (importMap) {
			answers.importmap = importMap[0]
		}

		manifest.create(answers)
	}

	await manifest.save()

	logger.success('Saved pkg.json')
}

export const command = new Command('init')
	.description('Interactively create a pkg.json file.')
	.action(wrap(action))
