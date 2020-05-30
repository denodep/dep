import { state } from '../store.ts'
import { readJSONFile, writeJSONFile } from '../utils/file.ts'
import logger from '../utils/logger.ts'
import { ImportMap, Package } from '../types.ts'
import { MANIFEST_FILE_NAME, DEFAULT_IMPORTMAP_NAME } from '../constants.ts'

const readAndCheckImportMap = async (path: string, pass = false) => {
	let data

	try {
		data = await readJSONFile(path)
	}
	catch (e) {
		logger.verbose(`Read json: ${path}: ${e.message}`)
	}

	return data && (pass || data.imports && typeof data.imports === 'object') ? data : null
}

export const findAndReadImportMap = async (path: string): Promise<[string, any] | null> => {
	for await (const { name, isFile } of Deno.readDir(path)) {
		if (isFile && name !== MANIFEST_FILE_NAME && name.endsWith('.json')) {
			const data = await readAndCheckImportMap(`${path}/${name}`)

			if (data) {
				return [name, data]
			}
		}
	}

	return null
}

export class ImportMapFile {
	cwd: string
	fileName?: string
	data?: ImportMap

	constructor(fileName?: string) {
		this.cwd = state.cwd || Deno.cwd()
		this.fileName = fileName
	}

	get fileUrl() {
		return this.fileName && `${this.cwd}/${this.fileName}`
	}

	async load() {
		let name = this.fileName
		let data

		if (this.fileUrl) {
			data = await readAndCheckImportMap(this.fileUrl, true)
		}
		// find exist imports map file
		else {
			const exist = await findAndReadImportMap(this.cwd)

			if (exist) {
				[name, data] = exist
			}
		}

		data = data || {}
		data.imports = data.imports || {}

		this.data = data
		this.fileName = name || DEFAULT_IMPORTMAP_NAME
	}

	async save() {
		const { fileUrl, data } = this

		if (!fileUrl || !data) {
			return
		}

		await writeJSONFile(fileUrl, data)

		logger.debug('@importmap.save', fileUrl, data)
	}

	addPackage(pkgs: Package | Package[]) {
		if (!this.data) {
			return
		}

		if (!Array.isArray(pkgs)) {
			pkgs = [pkgs]
		}

		for (const { name, main, urlPrefix } of pkgs) {
			if (urlPrefix) {
				// if (main) {
				// 	this.data.imports[name] = urlPrefix + main
				// }

				this.data.imports[`${name}/`] = urlPrefix
			}
		}
	}

	removePackage(pkgNames: string | string[]) {
		if (!this.data) {
			return
		}

		for (const name of pkgNames) {
			const nameWithSlash = `${name}/`

			delete this.data.imports[name]
			delete this.data.imports[nameWithSlash]
		}
	}
}
