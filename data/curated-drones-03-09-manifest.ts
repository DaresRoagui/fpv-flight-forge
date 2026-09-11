import { CuratedDroneRecord } from "@/lib/catalog-schema";
import { catalogOnly } from "@/data/curated-drone-helpers";
import { FlightStyle, VideoSystem } from "@/lib/schema";

const b = (id: string, name: string, brand: string, sourceSegment: number, sourceStatus: string, videoSystems: VideoSystem[], flightStyles: FlightStyle[]) =>
  catalogOnly({ id, name, brand, sourceSegment, sourceStatus, videoSystems, flightStyles, blockerReasons: ["SOURCE_DATA_INCOMPLETE" ] });

export const CURATED_DRONES_03_09_MANIFEST: CuratedDroneRecord[] = [
  b("hglrc-draknight-2-analog-elrs", "HGLRC Draknight 2 Analog ELRS", "HGLRC", 3, "CORE_WITH_AVAILABILITY_CHECK", ["analog"], ["freestyle"]),
  b("darwinfpv-babyape-iii-mini-2-analog", "DarwinFPV BabyApe III Mini 2 Analog ELRS", "DarwinFPV", 3, "CORE_BUDGET", ["analog"], ["freestyle"]),
  b("darwinfpv-babyape-iii-3-analog", "DarwinFPV BabyApe III 3 Analog ELRS", "DarwinFPV", 3, "CORE_BUDGET_CONDITIONAL", ["analog"], ["freestyle"]),
  b("happymodel-crux35-v2-analog-uart-elrs", "Happymodel Crux35 V2 Analog UART ELRS", "Happymodel", 3, "CORE", ["analog"], ["freestyle"]),
  b("darwinfpv-babyape-ii-3_5-analog", "DarwinFPV BabyApe II 3.5 Analog ELRS", "DarwinFPV", 3, "CORE_VALUE_DURABILITY", ["analog"], ["freestyle"]),
  b("geprc-smart35-analog", "GEPRC SMART35 Analog", "GEPRC", 3, "CORE_PREMIUM_3_5", ["analog"], ["freestyle"]),
  b("emax-tinyhawk-iii-plus-freestyle-analog-elrs", "EMAX Tinyhawk III Plus Freestyle Analog ELRS", "EMAX", 3, "CORE_ALTERNATIVE", ["analog"], ["freestyle"]),
  b("darwinfpv-babyape-iii-pro-3_5-analog", "DarwinFPV BabyApe III Pro 3.5 Analog ELRS", "DarwinFPV", 3, "CONDITIONAL_NEEDS_MORE_VALIDATION", ["analog"], ["freestyle"]),
  b("happymodel-bassline-2s-analog", "Happymodel Bassline 2S Analog", "Happymodel", 3, "CONDITIONAL", ["analog"], ["freestyle", "racing"]),

  b("flywoo-firefly18-v3-o4-wide", "Flywoo Firefly18 V3 O4 Wide", "Flywoo", 4, "CORE", ["dji_o4"], ["freestyle"]),
  b("flywoo-flybee20-o4-2s", "Flywoo Flybee20 O4 2S", "Flywoo", 4, "CORE", ["dji_o4"], ["freestyle"]),
  b("deepspace-dino20-o4-wide-3s", "DeepSpace DINO20 O4 Wide 3S", "DeepSpaceFPV", 4, "CORE_SPECIALIST", ["dji_o4"], ["freestyle"]),
  b("sub250-oasisfly25-o4-pro", "Sub250 OasisFly25 O4 Pro", "Sub250", 4, "CORE", ["dji_o4"], ["freestyle"]),
  b("deepspace-seeker3-o4-pro", "DeepSpace Seeker3 O4 Pro", "DeepSpaceFPV", 4, "CORE", ["dji_o4"], ["freestyle"]),
  b("deepspace-seeker35-o4-pro", "DeepSpace Seeker35 O4 Pro", "DeepSpaceFPV", 4, "CORE_SPECIALIST", ["dji_o4"], ["freestyle", "cinematic"]),
  b("rate-s30-pro-o4", "RATE S30 Pro O4", "RATEFPV", 4, "CONDITIONAL_AVAILABILITY_AND_FIRMWARE", ["dji_o4"], ["freestyle"]),
  b("oxbot-lumo25-o4-wide", "OXBOT Lumo25 O4 Wide", "OXBOT", 4, "CONDITIONAL_NEW_NEEDS_VALIDATION", ["dji_o4"], ["freestyle"]),
  b("axisflying-manta30-o4", "Axisflying Manta30 O4", "Axisflying", 4, "CONDITIONAL_PREMIUM_HEAVY", ["dji_o4"], ["freestyle"]),
  b("hglrc-draknight-o4", "HGLRC Draknight O4", "HGLRC", 4, "DO_NOT_DEFAULT", ["dji_o4"], ["freestyle"]),
  b("darwinfpv-babyape-iii-3-o4", "DarwinFPV BabyApe III 3 O4", "DarwinFPV", 4, "DO_NOT_DEFAULT_BUDGET_ONLY", ["dji_o4"], ["freestyle"]),
  b("darwinfpv-babyape-iii-pro-3_5-o4-pro", "DarwinFPV BabyApe III Pro 3.5 O4 Pro", "DarwinFPV", 4, "WATCHLIST", ["dji_o4"], ["freestyle"]),
  b("sub250-oasisfly30-o4-pro", "Sub250 OasisFly30 O4 Pro", "Sub250", 4, "DO_NOT_DEFAULT", ["dji_o4"], ["freestyle"]),

  b("speedybee-master5-v2-analog-elrs", "SpeedyBee Master 5 V2 Analog ELRS", "SpeedyBee", 5, "CORE_MATURE_VERIFY_STOCK", ["analog"], ["freestyle", "cinematic"]),
  b("geprc-mark5-analog-6s-elrs", "GEPRC MARK5 Analog 6S ELRS", "GEPRC", 5, "CORE_PREMIUM_MATURE", ["analog"], ["freestyle"]),
  b("geprc-vapor-d5-analog", "GEPRC Vapor-D5 Analog", "GEPRC", 5, "CONDITIONAL_CINEMATIC_FREESTYLE", ["analog"], ["freestyle", "cinematic"]),
  b("hglrc-my5-analog-6s-elrs", "HGLRC MY5 Analog 6S ELRS", "HGLRC", 5, "WATCHLIST_AVAILABILITY", ["analog"], ["freestyle"]),
  b("iflight-evoque-f5-v3-wtfpv", "iFlight Evoque F5 V3 WTFPV", "iFlight", 5, "DO_NOT_DEFAULT_INCOMPLETE_VIDEO", ["analog"], ["freestyle"]),
  b("aos-5-v2-analog-bnf", "AOS 5 V2 Analog BNF", "AOS", 5, "LEGACY_PARTS_RISK", ["analog"], ["freestyle"]),

  b("iflight-nazgul-evoque-f5-v3-o4-pro", "iFlight Nazgul Evoque F5 V3 O4 Pro", "iFlight", 6, "CORE_PREMIUM", ["dji_o4"], ["freestyle", "cinematic"]),
  b("deepspace-seeker5-o4-pro", "DeepSpace SEEKER5 O4 Pro", "DeepSpaceFPV", 6, "CORE_ENTHUSIAST", ["dji_o4"], ["freestyle"]),
  b("axisflying-manta5-se-v2-o4-pro", "Axisflying Manta 5 SE V2 O4 Pro", "Axisflying", 6, "CONDITIONAL_VALUE", ["dji_o4"], ["freestyle"]),
  b("axisflying-bando5-o4-pro", "Axisflying Bando 5 O4 Pro", "Axisflying", 6, "WATCHLIST_SPECIALIST_STOCK_GATED", ["dji_o4"], ["freestyle"]),

  b("vroom-comet-pro-5-wrekd-analog-elrs", "VROOM Comet Pro 5 Analog ELRS", "VROOM / WREKD", 7, "CORE_COMPETITIVE", ["analog"], ["racing"]),
  b("hglrc-wind5-lite-v2-analog-elrs", "HGLRC Wind5 Lite V2 Analog ELRS", "HGLRC", 7, "CONDITIONAL_STOCK_CONFLICT", ["analog"], ["racing"]),
  b("iflight-mach-r5-ultra-6s-analog-elrs", "iFlight Mach R5 Ultra Analog ELRS", "iFlight", 7, "WATCHLIST_OUT_OF_STOCK", ["analog"], ["racing"]),
  b("five33-analog-open-racer-rtf", "Five33 Analog Open Racer RTF", "Five33", 7, "WATCHLIST_COMING_SOON", ["analog"], ["racing"]),
  b("iflight-mach-r5-ultra-trainer-hdzero", "iFlight Mach R5 Ultra Trainer HDZero", "iFlight", 7, "CORE_COMPETITIVE", ["hdzero"], ["racing"]),
  b("emax-hawk-apex-5-hdzero-elrs", "EMAX Hawk Apex 5 HDZero ELRS", "EMAX", 7, "CORE_COMPETITIVE", ["hdzero"], ["racing"]),
  b("emax-hawk-apex-3_5-hdzero-elrs", "EMAX Hawk Apex 3.5 HDZero ELRS", "EMAX", 7, "CORE_TRAINER", ["hdzero"], ["racing"]),
  b("vroom-comet-pro-5-wrekd-hdzero-elrs", "VROOM Comet Pro 5 HDZero ELRS", "VROOM / WREKD", 7, "CORE_COMPETITIVE_PREMIUM", ["hdzero"], ["racing"]),
  b("five33-multigp-pro-spec-hdzero-elrs", "Five33 MultiGP Pro Spec HDZero ELRS", "Five33", 7, "CORE_SPECIALIST", ["hdzero"], ["racing"]),
  b("axisflying-manta5-se-v2-squashed-x-o4-wide-elrs", "Axisflying Manta 5 SE V2 Squashed-X O4 Wide", "Axisflying", 7, "CORE_RECREATIONAL_O4", ["dji_o4"], ["freestyle", "racing"]),

  b("betafpv-pavo-pico-ii-o4-wide-elrs", "BETAFPV Pavo Pico II O4 Wide ELRS", "BETAFPV", 8, "CORE_BEGINNER_SMALL", ["dji_o4"], ["cinematic"]),
  b("betafpv-pavo20-pro-ii", "BETAFPV Pavo20 Pro II", "BETAFPV", 8, "CORE_SMALL", ["dji_o4"], ["cinematic"]),
  b("geprc-darkstar22-o4-pro-elrs", "GEPRC DarkStar22 O4 Pro", "GEPRC", 8, "CORE_SMALL_ROBUST", ["dji_o4"], ["cinematic"]),
  b("geprc-darkstar25-o4", "GEPRC DarkStar25 O4", "GEPRC", 8, "CONDITIONAL_FAST", ["dji_o4"], ["cinematic"]),
  b("geprc-darkstar16-o4-pro", "GEPRC DarkStar16 O4 Pro", "GEPRC", 8, "CONDITIONAL_TINY", ["dji_o4"], ["cinematic"]),
  b("geprc-cinelog20-analog-elrs", "GEPRC CineLog20 Analog", "GEPRC", 8, "CORE_ANALOG_SMALL", ["analog"], ["cinematic"]),
  b("darwinfpv-cineape25-analog-elrs", "DarwinFPV CineApe25 Analog ELRS", "DarwinFPV", 8, "CORE_VALUE_ANALOG", ["analog"], ["cinematic"]),
  b("darwinfpv-cineape35-analog-6s", "DarwinFPV CineApe35 Analog 6S", "DarwinFPV", 8, "CORE_VALUE_ANALOG_HEAVY", ["analog"], ["cinematic"]),
  b("geprc-cinelog35-v2-analog", "GEPRC CineLog35 V2 Analog", "GEPRC", 8, "WATCHLIST_OUT_OF_STOCK", ["analog"], ["cinematic"]),
  b("betafpv-pavo20-pro-ii-3s-o4-pro", "BETAFPV Pavo20 Pro II 3S O4 Pro", "BETAFPV", 8, "CORE_SMALL", ["dji_o4"], ["cinematic"]),
  b("betafpv-pavo20-pro-ii-4s-o4-pro", "BETAFPV Pavo20 Pro II 4S O4 Pro", "BETAFPV", 8, "CORE_SMALL", ["dji_o4"], ["cinematic"]),
  b("geprc-cinebot25-analog-elrs", "GEPRC Cinebot25 Analog", "GEPRC", 8, "CORE_ANALOG_PREMIUM", ["analog"], ["cinematic"]),
  b("geprc-cinebot25-s-analog-elrs", "GEPRC Cinebot25 S Analog", "GEPRC", 8, "CORE_ANALOG_PREMIUM", ["analog"], ["cinematic"]),

  b("darwinfpv-darwin129-7-analog", "DarwinFPV Darwin129 7 Analog", "DarwinFPV", 9, "CONDITIONAL_VALUE_ANALOG", ["analog"], ["longRange"]),
  b("darwinfpv-x9-9-long-range", "DarwinFPV X9", "DarwinFPV", 9, "CORE_SPECIALIST", ["analog"], ["longRange"]),
  b("hglrc-rekon35-v2", "HGLRC Rekon35 V2", "HGLRC", 9, "WATCHLIST_OUT_OF_STOCK", [], ["longRange"]),
  b("hglrc-rekon-y6-5-long-range", "HGLRC Rekon Y6 5", "HGLRC", 9, "WATCHLIST_OUT_OF_STOCK", [], ["longRange"]),
  b("hglrc-rekon7-pro-analog", "HGLRC Rekon7 Pro Analog", "HGLRC", 9, "WATCHLIST_OUT_OF_STOCK", ["analog"], ["longRange"]),
  b("darwinfpv-foldape4-analog", "DarwinFPV FoldApe4 Analog", "DarwinFPV", 9, "DO_NOT_DEFAULT", ["analog"], ["longRange"]),
];
