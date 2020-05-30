import { minimatch, path } from '../../deps.ts'
import { IgnoreFilter, WalkFile } from '../types.ts'
import { removeSuffix } from './misc.ts'
import { RE_WHITESPACE } from '../constants.ts'

export const matchesFilter = (filter: IgnoreFilter, basename: string, loc: string): boolean => {
	let filterByBasename = true
	if (filter.base && filter.base !== '.') {
		loc = path.relative(filter.base, loc)
		filterByBasename = false
	}
	// the micromatch regex expects unix path separators
	loc = loc.replace(/\\/g, '/')

	return (
		filter.regex.test(loc) ||
		filter.regex.test(`/${loc}`) ||
		(filterByBasename && filter.regex.test(basename)) ||
		minimatch(loc, filter.pattern, null)
	)
}

export const sortFilter = (
	files: WalkFile[],
	filters: IgnoreFilter[],
	keepFiles: Set<string> = new Set(),
	possibleKeepFiles: Set<string> = new Set(),
	ignoreFiles: Set<string> = new Set()
) => {
	for (const file of files) {
		let keep = false

		// always keep a file if a ! pattern matches it
		for (const filter of filters) {
			if (filter.isNegation && matchesFilter(filter, file.basename, file.relative)) {
				keep = true
				break
			}
		}

		//
		if (keep) {
			keepFiles.add(file.relative)
			continue
		}

		// otherwise don't keep it if a pattern matches it
		keep = true
		for (const filter of filters) {
			if (!filter.isNegation && matchesFilter(filter, file.basename, file.relative)) {
				keep = false
				break
			}
		}

		if (keep) {
			possibleKeepFiles.add(file.relative)
		} else {
			ignoreFiles.add(file.relative)
		}
	}

	// exclude file
	for (const file of possibleKeepFiles) {
		const parts = path.dirname(file).split(path.sep)

		while (parts.length) {
			const folder = parts.join(path.sep)
			if (ignoreFiles.has(folder)) {
				ignoreFiles.add(file)
				break
			}
			parts.pop()
		}
	}

	//
	for (const file of possibleKeepFiles) {
		if (!ignoreFiles.has(file)) {
			keepFiles.add(file)
		}
	}

	//
	for (const file of keepFiles) {
		const parts = path.dirname(file).split(path.sep)

		while (parts.length) {
			// deregister this folder from being ignored, any files inside
			// will still be marked as ignored
			ignoreFiles.delete(parts.join(path.sep))
			parts.pop()
		}
	}

	return {
		ignoreFiles,
		keepFiles
	}
}

export const ignoreLinesToRegex = (lines: string[], base = '.'): IgnoreFilter[] => {
  return lines
		// create regex
		.map((line): any => {
			// remove empty lines, comments, etc
			if (line === '' || line === '!' || line[0] === '#' || RE_WHITESPACE.test(line)) {
				return null
			}

			let pattern = line
			let isNegation = false

			// hide the fact that it's a negation from minimatch since we'll handle this specifically
			// ourselves
			if (pattern[0] === '!') {
				isNegation = true
				pattern = pattern.slice(1)
			}

			// remove trailing slash
			pattern = removeSuffix(pattern, '/')

			const regex: RegExp = minimatch.makeRe(pattern.trim(), {dot: true, nocase: true})

			if (regex) {
				return {
					base,
					isNegation,
					pattern,
					regex
				}
			} else {
				return null
			}
	  })
	  .filter(Boolean)
}

export const filterOverridenGitignores = (files: WalkFile[]): WalkFile[] => {
	const IGNORE_FILENAMES = ['.depignore', '.yarnignore', '.npmignore', '.gitignore']
	const GITIGNORE_NAME = IGNORE_FILENAMES[2]

	return files.filter(file => IGNORE_FILENAMES.indexOf(file.basename) > -1).reduce((acc: WalkFile[], file) => {
		if (file.basename !== GITIGNORE_NAME) {
			return [...acc, file]
		} else {
			//don't include .gitignore if .npmignore or .yarnignore are present
			const dir = path.dirname(file.absolute)
			const higherPriorityIgnoreFilePaths = [path.join(dir, IGNORE_FILENAMES[0]), path.join(dir, IGNORE_FILENAMES[1])]
			const hasHigherPriorityFiles = files.find(
				file => higherPriorityIgnoreFilePaths.indexOf(path.normalize(file.absolute)) > -1,
			)
			if (!hasHigherPriorityFiles) {
				return [...acc, file]
			}
		}
		return acc
	}, [])
}
