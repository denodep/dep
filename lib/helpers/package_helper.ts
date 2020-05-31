import { Md5 } from '../../deps.ts'
import { RE_GITHUB_PACKAGE_NAME, RE_DEP_PACKAGE_TAG, HAS_ENTRY_STD_MODULES } from '../constants.ts'
import { isLowercase, isStartOrEndWithHyphen, isLetterNumberHyphen } from '../utils/validator.ts'
import { Package } from '../types.ts'
import { getGithubRepoHTTPUrl, getGithubPackageUrlPrefix, fetchLatestTagOfGithubRepo } from '../resolvers/github_resolver.ts'
import { getDenoStdRepoHTTPUrl, getDenoXRepoHTTPUrl, fetchVersionOfDenoStd } from '../resolvers/std_resolver.ts'
import { getDepPackageUrlPrefix } from '../resolvers/dep_resolver.ts'
import { findPackage } from '../apis/pkg.ts'

export const isValidPackageName = (name: string) => {
	return name.length <= 64 && isLowercase(name) && !isStartOrEndWithHyphen(name) && isLetterNumberHyphen(name)
}

export const getHashByPackageName = (name: string) => {
	return new Md5().update(`pkg:${name}`).toString()
}

export const parsePackageName = async (input: string) => {
	if (input.startsWith('@')) {
		throw new Error(`Scoped package is not yet supported '${input}'`)
	}

	const [name, tag] = input.split('@')
	const id = getHashByPackageName(name)


	let pkg: Package

	if (name.includes(':')) {
		const [type, path] = name.split(':')

		if (!path) {
			throw new Error(`Invalid package name '${name}'`)
		}

		// @ts-ignore
		pkg = { id }

		// type: github | alias: gh
		if (type === 'github' || type === 'gh') {
			const match = RE_GITHUB_PACKAGE_NAME.exec(path)

			if (!match) {
				throw new Error(`Invalid github repo '${path}'`)
			}

			const [_, owner, repo] = match

			pkg.type = 'github'
			pkg.name = repo
			pkg.owner = owner
			pkg.repo = repo
			pkg.tag = tag || await fetchLatestTagOfGithubRepo(owner, repo)
			pkg.repoUrl = getGithubRepoHTTPUrl(pkg)
			pkg.urlPrefix = getGithubPackageUrlPrefix(pkg)
		}
		// type: std
		else if (type === 'std') {
			const repo = path
			const stdVersion = tag || await fetchVersionOfDenoStd()

			if (stdVersion) {
				pkg.tag = stdVersion
				pkg.version = stdVersion
			}

			if (HAS_ENTRY_STD_MODULES.includes(repo)) {
				pkg.main = 'mod.ts'
			}

			pkg.type = 'std'
			pkg.name = repo
			pkg.repo = repo
			pkg.repoUrl = getDenoStdRepoHTTPUrl(pkg)
			pkg.urlPrefix = pkg.repoUrl + '/'
		}
		else if (type === 'x') {
			const repo = path

			pkg.type = 'x'
			pkg.name = repo
			pkg.repo = repo
			pkg.tag = tag
			pkg.repoUrl = getDenoXRepoHTTPUrl(pkg)
			pkg.urlPrefix = pkg.repoUrl + '/'
		}
		else {
			throw new Error(`Invalid package type '${type}'`)
		}
	}
	// type: dep
	else {
		if (!isValidPackageName(name)) {
			throw new Error(`Invalid package name '${name}'`)
		}
		else if (tag && !RE_DEP_PACKAGE_TAG.test(tag)) {
			throw new Error(`Invalid package version tag '@${tag}'`)
		}

		let res

		try {
			res = await findPackage(id, name)
		}
		catch (e) {
			if (e.response && e.response.status === 404) {
				throw new Error(`Package not found '${name}'`)
			}
			else {
				throw e
			}
		}

		const { main, permissions, version } = res

		pkg = {
			type: 'dep',
			id,
			name,
			repo: name,
			tag,
			version: tag || version,
			main,
			permissions
		}
		pkg.urlPrefix = getDepPackageUrlPrefix(pkg)
	}

	return pkg
}
