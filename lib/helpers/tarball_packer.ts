import { path, Sha1, Tar } from '../../deps.ts'
import { ignoreLinesToRegex, filterOverridenGitignores, sortFilter } from '../utils/filter.ts'
import { walk } from '../utils/file.ts'
import logger, { autospace } from '../utils/logger.ts'
import { IgnoreFilter, Manifest } from '../types.ts'
import { ImportMapFile } from './importmap_helper.ts'
import { buildImportSpecifiers, replaceImportPathOfScript } from '../resolvers/import_resolver.ts'
import { formatBytes } from '../utils/misc.ts'

const ENABLE_IMPORT_PATH_REPLACE = true

const FOLDERS_IGNORE = [
	// never allow version control folders
	'.git',
	'.hg',
	'.svn',
	'.vscode',
	'CVS',
	'node_modules',
]

const DEFAULT_IGNORE = ignoreLinesToRegex([
	...FOLDERS_IGNORE,

	// ignore cruft
	'.lock-wscript',
	'.wafpickle-{0..9}',
	'.npmrc',
	'.yarnrc',
	'.yarnrc.yml',
	'.yarnignore',
	'.npmignore',
	'.gitignore',
	'.DS_Store',
	'._*',
	'npm-debug.log',
	'yarn-error.log',
	'package-lock.json',
	'npm-shrinkwrap.json',
	'yarn.lock',
	'*.swp',
	'*.tgz',
	'*.zip',
	'*.rar',
	'*.7z'
])

const NEVER_IGNORE = ignoreLinesToRegex([
	// never ignore these files
	'!/pkg.json',
	'!/readme*',
	'!/+(license|licence)*',
	'!/+(changes|changelog|history)*',
])

export const packTarball = async (cwd: string, manifest: Manifest): Promise<[any, number, number]> => {
	const { main, importmap } = manifest

	let filters: IgnoreFilter[] = NEVER_IGNORE.slice().concat(DEFAULT_IGNORE)
	let importSpecifiers

	if (main) {
		filters = filters.concat(ignoreLinesToRegex(['!/' + main]))
	}

	if (importmap) {
		// filters = filters.concat(ignoreLinesToRegex([importmap]))

		// get import map data
		if (ENABLE_IMPORT_PATH_REPLACE) {
			const importMap = new ImportMapFile(importmap)

			await importMap.load()

			importSpecifiers = buildImportSpecifiers(importMap.data)
		}
	}

	const files = await walk(cwd, null, new Set(FOLDERS_IGNORE))

	const dotIgnoreFiles = filterOverridenGitignores(files)

	// create ignores
	for (const file of dotIgnoreFiles) {
		const raw = await Deno.readFile(file.absolute)
		const lines = new TextDecoder().decode(raw).split('\n')

		const regexes = ignoreLinesToRegex(lines, path.dirname(file.relative))
		filters = filters.concat(regexes)
	}

	// files to definitely keep, takes precedence over ignore filter
	const keepFiles: Set<string> = new Set()

	// files to definitely ignore
	const ignoredFiles: Set<string> = new Set()

	// list of files that didn't match any of our patterns, if a directory in the chain above was matched
	// then we should inherit it
	const possibleKeepFiles: Set<string> = new Set()

	// apply filters
	sortFilter(files, filters, keepFiles, possibleKeepFiles, ignoredFiles)

	const tar = new Tar()
	let unpackedSize = 0
	let fileCount = 0

	logger.info('Packaging...')

	// walk
	for (const name of keepFiles) {
		const { isDirectory, size } = await Deno.lstat(name)

		if (isDirectory || !size) {
			continue
		}

		logger.verbose(autospace(name, formatBytes(size)))

		let content = await Deno.readFile(name)

		if (size && importSpecifiers && /\.(js|ts)$/.test(name)) {
			try {
				content = replaceImportPathOfScript(content, importSpecifiers)
			}
			catch (e) {
				throw new Error(`Failed to pack: ${e.message} in ${name}`)
			}
		}

		await tar.append(`package/${name}`, {
			reader: new Deno.Buffer(content),
			contentSize: content.byteLength
		})

		unpackedSize += content.byteLength
		fileCount++
	}

	return [tar, unpackedSize, fileCount]
}

export const pack = async (manifest: Manifest, opts?: {
	cwd?: string
	filename?: string
	outputDir?: string | null
}) => {
	const {
		cwd = Deno.cwd(),
		filename = `${manifest.name}-v${manifest.version}.tgz`,
		outputDir
	} = opts || {}
	const path = outputDir || cwd
	const fileloc = `${path.endsWith('/') ? path : path + '/'}${filename}`
	const [tar, unpackedSize, fileCount] = await packTarball(cwd, manifest)
	const filebuf = await Deno.readAll(tar.getReader())
	const shasum = new Sha1().update(filebuf).hex()
	const packageSize = filebuf.byteLength

	await Deno.writeFile(fileloc, filebuf)

	return {
		filebuf,
		filename,
		fileloc,
		shasum,
		packageSize,
		unpackedSize,
		fileCount
	}
}
