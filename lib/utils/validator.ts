import { semver } from '../../deps.ts'
import { RE_WHITESPACE } from '../constants.ts'

const RE_EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i
const RE_TAG = /^[0-9a-z-]+$/

export const isEmpty = (val: string) => !val || RE_WHITESPACE.test(val)

export const isLowercase = (str: string) => str.toLowerCase() === str

export const isStartOrEndWithHyphen = (str: string) => str.startsWith('-') || str.endsWith('-')

export const isLetterNumberHyphen = (str: string) => /^[0-9a-z-]+$/.test(str) && !str.includes('--')

export const validateUsername = (username: string) => {
	if (username.length > 39) {
		throw new Error('Username must be at most 39 characters long.')
	}
	else if (username.toLowerCase() !== username) {
		throw new Error('Username must be lowercase.')
	}
	else if (username.startsWith('-') || username.endsWith('-')) {
		throw new Error('Username cannot begin or end with a hyphen.')
	}
	else if (!/^[0-9a-z-]+$/.test(username) || username.includes('--')) {
		throw new Error('Username can only contain letters, numbers & single hyphens.')
	}
	return true
}

export const validatePassword = (password: string) => {
	if (password.length < 8) {
		throw new Error('Password must be at least 8 characters long.')
	}
	else if (password.length > 256) {
		throw new Error('Password must be at most 256 characters long.')
	}
	else if (!/[a-z]/.test(password)) {
		throw new Error('Password must contain at least one lowercase letters.')
	}
	return true
}

export const validateEmail = (email: string) => {
	if (!RE_EMAIL.test(email)) {
		throw new Error('Invalid email address.')
	}
	return true
}

export const validatePackageName = (name: string) => {
	if (name.length > 64) {
		throw new Error('Package name must be at most 64 characters long.')
	}
	else if (!isLowercase(name)) {
		throw new Error('Package name must be lowercase.')
	}
	else if (isStartOrEndWithHyphen(name)) {
		throw new Error('Package name cannot begin or end with a hyphen.')
	}
	else if (!isLetterNumberHyphen(name)) {
		throw new Error('Package name can only contain letters, numbers & single hyphens.')
	}
	return true
}

export const validatePackageVersion = (version: string) => {
	if (!semver.valid(version)) {
		throw new Error('Invalid package version.')
	}
	return true
}

export const validatePackageTag = (tag: string) => {
	if (/^v?[0-9]/.test(tag)) {
		throw new Error('Tag cannot start with a number or the letter `v`.')
	}
	else if (tag.toLowerCase() !== tag) {
		throw new Error('Tag must be lowercase.')
	}
	else if (!RE_TAG.test(tag)) {
		throw new Error('Tag can only contain letters, numbers & hyphens.')
	}
	return true
}
