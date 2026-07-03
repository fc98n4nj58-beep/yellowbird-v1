# Launch Checklist

## Milestone 5 Goal

Protect the work, make Yellow Bird easy to restart, prepare deployment / launch notes, and avoid big new product work.

## Final Launch Checklist

- [ ] Docs reviewed
- [ ] README exists
- [ ] Launch checklist exists
- [ ] Expected untracked files reviewed
- [ ] Private remote backup / push strategy decided
- [ ] Final smoke QA passed
- [ ] Final manual walkthrough passed
- [ ] Final backup branch created
- [ ] Go/no-go decision recorded

## Final Smoke QA Checklist

Run the app with `npm start`, then check:

- [ ] `/`
- [ ] `/browse`
- [ ] `/faq`
- [ ] `/about`
- [ ] `/contact`
- [ ] `/health`
- [ ] `/qa/smoke`
- [ ] `/api/worksheet-catalog?status=ready`
- [ ] `/resource/worksheet/g1_addition_facts_within_20`
- [ ] `/catalog-preview.html?id=g1_addition_facts_within_20`
- [ ] `/api/catalog-pdf/g1_addition_facts_within_20?disposition=inline`

Expected:

- [ ] Ready worksheets remain 46 / 46 working
- [ ] Ready failures remain 0
- [ ] Catalog API returns 46 ready items
- [ ] Catalog PDF returns `application/pdf`
- [ ] Public nav remains Browse Library, FAQ, About, Contact
- [ ] Direct-only internal/beta pages remain marked `noindex,nofollow` with internal/beta/QA messaging

## Manual Walkthrough Checklist

- [ ] Home loads
- [ ] Browse loads
- [ ] Search / filter / sort feel usable
- [ ] Detail page loads for sample worksheet
- [ ] Preview opens
- [ ] PDF opens / downloads
- [ ] FAQ loads
- [ ] About loads
- [ ] Contact loads
- [ ] Mobile Browse sanity check
- [ ] Mobile detail sanity check

## Expected Untracked Files

These are known future/internal/placeholder materials:

- [ ] `engine/catalog/`
- [ ] `engine/visuals/index`
- [ ] `engine/visuals/renderVisual.js`
- [ ] `public/styles/images/`

Leave them untracked unless explicitly choosing to promote, ignore, or remove them.

## Deferrals / Do Not Start

Do not start these during final launch packaging:

- Graph visuals / `bar_graph`
- Accounts
- Subscriptions
- Payments
- Memberships
- AI worksheet generation
- Lesson slides
- Content Excellence / Product Differentiation Pass
- Language units

## Go / No-Go Notes

Date:

Reviewer:

Decision:

Notes:
