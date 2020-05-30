import { path } from '../../deps.ts'
import { WalkFile } from '../types.ts'

export const readJSONFile = async (path: string) => {
	return JSON.parse(new TextDecoder().decode(await Deno.readFile(path)))
}

export const writeJSONFile = async (path: string, data: any) => {
	return await Deno.writeFile(path, new TextEncoder().encode(JSON.stringify(data, null, 2)))
}

export const walk = async (dir: string, relativeDir?: string | null, ignoreBasenames = new Set()): Promise<WalkFile[]> => {
	const hasIgnore = ignoreBasenames.size
	let files: WalkFile[] = []

	for await (const { name, isDirectory } of Deno.readDir(dir)) {
		if (hasIgnore && ignoreBasenames.has(name)) {
			continue
		}

		const relative = relativeDir ? path.join(relativeDir, name) : name
		const loc = path.join(dir, name)

		files.push({
			relative,
			basename: name,
			absolute: loc
		})

		if (isDirectory) {
			files = files.concat(await walk(loc, relative, ignoreBasenames))
		}
	}

	return files
}
