import { requestGithub } from '../utils/request.ts'

export const getRepoContents = async (owner: string, repo: string, path: string, ref?: string) => {
	const res = await requestGithub({
		url: `/repos/${owner}/${repo}/contents/${path}`,
		query: ref && { ref }
	})

	return res?.json()
}
