# Radar docs style guide

How pages in this repository are written and formatted. People and coding agents both follow it. When a page and this guide disagree, fix the page.

The bar is the best developer documentation you have used: every page gets a developer to a working result, says only what is true, and reads as if one person wrote all of it.

## Principles

1. **Lead with the task.** A page opens with one or two sentences that say what the reader has working at the end. No "This page describes", no welcome, no product pitch.
2. **Say what to do, then how to check it worked.** Every procedure ends with something the reader can observe.
3. **One home per fact.** A guide gives the workflow. Reference defines methods and fields. Link to the canonical place instead of restating it. Shared procedures live in `snippets/`.
4. **Only verified facts.** Every method, field, default, limit, and UI label matches the released SDK, the API, or the current dashboard. If you can't verify it, leave it out.
5. **Formatting carries meaning.** Bold, code, and callouts each mean one thing (below). If everything is emphasized, nothing is.

## Voice

- Second person, present tense, active voice: "Radar returns a token", not "a token will be returned".
- Use contractions for negatives: don't, can't, isn't, doesn't.
- Use plain verbs: use (not utilize), let (not allow you to), need (not require) where it reads naturally.
- No filler or selling: seamlessly, powerful, robust, industry-leading, easily, simply, just, please, note that, in order to.
- "For example", not "e.g.". "That is", not "i.e.". "And so on", not "etc.".
- Straight quotes. No em dashes or en dashes; use a comma, a colon, or two sentences.
- State requirement strength exactly: "must" for required, "we recommend" for recommended, "can" for optional. Don't use "should".
- Don't write change history into a page ("previously", "earlier versions of this page said"). Describe current behavior. Version-specific behavior goes in the reference page's upgrade notes.
- Don't write disclaimers about how an example was produced or tested. An example in a page is one we stand behind; if we don't, it isn't in the page.

## Page structure

### Frontmatter

```mdx
---
title: "Track pickups, deliveries, and workers"
sidebarTitle: "Trips"
description: "Start, update, and complete trips to power pickup, delivery, and workforce tracking with live ETAs and arrival detection."
---
```

- `title`: sentence case. Guides start with a verb. Reference pages are a noun phrase ("Trips API", "iOS SDK").
- `sidebarTitle`: set it when the title is longer than about 30 characters. Two to four words.
- `description`: required. One sentence, under 160 characters, that says what the reader can do with the page. A CI check fails without it.
- Imports for snippets go directly after the frontmatter.

### Headings

- Don't repeat the title as an H1. Sections start at `##`.
- Sentence case, no trailing punctuation, no bold, no links.
- Task sections start with an imperative verb: "Create a geofence", "Validate the token on your backend". Not gerunds ("Creating a geofence") and not labels ("Geofence creation").
- Reference sections are noun phrases or the operation name: "Trip object", "List trips", "Errors".
- Code in a heading only when the heading is the identifier being documented, such as an event name or method.
- `##` and `###` in guides. `####` only in reference pages, for the parts of one operation.
- Don't skip levels. Don't put a heading directly under another heading with no text between them unless the lower heading starts a list of parallel items.
- **Don't rename a published heading.** Headings are link anchors. Customers, other pages, and the legacy-link pages (`api.mdx`, `faqs.mdx`, `geofencing/fraud.mdx`) depend on them. Headings that predate this guide stay as they are even if they break the rules above.

### Implementation guides

The product guides use these `##` sections, in this order. The task headings in row 6 are named for the guide's own steps.

| Order | Heading | Contents |
| --- | --- | --- |
| 1 | (opening, no heading) | What works at the end, in one or two sentences. |
| 2 | Complete example | The whole implementation at a glance, one tab per platform. See [Complete examples](#complete-examples). |
| 3 | Build with an agent | The copyable prompt. See [Agent prompts](#agent-prompts). |
| 4 | Prerequisites | Platform, SDK versions, access, environment, and permissions. A bulleted list. |
| 5 | How it works | Who does what: your app, Radar, your backend, downstream systems. A table or a short numbered list. |
| 6 | Task headings | Setup and implementation, in the order the reader does them. |
| 7 | Handle results and errors | Expected responses, each error and degraded path, and recovery. |
| 8 | Test the integration | The happy path and each meaningful failure path. |
| 9 | Production checklist | A task list (`- [ ]`) of things to confirm before launch. |
| 10 | See also | Links to reference and related guides. Last line points back to the agent prompt. |

Don't use generic task headings such as "Set up and implement" or "Expected responses and how to use them". Name the task.

### Reference pages

API operations follow one shape:

```mdx
## List trips

One sentence saying what the operation does.

- **Endpoint**: `GET /v1/trips`
- **Authentication**: Secret key
- **Rate limit**: 10 requests per second

### Query parameters

| Parameter | Type | Required | Description |

### Response

### Example

### Errors
```

SDK methods give, in order: one sentence of purpose, the signature, a parameter table, what the callback or return value contains, errors, and one example.

## Text formatting

### Bold

Use bold for exactly two things:

1. **Dashboard and other UI labels**, written exactly as they appear: click **Reset key**, the **API keys** section.
2. **The term that opens a list item or definition**, followed by a colon outside the bold: `- **Authentication**: Secret key`.

Don't use bold for emphasis, for whole sentences, for product or company names, for links, in headings, or in callouts. If a sentence needs emphasis, rewrite it so the important part comes first, or use a `<Warning>` if it qualifies.

### Italic

Don't use italics. Not for UI labels (bold), not for emphasis (rewrite), not for introducing a term (define it in the sentence).

### Code formatting

Use backticks for anything the reader types, or that a system returns:

- Methods, with parentheses: `Radar.trackOnce()`
- Parameters, fields, and values: `userId`, `passed`, `true`, `"car"`
- Event names: `user.entered_geofence`
- Endpoints, with the method: `GET /v1/geofences`
- HTTP status codes, headers, file names, paths, package names, environment variables, key prefixes: `402`, `X-Radar-Signing-Id`, `Info.plist`, `prj_test_pk_`

Don't use code formatting for product names, UI labels, or version numbers in prose ("iOS SDK 3.46.0 or later").

### Numbers and units

Numerals with a unit and a space: 5 seconds, 100 meters, 10 requests per second. Spell out the unit. In tables, name the unit in the description ("Radius in meters.").

## Callouts

Three callouts, each with one meaning. Most sections need none.

| Component | Use it for | Example |
| --- | --- | --- |
| `<Warning>` | Something that exposes credentials or user data, loses data, breaks a production integration, or can't be undone if the reader misses it. | Never put a secret key in client code. |
| `<Info>` | Availability: the feature depends on a plan, on account enablement, or on a minimum version. | Multi-leg trips must be enabled for your project. |
| `<Note>` | A fact that prevents a likely wrong assumption and doesn't fit the flow of the text. | Sync and import both upsert. Rows missing from the file aren't deleted. |

Rules:

- At most two sentences. Plain text, inline code, and links only. No bold lead-in, no heading, no list, no code block.
- A callout never contains a step. Required instructions go in the body, in order.
- Don't stack callouts, and don't open a page with one unless it's an `<Info>` saying the whole page is plan-gated.
- Don't use `<Tip>`, `<Check>`, or `<Danger>`.
- Before adding a callout, try writing it as a normal sentence in the right place. Keep the callout only if the reader would be harmed or blocked by skimming past it.
- A fact stated in a callout isn't repeated in the body next to it.

Standard wording:

```mdx
<Info>
  The Braze integration is available on the [Enterprise plan](https://radar.com/pricing).
</Info>

<Info>
  Multi-leg trips must be enabled for your project. Contact your Radar account team.
</Info>

<Warning>
  Use publishable keys in client code. Never put a secret key in an app or web page.
</Warning>
```

## The dashboard

- The product is the **Radar dashboard** on first mention in a page, then "the dashboard". Lowercase "dashboard".
- Name the page and link the page name the first time it appears in a section. "page" stays outside the link:

  ```mdx
  On the [Settings](https://dashboard.radar.com/settings) page, under **API keys**, click **Reset key**.
  ```

- Later mentions in the same section are plain text: "the Settings page".
- Sections, tabs, buttons, fields, and options are bold and match the UI label exactly, including its capitalization.
- A path through nested UI uses `>`: **Organization settings** > **Connectors**.
- One verb per control type:

  | Control | Verb |
  | --- | --- |
  | Button or link | click |
  | Option, tab, dropdown item, checkbox, radio button | select |
  | Text field | enter |
  | Toggle | turn on, turn off |
  | Page | open |

- Say what the reader sees afterward: "The new rule appears in the list with the status **Enabled**."
- Dashboard steps are written in words. Don't refer to a screenshot or to on-screen position ("in the top right").
- Use these URLs. Don't link to a dashboard URL that isn't on this list without checking that it exists.

  | Page | URL |
  | --- | --- |
  | Settings | `https://dashboard.radar.com/settings` |
  | Integrations | `https://dashboard.radar.com/integrations` |
  | Users | `https://dashboard.radar.com/geofencing/users` |
  | Locations | `https://dashboard.radar.com/geofencing/locations` |
  | Events | `https://dashboard.radar.com/geofencing/events` |
  | Geofences | `https://dashboard.radar.com/geofencing/geofences` |
  | Beacons | `https://dashboard.radar.com/geofencing/beacons` |
  | Simulator | `https://dashboard.radar.com/geofencing/simulate` |

## Plans, access, and support

- Plan-gated: "X is available on the [Enterprise plan](https://radar.com/pricing)." in an `<Info>` at the top of the page or section it applies to. Link the plan name, not bold.
- Account-gated: "X must be enabled for your project. Contact your Radar account team."
- The people are "your Radar account team". Not "your CSM", "the Radar team", or "your Radar representative".
- For help: "contact [Radar support](https://radar.com/support)".

## Links

- Link text is the destination's title or heading, or a phrase that names it. Never "here", "this page", or a bare URL.
- Internal links are root-relative with no extension: `/geofencing/trips#track-pickups`.
- Cross-references use "See": "See [Trips API](/api/trips)." With a reason when it helps: "For every parameter, see [Create a trip](/api/trips#create-a-new-trip)." Don't use "Learn more", "Refer to", "Check out", or "Read".
- Link a given destination once per section, at the point the reader needs it.
- External links go to the primary source (Apple, Android, the partner's docs), and only where the reader needs them.
- Before you add an anchor link, check that the heading exists.

## Lists, steps, and tables

- **Steps**: use `<Steps>` for a procedure of three or more steps in a guide. Step titles are imperative, sentence case, no trailing period. Use a plain numbered list for short procedures inside reference pages and snippets.
- **Bullets**: for unordered items. Parallel grammar. A full sentence ends with a period; a fragment doesn't. Don't mix the two in one list.
- **Definition-style lists**: `- **Term**: explanation.`
- **Tables**: for anything with two or more attributes per item. Header cells are sentence case. Standard columns:

  | Table | Columns |
  | --- | --- |
  | API parameters | Parameter, Type, Required, Description |
  | Object fields | Field, Type, Description |
  | SDK options | Option, Type, Default, Description |
  | Errors | Status or Code, Meaning, What to do |
  | Platform support | Capability, then one column per platform |

  Type cells use one vocabulary: string, number, integer, boolean, object, array of X, GeoJSON geometry, ISO 8601 string.

  The first column is code-formatted. Required is "Yes", "No", or "Conditional" with the condition in the description. An absent default is "None". Platform support cells are "Yes", "No", or "Partial" with a short reason. Descriptions are full sentences with periods.
- **State machines and decisions**: a table, not a diagram.
- **Tabs and accordions**: `<Tabs>` only for mutually exclusive paths the reader picks once (Expo or bare React Native). `<Accordion>` only for long optional material. Never put required setup in an accordion.

## Code

- Every block has a language, and it is the real one: `swift`, `objc`, `kotlin`, `java`, `javascript`, `typescript`, `jsx`, `dart`, `csharp`, `python`, `json`, `xml`, `html`, `gradle`, `ruby`, `yaml`, `sql`, `csv`, `powershell`. Shell is `bash`, not `sh`. Output, prompts, and anything with no language is `text`.
- Multi-platform examples go in a `<CodeGroup>`. Labels and order:

  Swift, Objective-C, Kotlin, Java, JavaScript, React Native, Flutter, then others.

  Server examples: Node.js, Python. A block that shows a file's contents is labeled with the file name (`AndroidManifest.xml`).
- Include only platforms the page supports. Don't add a tab that says "not supported".
- Examples are complete enough to paste: imports, initialization or a link to it, error handling, and a visible success condition.
- Idiomatic for the language. Not a translation of another platform's sample.
- Comments are rare, sentence case, and explain why, not what.
- Synthetic data only: `user-123`, `store-42`, `order-789`, `example.com`. No customer names, real IDs, or real keys.
- Keys: `prj_test_pk_...`, `prj_live_pk_...`, `prj_test_sk_...`, `prj_live_sk_...`. Client examples use publishable keys only. Server examples read the secret key from an environment variable.
- Don't log tokens or precise locations in examples.
- JSON is valid JSON. Shorten a response by removing fields, never with `...` or comments.
- Pseudocode is labeled as pseudocode in the sentence that introduces it, and uses the `text` language.
- Introduce every block with a sentence that says what it does. Don't put two blocks back to back with nothing between them.

## Complete examples

Each implementation guide has a `## Complete example` section directly after the opening, so a reader sees the whole implementation before the explanation.

- One sentence above the code. The sections below it explain each part.
- A `<CodeGroup>` with one tab per platform that can do the whole task: imports, initialization, identifying the user, permission where needed, the core call, and handling the result, including failure.
- Every tab does the same thing in the same order, so platforms compare line by line.
- If the task has a backend half, a second `<CodeGroup>` follows with Node.js, and Python where the page has it.
- Desktop tabs (macOS, Windows) appear only on Geo-compliance guides.
- The complete example and the step-by-step sections use the same method names, options, and result handling.

## Results and decisions

Describe results in Radar's own terms: `passed`, `failureReasons`, warnings, expiry, a risk level, an error status. Don't invent a decision vocabulary on top ("allow", "deny", "step up" enums, policy modules, wrapper result types). A backend example verifies the token, reads Radar's fields, and rejects the action when `passed` is `false`.

Don't frontload edge-case lifecycle code such as logout resets. Say that `userId` is nullable, and link to the page that covers user switching.

## Live demos

The Maps guides embed live components from `snippets/radar-demos.jsx` (a map, an address autocomplete, a store locator). They run the Radar web SDK in the page with a demo publishable key.

- Place a demo directly under the page opening, or next to the code it demonstrates, and make sure the code shown on the page produces what the demo shows.
- A demo never replaces instructions or code. The page must work as Markdown without it.
- In that file, only exported components can be used as JSX tags. Shared pieces are plain functions.

## Agent prompts

Each implementation guide has a `## Build with an agent` section directly after the complete example.

- First line, exactly: "Copy this prompt into a coding agent that has access to your repository."
- The prompt is one `text` code block. It names the task, links the guide's own Markdown URL (`https://docs.radar.com/<path>.md`), the platform SDK reference, and the relevant API page, states the constraints, and lists the guide-specific tests.
- The last line of the page, exactly: "To have a coding agent implement this guide, use the prompt in [Build with an agent](#build-with-an-agent)."

## Words we use

| Use | Not |
| --- | --- |
| Geo-compliance, Fraud, Geofencing, Maps (products) | Protect, Engage, Optimize, Reveal, Geofencing Platform, Maps Platform |
| Radar dashboard, the dashboard | Dashboard (capitalized), back office, admin |
| publishable key, secret key | public key, private key, API key (when the type matters) |
| Test environment, Live environment | sandbox, production environment, test mode |
| your app (client), your backend (server) | application, your server, server-side code |
| verified location check, then "check" | verification call, verified request |
| geolocation token, then "token" | JWT (unless describing the format), location token |
| geofence, place, trip, beacon (lowercase) | Geofence, Trip |
| Places (the feature), Radar SDK, Radar API | places feature, the SDK's API |
| user ID (concept), `userId` (field) | UserID, user id |
| iOS, Android, web (lowercase web) | Web, the browser SDK |
| turn on, turn off | enable, disable (for toggles) |
| sign in, sign out (dashboard accounts) | log in, login |
| your Radar account team | CSM, account rep |

Keep exact technical identifiers even when they contain a retired name: `Radar.revealRisk()`, `@radarlabs/plugin-fraud`.

## Images

Pages currently have no screenshots or illustrations. Don't add one, and don't write text that depends on one. When screenshots return, they'll be current-UI captures with synthetic data and alt text, and the written step must still work without them.

## Before you open a pull request

- `mint dev` renders the page with no MDX errors (needs Node 22).
- `mint broken-links` passes.
- Every new anchor link resolves, and no published heading was renamed.
- The page's Markdown export (`<page-url>.md`) contains the full instructions, including snippet content.
- No customer names, real identifiers, keys, or internal links.
