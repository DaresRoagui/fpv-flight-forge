# FPV Flight Forge — Project Handoff

Last updated: 2026-09-12

## Active workflow

- Repository: `DaresRoagui/fpv-flight-forge`
- Working branch: `devin/1788666549-fpv-mvp`
- Production branch: `main`
- Continue iterative work on the working branch.
- Do not deploy or merge to `main` unless explicitly requested.

## Product goal

Build a deterministic complete-kit FPV recommender centered on the aircraft:

**Goggles + Drone + Radio + Charger + Batteries**

Hard compatibility always dominates scoring. Missing research data remains nullable/gated rather than invented.

## Research source of truth

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

## Iteration 1 — Drone catalog

Status: IMPLEMENTED.

- 99 auditable curated/derived drone records.
- 23 enabled runtime drone records at Iteration 1 completion.
- WATCHLIST / CONDITIONAL / DO_NOT_DEFAULT / LEGACY gating.
- Exact AircraftProfile battery envelopes for enabled aircraft.
- Mark5/Vapor-D5 role corrections.

## Iteration 2 — Components and compatibility

Status: IMPLEMENTED AND CI-VERIFIED.

Curated catalog:
- goggles: 17
- radios: 14
- chargers: 18
- batteries: 41 curated records, plus existing Fullsend 3300 long-range runtime regression fixture

Key corrections:
- DJI Goggles N3 = LCD 60Hz, O4-family only for this catalog, no O3.
- DJI Goggles 3 = O3 + O4-family.
- HDZero Goggle 2 real Analog + HDZero path.
- RadioMaster Pocket value path = ELRS 2.4GHz.
- Current TX15 / TX16S MK3 generations represented.
- BT2.0/A30 directional compatibility and PH2.0 distinction.
- cells/chemistry/connector/capacity/weight modeled for source-backed batteries.
- charger cells/chemistry/channels/storage/input/PSU/adapter completeness modeled.
- `battery-gnb-1s-530` misleading legacy record removed.
- large battery validity depends on AircraftProfile.

Iteration 2 CI baseline: 48/48 tests + typecheck + build passed.

## Iteration 3 — Complete bundle recommendation engine

Status: IMPLEMENTED AND CI-VERIFIED.

Current verified code head before this documentation-only commit:
`84f6535e7b4c6556001c7b161f69bdbd7b4ed129`

### Candidate generation

`recommendation.ts` no longer chooses the first compatible normal component.

For each eligible drone:
1. hard-filter compatible batteries from the exact AircraftProfile;
2. hard-filter goggles by exact video system/unit/generation;
3. hard-filter radios by protocol/band;
4. hard-filter chargers against the selected battery;
5. prune each compatible pool deterministically;
6. evaluate complete bundle combinations;
7. reject any remaining hard-invalid/incomplete combination;
8. score and sort complete bundles.

Exact owned-product ID lookup may still use `.find()` because it is a direct lookup, not recommendation selection.

### Combinatorial pruning

Current deterministic caps:
- drones per video system: 8
- batteries per drone: 4
- goggles per drone: 3
- radios per drone: 3
- chargers per battery: 3

Candidates are sorted by component fit score, then lower price, then stable product ID before pruning. This avoids an unbounded Cartesian product without returning to first-compatible selection.

### Bundle scoring

Normalized 0–10 bundle score follows Segment 20:

- droneStyleFit: 24%
- compatibilityConfidence: 20%
- budgetEfficiency: 14%
- batteryFit: 10%
- gogglesFit: 9%
- radioFit: 7%
- chargerFit: 6%
- availability: 5%
- experienceFit: 3%
- futureProofing: 2%

Hard incompatibility is removed before scoring.

Component scoring uses the Segment 20 battery/goggle/radio/charger models and curated metadata.

Important budget correction: a technically valid cheaper bundle is no longer penalized merely for spending less. Bundles at or below 90% of budget retain full headroom score; near-ceiling bundles are penalized. VALUE applies an even stronger price-efficiency curve.

### Advanced priorities

Implemented and regression-tested:
- BALANCED
- LOW_LATENCY
- IMAGE_QUALITY
- VALUE
- PORTABILITY
- FLIGHT_TIME
- REPAIRABILITY

LOW_LATENCY uses curated video-unit latency profiles/ecosystem metadata, not a blanket Analog bonus.

Concrete tested ranking changes include:
- IMAGE_QUALITY O4 path -> DJI Goggles 3; VALUE -> DJI Goggles N3.
- PORTABILITY -> RadioMaster Pocket/Pocket Crush family instead of Boxer-class radio.
- FLIGHT_TIME -> larger compatible battery than PORTABILITY on a fixed 75mm platform.
- LOW_LATENCY competitive racing -> HDZero path.
- REPAIRABILITY materially changes the aircraft style score where repairability/parts metadata differs.

### Racing behavior

- purpose-built RACE_5 aircraft outrank freestyle platforms for competitive racing;
- explicit Analog can return a real purpose-built Analog racer;
- explicit HDZero has a complete runtime path;
- `recommend` racing considers HDZero + Analog + O4 and favors dedicated race ecosystems over O4 compromise;
- explicit DJI O4 never silently switches system;
- explicit O4 racing returns the curated Axisflying Manta race-oriented compromise with `RACING_COMPROMISE` warning.

Runtime race records were added in `data/curated-drones-racing-runtime.ts` to unlock source-complete Analog/HDZero racing paths.

### Scope behavior

FULL_KIT:
- budget includes purchased drone, required battery quantity, goggles, radio, charger and required completeness costs such as radio cells / PSU / charge adapter when applicable.

DRONE_ONLY:
- only drone consumes stated budget;
- compatible battery/goggles/radio/charger are returned as reference-only items.

COMPLETE_EXISTING_SETUP:
- compatible owned gear is reused with zero purchase cost;
- incompatible owned gear is surfaced as `OWNED_GEAR_CONFLICT` and a compatible replacement is selected rather than silently ignoring the conflict.

### Alternatives

When sufficient candidates exist, deterministic technically-valid alternatives can be returned as:
- PRIMARY
- VALUE
- PREMIUM

### Critical compatibility regressions retained

- CineLog35 V3 + 3300mAh => HARD_INVALID.
- Cinebot35 + 3300mAh => HARD_INVALID.
- MOZ7 / supported 7-inch long range + 3300mAh => valid/not hard-invalid.
- N3 does not accept O3.
- ELRS band/protocol compatibility remains hard-filtered.
- charger cell/chemistry/connector completeness remains hard-filtered.

## Iteration 3 tests and CI

Verification workflow run: `34727875609`
Verified code head: `84f6535e7b4c6556001c7b161f69bdbd7b4ed129`

Passed:
- `npm ci`
- `npm run typecheck`
- `npm test` — **69/69 tests passed across 5 files**
- `npm run build` — Next.js production build succeeded

Iteration 3-specific suite: `tests/recommendation-engine-v3.test.ts` — **20/20 passed**.

Covered scenarios include:
- beginner tinywhoop Analog indoor
- beginner tinywhoop O4 indoor
- freestyle 5-inch Analog/O4
- competitive racing Analog/HDZero/recommend/explicit O4
- cinematic
- long range
- LOW_LATENCY / IMAGE_QUALITY / VALUE / PORTABILITY / FLIGHT_TIME / REPAIRABILITY
- FULL_KIT / DRONE_ONLY / COMPLETE_EXISTING_SETUP
- owned gear compatible/conflict
- deterministic alternatives
- CineLog35/Cinebot35/MOZ7 3300mAh regressions

## Key Iteration 3 files

- `lib/recommendation.ts`
- `lib/recommendation-scoring.ts`
- `lib/compat.ts`
- `lib/schema.ts`
- `data/curated-drones-racing-runtime.ts`
- `data/curated-drones.ts`
- `tests/recommendation-engine-v3.test.ts`
- `tests/recommendation.test.ts`
- `tests/regression.test.ts`
- `tests/catalog-sanity.test.ts`

## Next task — Iteration 4

Main remaining work is coverage/UX/alternatives/accessories/regulation QA, not another recommendation-engine rewrite.

Potential Iteration 4 focus:
- improve user-facing explainability for score breakdown and compatibility reasons;
- surface Primary / Value / Premium clearly in UI;
- improve insufficient-budget/minimum-compatible-kit UX;
- accessories/extras coverage and category-specific recommendations;
- regulation/weight UX QA;
- broader edge-case and integration coverage;
- keep image campaign for the later image/final-QA iteration.

## Continuation checklist

1. Read this file first.
2. Confirm working branch/head before editing.
3. Treat Segments 01–20 as source of truth for engine behavior.
4. Preserve hard compatibility before scoring.
5. Preserve deterministic pruning/tie-breaking.
6. Run typecheck + unit tests + production build after changes.
7. Do not deploy or merge to `main` unless explicitly requested.