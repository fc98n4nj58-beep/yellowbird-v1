# Yellow Bird

Yellow Bird is in final launch packaging / handoff mode.

Milestone 2, Milestone 3, and Milestone 4 are closed. The launch-facing public flow is stable. The latest recorded final smoke QA passed, and the ready worksheet catalog remains 46 / 46 working with 0 ready failures.

## Stable Public Flow

```text
/ -> /browse -> /resource/worksheet/:id -> /catalog-preview.html?id={id} -> /api/catalog-pdf/{id}?disposition=inline
```

Launch-facing public navigation:

- Browse Library
- FAQ
- About
- Contact

## Setup

```sh
npm install
npm start
```

`npm start` runs `node server.js`.

## Environment

Copy `.env.example` if local environment configuration is needed.

`PORT=3000` is optional. The app defaults to port 3000 when `PORT` is not set.

Do not commit `.env`.

## Verification

```sh
git status --short
npm run audit:worksheets
npm start
```

Visit `/qa/smoke` on the running app for the project smoke page. There is no `npm run qa:smoke` script at this time.

Expected launch-facing audit result:

- Ready worksheets: 46 / 46 working
- Ready failures: 0

## Final Smoke URLs

Check these against the running app:

- `/`
- `/browse`
- `/faq`
- `/about`
- `/contact`
- `/health`
- `/qa/smoke`
- `/api/worksheet-catalog?status=ready`
- `/resource/worksheet/g1_addition_facts_within_20`
- `/catalog-preview.html?id=g1_addition_facts_within_20`
- `/api/catalog-pdf/g1_addition_facts_within_20?disposition=inline`

Expected:

- Catalog API returns 46 ready items.
- Catalog PDF returns `application/pdf`.
- Public nav remains Browse Library, FAQ, About, Contact.

## Expected Untracked Files

These are known future/internal/placeholder materials:

- `engine/catalog/`
- `engine/visuals/index`
- `engine/visuals/renderVisual.js`
- `public/styles/images/`

Leave them untracked unless explicitly choosing to promote, ignore, or remove them.

## Guardrails

- One airplane flying.
- Generate once. Transform many times.
- Routes stay thin.
- Renderers render only.
- Make the smallest safe change.

Do not start accounts, payments, memberships, subscriptions, AI worksheet generation, lesson slides, graph visuals, language units, or Content Excellence before final launch packaging is closed.
