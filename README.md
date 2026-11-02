For basic info, read: https://www.mintlify.com/docs/quickstart

Download mintlify with `npm i -g mint`.

Start preview with `mint dev`.

Update spell correction dictionary by adding words one per line into `/vale/config/vocabularies/Radar/accept.txt`. Lines can be regex.

Every page in the navigation needs a one-sentence `description` in its frontmatter. Mintlify uses it for search snippets and for the page summary in `/llms.txt`, which AI tools read to find the right page. Update it when a page's scope changes. A PR check fails if a page is missing one.
