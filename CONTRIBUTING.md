# Contribute to the Sei docs

Thank you for your interest in contributing to Sei's documentation! This guide will help you get started.

## How to contribute

### Option 1: Edit directly on GitHub

1. Navigate to the page you want to edit
2. Click the "Edit this file" button (the pencil icon)
3. Make your changes and submit a pull request

### Option 2: Local development

1. Fork and clone this repository
2. Install the Mintlify CLI: `npm i -g mint`
3. Create a branch for your changes
4. Make changes
5. Navigate to the docs directory and run `mint dev`
6. Preview your changes at `http://localhost:3000`
7. Commit your changes and submit a pull request

See the [README](README.md) for more details on local setup.

## Writing guidelines

- **Use active voice**: "Run the command" not "The command should be run"
- **Address the reader directly**: Use "you" instead of "the user"
- **Keep sentences concise**: Aim for one idea per sentence
- **Lead with the goal**: Start instructions with what the user wants to accomplish
- **Use consistent terminology**: Don't alternate between synonyms for the same concept
- **Include examples**: Show, don't just tell

## JSX styling

Mintlify only generates Tailwind utilities it can extract from JSX. In `snippets/*.jsx` and rendered JSX in `.mdx` pages, keep class lists in literal attributes. Prefer `className="..."`; static string and template expressions without interpolation are also safe. Do not keep utility lists in variables or assemble `className` dynamically. Use explicit JSX branches, inline styles, or a semantic hook in `style.css` for conditional styles.

For theme-aware snippets, run `node scripts/check-snippet-theme-default.mjs`.
