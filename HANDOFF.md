# FPV Flight Forge — Project Handoff

Last updated: 2026-09-13

## Current repository state

- Repository: `DaresRoagui/fpv-flight-forge`
- Working branch: `devin/1788666549-fpv-mvp`
- Working branch head before this handoff commit: `63f1f6cb4e1c876617507ba9266753d59ad25f30`
- Production branch: `main`
- `main` and the working branch are currently **diverged**. The working branch is 8 commits ahead and 2 commits behind `main` relative to their common merge base.
- Do not blindly force/fast-forward one branch over the other. Reconcile the 2 `main`-only commits before a final merge.
- Old PR #1 is already merged/closed and does not represent the current final branch state.

## Product goal

A deterministic FPV recommender that builds a technically coherent bundle around the aircraft:

**Goggles + Drone + Radio + Charger + Batteries**

Hard compatibility always wins over scoring/UX preferences. Missing source data remains nullable/gated rather than invented. Practical accessories are a separate layer and never make an invalid core bundle valid.

## Sources of truth

- 01–09: aircraft catalog / roles / variants
- 10–11: analog + DJI goggles and O3/O4 compatibility
- 12: ELRS radios
- 13–14: chargers
- 15–17: batteries
- 18: indispensable accessories / spares / safety
- 19: global compatibility/category audit
- 20: scoring / recommendation matrix
- 21: regulatory weight/country UX
- 22: localization/currency
- 23: community/Medellín questionnaire and UX needs

## Iteration 1 — aircraft catalog

Status: COMPLETE.

- 99 auditable curated/derived drone records at Iteration 1 completion.
- 23 runtime-enabled records at Iteration 1 completion.
- `AircraftProfile` became the source of truth for battery/video/control compatibility.
- Mark5 and Vapor-D5 role corrections implemented.
- Historical/conditional/watchlist/legacy states retained for audit but gated from normal recommendations.

## Iteration 2 — goggles/radios/chargers/batteries + hard compatibility

Status: COMPLETE.

Curated audit catalog at Iteration 2 completion:
- goggles: 17
- radios: 14
- chargers: 18
- batteries: 41 curated + explicit Fullsend 3300 long-range runtime regression fixture

Important corrections:
- DJI Goggles N3: LCD, O4-family path, no O3.
- DJI Goggles 3: O3 + O4 family.
- HDZero Goggle 2 runtime path.
- RadioMaster Pocket value path is ELRS.
- current TX15 / TX16S MK3 generation represented.
- exact battery cells / chemistry / connector / capacity / weight where source-backed.
- chargers model cell range, chemistry, channels, storage, input, PSU/adapters.
- BT2.0/A30 behavior modeled directionally; PH2.0 stays distinct.
- battery validity depends on `AircraftProfile`, not a global mAh ceiling.

## Iteration 3 — complete bundle recommendation engine

Status: COMPLETE.

Architecture:
1. select eligible drones from user intent;
2. hard-filter batteries/goggles/radios/chargers against each drone/AircraftProfile;
3. deterministic top-N candidate pruning;
4. evaluate complete bundle combinations;
5. reject invalid/incomplete bundles;
6. score full bundles and return strongest options.

Pruning caps:
- drones/system: 8
- batteries/drone: 4
- goggles/drone: 3
- radios/drone: 3
- chargers/battery: 3

Normalized Segment-20 scoring base:
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

Advanced priorities materially alter ranking:
`BALANCED`, `LOW_LATENCY`, `IMAGE_QUALITY`, `VALUE`, `PORTABILITY`, `FLIGHT_TIME`, `REPAIRABILITY`.

Scopes:
- `FULL_KIT`: every required purchased core component consumes budget.
- `DRONE_ONLY`: only drone consumes budget; required compatibility references are still shown.
- `COMPLETE_EXISTING_SETUP`: compatible owned gear is reused at zero cost; incompatible owned gear becomes an explicit conflict.

Racing:
- purpose-built Analog and HDZero racers can win.
- `recommend` can choose Analog or HDZero.
- explicit O4 never silently switches ecosystem; returns curated O4 racing compromise plus warning.

Critical battery regressions:
- CineLog35 V3 + 3300mAh invalid.
- Cinebot35 + 3300mAh invalid.
- supported MOZ7 / large 7-inch long-range + 3300mAh valid.

## Iteration 4 — functional coverage + UX

Status: COMPLETE.

Implemented:
- progressive questionnaire in `lib/questionnaire.ts` + `RecommenderV4`;
- `Environment` materially changes tinywhoop / micro-like / cinematic ranking;
- automated high-value recommendation coverage target >=95%;
- closest valid kit + minimum budget for true budget shortfall;
- Primary / Value / Premium alternatives;
- practical accessories/consumables from Segment 18 separated from the core bundle;
- ready-to-fly regulatory weight logic for CO / US / EU-EASA with non-absolute guidance;
- `preferSimplerWeightClass` as a secondary soft ranking preference;
- ES/EN and fixed COP/USD 3200;
- warnings, reasons, DRONE_ONLY references, owned-gear reuse/conflicts;
- 6 focused Chromium flows instead of an exhaustive E2E explosion.

## Iteration 5 — assets, presentation, final QA

Status: **IMPLEMENTATION COMPLETE ON THE WORKING BRANCH; FINAL PRODUCTION RECONCILIATION/DEPLOYMENT STILL REQUIRES BRANCH reconciliation and independent Vercel verification.**

### Recommendation-visible product asset audit

Exactly **57 products** can appear in Primary / Value / Premium / closest-valid recommendations under the audited questionnaire surface:

- Drones: 23
- Goggles: 5
- Radios: 8
- Chargers: 7
- Batteries: 14

`data/product-assets.ts` contains the explicit real product image + product/source URL mapping for all 57 recommendation-visible products.

Rules used:
- manufacturer asset preferred;
- reputable FPV retailer asset accepted when official asset is unsuitable/unavailable;
- exact model/version/variant only;
- no generated/fabricated product images;
- category SVG remains runtime-error fallback only;
- variant-sensitive Air65 II and LAVA II records use distinct assets.

### Presentation work

- `ProductCard.tsx` updated for real product imagery and compact high-value metadata.
- Product modal already exposes image, price, key specs, compatibility, ideal use, limitations/tradeoffs, source and purchase link.
- recommendation-visible products are no longer intentionally wired to generic placeholders.
- `next.config.ts` includes remote image hosts used by verified manufacturer/retailer assets.
- `lib/catalog-i18n.ts` received final recommendation-key localization fixes.

### Final QA

Latest verified CI at branch head `63f1f6cb4e1c876617507ba9266753d59ad25f30`:

- `npm run lint` ✅
- `npm run typecheck` ✅
- `npm test` ✅ **90/90**
- recommendation high-value coverage assertion >=95% ✅
- `npm run build` ✅
- focused Playwright Chromium ✅ **6/6**
- E2E verifies visible recommendation images finish loading with non-zero natural width.
- Product modal purchase/source link is exercised.
- desktop and mobile final visual QA screenshots are produced as the `final-visual-qa` GitHub Actions artifact.
- latest Final CI run: `34787810826` — success.

The asset-discovery test was originally too broad and timed out while evaluating >5k bundles. It was corrected to a deterministic audit/contract and now completes quickly while preserving the exact 57-product surface.

### Iteration 5 residual caveats

- Some seller-built racing products (for example WREKD builds) can change small electronics/motors over time; the asset/link represents the audited listing, not every future batch.
- Remote manufacturer/retailer images can move or disappear later; category fallback remains for resilience.
- Vercel production credentials/access are external to the repository. A green GitHub Actions run does **not** prove production is updated.

## Deployment / production status

Do **not** claim the final branch is live merely from CI.

Known facts:
- `main` and `devin/1788666549-fpv-mvp` are currently diverged.
- The final working-branch implementation has green CI.
- Production deployment must be checked independently in Vercel after reconciling branches.
- Historical URL used by the project: `https://fpv-flight-forge.vercel.app/`, but verify which commit it is actually serving before declaring success.

## Key final files

- `data/product-assets.ts`
- `lib/products.ts`
- `lib/recommendation.ts`
- `lib/recommendation-scoring.ts`
- `lib/recommendation-v4.ts`
- `lib/compat.ts`
- `lib/questionnaire.ts`
- `lib/accessories.ts`
- `lib/regulation.ts`
- `lib/catalog-i18n.ts`
- `app/components/RecommenderV4.tsx`
- `app/components/ProductCard.tsx`
- `app/components/ProductModal.tsx`
- `app/components/RegulatoryBadge.tsx`
- `tests/asset-discovery-v5.test.ts`
- `tests/recommendation-engine-v3.test.ts`
- `tests/recommendation-coverage-v4.test.ts`
- `tests/environment-v4.test.ts`
- `tests/regulatory-preference-v4.test.ts`
- `e2e/recommender.spec.ts`
- `.github/workflows/iteration2-ci.yml` (display name: `Final CI`)
- `ITERATION5_FINAL.md`

## Recommended next action

1. Compare the 2 `main`-only commits against the 8 working-branch-only commits.
2. Reconcile `main` into the working branch or create a clean final PR without discarding either side.
3. Run `Final CI` again after reconciliation.
4. Merge only once final CI is green.
5. Trigger/verify exactly one production deployment in Vercel.
6. Smoke-check the production URL, images, questionnaire, one Analog path, one O4 path, one HDZero/racing path, locale/currency and mobile layout.
7. Record the actual deployed commit SHA and production URL in this handoff.

## Continuation rules

- Treat Segments 01–23 as the source of truth for existing behavior.
- Do not weaken hard compatibility for UX/scoring.
- Preserve deterministic pruning/tie-breaking.
- Do not re-open catalog architecture unless a concrete regression requires it.
- Do not replace exact product assets with another model/version just because an image is easier to find.
- Before claiming completion, verify branch head, CI and deployed production commit independently.
