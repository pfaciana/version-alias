import { describe, test, expect } from 'vitest'
import { getLatestTag } from './index.js'

describe('getLatestTag', () => {
	// Test cases for 'major.minor' scope
	describe('Scope: major.minor', () => {
		test('highest patch version', () => {
			const tags = ['v1.2.0', 'v1.2.1', 'v1.2.2', 'v1.2.3']
			const result = getLatestTag(tags, '~1.2')
			expect(result).toBe('v1.2.3')
		})

		test('no highest patch version', () => {
			const tags = ['v1.2.0', 'v1.2.1', 'v1.2.2', 'v1.2.3']
			const result = getLatestTag(tags, '~1.3')
			expect(result).toBe(null)
		})

		test('should handle tags with different major.minor versions', () => {
			const tags = ['v1.1.5', 'v1.2.2', 'v1.2.3', 'v1.3.0']
			const result = getLatestTag(tags, '~1.2')
			expect(result).toBe('v1.2.3')
		})

		test('should handle pre-release versions correctly', () => {
			const tags = ['v1.2.3-alpha', 'v1.2.3-beta', 'v1.2.3']
			const result = getLatestTag(tags, '~1.2')
			expect(result).toBe('v1.2.3')
		})

		test('no tag in scope', () => {
			const tags = ['v1.1.0', 'v1.3.0', 'v2.0.0']
			const result = getLatestTag(tags, '~1.2')
			expect(result).toBe(null)
		})

		test('there are higher pre-release versions', () => {
			const tags = ['v1.2.3-beta', 'v1.2.3']
			const result = getLatestTag(tags, '~1.2')
			expect(result).toBe('v1.2.3')
		})

		test('should handle invalid semver tags gracefully', () => {
			const tags = ['v1.2.2', 'invalid-tag', 'v1.2.3']
			const result = getLatestTag(tags, '~1.2')
			expect(result).toBe('v1.2.3')
		})

		test('other tags are invalid', () => {
			const tags = ['v1.2.x', 'v1.2.a', 'v1.2.3']
			const result = getLatestTag(tags, '~1.2')
			expect(result).toBe('v1.2.3')
		})

		test('all tags are invalid except a higher one', () => {
			const tags = ['invalid1', 'invalid2', 'v1.2.4']
			const result = getLatestTag(tags, '~1.2')
			expect(result).toBe('v1.2.4')
		})
	})

	// Test cases for 'major' scope
	describe('Scope: major', () => {
		test('highest version in major scope', () => {
			const tags = ['v1.0.5', 'v1.2.5', 'v1.3.1', 'v1.3.2']
			const result = getLatestTag(tags, '~1')
			expect(result).toBe('v1.3.2')
		})

		test('should handle multiple major versions', () => {
			const tags = ['v1.9.9', 'v2.0.0', 'v2.0.1']
			const result = getLatestTag(tags, '~1')
			expect(result).toBe('v1.9.9')
		})

		test('should handle pre-release versions in major scope', () => {
			const tags = ['v1.3.0-alpha', 'v1.3.0-beta', 'v1.3.0']
			const result = getLatestTag(tags, '~1')
			expect(result).toBe('v1.3.0')
		})

		test('one tag in major scope', () => {
			const tags = ['v1.0.0', 'v2.0.0']
			const result = getLatestTag(tags, '~1')
			expect(result).toBe('v1.0.0')
		})

		test('should handle invalid semver tags in major scope', () => {
			const tags = ['v1.3.1', 'invalid-tag', 'v1.3.2']
			const result = getLatestTag(tags, '~1')
			expect(result).toBe('v1.3.2')
		})

		test('ignore invalid tags', () => {
			const tags = ['invalid1', 'invalid2', 'v1.3.2']
			const result = getLatestTag(tags, '~1')
			expect(result).toBe('v1.3.2')
		})
	})

	// Edge cases
	describe('Edge Cases', () => {
		test('should handle empty tags array', () => {
			const result = getLatestTag([], '~1')
			expect(result).toBe(null)
		})

		test('should handle invalid inputTag', () => {
			const tags = ['v1.2.0', 'v1.2.1', 'v1.2.2']
			const result = getLatestTag(tags, 'invalid')
			expect(result).toBe(null)
		})
	})

	// Many Tags
	describe('Many Cases', () => {
		test('should handle many tags array', () => {
			const tags = [
				'v0.0.1', 'v0.0.2', 'v0.0.3', 'v0.0',
				'v0.1.0', 'v0.1.1', 'v0.1.2', 'v0.1.3', 'v0.1',
				'v0.2.0', 'v0.2.1', 'v0.2.2', 'v0.2.3', 'v0.2', 'v0',

				'v1.0.0', 'v1.0.1', 'v1.0.2', 'v1.0.3', 'v1.0.4', 'v1.0',
				'v1.1.0', 'v1.1.1', 'v1.1.2', 'v1.1.3', 'v1.1',
				'v1.2.0', 'v1.2.1', 'v1.2.2', 'v1.2.3', 'v1.2.4', 'v1.2',
				'v1.3.0', 'v1.3.1', 'v1.3.2', 'v1.3.3', 'v1.3.4', 'v1.3.5', 'v1.3', 'v1',

				'v2.0.0', 'v2.0.1', 'v2.0.2', 'v2.0.3', 'v2.0',
				'v2.1.0', 'v2.1.1', 'v2.1.2', 'v2.1.3', 'v2.1',
				'v2.2.0', 'v2.2.1', 'v2.2.2', 'v2.2.3', 'v2.2', 'v2',

				'v3.0.0', 'v3.0', 'v3',
				'v4.0.0', 'v4.0', 'v4',
				'v5.0.0', 'v5.0', 'v5',
			]

			expect(getLatestTag(tags, '~0.0')).toBe('v0.0.3')
			expect(getLatestTag(tags, '~0.1')).toBe('v0.1.3')
			expect(getLatestTag(tags, '~0.2')).toBe('v0.2.3')
			expect(getLatestTag(tags, '~0.3')).toBe(null)
			expect(getLatestTag(tags, '~0')).toBe('v0.2.3')

			expect(getLatestTag(tags, '~1.0')).toBe('v1.0.4')
			expect(getLatestTag(tags, '~1.1')).toBe('v1.1.3')
			expect(getLatestTag(tags, '~1.2')).toBe('v1.2.4')
			expect(getLatestTag(tags, '~1.3')).toBe('v1.3.5')
			expect(getLatestTag(tags, '~1.4')).toBe(null)
			expect(getLatestTag(tags, '~1')).toBe('v1.3.5')

			expect(getLatestTag(tags, '~2.0')).toBe('v2.0.3')
			expect(getLatestTag(tags, '~2.1')).toBe('v2.1.3')
			expect(getLatestTag(tags, '~2.2')).toBe('v2.2.3')
			expect(getLatestTag(tags, '~2.3')).toBe(null)
			expect(getLatestTag(tags, '~2')).toBe('v2.2.3')

			expect(getLatestTag(tags, '~3.0')).toBe('v3.0.0')
			expect(getLatestTag(tags, '~3.1')).toBe(null)
			expect(getLatestTag(tags, '~3')).toBe('v3.0.0')

			expect(getLatestTag(tags, '~4.0')).toBe('v4.0.0')
			expect(getLatestTag(tags, '~4.1')).toBe(null)
			expect(getLatestTag(tags, '~4')).toBe('v4.0.0')

			expect(getLatestTag(tags, '~5.0')).toBe('v5.0.0')
			expect(getLatestTag(tags, '~5.1')).toBe(null)
			expect(getLatestTag(tags, '~5')).toBe('v5.0.0')

			expect(getLatestTag(tags, '~6.0')).toBe(null)
			expect(getLatestTag(tags, '~6.1')).toBe(null)
			expect(getLatestTag(tags, '~6')).toBe(null)
		})
	})
})
