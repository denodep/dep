export type AuthorType = string | {
	name: string
	email?: string
	url?: string
}

export type RepositoryType = string | {
	type: 'git',
	url: string
}

export type PermissionMap = {
	[key: string]: true | string | Array<string>
}

export type PermissionSetMap = {
	[key: string]: Set<string>
}

export interface Package {
	id: string
	type: 'dep' | 'github' | 'std' | 'x'
	name: string
	owner?: string
	repo: string
	repoUrl?: string // github | std
	urlPrefix?: string
	version?: string
	main?: string
	tag?: string
	scoped?: boolean
	permissions?: PermissionMap
}

export interface Manifest {
	name?: string
	version?: string
	description?: string
	keywords?: string[]
	homepage?: string
	author?: AuthorType
	private?: boolean
	license?: string
	repository?: RepositoryType
	bugs?: {
		url: string
	}
	dependencies?: {
		[key: string]: string
	}
	permissions?: PermissionMap
	main?: string
	importmap?: string
}

export interface ImportMap {
	imports: {
		[key: string] : string
	}
}

export interface IgnoreFilter {
  base: string
  isNegation: boolean
  regex: RegExp
  pattern: string
}

export interface WalkFile {
	relative: string
	absolute: string
	basename: string
	mtime?: number
}
