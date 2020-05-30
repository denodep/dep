import { Package } from '../types.ts'
import { CDN_BASE_URL } from '../constants.ts'

export const getDepPackageUrlPrefix = (pkg: Package) => {
	const { name, version } = pkg

	return `${CDN_BASE_URL}/${name}@${version}/`
}
