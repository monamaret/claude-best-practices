# Review deploy site: research notes

Not published. Hugo publishes only `content/` and `static/`. Collected on 2026-10-27 for the counter item "review or dev deploy site". Nothing is implemented yet; it waits on the owner's decisions at the end of this file. Verify the facts against the linked sources before you implement anything.

## Findings

- **One Pages site per repository.** "Maximum of one pages site per repository". Each `actions/deploy-pages` run replaces the whole site. https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- **No public preview deployments.** The `preview` input of `actions/deploy-pages` is "only in alpha currently and is not available to the public". https://github.com/actions/deploy-pages
- **Production risk now:** `pages.yaml` has `workflow_dispatch`. GitHub recommends "a deployment protection rule so that only the default branch can deploy to this environment". Set Settings > Environments > github-pages > Deployment branches to `main` only. https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site
- **Pages sites are public even for private repositories.** Private Pages needs an organization on GitHub Enterprise Cloud. The repository belongs to a personal account, so private Pages is not available now. https://docs.github.com/en/pages/getting-started-with-github-pages/changing-the-visibility-of-your-github-pages-site
- `noindex` and `robots.txt` only ask crawlers to stay away. They do not restrict access.

## Options

| Option | Review content visible to | Notes |
| --- | --- | --- |
| a) Second repository (for example `coding-assistant-guide-review`), deployed from this repository's `review` branch | Anyone with the URL | Recommended if public drafts are acceptable. Production stays separate. Needs a deploy key secret. |
| b) `/review/` subpath on the production site | Anyone, on the production domain | Not recommended. The `review` branch would need permission to deploy to production. |
| c) External host with access control (Cloudflare Access, Netlify Enterprise) | Only allowed people | Content leaves GitHub. |
| d) Private Pages in a GitHub Enterprise Cloud organization | People with read access to the repository | Not possible on a personal account. With Enterprise Managed Users, all Pages sites are private, including production. |
| e) No deployment: `hugo server -D -F` locally, or a workflow artifact from `hugo -D -F` | People with repository access | The only fully private option on the current plan. No URL to share. |

## Recommended setup for option a (tested locally with Hugo 0.168.0 on a scratch copy)

Git workflow:
1. Create `review` from `main` once.
2. To preview a feature branch, merge it into `review`. Keep the normal PR from the feature branch to `main` for release.
3. Merge `main` into `review` regularly.
4. Release by merging feature branches to `main`, not `review` to `main`.

`config/review/hugo.yaml`. Hugo merges it over the root `hugo.yaml` with `--environment review` (https://gohugo.io/configuration/introduction/):

```yaml
buildDrafts: true
buildFuture: true
enableRobotsTXT: true
params:
  banner:
    key: review-build
    message: "Review build: drafts and unreleased changes. Not the published guide."
```

`layouts/robots.txt`:

```
User-agent: *
{{ if not hugo.IsProduction }}Disallow: /{{ end }}
```

Results of the local test:
- The review build includes drafts, shows the banner, and writes `Disallow: /`.
- Hextra prints `noindex, nofollow` automatically outside production.
- The production build is unchanged.
- `layouts/index.html` (the redirect page) has no robots meta tag. Add one when `not hugo.IsProduction`.
- A project site cannot serve `robots.txt` at the host root, so in practice the meta tag does the work.

One-time setup:
1. Create the review repository.
2. Generate an SSH key pair.
3. Add the public key as a deploy key with write access in the review repository.
4. Add the private key as the Actions secret `REVIEW_DEPLOY_KEY` in this repository. Never put it in a file.
5. Push once. In the review repository, set Pages to "Deploy from a branch", `gh-pages`, `/ (root)`.

`.github/workflows/review.yaml`:

```yaml
name: Deploy review site

on:
  push:
    branches: ["review"]
  workflow_dispatch:

permissions:
  contents: read

# Different group from production ("pages"), so that the two never cancel each other.
concurrency:
  group: review-site
  cancel-in-progress: true

defaults:
  run:
    shell: bash

jobs:
  build-deploy:
    if: github.ref == 'refs/heads/review'
    runs-on: ubuntu-latest
    env:
      REVIEW_BASE_URL: https://monamaret.github.io/coding-assistant-guide-review/
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: Setup Go
        uses: actions/setup-go@v5
        with:
          go-version: '1.26'
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@2752ce1d29631191ea3f27c23495fa06139a5b78 # v3.2.1
        with:
          hugo-version: '0.168.0'
          extended: true
      - name: Build with Hugo (review environment)
        run: |
          hugo \
            --gc --minify \
            --environment review \
            --buildDrafts --buildFuture \
            --baseURL "${REVIEW_BASE_URL}"
      - name: Deploy to the review repository
        # Verify this SHA against the v4.0.0 tag of peaceiris/actions-gh-pages before use.
        uses: peaceiris/actions-gh-pages@4f9cc6602d3f66b9c108549d475ec49e8ef4d45e # v4.0.0
        with:
          deploy_key: ${{ secrets.REVIEW_DEPLOY_KEY }}
          external_repository: monamaret/coding-assistant-guide-review
          publish_branch: gh-pages
          publish_dir: ./public
          force_orphan: true
          user_name: github-actions[bot]
          user_email: 41898282+github-actions[bot]@users.noreply.github.com
          commit_message: Deploy review build
```

Credentials:
- **Deploy key (preferred):** one repository, write access, no expiry, and not tied to a user.
- **Fine-grained token:** can be limited to one repository and can expire, but it is tied to the owner's account.

Sources:
- https://docs.github.com/en/authentication/connecting-to-github-with-ssh/managing-deploy-keys
- https://github.com/peaceiris/actions-gh-pages

## Project rules to update if option a is chosen

- **CLAUDE.md rule 1, and the meaning of `draft: true` in `site-structure.md`:** drafts become public on the review site.
- **Hugo version sync:** `review.yaml` adds a fourth `hugo-version` to keep in sync.
- **Repository layout in CLAUDE.md:** add `config/review/` and `layouts/robots.txt`.
- **The under-review tag:** cascade cannot target tags. To show tagged pages only on the review site, they also need `draft: true`.

## Decisions for the owner

1. Must review content be private, or is a public review URL with noindex acceptable for drafts?
2. Is a GitHub Enterprise Cloud organization available to host the repository? Only that gives private Pages.
3. Is a second repository acceptable, and should it be public or private? The site is public either way on the current plan.
4. Deploy key or fine-grained token? A deploy key is recommended.
5. Should `under-review` pages stay visible in production with the flag, or appear only on the review site?
6. Release by merging feature branches to `main` (recommended), or by merging `review` into `main`?
7. Is an external host with access control allowed, given that the content leaves GitHub?
