# Version Alias

A GitHub Action that automatically creates and updates version alias tags for your repository, making it easier to reference the latest versions of your releases.

The Version Alias GitHub Action simplifies version management in your repository by automatically creating and updating version alias tags. When you push a new semantic version tag (e.g., v1.2.3), this action will create or update corresponding major (v1) and minor (v1.2) version tags, pointing to the latest release within each respective version range.

### Features

- Automatically creates and updates major and minor version alias tags
- Option to control creation of major and minor aliases independently
- Supports custom tag prefixes (e.g., 'v' or no prefix)
- Preserves existing tag history

## Getting Started

### Installation

To use this action in your workflow, you need to have a `.github/workflows` directory in your repository. If you don't have one, create it.

### Quick Start

Create a new file `.github/workflows/version-alias.yml` with the following content:

```yaml
name: Update Version Aliases

on:
  workflow_dispatch:
  push:
    branches:
      - master

jobs:
  update-version-aliases:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required to retrieve git history
          fetch-tags: true # IMPORTANT: Required to fetch all tags

      - uses: pfaciana/version-alias@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This basic configuration will run the Version Alias action whenever a new semantic version tag is pushed to the repository.

## Usage

### Full Usage

Here's a more comprehensive example of how to use the Version Alias action:

```yaml
name: Update Version Aliases

on:
  workflow_dispatch:
  push:
    branches:
      - master

jobs:
  update-version-aliases:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required to retrieve git history
          fetch-tags: true # IMPORTANT: Required to fetch all tags

      - name: Update version aliases
        uses: pfaciana/version-alias@v1
        with:
          alias-minor: 'yes'
          alias-major: 'yes'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This configuration allows the action to run automatically on new tag pushes and manually with an optional specific tag input. It also explicitly enables both minor and major alias creation.

### Inputs

| Name        | Description                                   | Required | Default       |
|-------------|-----------------------------------------------|----------|---------------|
| match-tag   | Specific tag to process instead of the latest | No       | (current tag) |
| alias-minor | Enable creation of minor version aliases      | No       | `true`        |
| alias-major | Enable creation of major version aliases      | No       | `true`        |

Note: For `alias-minor` and `alias-major`, the action uses a custom boolean parsing function. The following values are considered `false`: missing value, empty string, `undefined`, `null`, `false`, `0`, `no`, and `off` (case-insensitive). Any other value is considered `true`.

### Outputs

This action does not have any outputs. It creates and updates tags directly in the repository.

## Examples

### Basic Usage

This example shows the basic usage of the action, which will run on every semantic version tag push:

```yaml
name: Update Version Aliases

on:
  workflow_dispatch:
  push:
    branches:
      - master

jobs:
  update-version-aliases:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required to retrieve git history
          fetch-tags: true # IMPORTANT: Required to fetch all tags

      - uses: pfaciana/version-alias@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Custom Tag Matching

This example demonstrates how to use the action with a custom tag matching pattern:

```yaml
name: Update Version Aliases

on:
  push:
    branches:
      - master
  workflow_dispatch:
    inputs:
      match_tag:
        description: 'Specific tag to process'
        required: false

jobs:
  update-version-aliases:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required to retrieve git history
          fetch-tags: true # IMPORTANT: Required to fetch all tags

      - name: Update version aliases
        uses: pfaciana/version-alias@v1
        with:
          match-tag: ${{ github.event.inputs.match_tag }}
          alias-minor: 'no'
          alias-major: 'yes'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Scheduled Updates

This example shows how to run the action on a schedule to ensure version aliases are always up-to-date:

```yaml
name: Update Version Aliases

on:
  schedule:
    - cron: '0 0 * * *'  # Run daily at midnight
  workflow_dispatch:  # Allow manual triggers

jobs:
  update-version-aliases:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required to retrieve git history
          fetch-tags: true # IMPORTANT: Required to fetch all tags

      - uses: pfaciana/version-alias@v1
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Controlling Alias Creation

This example shows how to control which aliases are created:

```yaml
name: Update Version Aliases

on:
  workflow_dispatch:
  push:
    branches:
      - master

jobs:
  update-version-aliases:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # Required to retrieve git history
          fetch-tags: true # IMPORTANT: Required to fetch all tags

      - uses: pfaciana/version-alias@v1
        with:
          alias-minor: 'true'
          alias-major: 'false'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

This configuration will create minor version aliases (e.g., v1.2) but not major version aliases (e.g., v1).

## FAQ

### Q: Does this action work with non-semantic version tags?

A: No, this action is designed to work specifically with semantic version tags (e.g., v1.2.3). It relies on semantic versioning to determine the major and minor versions.

### Q: Can I use this action with tags that don't start with 'v'?

A: Yes, the action will preserve the prefix (or lack thereof) of your existing tags. If your tags don't start with 'v', the action will create alias tags without 'v' as well.

### Q: What happens if I manually create a version alias tag?

A: The action will overwrite manually created version alias tags if it determines that a newer version should be pointed to by that alias.

### Q: Can I control which aliases are created?

A: Yes, you can use the `alias-minor` and `alias-major` environment variables to control whether minor and major version aliases are created, respectively. Set them to 'true' to enable or 'false' to disable.

### Q: How are the boolean inputs (alias-minor and alias-major) interpreted?

A: The action uses a custom function to interpret these inputs as booleans. The input is converted to a string and trimmed of whitespace and converted to lowercase. The resulting string is one of the following, it's considered `false`: Missing value, Empty string, `undefined`, `null`, `false`, `0`, `no`, `off`. Any other value is considered `true`.

This means you can use various formats to set these to false, such as:

```yaml
with:
  alias-minor: no
  alias-major: off
```

Or to set them to true:

```yaml
with:
  alias-minor: yes
  alias-major: on
```

Remember, if you don't set these environment variables, they default to `true`.

### Q: What happens if the action fails to push a tag?

A: If the action fails to push a tag (e.g., due to a conflict), it will output an error message in the workflow run log. The action does not automatically retry in case of failures.