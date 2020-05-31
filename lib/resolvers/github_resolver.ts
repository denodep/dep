import { Package } from '../types.ts'
import { GITHUB_BASE_URL, GITHUB_RAW_BASE_URL } from '../constants.ts'
import { getRepoTags } from '../apis/github.ts'

export const getGithubRepoHTTPUrl = (pkg: Package) => {
	const { owner, repo, tag } = pkg

	return `${GITHUB_BASE_URL}/${owner}/${repo}` + (tag ? `/tree/${tag}` : '')
}

export const getGithubPackageUrlPrefix = (pkg: Package) => {
	const { owner, repo, tag } = pkg

	return `${GITHUB_RAW_BASE_URL}/${owner}/${repo}/${tag || 'master'}/`
}

export const fetchLatestTagOfGithubRepo = async (owner: string, repo: string) => {
	const ret = await getRepoTags(owner, repo)

	return ret && ret.length ? ret[0].name : null
}
