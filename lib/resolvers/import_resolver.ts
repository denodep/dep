import { ImportMap } from '../types.ts'
import logger from '../utils/logger.ts'
import { RE_WHITESPACE } from '../constants.ts'

const RE_REMOTE_PATH = /^http(s)?\:\/\//
const RE_LOCAL_FILE_PATH = /^file\:\/\//
const RE_IMPORT_EXPORT = /(?:import|export)\s+(?:[0-9a-zA-Z_\{\}\*\,\s]+from\s+)?(['"])([0-9a-z_]\S+)['"]/
const RE_DYNAMIC_IMPORT = /import\((['"])([0-9a-z_]\S+)['"]\)/
const RE_FROM_PATH = /\s+from\s+(['"])([0-9a-z_]\S+)['"]/
const RE_SINGLE_LINE_COMMENT = /^\s*\/\//
const RE_MULTIPLE_LINE_COMMENT_START = /^\s*\/\*/
const RE_MULTIPLE_LINE_COMMENT_END = /\*\/\s*$/

type ImportSpecifiers = [string[], string[]]

export const buildImportSpecifiers = (importmap?: ImportMap): ImportSpecifiers | null => {
	const keys = importmap && importmap.imports && Object.keys(importmap.imports)

	if (!keys || !keys.length) {
		return null
	}

	// @ts-ignore
	const urlPrefixs = keys.map((key) => importmap.imports[key])

	return [keys, urlPrefixs]
}

const validateAndResolveImportPath = (path: string, specs: ImportSpecifiers) => {
	if (RE_LOCAL_FILE_PATH.test(path)) {
		throw new Error(`Local file import path is not acceptable "${path}"`)
	}
	else if (RE_REMOTE_PATH.test(path)) {
		logger.verbose(` - Skip remote import path "${path}"`)
		return
	}
	else {
		const [bases, urlPrefixs] = specs

		for (let i = 0, len = bases.length; i < len; i++) {
			const base = bases[i]

			if (path.indexOf(base) === 0) {
				const newPath = path.replace(base, urlPrefixs[i])

				logger.verbose(` - Replace import path "${path}" with "${newPath}"`)
				return newPath
			}
		}

		throw new Error(`Unresolved import path "${path}"`)
	}
}

export const replaceImportPathOfScript = (content: Uint8Array, specs: ImportSpecifiers) => {
	const lines = new TextDecoder().decode(content).split('\n')
	let changed = false
	let commenting = false
	let pending = false

	for (let i = 0, len = lines.length; i < len; i++) {
		const line = lines[i]

		// skip if empty
		if (!line || RE_WHITESPACE.test(line)) {
			continue
		}

		const isCommetStart = RE_MULTIPLE_LINE_COMMENT_START.test(line)
		const isCommetEnd = RE_MULTIPLE_LINE_COMMENT_END.test(line)

		// skip if comment
		if (commenting || isCommetStart || isCommetEnd || RE_SINGLE_LINE_COMMENT.test(line)) {
			commenting = isCommetStart && !isCommetEnd
			continue
		}
		// skip if not include `import` keyword
		else if (!pending && !line.includes('import')) {
			continue
		}

		let matchResult = RE_IMPORT_EXPORT.exec(line) || RE_DYNAMIC_IMPORT.exec(line)

		if (!matchResult) {
			if (pending) {
				matchResult = RE_FROM_PATH.exec(line)
			}
			else {
				pending = true
			}
		}

		if (matchResult) {
			const [_, quote, path] = matchResult
			const newPath = validateAndResolveImportPath(path, specs)

			if (newPath) {
				lines.splice(i, 1, line.replace(quote + path, quote + newPath))
				changed = true
			}

			pending = false
		}
	}

	return changed ? new TextEncoder().encode(lines.join('\n')) : content
}
