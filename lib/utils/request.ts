import { qs } from '../../deps.ts'
import { store, state } from '../store.ts'
import { DEFAULT_REQUEST_TIMEOUT, API_BASE_URL, GITHUB_API_BASE_URL, CDN_BASE_URL } from '../constants.ts'
import logger from './logger.ts'

class RequestError extends Error {
	response?: Response
	data?: any

	constructor(msg: string, res?: Response, data?: any) {
		super(msg)

		this.response = res
		this.data = data
	}
}

interface RequestParams {
	method?: 'GET' | 'POST' | 'PUT',
	url: string
	baseUrl?: string
	headers?: any
	query?: any
	body?: any
	timeout?: number // ms
	isJson?: boolean
}

export const request = async (params: RequestParams) => {
	const { method = 'GET', url, baseUrl, headers, query, body, timeout = DEFAULT_REQUEST_TIMEOUT, isJson = true } = params
	const controller = new AbortController()
	const { signal } = controller
	const fullUrl = `${baseUrl}${url}${query ? '?' + qs.stringify(query) : ''}`
	const startAt = Date.now()

	logger.verbose(`\x1b[37;3mrequest\x1b[0;37m ${method} ${fullUrl}\x1b[0m`)

	const timeoutId = setTimeout(() => {
		controller.abort()
		throw new Error(`Request timeout after ${timeout}ms: ${method} ${fullUrl}`)
	}, timeout)

	const promise = fetch(fullUrl, {
		method,
		body: body && (isJson ? JSON.stringify(body) : body),
		headers,
		signal
	})
		.then(async (res) => {
			logger.verbose(`\x1b[32;3mresponse\x1b[0m ${method} ${fullUrl} \x1b[${res.status < 300 ? '32' : '31'}m${res.status} \x1b[32m${Date.now() - startAt}ms\x1b[0m`)

			if (!res.ok) {
				let data

				try {
					data = await res.json()
				}
				catch (e) {}

				if (data && (data.message || data.error?.message)) {
					throw new RequestError((data.message || data.error.message), res, data)
				}
				throw new RequestError(`${res.statusText} (${res.status})`, res)
			}

			return res.status === 204 ? null : res
		})
		.finally(() => {
			clearTimeout(timeoutId)
		})

	return await promise
}

export const fetchFile = async (params: RequestParams) => {
	params.baseUrl = CDN_BASE_URL

	return await request(params)
}

export const requestDep = async (params: RequestParams) => {
	const { dep } = state
	const { isJson = true } = params
	const { udid, fpi, accessToken, preAccessToken } = await store.toObject()
	const commonHeaders: any = {
		'x-dep-ver': dep?.version,
		'x-dep-udid': udid,
		'x-dep-fpi': fpi
	}

	if (isJson) {
		commonHeaders['content-type'] = 'application/json;charset=utf-8'
	}

	if (accessToken) {
		commonHeaders.authorization = `Bearer ${accessToken}`
	}
	else if (preAccessToken) {
		commonHeaders['x-pre-access-token'] = preAccessToken
	}

	params.baseUrl = API_BASE_URL
	params.headers = {
		...commonHeaders,
		...params.headers
	}

	return await request(params)
}

export const requestGithub = async (params: RequestParams) => {
	params.baseUrl = GITHUB_API_BASE_URL
	params.headers = {
		accept: 'application/vnd.github.v3.object',
		...params.headers
	}

	return await request(params)
}
