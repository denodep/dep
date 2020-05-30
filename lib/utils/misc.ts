export const sleep = (ms: number) => {
	return new Promise((resolve) => setTimeout(resolve, ms))
}

export const omitBy = (obj: any, validator: (val: any) => boolean) => {
	for (const key in obj) {
		if (validator(obj[key])) {
			delete obj[key]
		}
	}
}

export const removeSuffix = (pattern: string, suffix: string) => {
	if (pattern.endsWith(suffix)) {
		return pattern.slice(0, -suffix.length)
	}

	return pattern
}

export const formatBytes = (bytes: number) => {
	return (bytes && (bytes < 1024 ? bytes + 'B' : (bytes / 1024).toFixed(1) + 'KB')) + ''
}
