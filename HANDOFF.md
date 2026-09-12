# FPV Flight Forge — Project Handoff

Last updated: 2026-09-12

## Active workflow

- Repository: `DaresRoagui/fpv-flight-forge`
- Working branch: `devin/1788666549-fpv-mvp`
- Production branch: `main`
- `main` base currently used by this branch: `0e2cf99ae88cc2b75134155531a9d4bba69ac72a`
- Continue iterative work on the working branch. No production deploy as part of Iteration 2.

## Product goal

Build a deterministic complete-kit FPV recommender centered on the aircraft:

**Goggles + Drone + Radio + Charger + Batteries**

Hard compatibility must always dominate scoring. Missing research data must remain nullable/gated rather than being replaced by invented values.

## Research source of truth

Primary curated research used so far:
- Segments 01–09: aircraft
- Segment 10: analog goggles
- Segment 11: DJI goggles / O3-O4 compatibility
- Segment 12: ELRS radios
- Segment 13: 1S chargers
- Segment 14: 2S–6S chargers
- Segment 15: 1S/2S tinywhoop batteries
- Segment 16: freestyle/cinematic batteries
- Segment 17: racing batteries
- Segment 19: global compatibility/category coherence
- Segment 20: final recommendation/scoring handoff

Do not silently replace curated CORE products with autonomous discoveries.

## Iteration 1 — Drone catalog

Status: IMPLEMENTED.

- 99 auditable curated/derived drone records.
- 23 enabled runtime drone records with exact price + AircraftProfile.
- WATCHLIST / CONDITIONAL / DO_NOT_DEFAULT / LEGACY gating.
- Mark5 and Vapor-D5 role corrections.
- Exact aircraft-specific battery envelopes for enabled aircraft.
- HDZero racing inventory represented in audit catalog.

## Iteration 2 — Components and compatibility

Status: IMPLEMENTED AND CI-VERIFIED on `devin/1788666549-fpv-mvp`.

### Curated component inventory

Source-grounded curated catalog: **90 records**
- goggles: **17**
- radios: **14**
- chargers: **18**
- batteries: **41**

Normal `ENABLED` curated records:
- goggles: **5**
- radios: **9**
- chargers: **9**
- batteries: **20**

The runtime audit catalog also retains the existing `battery-iflight-fullsend-6s-3300` as the explicit large-pack long-range regression fixture, so runtime battery audit count is 42.

Legacy component catalog before Iteration 2 had:
- goggles: 6
- radios: 4
- chargers: 4
- batteries: 3

### Architecture added

- `lib/component-catalog-schema.ts`
- `data/curated-goggles.ts`
- `data/curated-radios.ts`
- `data/curated-chargers.ts`
- `data/curated-batteries.ts`
- `data/curated-components.ts`
- `lib/curated-component-products.ts`
- `tests/component-catalog.test.ts`

`CURATED_COMPONENT_CATALOG` is the complete source-grounded audit catalog.
`CURATED_RECOMMENDER_COMPONENTS` contains only records safe to enter normal recommendation.

### Important corrections completed

- DJI Goggles N3 is modeled as **single 3.5-inch 1920x1080 LCD, 60Hz**, not OLED.
- N3 supports DJI O4 / O4 Wide / O4 Pro and explicitly rejects DJI O3.
- DJI Goggles 3 supports O3 + O4-family units and stores latency by video-unit/mode rather than one fake generic latency.
- HDZero Goggle 2 is represented as a real Analog + HDZero premium path.
- RadioMaster Pocket normal value path is ELRS 2.4GHz, not CC2500/FrSky.
- Current RadioMaster TX15 and TX16S MK3 generations are represented; stale TX16S MKII runtime record is removed.
- TX15 is selectable 2.4/900, not Gemini-X; GX12 and TX16S MK3 are modeled as true Gemini-X paths.
- `battery-gnb-1s-530` misleading legacy record is removed. Correct `gnb-1s-530-90c-a30` remains catalog-only until source completeness allows promotion.
- Batteries now carry cells, chemistry, connector, capacity, weight when source-backed, max charge voltage, balance connector and roles.
- Chargers now carry supported cell counts, chemistry, channels, storage/discharge, native/accepted connectors, adapter requirements, inputs and external-PSU completeness.
- BT2.0/A30 compatibility is directional where research supports it; PH2.0 remains distinct.
- Large battery validity is aircraft-profile-dependent, not globally invalid.

### Compatibility cases covered by tests

- N3 + O3 => invalid.
- N3 + O4 / O4 Wide / O4 Pro => valid.
- charger cell-count and chemistry hard filtering.
- BT2.0 / A30 / PH2.0 behavior.
- XT30 pack on XT60-native multi-cell charger => incomplete when adapter lead is required.
- ELRS drone rejects incompatible FrSky radio.
- 2.4GHz-only Pocket rejects 900MHz-only ELRS receiver.
- HDZero has goggle + racer inventory + ELRS radio + 6S battery + 6S charger path ready for Iteration 3.
- CineLog35 V3 + 3300mAh => HARD_INVALID.
- Cinebot35 + 3300mAh => HARD_INVALID.
- MOZ7 + 3300mAh => valid/not hard-invalid.

## CI status after Iteration 2

GitHub Actions workflow: `Iteration 2 CI`
Run ID: `34725118626`
Verified head before this handoff update: `8d75e4760a6c3a8a3af40708126b046b33fe6773`

Passed:
- `npm ci`
- `npm run typecheck`
- `npm test` — **48/48 tests passed**
- `npm run build` — Next.js production build succeeded

No deploy was performed by Iteration 2 CI.

## Real blockers / next task — Iteration 3

The data layer is ready; the main remaining work is bundle generation/scoring.

1. `userPreferences.videoSystem` still exposes only `analog | dji_o4 | recommend`; add HDZero selection/recommendation deliberately in Iteration 3.
2. Real HDZero racing aircraft exist in the audit catalog, but a purpose-built HDZero racer still needs promotion into runtime once exact price + full AircraftProfile requirements are satisfied.
3. Refactor `recommendation.ts` around complete compatible bundle generation instead of first-match component selection.
4. Treat adapter/PSU/radio-battery completeness as bundle completeness, not merely product compatibility.
5. Use component editorial metrics (latency/display/value/ergonomics/charger completeness/etc.) only after hard filters.
6. Preserve aircraft-specific battery range as a hard compatibility gate.
7. Do not rework product images yet.

## Iteration 3 target architecture

A. Generate eligible drone candidates from user intent.
B. Generate compatible goggles/radio/battery/charger combinations per drone.
C. Reject HARD_INVALID or incomplete bundles.
D. Score complete bundles and return strongest options/alternatives.

Compatibility must outrank all editorial scores.

## Key files after Iteration 2

- `lib/schema.ts`
- `lib/compat.ts`
- `lib/products.ts`
- `lib/catalog-schema.ts`
- `lib/component-catalog-schema.ts`
- `lib/curated-drone-products.ts`
- `lib/curated-component-products.ts`
- `data/curated-drones*.ts`
- `data/curated-goggles.ts`
- `data/curated-radios.ts`
- `data/curated-chargers.ts`
- `data/curated-batteries.ts`
- `data/curated-components.ts`
- `tests/catalog-sanity.test.ts`
- `tests/component-catalog.test.ts`
- `tests/recommendation.test.ts`
- `tests/regression.test.ts`
- `.github/workflows/iteration2-ci.yml`
- `HANDOFF.md`

## Continuation checklist

1. Read this file first.
2. Confirm working branch/head before editing.
3. Treat Segments 01–20 as source of truth.
4. Run typecheck + unit tests + production build after every Iteration 3 milestone.
5. Do not deploy or merge to `main` unless explicitly requested.