# AK Gutenberg Custom Blocks

UX-focused custom Gutenberg blocks for WordPress projects where content editors should be able to publish confidently without recurring developer help.

## Product positioning

This plugin was built with a strong editorial UX focus. Its key value is not only the visual output of the blocks, but the fact that less technical CMS users can create and update rich content more independently.

That makes it especially useful for production websites where content teams need flexibility, consistency, and less dependency on developers for day-to-day publishing.

## Included blocks

- `Logo Grid`
- `Photo With Text`
- `2 Photos + Title (Left / Right)`
- `2 Photo Blocks + Pop-Up Title`
- `Masonry Photo Layout - 2 Col`
- `Image Layout 1`
- `Image Layout 2`
- `2 Horizontal Videos`
- `2 Videos + Title (Left / Right)`
- `Masonry Video Layout - 2 Col`
- `Masonry Video Layout - 3 Columns`

## Who this is for

- Agencies delivering custom WordPress editing experiences
- Marketing teams maintaining high-visibility pages
- Content editors who need a guided, low-friction publishing workflow
- Businesses that want a reusable final plugin, not a one-off prototype

## Installation

1. Download the latest plugin ZIP from the repository releases.
2. In WordPress, go to `Plugins > Add New > Upload Plugin`.
3. Upload the ZIP file and activate `AK Gutenberg Custom Blocks`.
4. Open the block editor and insert the custom blocks from the block inserter.

For manual installation, place the plugin folder inside `wp-content/plugins/` and activate it from the WordPress admin.

## Compatibility

- WordPress: `6.4+`
- Tested up to: `6.9`
- PHP: `7.4+`

## Repository contents

- [`gutenberg-custom-blocks.php`](./gutenberg-custom-blocks.php) is the main plugin bootstrap and registration file.
- [`blocks.js`](./blocks.js) contains the custom Gutenberg blocks and editor UI.
- [`frontend.js`](./frontend.js) handles front-end video interaction.
- [`editor.css`](./editor.css), [`style.css`](./style.css), and [`style-new.css`](./style-new.css) contain editor and front-end styles.
- [`readme.txt`](./readme.txt) is the WordPress-compatible distribution readme.

## GitHub release flow

This repository includes:

- a CI workflow for basic PHP and JavaScript syntax checks
- a release packaging workflow that generates a production ZIP file
- issue and pull request templates
- a changelog, contribution guide, and security policy

Recommended release process:

1. Push the repository to GitHub.
2. Create a release tag such as `v2.0.0`.
3. Publish a GitHub Release.
4. Let the `Build Release ZIP` workflow attach a ready-to-install plugin ZIP.
5. Use that ZIP for production installs or client delivery.

## Recommended next improvements

- Add real editor screenshots or short GIFs to demonstrate the UX advantage
- Add `Plugin URI` and `Author URI` once the public repository is live
- Add translations if the plugin will be distributed across multilingual teams
- Consider splitting block code into smaller source files if the plugin keeps growing

## License

Licensed under `GPL-2.0-or-later`. See [`LICENSE`](./LICENSE).
