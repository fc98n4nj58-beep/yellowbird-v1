# Launch Checklist

## Milestone 5 Goal

Protect the work, make Yellow Bird easy to restart, prepare deployment / launch notes, and avoid big new product work.

## Final Launch Checklist

- [ ] Docs reviewed
- [x] README exists
- [x] Launch checklist exists
- [x] Expected untracked files reviewed
- [x] Private remote backup / push strategy decided
- [x] Final smoke QA passed
- [x] Final manual walkthrough passed
- [x] Final backup branch created
- [x] Go/no-go decision recorded

## Final Smoke QA Checklist

Run the app with `npm start`, then check:

- [x] `/`
- [x] `/browse`
- [x] `/faq`
- [x] `/about`
- [x] `/contact`
- [x] `/health`
- [x] `/qa/smoke`
- [x] `/api/worksheet-catalog?status=ready`
- [x] `/resource/worksheet/g1_addition_facts_within_20`
- [x] `/catalog-preview.html?id=g1_addition_facts_within_20`
- [x] `/api/catalog-pdf/g1_addition_facts_within_20?disposition=inline`

Expected:

- [x] Ready worksheets remain 46 / 46 working
- [x] Ready failures remain 0
- [x] Catalog API returns 46 ready items
- [x] Catalog PDF returns `application/pdf`
- [x] Public nav remains Browse Library, FAQ, About, Contact
- [x] Direct-only internal/beta pages remain marked `noindex,nofollow` with internal/beta/QA messaging

## Manual Walkthrough Checklist

- [x] Home loads
- [x] Browse loads
- [x] Search / filter / sort feel usable
- [x] Detail page loads for sample worksheet
- [x] Preview opens
- [x] PDF opens / downloads
- [x] FAQ loads
- [x] About loads
- [x] Contact loads
- [x] Mobile Browse sanity check
- [x] Mobile detail sanity check

## Expected Untracked Files

These are known future/internal/placeholder materials:

- [ ] `engine/catalog/`
- [ ] `engine/visuals/index`
- [ ] `engine/visuals/renderVisual.js`
- [ ] `public/styles/images/`

Leave them untracked unless explicitly choosing to promote, ignore, or remove them.

Decision: leave visible as untracked for Milestone 5.

Reason: these paths are known future/internal/placeholder material, not imported by active launch-facing code, and not needed for the stable public flow.

Later cleanup may delete empty placeholders or decide whether to promote/delete the future visual helper files.

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

Date: 2026-07-03

Reviewer: David Birnie

Decision: GO for final launch packaging / deployment preparation

Notes:

Yellow Bird is launch-packaged at the local/private-backup level. Public launch-facing flow is verified. Remaining work is deployment-host selection and any final production environment setup, not core app readiness.

Private GitHub remote backup completed. `main`, `backup/milestone-4-closed`, and `backup/milestone-5-task-1` have been pushed. Remote remains private.

Final backup branch created: `backup/milestone-5-closed`.

Final smoke QA and manual walkthrough passed. Ready launch-facing worksheets remain 46 / 46 working with 0 ready failures. Mobile browse/detail sanity passed at 390px. No blockers found.
