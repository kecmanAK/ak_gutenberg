# Contributing

Thanks for contributing to AK Gutenberg Custom Blocks.

## Ground rules

- Keep the editorial UX simple and predictable for non-technical users.
- Avoid unnecessary architectural churn in working block implementations.
- Prefer backward-compatible changes unless a breaking change is clearly justified.
- Document any editor-facing behavior change in the pull request.

## Local workflow

1. Create a feature branch from your default branch.
2. Make focused changes.
3. Verify PHP and JavaScript syntax before opening a pull request.
4. Update `CHANGELOG.md` when the change is user-facing or release-relevant.
5. Open a pull request using the included template.

## Pull request expectations

- Explain what changed and why.
- Call out any risk to existing editors or published content.
- Include screenshots or short recordings when editor UI changes.
- Keep pull requests reviewable and focused.

## Release notes

When preparing a release:

1. Confirm the plugin version in `gutenberg-custom-blocks.php`.
2. Update `readme.txt` and `CHANGELOG.md`.
3. Publish a GitHub Release or run the release packaging workflow manually.
