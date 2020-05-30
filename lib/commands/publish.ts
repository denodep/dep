import { Command, Ask } from '../../deps.ts'
import logger from '../utils/logger.ts'
import Spinner from '../utils/spinner.ts'
import { ManifestFile } from '../helpers/manifest_helper.ts'
import { pack } from '../helpers/tarball_packer.ts'
import { store } from '../store.ts'
import { PACKAGE_SIZE_LIMIT } from '../constants.ts'
import { getHashByPackageName } from '../helpers/package_helper.ts'
import { publishPreCheck, publishPackage } from '../apis/pkg.ts'
import { validatePackageName, validatePackageVersion, validatePackageTag } from '../utils/validator.ts'
import { wrap } from '../lifecycles/hooks.ts'
import { syncConfirmation, checkAndRefreshToken } from '../helpers/account_helper.ts'

const publishAbortHook = async (fileloc: string, msg: string) => {
	await Deno.remove(fileloc)
	throw new Error(msg)
}

export const action = async (command: Command) => {
	const { accessToken, preAccessToken } = await store.toObject()
	const spinner = new Spinner()

	spinner.start()
	spinner.setText('Preparing...')

	if (!accessToken) {
		if (preAccessToken) {
			spinner.setText('Checking account confirmation...')
			await syncConfirmation()
		}
		else {
			throw new Error('Login required. Run `dep login` to login or `dep signup` to create a depjs.com account.')
		}
	}

	await checkAndRefreshToken()

	spinner.stop()

	const ask = new Ask()
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

	if (!manifest.data.main) {
		const { confirm } = await ask.confirm({
			name: 'confirm',
			message: `You didn't specify the entry point (\`main\`) in pkg.json. Are you sure you want to publish this package without entry?`,
			default: 'n'
		})

		if (!confirm) {
			return
		}
	}
	// check entry exists
	else {
		try {
			await Deno.lstat(manifest.data.main)
		}
		catch (e) {
			throw new Error(`Entry file (${manifest.data.main}) does not exists, please check "main" in your pkg.json.`)
		}
	}

	const tag = command.tag || 'latest'
	const { name, version } = manifest.data

	// local check
	validatePackageName(name)
	validatePackageVersion(version)
	validatePackageTag(tag)

	// pack
	const {
		filebuf,
		filename,
		fileloc,
		shasum,
		packageSize,
		unpackedSize,
		fileCount
	} = await pack(manifest.data, {
		cwd: command.cwd,
		outputDir: Deno.dir('tmp')
	})

	logger.verbose(`Wrote tarball to "${fileloc}".`)

	if (packageSize > PACKAGE_SIZE_LIMIT) {
		await publishAbortHook(fileloc, `Package size exceeds upload limit (${PACKAGE_SIZE_LIMIT / 1024 / 1024}M).`)
	}

	const body = {
		id: getHashByPackageName(name),
		name,
		version,
		tag,
		shasum
	}

	// pre-check
	let preCheckRet

	try {
		preCheckRet = await publishPreCheck(body)
	}
	catch (e) {
		await publishAbortHook(fileloc, `Pre-check failed: ${e.message}`)
	}

	const { sign, timestamp, initial } = preCheckRet

	Object.assign(body, {
		sign,
		timestamp,
		initial,
		dist: {
			packageSize,
			unpackedSize,
			fileCount
		},
		manifest: manifest.data
	})

	// publish
	try {
		await publishPackage(body, filebuf, filename)
	}
	catch (e) {
		await publishAbortHook(fileloc, `Publish failed: ${e.message}`)
	}

	// remove archive file
	await Deno.remove(fileloc)

	logger.success(`Published \x1b[34;1m${name}\x1b[0;35;3m@${version}.`)
}

export const command = new Command('publish')
	.description('Publish a package to depjs.com.')
	.option('--tag [tag]', 'version tag')
	.action(wrap(action))
