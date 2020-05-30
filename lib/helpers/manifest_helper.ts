import { Manifest, Package, PermissionMap, PermissionSetMap } from '../types.ts'
import { state } from '../store.ts'
import { readJSONFile, writeJSONFile } from '../utils/file.ts'
import logger from '../utils/logger.ts'
import { MANIFEST_FILE_NAME } from '../constants.ts'

const buildPermissionSetMap = (permissions?: PermissionMap) => {
	const map: PermissionSetMap = {}

	if (!permissions || !permissions.length) {
		return map
	}

	for (const key in permissions) {
		const val = permissions[key]
		const iter = Array.isArray(val) ? val : (typeof val === 'string' ? [val] : undefined)

		if (val) {
			map[key] = new Set(iter)
		}
	}

	return map
}

const convertPermissionSetMap = (setMap?: PermissionSetMap): PermissionMap | undefined => {
	if (!setMap || !Object.keys(setMap).length) {
		return
	}

	const map: PermissionMap = {}
	const sortedKeys = Object.keys(setMap).sort()

	for (const key of sortedKeys) {
		map[key] = setMap[key].size ? [...setMap[key]] : true
	}

	return Object.keys(map).length ? map : undefined
}

export class ManifestFile {
	cwd: string
	exists: boolean
	data?: Manifest
	permissionSetMap?: PermissionSetMap

	constructor() {
		this.cwd = state.cwd || Deno.cwd()
		this.exists = this.checkExists()
	}

	get fileUrl() {
		return `${this.cwd}/${MANIFEST_FILE_NAME}`
	}

	private checkExists() {
		for (const { name, isFile } of Deno.readDirSync(this.cwd)) {
			if (isFile && name === MANIFEST_FILE_NAME) {
				return true
			}
		}

		return false
	}

	async load() {
		this.data = await readJSONFile(this.fileUrl)
		this.permissionSetMap = buildPermissionSetMap(this.data?.permissions)
	}

	async save() {
		const { fileUrl, data, permissionSetMap } = this

		if (!data) {
			return
		}

		if (data.dependencies && !Object.keys(data.dependencies).length) {
			delete data.dependencies
		}

		data.permissions = convertPermissionSetMap(permissionSetMap)

		await writeJSONFile(fileUrl, data)
		this.exists = true

		logger.debug('@manifest.save', fileUrl, data)
	}

	create(data?: Manifest) {
		const {
			name = this.cwd.split('/').pop(),
			version = '1.0.0',
			license = 'MIT'
		} = data || {}

		this.data = {
			...data,
			name,
			version,
			license
		}
	}

	set(key: keyof Manifest | Manifest, val?: any) {
		if (!this.data) {
			return
		}

		if (typeof key === 'string') {
			this.data[key] = val
		}
		else {
			Object.assign(this.data, key)
		}
	}

	addDependency(pkgs: Package | Package[]) {
		if (!this.data) {
			return []
		}

		const added: Array<[string, string?]> = []

		if (!Array.isArray(pkgs)) {
			pkgs = [pkgs]
		}

		this.data.dependencies = this.data.dependencies || {}
		this.permissionSetMap = this.permissionSetMap || {}

		for (const { type, name, repoUrl, version, permissions } of pkgs) {
			const spec = type === 'dep' ? version : repoUrl
			// @ts-ignore
			this.data.dependencies[name] = spec
			added.push([name, spec])

			if (!permissions) {
				continue
			}

			for (const perm in permissions) {
				const val = permissions[perm]
				const iter = Array.isArray(val) ? val : (typeof val === 'string' ? [val] : undefined)

				this.permissionSetMap[perm] = this.permissionSetMap[perm] || new Set(iter)

				if (iter) {
					for (const s of iter) {
						this.permissionSetMap[perm].add(s)
					}
				}
			}
		}

		return added
	}

	removeDependency(pkgNames: string | string[]) {
		if (!this.data || !this.data.dependencies) {
			return []
		}

		const removed: string[] = []

		for (const name of pkgNames) {
			if (this.data.dependencies[name]) {
				delete this.data.dependencies[name]
				removed.push(name)
			}
			else {
				logger.error(`Module '${name}' isn't specified in the pkg.json file`)
			}
		}

		return removed
	}
}
