import { Package } from '../types.ts'
import { GITHUB_BASE_URL, GITHUB_RAW_BASE_URL } from '../constants.ts'

export const getGithubRepoHTTPUrl = (pkg: Package) => {
	const { owner, repo, tag } = pkg

	return `${GITHUB_BASE_URL}/${owner}/${repo}` + (tag ? `/tree/${tag}` : '')
}

export const getGithubPackageUrlPrefix = (pkg: Package) => {
	const { owner, repo, tag } = pkg

	return `${GITHUB_RAW_BASE_URL}/${owner}/${repo}/${tag || 'master'}/`
}
