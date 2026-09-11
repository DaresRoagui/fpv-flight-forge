# FPV Flight Forge — Project Handoff

Last updated: 2026-09-11

## Active workflow

- Repository: `DaresRoagui/fpv-flight-forge`
- Working branch: `devin/1788666549-fpv-mvp`
- Production branch: `main`
- Pull request: #1
- Development rule: continue all iterative work on the working branch. Do not merge to `main` until the current iteration has been reviewed in Vercel Preview.

## Vercel deployment flow

The GitHub workflow `.github/workflows/vercel-deploy.yml` is intentionally split by branch:

1. Push to `devin/1788666549-fpv-mvp` -> Vercel Preview deployment.
2. Review the Preview URL and validate functionality/visual behavior.
3. Continue fixing on the same working branch; every push should refresh Preview.
4. When the project is stable, merge PR #1 into `main`.
5. Push/merge to `main` -> Vercel Production deployment.

Required GitHub secrets:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Never use `--prod` from the working branch.

## Product goal

Build a deterministic complete-kit FPV recommender centered on the aircraft:

**Goggles + Drone + Radio + Charger + Batteries**

Recommendations must optimize the complete compatible bundle, not independent product winners.

Core inputs include:
- budget
- experience
- flight style
- video preference
- FULL_KIT / DRONE_ONLY / COMPLETE_EXISTING_SETUP
- advanced priority
- environment
- owned gear
- regulatory region

Hard compatibility must always dominate scoring.

## Research source of truth

Curated research segments 01–24 from the project Library are the source of truth. Do not re-research or silently replace approved products unless explicitly requested.

Important compatibility rules:
- aircraft profile is the center of compatibility
- hard-filter video, goggles generation, radio protocol/band, cells, chemistry, connector, exact capacity, physical fit, charger compatibility and completeness before scoring
- large battery capacity is aircraft-specific, not globally valid/invalid
- CineLog35 V3: 6S 1100–1300 mAh
- Cinebot35: 6S 1300–1550 mAh
- large 7-inch long-range aircraft such as MOZ7 may legitimately use ~3300 mAh
- Mark5 is freestyle-first and must not win competitive racing
- racing + explicit DJI O4 must return a curated race-oriented O4 compromise with a tradeoff warning, not an empty result
- competitive digital racing should generally favor HDZero when video preference permits it

## Iteration status

### Iteration 1 — Drone catalog
Status: IMPLEMENTED on working branch.

Implemented:
- curated drone inventory for Segments 01–09
- 99 auditable source/derived drone records
- 23 source-complete drones currently enabled for normal recommendation
- gated WATCHLIST / CONDITIONAL / DO_NOT_DEFAULT / LEGACY records
- exact AircraftProfile metadata for enabled products
- distinct technical variants instead of ambiguous merged products
- HDZero racing inventory represented
- O4 race-oriented compromise represented
- Mark5/Vapor-D5 classification corrections
- catalog sanity tests
- schema support for video unit and dry weight

Important architecture:
- `CURATED_DRONE_CATALOG`: complete auditable curated catalog
- `CURATED_RECOMMENDER_DRONES`: only records safe for normal recommendation
- missing research data is represented as catalog-only instead of fake prices/specifications

Known Iteration 1 limitation:
- several Segment 03/04/07 products remain `CATALOG_ONLY` because exact price/battery/connector/variant details need Segments 10–17, especially battery research
- Meteor65 Pro II O4 contains a research discrepancy that must be reconciled with the battery catalog rather than guessed

## Next task — Iteration 2

Complete and sanitize:
- Segment 10: analog goggles
- Segment 11: DJI goggles / O3/O4 generation compatibility
- Segment 12: ELRS radios
- Segment 13: 1S chargers
- Segment 14: 2S–6S chargers
- Segment 15: tinywhoop batteries
- Segment 16: freestyle/cinematic batteries
- Segment 17: racing batteries

Required corrections include:
- DJI Goggles N3 real display/specs and O4 compatibility; do not claim unsupported O3 compatibility
- RadioMaster Pocket value/default path should use ELRS when research says so
- current RadioMaster generation instead of stale generation
- real HDZero goggle/component path
- exact battery cells/chemistry/connector/capacity/weight
- fix misleading battery IDs
- preserve aircraft-specific 3300 mAh behavior

Do not perform the major `recommendation.ts` combination/scoring refactor until Iteration 3.

## Iteration roadmap

1. Drone catalog — implemented
2. Goggles/radios/chargers/batteries — next
3. Bundle candidate generation + complete scoring refactor
4. Coverage, alternatives, accessories, regulation and UX QA
5. Product images/assets, final QA and production deploy

## Safety / change rules

- work on `devin/1788666549-fpv-mvp`
- do not modify `main` directly
- no production deploy before Preview review
- no invented specs to satisfy TypeScript/schema
- preserve ES/EN
- preserve USD/COP with `COP_PER_USD = 3200`
- preserve FULL_KIT / DRONE_ONLY / COMPLETE_EXISTING_SETUP
- keep recommendation deterministic
- prefer targeted unit/regression tests over large Playwright expansion until final QA

## Key files after Iteration 1

- `lib/schema.ts`
- `lib/catalog-schema.ts`
- `lib/products.ts`
- `lib/curated-drone-products.ts`
- `data/curated-drones.ts`
- `data/curated-drones-01.ts`
- `data/curated-drones-02.ts`
- `data/curated-drones-03-09-manifest.ts`
- `data/curated-drones-enabled-03-09.ts`
- `data/curated-drone-derived-variants.ts`
- `data/curated-drone-helpers.ts`
- `tests/catalog-sanity.test.ts`
- `.github/workflows/vercel-deploy.yml`

## Continuation checklist for the next agent/session

1. Read this file first.
2. Confirm current branch and head before changing files.
3. Inspect the latest Vercel Preview deployment for this branch.
4. Treat curated research as source of truth.
5. Continue with Iteration 2 only after resolving any build/type errors exposed by Preview.
6. Update this `HANDOFF.md` after every completed iteration with head SHA, Preview status and remaining work.
