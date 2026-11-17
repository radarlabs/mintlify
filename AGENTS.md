# Working on the Radar docs

This repository is the source for [docs.radar.com](https://docs.radar.com), built with Mintlify. It is public.

## Before you write

- Read [STYLE.md](STYLE.md). It defines page structure, formatting, callouts, dashboard references, code examples, and terminology. Follow it exactly.
- Navigation and redirects live in `docs.json`. A page that isn't listed there is hidden from the sidebar but still published.
- Shared procedures live in `snippets/` and are imported by several pages. Change the snippet, not the copies, and check every page that imports it.

## Rules

- Document only behavior you verified against a released SDK, the public API, or the current dashboard. Don't infer support on one platform from another.
- Never commit customer names, real identifiers, API keys, internal links, or private source material.
- Don't rename a published heading. Headings are link anchors, and `api.mdx`, `faqs.mdx`, and `geofencing/fraud.mdx` exist to keep old anchors working.
- Every page in the navigation needs a one-sentence `description` in its frontmatter. A PR check fails without it.
- SDK install version pins are rewritten by `.github/scripts/bump-sdk-versions.mjs`. Keep their textual form.
- When you move or remove a page, add a redirect in `docs.json` and fix every link to it.

## Preview and check

Mintlify's CLI needs Node 22:

```bash
npx -y -p node@22 -p mint@latest -c 'mint dev --port 3333'
npx -y -p node@22 -p mint@latest -c 'mint broken-links'
```

Check the page's Markdown export too (`http://localhost:3333/<path>.md`), since coding agents read that version.
