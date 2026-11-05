# Claude Code Guide

Best practices for software developers who use Claude Enterprise (Claude Desktop and the Claude Code CLI) as a coding assistant.

The site is built with [Hugo](https://gohugo.io/) and the [Hextra](https://imfing.github.io/hextra/) theme. It is deployed to GitHub Pages at https://monamaret.github.io/claude-best-practices/. This repository and the site are public, so do not commit secrets, customer names, or other non-public information.

## Contents

The guide is in `content/docs/`. It has five sections in order of increasing complexity, followed by a prompt library:

1. General tips
2. Use the CLI
3. Version control
4. Integrate workflows
5. Patterns that work
6. Reference: Prompting strategies

See [`.claude/rules/site-structure.md`](.claude/rules/site-structure.md) for the full list of pages.

## Prerequisites

- [Hugo](https://gohugo.io/installation/) 0.168.0, extended edition
- [Go](https://go.dev/doc/install), which Hugo uses to download the theme module
- [Git](https://git-scm.com/)

The Hugo version must match in three places: your local installation, `HUGO_VERSION` in `.github/workflows/pages.yaml`, and `module.hugoVersion.min` in `hugo.yaml`. If you upgrade Hugo, update all three.

## Local development

```shell
git clone git@github.com:monamaret/claude-best-practices.git
cd claude-best-practices
hugo mod tidy
hugo server --disableFastRender -p 1313
```

Open http://localhost:1313 to preview the site.

Before you push, run a production build and confirm that it shows no errors or warnings:

```shell
hugo --gc --minify
```

## Contributing content

Contributors write and review content with the help of Claude Code. The project guidelines are:

- [`CLAUDE.md`](CLAUDE.md): project overview and rules for every change
- [`.claude/rules/`](.claude/rules/): content style, site structure, Hextra components, and the prompt library format
- [`.claude/agents/`](.claude/agents/): the `content-writer` and `content-reviewer` subagents

Claude Code loads these files automatically. Human contributors should read `.claude/rules/content-style.md` before they write a page.

## Deployment

The [`pages.yaml`](.github/workflows/pages.yaml) workflow builds the site and deploys it to GitHub Pages on every push to `main`. You can also run the workflow manually from the **Actions** tab.

In the repository settings, go to **Settings** > **Pages** and set **Source** to **GitHub Actions**.

## Update the theme

```shell
hugo mod get -u
hugo mod tidy
```

After an update, run `hugo --gc --minify` and fix any deprecation warnings. See [Update modules](https://gohugo.io/hugo-modules/use-modules/#update-modules) in the Hugo documentation.

## License

- The guide content (everything under `content/`, and the rest of the repository unless noted otherwise) is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). See [`LICENSE`](LICENSE).
- The code (the example files in `static/examples/`, the layout overrides in `layouts/`, and the workflow in `.github/`) is licensed under the [MIT License](LICENSE-CODE).
