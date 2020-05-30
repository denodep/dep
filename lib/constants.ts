export const MANIFEST_FILE_NAME = 'pkg.json'
export const MANIFEST_INIT_VERSION = '1.0.0'
export const MANIFEST_INIT_LICENSE = 'MIT'
export const DEFAULT_IMPORTMAP_NAME = 'deps.json'

export const CDN_BASE_URL = 'https://cdn.depjs.com'
export const API_BASE_URL = 'https://api.depjs.com'
export const GITHUB_BASE_URL = 'https://github.com'
export const GITHUB_API_BASE_URL = 'https://api.github.com'
export const GITHUB_RAW_BASE_URL = 'https://raw.githubusercontent.com'
export const DENO_BASE_URL = 'https://deno.land'
export const UPDATE_CHECK_DEBOUNCE = 24 * 3600 * 1000 // 1d
export const STD_VERSION_CHECK_DEBOUNCE = 10 * 60 * 1000 // 10m
export const DEFAULT_REQUEST_TIMEOUT = 60 * 1000 // 60s
export const PACKAGE_SIZE_LIMIT = 5 * 1024 * 1024 // 5M
export const UNSTABLE_FLAGS = ['all', 'net', 'read', 'write', 'plugin', 'importmap']
export const HAS_ENTRY_STD_MODULES = ['async', 'bytes', 'datetime', 'flags', 'fs', 'http', 'io', 'log', 'mime', 'path', 'permissions', 'signal', 'textproto', 'uuid', 'ws']

export const RE_WHITESPACE = /^\s+$/
export const RE_DEP_PACKAGE_TAG = /^([0-9a-z-\.]+)$/
export const RE_SCOPED_PACKAGE_NAME = /^\@[0-9a-z-]\/[0-9a-z-]/
export const RE_GITHUB_PACKAGE_NAME = /^([0-9a-zA-Z-]+)\/([0-9a-zA-Z-_\.]+)$/
