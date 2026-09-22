# Kenn Hunat — portfolio

A personal portfolio built on the [Zesty.io Next.js starter](https://github.com/zesty-io/nextjs-starter). Content lives in Zesty; Next.js renders it.

**Stack:** Next.js 12.3 (Pages Router) · React 17 · JavaScript · Three.js · GSAP · MUI (starter leftovers only)

```bash
npm run dev     # http://localhost:3000
```

Start at `/home/` — that is the portfolio landing page. `/` still serves an older duplicate model (see [Known rough edges](#known-rough-edges)).

---

## How a page renders

Two data paths run side by side. Understanding the split explains most of the codebase.

```
                     ┌──────────────────────── Zesty.io instance ───────────────────────┐
                     │                                                                  │
   browser           │   /<path>/?toJSON        /portfolio.json      /test-view.json    │
      │              │   one content item       all datasets         filtered projects  │
      │              └───────▲──────────────────────▲───────────────────────▲───────────┘
      │                      │                      │                       │
      │              ┌───────┴──────────┐   ┌───────┴────────┐   ┌──────────┴─────────┐
      │              │ fetchZestyPage   │   │fetchZestyPortf.│   │ /api/projects      │
      │              └───────▲──────────┘   └───────▲────────┘   └──────────▲─────────┘
      │                      │                      │                       │
      │                      └──── getServerSideProps ────┘                 │ (browser
      │                                   │                                 │  fetch)
      ▼                                   ▼                                 │
  GET /work/  ─────────────►  pages/[...slug].js                            │
                                          │                                 │
                                          ▼                                 │
                              components/zesty/ZestyView.js                 │
                       resolves meta.model_alternate_name ──► views/zesty/Work.js
                                          │                                 │
                                          ▼                                 │
                              layout/Portfolio + components/portfolio/* ◄────┘
```

**Path 1 — the routed item.** `pages/[...slug].js` is a catch-all. It asks Zesty for whatever content item lives at the requested URL (`fetchZestyPage` → `?toJSON`), then `ZestyView` reads `meta.model_alternate_name` off the response and renders the matching component from `views/zesty/`. Nothing is hard-coded: a new page in Zesty appears as soon as a view with the matching name exists.

**Path 2 — the shared datasets.** A single page's `?toJSON` only contains that item's own fields. The project lists, roles, tech, experience, stack groups and site settings are separate models with no URLs of their own, so `fetchZestyPortfolio` pulls them in one request from a custom Parsley endpoint (`/portfolio.json`) and attaches them to `props.portfolio`. Every view reads them at `content.portfolio`.

**Path 3 — interactive filtering.** Clicking a filter chip calls `/api/projects/`, a Next API route that proxies Zesty's `/test-view.json` (a Parsley endpoint that filters by role and tech ZUID). It is a proxy rather than a direct browser call so the stage password stays on the server — see [Secrets](#secrets).

### Where the props come from

```js
function Work({ content }) {
  content.intro              // the Work item's own field, from ?toJSON
  content.portfolio.projects // shared dataset, from /portfolio.json
  content.meta.web           // Zesty SEO fields, consumed by ZestyHead
}
```

---

## Routes

| URL | View | Content model |
|---|---|---|
| `/home/` | `views/zesty/Home.js` | `home` — hero + statement |
| `/work/` | `views/zesty/Work.js` | `work` — client projects, filterable |
| `/lab/` | `views/zesty/Lab.js` | `lab` — side projects, filterable |
| `/about/` | `views/zesty/About.js` | `about` — bio, stack groups, timeline |
| `/contact/` | `views/zesty/Contact.js` | `contact` — email, links, CV |
| `/projects/<slug>/` | `pages/projects/[slug].js` | `projects` dataset |
| `/api/projects/` | `pages/api/projects.js` | filter proxy (JSON, not a page) |

`/projects/<slug>/` is a **real Next route**, not a Zesty-routed one, because `projects` is a Headless Dataset — its items have no URLs. Next gives concrete routes priority over the `[...slug]` catch-all, so the two coexist without special-casing.

---

## Structure

```
pages/
  [...slug].js            Zesty catch-all: fetch item + datasets, hand to ZestyView
  index.js                delegates to [...slug] so / works the same way
  projects/[slug].js      case-study pages, read from the portfolio dataset
  api/projects.js         server-side proxy for filtered project queries
  _app.js                 global CSS, ZestyHead, RouteProgress

views/zesty/              ONE COMPONENT PER CONTENT MODEL — see "Adding a page"
  Home Work Lab About Contact      ← the portfolio
  Project Role Tech Experience …   ← generated for datasets; never routed
  index.js                         ← generated, do not hand-edit

components/
  portfolio/              everything the design needs (see below)
  zesty/                  ZestyView (model → component), ZestyHead (SEO)
  marketing-example/      starter scaffold, unused

lib/zesty/
  fetchPage.js            one URL -> one content item (?toJSON)
  fetchPortfolio.js       all datasets in one request (/portfolio.json)
  fetchInstant.js         one model's items (/-/instant/<zuid>.json)
  fetchRoutes.js          Zesty's route table, for getStaticPaths if you switch to ISR
  fetchRedirects.js       feeds next.config.js redirects()
  splitSections.js        splits WYSIWYG HTML into <h2> sections — CLIENT-SAFE
  serverConfig.js         the stage password, server-only
  sync.js                 generates views/zesty/* from the instance schema

layout/
  Portfolio/              the portfolio shell: header, footer, fonts
  Main/                   starter shell (MUI); no longer wraps anything

styles/portfolio.css      the whole design system, imported once in _app.js
```

### `components/portfolio/`

| File | Purpose |
|---|---|
| `Hero.js` | Three.js particle hero — samples "KENN" from a canvas, runs a spring simulation |
| `SplitTitle.js` | per-character GSAP reveal on scroll |
| `ProjectIndex.js` | project lists + role/stack filters, talks to `/api/projects/` |
| `GeneratedCover.js` | deterministic canvas fallback when a project has no cover image |
| `CaseBar.js` | top bar on case studies, replaces the site header |
| `SectionHead.js` `AboutBody.js` `ContactBody.js` | shared section pieces |
| `Header.js` `RollLink.js` `CopyEmail.js` `LocalTime.js` | nav and small widgets |
| `RouteProgress.js` | top loading bar — every page is SSR'd, so clicks wait on Zesty |

---

## Adding a page

1. Create the model and item in the Zesty manager, and publish.
2. `npm run sync` — generates `views/zesty/<ModelName>.js` and updates `index.js`.
3. Replace the generated body. The item's fields are on `content`; datasets on `content.portfolio`.
4. Add it to `NAV` in `components/portfolio/Header.js` if it needs a nav link.

`sync` never overwrites an existing view, which is why a re-sync is safe — and why a stale scaffold file stays stale until you edit it.

> **If a page renders blank with no error**, `meta.model_alternate_name` does not match any export in `views/zesty/index.js`. `ZestyView` resolves by name and fails silently. Check that first.

---

## Secrets

The Zesty **preview domain is password protected** — `/-/instant/…` and the custom endpoints return `401` without `?zpw=`. The production domain ignores the parameter entirely.

The password lives in `ZESTY_STAGE_PASSWORD` (`.env.local`) and is read only by `lib/zesty/serverConfig.js`.

**It must never be imported from client-reachable code.** `next.config.js` strips `stage_password` out of the `env.zesty` object for exactly this reason:

```js
const { stage_password, ...zestyPublic } = zestyConfig;
```

The subtle trap: importing *anything* from a module that imports `serverConfig` pulls the whole config into that page's client bundle, even if the value is only used inside `getServerSideProps`. That is why `splitSections` lives in its own file rather than in `fetchPortfolio.js` — it is called during render, so its module ships to the browser.

After changing anything in this area:

```bash
grep -rl "$ZESTY_STAGE_PASSWORD" .next/static   # must return nothing
```

---

## Build and deploy

```bash
npm run build   # compiles to .next
npm start       # serves the build on :3000
```

**Never run `npm run build` while `npm run dev` is running.** They share `.next` and corrupt each other; the symptom is `ENOENT … _document.js` or `Cannot find module for page: /404`, with the failing page varying between runs. Stop one first.

**Check the real exit code.** Piping the build (`npm run build | tail`) reports `tail`'s exit status, not Next's. A successful build ends with the `Route (pages) … First Load JS` table — if that table is missing, it failed.

Two settings worth knowing:

- **`swcMinify: true`** is required. `three@0.186` emits ES2022 `static { … }` blocks, which Next 12's bundled Terser cannot parse; the build fails during minification without it.
- **`trailingSlash: true`** means every internal href needs a trailing slash, including `fetch('/api/projects/?…')` — without it you eat a 308 redirect per request.

Before deploying: set `PRODUCTION=true` so the fetchers target the production domain, and change `postinstall` — it runs `zesty init`, which needs interactive auth and will fail in CI.

### Rendering mode

Every page uses `getServerSideProps`, so each request hits Zesty. Content edits appear on refresh, at the cost of time-to-first-byte. To trade that for speed, switch to `getStaticProps` + `revalidate` and feed `getStaticPaths` from `fetchZestyRoutes()` — the helper is already there for it.

---

## Known rough edges

- **`/` serves an old `homepage` model**, a near-duplicate of `home` carrying a typo'd field (`contact_introqweq`). The tidy fix is to point `/` at the Home item and retire `/home/`.
- **The footer contact intro is page-dependent.** `ContactBody` takes its intro from whichever page is in scope, so `/work/` shows the Work intro under a Contact heading. Fix by adding a `contact_intro` field to the `site_settings` model.
- **Production content lags stage** — fewer roles and tech, no stack groups. Publish before flipping `PRODUCTION=true`.
- **Unused scaffold:** `components/marketing-example/`, `components/ZestyTutorial.js`, `layout/Main/`, and the non-exported views (`ABExample`, `Layout`, `Personalization`, `Widget`). The views are never bundled — `views/zesty/index.js` does not export them — so they cost nothing until deleted.
- **Dead import:** `pages/[...slug].js` still has `import Main from 'layout/Main'` with the `<Main>` wrapper commented out. Worth removing — it may keep MUI in that page's bundle for no benefit.
- **`.env.local` and `zesty.config.json` are committed.** Both carry the stage password. Keep this repo private or move them out before publishing.

---

## Reference

- [Parsley (Zesty templating)](https://zesty.org/services/web-engine/introduction-to-parsley/parsley-index) — the custom `/portfolio.json` and `/test-view.json` endpoints are Parsley files in the instance's Code section
- [Zesty Media API](https://zesty.org/services/media-storage-micro-dam/on-the-fly-media-optimization-and-dynamic-image-manipulation) — `?width=` resizing, used instead of `next/image`
- [Zesty Next.js starter](https://github.com/zesty-io/nextjs-starter) — upstream template
