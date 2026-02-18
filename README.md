[![License](https://img.shields.io/badge/License-MIT-green.svg)](https://github.com/sei-protocol/sei-docs/blob/main/LICENSE)

# Contributing to the Docs

## Quick Start

Ensure you have `yarn` installed (macOS users can Run `brew install yarn`)

1. Use `yarn` to install dependencies
2. Use `yarn dev` to run the docs locally.
3. Use `yarn build` to build the docs.

You should always run `yarn build` before pushing any changes to validate that there are no syntax errors.

## Contributing

This documentation is created using [Nextra](https://nextra.site).

### Structure

Each page is generated from a single `.mdx` file under the `./content` directory.

Each directory represents a page grouping. Each directory contains a `_meta.json` file, which dictates the order and name of the items in the navbar.

For more information on how the docs are structured, please refer to the [Nextra docs](https://nextra.site/docs/guide).

### Changing Content

All content submitted will be reviewed by a maintainer

To standardize the documentation, please follow the [style guide](https://github.com/sei-protocol/sei-docs/blob/devrel/STYLE_GUIDE.mdx) for instructions on how to format changes to the docs.

## Open Source Contributors

As an open source and decentralized protocol, we **greatly appreciate** any contributions!
If you feel like the docs can be better in some way, please feel free to fork this repo and make a pull request or open an issue in this Repository.

### Make changes yourself

While the contents of this repository are not technical in nature, contributing requires a basic understanding of:

- [Git](https://git-scm.com/downloads)
- Github

To propose changes directly, you can open a Pull Request against this repository.

1. [Fork the repository](https://guides.github.com/activities/forking/), then [clone](https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project#cloning-a-fork) the forked repository locally.
2. Make changes to the repository. You can refer to the contribution guide above on how or where to make specific changes.
3. Validate your changes by running the docs locally (Refer to the [Quick Start](#quick-start) section above for instructions)
4. Commit and push your changes to your forked repository.
5. Once your changes have been pushed to your forked repository, [make a Pull Request](https://git-scm.com/downloads) against this repository. Ensure that your Pull Request follows the template so we can understand and review your changes clearly.

### Open an Issue

Alternatively, if you have more general suggestions on how we can improve or correct these docs, you can [open an issue](https://github.com/sei-protocol/sei-docs/issues).

### Local Development
