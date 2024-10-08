const exec = require('@actions/exec')
const github = require('@actions/github')
const semver = require('semver')
const { getBooleanInput, getRepoData, getLatestTag, createAndPushTag } = require('./src/index.js')

const octokit = github.getOctokit(process.env.GITHUB_TOKEN)
const context = github.context

async function run() {
	let matchTag = process.env.MATCH_TAG || ''
	if (!matchTag) {
		let { stdout } = await exec.getExecOutput('git', ['describe', '--tags', '--abbrev=0'])
		matchTag = stdout.trim()
		if (!matchTag) {
			return
		}
	}
	const inputSemver = semver.parse(matchTag)

	const tagDetails = await getRepoData(octokit, 'listTags', { params: { per_page: 100, ...context.repo } })
	const tagNames = tagDetails.filter(tag => semver.valid(tag.name)).map(tag => tag.name)

	const prefix = matchTag.startsWith('v') ? 'v' : ''

	if (getBooleanInput(process.env.ALIAS_MINOR ?? true)) {
		const minorTag = getLatestTag(tagNames, `~${inputSemver.major}.${inputSemver.minor}`)
		if (minorTag && minorTag === matchTag) {
			await createAndPushTag(`${prefix}${inputSemver.major}.${inputSemver.minor}`)
		}
	}

	if (getBooleanInput(process.env.ALIAS_MAJOR ?? true)) {
		const majorTag = getLatestTag(tagNames, `~${inputSemver.major}`)
		if (majorTag && majorTag === matchTag) {
			await createAndPushTag(`${prefix}${inputSemver.major}`)
		}
	}
}

run()