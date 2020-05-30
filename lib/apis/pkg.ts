import { requestDep, fetchFile } from '../utils/request.ts'

export const findPackage = async (pkgId: string, pkgName: string) => {
	const res = await requestDep({
		url: `/pkg/${pkgId}`,
		query: {
			name: pkgName
		}
	})

	return res?.json()
}

export const publishPreCheck = async (body: any) => {
	const res = await requestDep({
		method: 'POST',
		url: `/pkg/pre`,
		body
	})

	return res?.json()
}

export const publishPackage = async (json: any, filebuf: Uint8Array, filename: string) => {
	const formData = new FormData()

	formData.append('document', new Blob([JSON.stringify(json)], {
		type: 'application/json'
	}))

	formData.append('tarball', new Blob([filebuf], {
		type: 'application/gzip'
	}), filename)

	const res = await requestDep({
		method: 'PUT',
		url: `/pkg`,
		body: formData,
		isJson: false
	})

	return res?.json()
}

export const getPackageDetails = async (pkgName: string) => {
	const res = await fetchFile({
		url: `/${pkgName}/pkg.json`
	})

	return res?.json()
}
