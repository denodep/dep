import { Sha1, getMac, getUsername } from '../../deps.ts'

const NEED_ENCODE_KEYS = ['vd', 'hn', 'un']

export const getDeviceInfo = async () => {
	const { arch, os, vendor } = Deno.build
	const digest: any = {
		ar: arch,
		os,
		vd: vendor,
		hn: Deno.hostname(),
		tz: - new Date().getTimezoneOffset() / 60,
		un: await getUsername(),
		ma: await getMac()
	}
	const content = Object.keys(digest)
		.sort()
		.filter(key => !!digest[key])
		.map(key => `${key}=${NEED_ENCODE_KEYS.includes(key) ? encodeURIComponent(digest[key]) : digest[key]}`)
		.join('&')
	const udid = new Sha1().update(new TextEncoder().encode(`udid:${content}`)).hex()
	const fpi = btoa(content).replace(/=+$/, '')

	return [udid, fpi]
}
