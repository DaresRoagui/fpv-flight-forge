# FPV Flight Forge — Project Handoff

Last updated: 2026-09-13

## Active workflow

- Repository: `DaresRoagui/fpv-flight-forge`
- Working branch: `devin/1788666549-fpv-mvp`
- Production branch: `main`
- Continue iterative work on the working branch.
- Do not deploy or merge to `main` unless explicitly requested.

## Product goal

Deterministic FPV recommender centered on the aircraft:

**Goggles + Drone + Radio + Charger + Batteries**

Hard compatibility always dominates scoring. Missing research data stays nullable/gated rather than invented. Practical accessories are a separate layer and must never make an invalid core bundle valid.

## Source of truth used through Iteration 4

- 01–09: aircraft
- 10–11: analog/DJI goggles and video-unit compatibility
- 12: ELRS radios
- 13–14: chargers
- 15–17: batteries
- 18: indispensable accessories / spares / safety
- 19: global compatibility/category coherence
- 20: final recommendation/scoring model
- 21: regulatory weight/country UX
- 22: localization/currency implementation
- 23: Medellín/community needs and progressive UX

## Iteration 1 — aircraft catalog

Status: IMPLEMENTED.

- 99 auditable curated/derived drone records at Iteration 1 completion.
- 23 runtime-enabled records at Iteration 1 completion.
- Product-state gating: CORE / VALUE / PREMIUM / SPECIALIST / CONDITIONAL / WATCHLIST / DO_NOT_DEFAULT / LEGACY.
- AircraftProfile is the source of truth for exact battery/video/control requirements.
- Mark5 and Vapor-D5 role corrections.

## Iteration 2 — components + hard compatibility

Status: IMPLEMENTED AND CI-VERIFIED.

Curated audit catalog:
- goggles: 17
- radios: 14
- chargers: 18
- batteries: 41 curated + explicit Fullsend 3300 long-range runtime regression fixture

Important corrections:
- DJI Goggles N3: LCD 60Hz, O4-family path, no O3.
- DJI Goggles 3: O3 + O4 family.
- HDZero Goggle 2 real runtime path.
- RadioMaster Pocket normal value path is ELRS 2.4GHz.
- current TX15 / TX16S MK3 generation represented.
- battery cells/chemistry/connector/capacity/weight source-backed.
- charger cell/chemistry/channel/storage/input/PSU/adapter completeness.
- BT2.0/A30 directional behavior and PH2.0 distinction.
- large battery validity depends on AircraftProfile, not a global mAh cap.

## Iteration 3 — complete-bundle engine

Status: IMPLEMENTED AND CI-VERIFIED.

Architecture:
1. select eligible drones from intent;
2. hard-filter battery/goggles/radio/charger against each drone/AircraftProfile;
3. deterministic top-N pruning;
4. evaluate complete bundle combinations;
5. reject remaining invalid/incomplete bundles;
6. score complete bundles and return strongest options.

Pruning caps:
- drones/system: 8
- batteries/drone: 4
- goggles/drone: 3
- radios/drone: 3
- chargers/battery: 3

Normalized Segment-20 scoring:
- droneStyleFit 24%
- compatibilityConfidence 20%
- budgetEfficiency 14%
- batteryFit 10%
- gogglesFit 9%
- radioFit 7%
- chargerFit 6%
- availability 5%
- experienceFit 3%
- futureProofing 2%

Advanced priorities materially affect ranking:
BALANCED / LOW_LATENCY / IMAGE_QUALITY / VALUE / PORTABILITY / FLIGHT_TIME / REPAIRABILITY.

Scope behavior:
- FULL_KIT: all required purchased core components consume budget.
- DRONE_ONLY: only drone consumes budget; compatibility references are still returned.
- COMPLETE_EXISTING_SETUP: compatible owned gear is reused at zero purchase cost; incompatible gear becomes an explicit OWNED_GEAR_CONFLICT.

Racing:
- real purpose-built Analog and HDZero race paths.
- recommend/ANY can favor Analog or HDZero.
- explicit O4 never silently switches ecosystem and returns the curated O4 race compromise with warning.

Critical regressions retained:
- CineLog35 V3 + 3300mAh HARD_INVALID.
- Cinebot35 + 3300mAh HARD_INVALID.
- supported MOZ7/7-inch long-range + 3300mAh valid.

## Iteration 4 — functional coverage + recommendation UX

Status: IMPLEMENTED. Final CI should be read from the latest `Iteration 4 CI` run on this branch before claiming a future change is green.

### Progressive questionnaire

New `lib/questionnaire.ts` and `RecommenderV4` flow:

- scope first;
- budget;
- style;
- experience;
- environment only for tinywhoop / current micro-like freestyle / cinematic;
- video;
- owned gear only for COMPLETE_EXISTING_SETUP;
- advanced priority/regulatory options only for advanced pilots.

Beginner FULL_KIT flows are intentionally short and do not force owned-gear or advanced-option screens.

HDZero is exposed deliberately for racing/advanced use rather than presented as a default beginner choice.

### Environment intent

`Environment` is now a real scoring input, not cosmetic questionnaire data.

Regression coverage requires materially different aircraft intent for:
- Analog tinywhoop: tight indoor vs outdoor;
- micro-like freestyle: tight indoor vs outdoor;
- O4 cinematic: tight indoor vs outdoor.

Environment affects soft ranking only; hard compatibility remains unchanged.

### Coverage matrix

`tests/recommendation-coverage-v4.test.ts` contains a high-value matrix covering:
- beginner/intermediate/advanced;
- tinywhoop Analog/O4/recommend;
- micro-like/freestyle Analog/O4;
- cinematic Analog/O4 and environments;
- long range Analog/O4;
- racing Analog/HDZero/recommend/explicit O4;
- value/latency/portability/flight-time priorities;
- FULL_KIT and DRONE_ONLY.

The automated assertion requires >=95% of these reasonable scenarios to return an in-budget, hard-valid kit.

Low-budget regression requires:
- `kind=insufficient`;
- finite minimum recommended budget;
- closest technically-valid kit when budget is the blocker.

### Alternatives

UI now surfaces typed alternatives when the engine has them:
- Primary / Best pick
- Value alternative
- Premium upgrade

Alternatives must remain hard-valid and deterministic.

### Practical accessories / consumables

New `lib/accessories.ts` implements Segment-18 category-aware extras separately from the core bundle.

Modeled examples include:
- exact/generation-aware spare props;
- Air65 II / Air75 II spare frame where source-backed;
- basic FPV tool kit for larger aircraft;
- VIFLY Finder 2 for appropriate outdoor 5-inch / long-range aircraft when recovery is not integrated;
- VIFLY Finder Mini for appropriate outdoor cinematic use;
- VIFLY ShortSaver 2 for repair/bench workflows, not 1S flight use;
- SEQURE SI012 Pro repair tool;
- SpeedyBee Adapter 3 for relevant long-range field configuration;
- BAT-SAFE Mini/Standard containment suggestions for appropriate full-kit users.

Rules:
- no self-powered Finder default on 65/75mm whoops;
- do not duplicate recovery hardware already included by AircraftProfile;
- extras have their own subtotal;
- `corePrice`/hard compatibility are not changed by optional/practical extras;
- unknown exact accessory prices stay null instead of being invented.

### Regulation / ready-to-fly weight

`lib/regulation.ts` uses ready-to-fly weight from:
- dry aircraft weight;
- selected flight battery;
- payload if represented;
- mandatory onboard hardware if represented.

Unknown weight remains unknown; threshold status is not guessed.

The regulatory badge now shows jurisdiction/context notes and a general official-source disclaimer for Colombia / US / EU-EASA paths.

`NOT_SURE` operation purpose intentionally returns neutral CHECK_LOCAL_RULES guidance rather than claiming an exemption.

`preferSimplerWeightClass` is active as a secondary soft preference among already-valid Primary/Value/Premium candidates. It never overrides hard technical compatibility and does nothing when exact RTF weight/threshold is unknown.

### Localization / currency

- ES/EN retained.
- USD remains canonical catalog currency.
- COP fixed reference conversion remains exactly 3200 COP/USD.
- language, currency and regulatory region persist independently.
- COP UI displays the reference-rate disclaimer.

### Explanation / warnings / owned gear

Result UX now surfaces:
- why-this-kit text and structured reasons;
- typed warnings;
- explicit owned-gear reuse/conflicts;
- DRONE_ONLY compatibility references;
- beginner simulator learning note;
- core price vs recommended extras subtotal vs total-with-extras.

### Iteration 4 browser QA

Focused Chromium E2E suite intentionally stays small (6 high-value browser flows):
1. beginner full kit + progressive UX + extras;
2. low-budget closest valid kit;
3. DRONE_ONLY reference behavior;
4. compatible owned DJI/ELRS gear reuse;
5. advanced HDZero racing + LOW_LATENCY;
6. language/currency/regulatory settings persistence.

No broad image campaign and no deployment are part of Iteration 4.

## Key files after Iteration 4

- `lib/recommendation.ts`
- `lib/recommendation-scoring.ts`
- `lib/recommendation-v4.ts`
- `lib/questionnaire.ts`
- `lib/accessories.ts`
- `lib/compat.ts`
- `lib/regulation.ts`
- `app/components/RecommenderV4.tsx`
- `app/components/RegulatoryBadge.tsx`
- `app/components/LocaleProvider.tsx`
- `app/components/LocaleSwitcher.tsx`
- `tests/recommendation-engine-v3.test.ts`
- `tests/recommendation-coverage-v4.test.ts`
- `tests/environment-v4.test.ts`
- `tests/regulatory-preference-v4.test.ts`
- `e2e/recommender.spec.ts`
- `.github/workflows/iteration2-ci.yml` (workflow display name is now `Iteration 4 CI`)

## Next task — Iteration 5

Do not redo catalog/compatibility/recommendation architecture unless a regression proves it necessary.

Primary remaining work should be:
- real product image/PNG asset campaign;
- exact-generation image validation and fallback cleanup;
- product/detail visual polish;
- responsive/mobile visual QA;
- accessibility/focus/reduced-motion QA;
- final copy/translation polish;
- final deployment/production workflow only when explicitly requested.

## Continuation checklist

1. Read this file first.
2. Confirm branch head + latest `Iteration 4 CI` result before editing.
3. Treat Segments 01–23 as source of truth for existing behavior.
4. Preserve hard compatibility before any UX/scoring preference.
5. Preserve deterministic candidate pruning/tie-breaking.
6. Run typecheck + unit/regression + build for code changes.
7. Keep browser QA focused rather than exploding repeated scenarios.
8. Do not deploy or merge to `main` unless explicitly requested.
