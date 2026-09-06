export type ProductTranslation = {
  description: string;
  idealFor: string[];
  limitations: string[];
};

export const PRODUCT_TRANSLATIONS: Record<string, ProductTranslation> = {
  "goggles-eachine-ev800d": {
    description:
      "Box-style goggles with a true diversity receiver, built-in DVR, and a removable screen. A great entry point into analog FPV.",
    idealFor: ["First FPV goggles", "Indoor and tinywhoop flying", "Tight budget"],
    limitations: ["Basic resolution", "Not compatible with HD digital video", "Somewhat bulky"],
  },
  "goggles-betafpv-vr04": {
    description:
      "Lightweight, affordable BetaFPV goggles for starting out in analog FPV, especially comfortable for whoops.",
    idealFor: ["Beginners", "Tinywhoop and micro drones", "Portable use"],
    limitations: ["Small screen", "No DVR", "No diversity"],
  },
  "goggles-skyzone-cobra-x": {
    description:
      "Box-style analog goggles with HD LCD, diversity, DVR, and head tracker. Better image quality than entry-level options without a premium price.",
    idealFor: ["Pilots looking for a better screen", "Freestyle and cinematic analog", "Outdoor flying"],
    limitations: ["Still analog", "Not natively compatible with digital"],
  },
  "goggles-skyzone-sky04x": {
    description:
      "Premium analog goggles with Full HD OLED panel, improved optics, and head tracker. Top-tier analog for demanding pilots.",
    idealFor: ["Advanced pilots", "Competition and serious freestyle", "High-fidelity analog image"],
    limitations: ["High price for an analog system", "No 4K recording"],
  },
  "goggles-dji-n3": {
    description:
      "Affordable DJI digital goggles with low-latency O4 transmission. The easiest way to jump into HD FPV.",
    idealFor: ["First digital system", "Whoops and O4 drones", "DJI ecosystem users"],
    limitations: ["Only compatible with O3/O4", "Lower fidelity than Goggles 3"],
  },
  "goggles-dji-goggles-3": {
    description:
      "Flagship DJI digital goggles with O4 transmission, wideband support, and the best panel for a premium HD FPV experience.",
    idealFor: ["High-end digital", "Cinematic and freestyle HD", "Pilots already in the DJI ecosystem"],
    limitations: ["High price", "Limited to DJI-compatible gear"],
  },
  "drone-betafpv-cetus-pro": {
    description:
      "Brushless ready-to-fly whoop with a self-leveling gyroscope and FrSky protocol. Ideal for learning FPV indoors.",
    idealFor: ["First FPV drone", "Flying at home", "Learning acro safely"],
    limitations: ["Only 1S and BT2.0 connector", "Basic VTX", "Does not support digital video"],
  },
  "drone-iflight-mach-r5-sport": {
    description:
      "5\" competition-oriented drone with split arms, powerful motors, and a 600mW VTX for the track.",
    idealFor: ["Racing and track days", "Advanced pilots", "Light and fast setup"],
    limitations: ["Needs 6S batteries", "No propeller guards", "Racing-focused, not for cinema"],
  },
  "drone-iflight-nazgul5-v3": {
    description:
      "The reference 5\" freestyle quad with pre-tuned setup, 6S power, and a high-performance VTX for tricks and free flying.",
    idealFor: ["5\" freestyle", "Acro and park flying", "Intermediate / advanced pilots"],
    limitations: ["Requires manual-mode experience", "Noisy for indoors", "No propeller guards"],
  },
  "drone-geprc-cinelog35-v2": {
    description:
      "3.5\" protected cinewhoop with ducts, ideal for flying near people and capturing smooth shots indoors and outdoors.",
    idealFor: ["Cinematic and cine-whoops", "Filming in enclosed spaces", "Safe flying near objects"],
    limitations: ["Less agile than a 5\" freestyle", "Analog system", "Requires 6S battery"],
  },
  "drone-iflight-chimera7-pro-v2": {
    description:
      "7.5\" long-range drone with aerodynamic efficiency, GPS, and a high-power VTX for exploring far away.",
    idealFor: ["Long range", "Exploration and travel", "Smooth flying with long endurance"],
    limitations: ["Large size and weight", "Needs advanced experience", "Large batteries recommended"],
  },
  "drone-betafpv-meteor65-pro-o4": {
    description:
      "1S whoop with an integrated DJI O4 unit for HD FPV indoors. ELRS 2.4GHz and BT2.0 connector from the factory.",
    idealFor: ["Tinywhoop HD", "First digital drone", "Flying at home with HD image quality"],
    limitations: ["Limited to 1S and BT2.0", "Short flight time (~2:40)", "Needs DJI O4 goggles"],
  },
  "drone-iflight-chimera7-pro-v2-o4": {
    description:
      "7.5\" long-range drone with DJI O4 Pro transmission, GPS, and extended endurance for HD expeditions.",
    idealFor: ["Long range digital", "Nature cinematography", "Exploration with maximum quality"],
    limitations: ["High price", "Large size", "Requires compatible DJI goggles"],
  },
  "drone-geprc-mark5-o4": {
    description:
      "5\" freestyle / racing drone with DJI O4 Pro, aluminum camera mount, and silicone damping for stable footage.",
    idealFor: ["Freestyle HD", "Digital racing", "Acro with 4K recording"],
    limitations: ["Mid-high price", "Requires DJI O4 goggles", "No propeller guards"],
  },
  "drone-geprc-vapor-d5-o4": {
    description:
      "5\" racing drone optimized for DJI O4 Pro: 5mm arms, CNC lens support, and GEPRC tune for competitive HD flying.",
    idealFor: ["Digital racing", "HD track days", "Fast and precise pilots"],
    limitations: ["Racing-focused tuning", "6S battery required", "GoPro not included"],
  },
  "drone-geprc-cinelog35-v3-o4": {
    description:
      "3.5\" DJI O4 Pro cinewhoop with 4K 120fps recording and damped camera mount for stable cinematic shots.",
    idealFor: ["Digital cine FPV", "Smooth indoor shots", "Amateur production"],
    limitations: ["High price for a cinewhoop", "Only DJI-compatible goggles", "Requires 6S battery"],
  },
  "radio-radiomaster-pocket": {
    description:
      "Compact, lightweight, and affordable RadioMaster radio with Hall-effect gimbals and EdgeTX firmware. CC2500 version compatible with FrSky.",
    idealFor: ["Beginners", "Tinywhoop and micro drones", "Reduced budget"],
    limitations: ["No batteries included", "Shorter range than larger radios", "No internal ELRS module"],
  },
  "radio-radiomaster-zorro": {
    description:
      "Compact RadioMaster radio with Hall gimbals, internal ELRS module, and an ergonomic gamepad-style design. The most affordable ELRS option for modern drones.",
    idealFor: ["ELRS beginners", "Tinywhoop and 5\"", "Tight budget"],
    limitations: ["No batteries included", "Slightly shorter range than Boxer / TX16S", "No touchscreen"],
  },
  "radio-radiomaster-boxer": {
    description:
      "Full-size RadioMaster radio with internal ELRS module, Hall gimbals, and balanced ergonomics. The go-to choice for modern FPV.",
    idealFor: ["Freestyle, racing, and long range", "ELRS protocol", "Intermediate / advanced pilots"],
    limitations: ["Not natively FrSky", "Batteries not included", "Somewhat large for travel"],
  },
  "radio-radiomaster-tx16s": {
    description:
      "Flagship RadioMaster radio with color touchscreen, ELRS module, and extensive customization for advanced pilots.",
    idealFor: ["Advanced configuration", "Racing and long range", "Demanding users"],
    limitations: ["High price", "Considerable weight", "EdgeTX learning curve"],
  },
  "charger-vifly-whoopstor-v3": {
    description:
      "6-port 1S battery charger with storage function and BT2.0, A30, and PH2.0 connectors.",
    idealFor: ["1S whoops", "Multi-battery charging", "Keeping batteries at storage voltage"],
    limitations: ["1S only", "Does not balance 2S+ packs", "Requires USB or DC input"],
  },
  "charger-hota-t6": {
    description:
      "Pocket-sized charger with DC or USB-PD input, up to 6S, and 15A. Ideal for the field and travel.",
    idealFor: ["Field charging", "1S-6S batteries", "Portable use"],
    limitations: ["DC input requires an external power supply", "No direct AC input", "Not dual channel"],
  },
  "charger-toolkitrc-m6d": {
    description:
      "High-performance dual-channel DC charger with two independent outputs, color screen, and support up to 6S.",
    idealFor: ["Charging two packs at once", "Racing and freestyle", "Field with a strong DC source"],
    limitations: ["DC input only", "Requires a powerful external power supply", "No AC"],
  },
  "charger-hota-d6-pro": {
    description:
      "Dual AC/DC desktop charger with two channels, wireless charging, and a color screen. An all-in-one for the workshop.",
    idealFor: ["Home workshop", "Charging multiple packs", "No external DC source needed"],
    limitations: ["Size and weight", "High price", "Fans can be somewhat noisy"],
  },
  "battery-gnb-1s-530": {
    description:
      "1S LiHV battery with solid-pin BT2.0 connector. Compatible with the Cetus Pro and Meteor65 Pro O4 (BT2.0 version).",
    idealFor: ["1S whoops", "Longer flight time than PH2.0", "Lower contact resistance"],
    limitations: ["BT2.0 connector only", "Requires a compatible charger", "LiHV cycle life"],
  },
  "battery-ovonic-6s-1300": {
    description:
      "High-discharge 6S pack for 5\" freestyle / racing drones. Balances weight, power, and flight time.",
    idealFor: ["Freestyle and racing 5\"", "3.5\" 6S cinewhoops", "Sport flying"],
    limitations: ["Limited endurance for long range", "Weight for whoops", "Requires proper LiPo handling"],
  },
  "battery-iflight-fullsend-6s-3300": {
    description:
      "High-capacity 6S battery for long range and cinematic. More endurance at the cost of more weight.",
    idealFor: ["Long range", "Cinematic with gimbal/GoPro", "Extended flights"],
    limitations: ["Heavy weight", "Not for aggressive acro", "High price"],
  },
};
