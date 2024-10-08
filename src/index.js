const exec = require('@actions/exec')
const semver = require('semver')

/**
 * Converts an input value to a boolean.
 *
 * @param {string|boolean|number} input - The input value to convert.
 * @returns {boolean} The boolean representation of the input.
 */
function getBooleanInput(input) {
	return !['', 'undefined', 'null', 'false', '0', 'no', 'off'].includes(String(input).toLowerCase().trim())
}

/**
 * @typedef {import('@octokit/core').Octokit} Octokit
 */

/**
 * @typedef {Object} GetRepoDataOptions
 * @property {number} [limit=500] - The maximum number of items to retrieve.
 * @property {Object} [params={ per_page: 100 }] - Parameters for API requests.
 */

/**
 * Retrieves repository data from GitHub API.
 *
 * @async
 * @param {Octokit} octokit - The Octokit instance for making GitHub API calls.
 * @param {string} endpoint - The API endpoint to call.
 * @param {GetRepoDataOptions} [options={}] - Options for retrieving repository data.
 * @returns {Promise<Array>} A promise that resolves to an array of retrieved items.
 */
async function getRepoData(octokit, endpoint, options = {}) {
	options = { ...{ limit: 500, params: { per_page: 100 } }, ...options }

	let items = []

	for await (const response of octokit.paginate.iterator(octokit.rest.repos[endpoint], options.params)) {
		for (const item of response.data) {
			items.push(item)
			if (items.length >= options.limit) {
				return items
			}
		}
		if (response.data.length < (options.params.per_page ?? 30)) {
			return items
		}
	}

	return items
}

/**
 * Gets the latest tag that satisfies the given semver range.
 *
 * @param {string[]} tags - An array of version tags.
 * @param {string} range - The semver range to satisfy.
 * @returns {string|null} The latest tag that satisfies the range, or null if none found.
 */
function getLatestTag(tags, range) {
	const rangeTags = tags.filter(tag => semver.satisfies(tag, range)).sort(semver.rcompare)
	return rangeTags.length ? rangeTags[0] : null
}

/**
 * Creates and pushes a new git tag.
 *
 * @async
 * @param {string} tagName - The name of the tag to create and push.
 * @returns {Promise<void>}
 */
async function createAndPushTag(tagName) {
	if (!tagName) {
		return
	}
	await exec.exec('git', ['tag', '-f', tagName])
	await exec.exec('git', ['push', 'origin', tagName, '--force'])
}

module.exports = {
	getBooleanInput,
	getRepoData,
	getLatestTag,
	createAndPushTag,
}

