import { Product, UserPreferences, FlightStyle } from "@/lib/schema";

export function videoSystemMatches(goggles: Product, drone: Product): boolean {
  return goggles.videoSystems.some((v) => drone.videoSystems.includes(v));
}

export function protocolMatches(radio: Product, drone: Product): boolean {
  return radio.protocols.some((p) => drone.protocols.includes(p));
}

function parseList(value: string | undefined): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function cellRangeIncludes(supported: string, cell: string): boolean {
  const exact = supported.split(",").map((s) => s.trim());
  if (exact.includes(cell)) return true;
  const match = supported.match(/(\d+)S\s*-\s*(\d+)S/i);
  if (!match) return false;
  const min = parseInt(match[1], 10);
  const max = parseInt(match[2], 10);
  const cellNum = parseInt(cell.replace(/S$/i, ""), 10);
  return !Number.isNaN(cellNum) && cellNum >= min && cellNum <= max;
}

function droneChemistrySupportsBattery(drone: Product, battery: Product): boolean {
  const droneChemistry = parseList(drone.keySpecs.chemistry).map((s) => s.toLowerCase());
  const batteryChemistry = (battery.keySpecs.chemistry ?? "").toLowerCase();
  if (!droneChemistry.length || !batteryChemistry) return false;
  return droneChemistry.includes(batteryChemistry);
}

export function batteryMatchesDrone(battery: Product, drone: Product): boolean {
  const droneCells = drone.keySpecs.cells ?? "";
  const batteryCells = battery.keySpecs.cells ?? "";
  const droneConnector = drone.keySpecs.connector ?? "";
  const batteryConnector = battery.keySpecs.connector ?? "";
  return (
    droneCells.toLowerCase() === batteryCells.toLowerCase() &&
    droneConnector.toLowerCase() === batteryConnector.toLowerCase() &&
    droneChemistrySupportsBattery(drone, battery)
  );
}

function chargerSupportsChemistry(charger: Product, battery: Product): boolean {
  const chargerChemistry = parseList(charger.keySpecs.chemistry).map((s) => s.toLowerCase());
  const batteryChemistry = (battery.keySpecs.chemistry ?? "").toLowerCase();
  if (!chargerChemistry.length || !batteryChemistry) return false;
  return chargerChemistry.includes(batteryChemistry);
}

function chargerSupportsConnector(charger: Product, battery: Product): boolean {
  const chargerConnectors = parseList(charger.keySpecs.connector).map((s) => s.toLowerCase());
  const batteryConnector = (battery.keySpecs.connector ?? "").toLowerCase();
  if (!chargerConnectors.length || !batteryConnector) return false;
  return chargerConnectors.includes(batteryConnector);
}

export function chargerMatchesBattery(charger: Product, battery: Product): boolean {
  const supportedCells = charger.keySpecs.supportedCells ?? "";
  const batteryCells = battery.keySpecs.cells ?? "";
  return (
    !!supportedCells &&
    !!batteryCells &&
    cellRangeIncludes(supportedCells, batteryCells) &&
    chargerSupportsConnector(charger, battery) &&
    chargerSupportsChemistry(charger, battery)
  );
}

export function flightStyleMatches(drone: Product, style: FlightStyle): boolean {
  return drone.flightStyles.includes(style);
}

export function videoSystemIsRecommended(preferences: UserPreferences) {
  if (preferences.videoSystem !== "recommend") return preferences.videoSystem;
  // DJI O4 is a nicer experience for beginners when budget allows.
  if (preferences.budget >= 550 && preferences.experience !== "advanced") return "dji_o4";
  return "analog";
}

export type ValidationError =
  | { kind: "video"; goggles: Product; drone: Product }
  | { kind: "protocol"; radio: Product; drone: Product }
  | { kind: "battery"; battery: Product; drone: Product }
  | { kind: "charger"; charger: Product; battery: Product };

export function validateBundle(
  goggles: Product,
  drone: Product,
  radio: Product,
  charger: Product,
  battery: Product
): ValidationError | null {
  if (!videoSystemMatches(goggles, drone)) {
    return { kind: "video", goggles, drone };
  }
  if (!protocolMatches(radio, drone)) {
    return { kind: "protocol", radio, drone };
  }
  if (!batteryMatchesDrone(battery, drone)) {
    return { kind: "battery", battery, drone };
  }
  if (!chargerMatchesBattery(charger, battery)) {
    return { kind: "charger", charger, battery };
  }
  return null;
}
