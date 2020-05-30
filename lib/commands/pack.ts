import { Command } from '../../deps.ts'
import logger from '../utils/logger.ts'
import { ManifestFile } from '../helpers/manifest_helper.ts'
import { pack } from '../helpers/tarball_packer.ts'
import { wrap } from '../lifecycles/hooks.ts'

export const action = async (command: Command) => {
	const manifest = new ManifestFile()
	const isExists = manifest.exists

	if (!isExists) {
		throw new Error('No pkg.json file found. Run `dep init` to create.')
	}

	await manifest.load()

	if (!manifest.data) {
		throw new Error('Malformed pkg.json file.')
	}

	if (!manifest.data.name) {
		throw new Error(`pkg.json doesn't have a name.`)
	}

	if (!manifest.data.version) {
		throw new Error(`pkg.json doesn't have a version.`)
	}

	const { fileloc } = await pack(manifest.data, {
		cwd: command.cwd,
		filename: command.filename
	})

	logger.success(`Wrote tarball to "${fileloc}".`)
}

export const command = new Command('pack')
	.description('Create a compressed gzip archive of package.')
	.option('-f, --filename <filename>', 'filename')
	.action(wrap(action))
