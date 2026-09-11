import { CuratedDroneRecord } from "@/lib/catalog-schema";
import { catalogOnly } from "@/data/curated-drone-helpers";

/**
 * Derived variant records are intentionally catalog-only until every exact
 * connector/capacity/price field is source-grounded. They prevent the engine
 * from treating materially different purchasable variants as one aircraft.
 */
export const CURATED_DERIVED_VARIANTS: CuratedDroneRecord[] = [
  catalogOnly({ id:"emax-hawk-apex-5-hdzero-elrs-4s", name:"EMAX Hawk Apex 5 HDZero ELRS 4S 2400KV", brand:"EMAX", sourceSegment:7, sourceStatus:"CORE_COMPETITIVE_VARIANT", videoSystems:["hdzero"], protocols:["elrs_2.4"], flightStyles:["racing"], blockerReasons:["MISSING_EXACT_CONNECTOR","MISSING_EXACT_CAPACITY_PROFILE"], videoUnit:"HDZERO_WHOOP_VTX" }),
  catalogOnly({ id:"emax-hawk-apex-5-hdzero-elrs-6s", name:"EMAX Hawk Apex 5 HDZero ELRS 6S 1600KV", brand:"EMAX", sourceSegment:7, sourceStatus:"CORE_COMPETITIVE_VARIANT", videoSystems:["hdzero"], protocols:["elrs_2.4"], flightStyles:["racing"], blockerReasons:["MISSING_EXACT_CONNECTOR","MISSING_EXACT_CAPACITY_PROFILE"], videoUnit:"HDZERO_WHOOP_VTX" }),
  catalogOnly({ id:"geprc-smart35-analog-4s", name:"GEPRC SMART35 Analog 4S", brand:"GEPRC", sourceSegment:3, sourceStatus:"CORE_PREMIUM_3_5_VARIANT", videoSystems:["analog"], protocols:["elrs_2.4"], flightStyles:["freestyle"], blockerReasons:["MISSING_EXACT_CONNECTOR","MISSING_EXACT_CHEMISTRY"] }),
  catalogOnly({ id:"geprc-smart35-analog-6s", name:"GEPRC SMART35 Analog 6S", brand:"GEPRC", sourceSegment:3, sourceStatus:"CORE_PREMIUM_3_5_VARIANT", videoSystems:["analog"], protocols:["elrs_2.4"], flightStyles:["freestyle"], blockerReasons:["MISSING_EXACT_CONNECTOR","MISSING_EXACT_CHEMISTRY"] }),
  catalogOnly({ id:"darwinfpv-babyape-ii-3_5-analog-4s", name:"DarwinFPV BabyApe II 3.5 Analog 4S", brand:"DarwinFPV", sourceSegment:3, sourceStatus:"CORE_VALUE_DURABILITY_VARIANT", videoSystems:["analog"], protocols:["elrs_2.4"], flightStyles:["freestyle"], blockerReasons:["MISSING_OR_UNRESOLVED_USD_PRICE","MISSING_EXACT_CONNECTOR","MISSING_EXACT_CHEMISTRY"] }),
  catalogOnly({ id:"darwinfpv-babyape-ii-3_5-analog-6s", name:"DarwinFPV BabyApe II 3.5 Analog 6S", brand:"DarwinFPV", sourceSegment:3, sourceStatus:"CORE_VALUE_DURABILITY_VARIANT", videoSystems:["analog"], protocols:["elrs_2.4"], flightStyles:["freestyle"], blockerReasons:["MISSING_OR_UNRESOLVED_USD_PRICE","MISSING_EXACT_CONNECTOR","MISSING_EXACT_CHEMISTRY"] }),
];
