import { Product, RegulatoryRegion, OperationPurpose, RegulatoryAssessment, Warning } from "@/lib/schema";
import { parseWeightG } from "@/lib/compat";

export function getProductWeightG(product: Product): number | null {
  if (product.weightG !== undefined) return product.weightG;
  return parseWeightG(product.keySpecs?.weight);
}

function warning(type: Warning["type"], messageKey: string, params?: Record<string, string | number>): Warning {
  return { type, messageKey, params };
}

export function assessRegulation(
  drone: Product,
  battery: Product,
  region: RegulatoryRegion,
  purpose: OperationPurpose
): RegulatoryAssessment {
  const droneWeight = getProductWeightG(drone);
  const batteryWeight = getProductWeightG(battery);
  const payload = drone.aircraftProfile?.payloadWeightG ?? 0;
  const mandatory = drone.aircraftProfile?.mandatoryOnboardWeightG ?? 0;

  const estimatedTakeoffWeightG =
    droneWeight !== null && batteryWeight !== null
      ? droneWeight + batteryWeight + payload + mandatory
      : null;

  const weightThresholdG = region === "CO" ? 200 : region === "US" || region === "EU_EASA" ? 250 : null;

  if (estimatedTakeoffWeightG === null) {
    return {
      region,
      purpose,
      estimatedTakeoffWeightG,
      weightThresholdG,
      status: "UNKNOWN_WEIGHT",
      messageKey: "regulation.unknownWeight",
      warnings: [warning("NO_EXACT_TAKEOFF_WEIGHT", "warnings.noExactTakeoffWeight")],
    };
  }

  if (region === "CO") {
    if (purpose === "COMMERCIAL_OR_SPECIFIC") {
      return {
        region,
        purpose,
        estimatedTakeoffWeightG,
        weightThresholdG,
        status: "REGISTRATION_REQUIRED",
        messageKey: "regulation.coCommercial",
        warnings: [warning("REGULATORY_THRESHOLD_CROSSED", "warnings.regulatoryThresholdCrossed")],
      };
    }

    return {
      region,
      purpose,
      estimatedTakeoffWeightG,
      weightThresholdG,
      status: estimatedTakeoffWeightG < 200 ? "NO_REGISTRATION_BY_WEIGHT" : "REGISTRATION_REQUIRED",
      messageKey: estimatedTakeoffWeightG < 200 ? "regulation.coSub200" : "regulation.coRegistration",
      warnings: [],
    };
  }

  if (region === "US") {
    if (purpose === "COMMERCIAL_OR_SPECIFIC") {
      return {
        region,
        purpose,
        estimatedTakeoffWeightG,
        weightThresholdG,
        status: "REGISTRATION_REQUIRED",
        messageKey: "regulation.usPart107",
        warnings: [warning("REGULATORY_THRESHOLD_CROSSED", "warnings.regulatoryThresholdCrossed")],
      };
    }

    return {
      region,
      purpose,
      estimatedTakeoffWeightG,
      weightThresholdG,
      status: estimatedTakeoffWeightG < 250 ? "NO_REGISTRATION_BY_WEIGHT" : "REGISTRATION_REQUIRED",
      messageKey: estimatedTakeoffWeightG < 250 ? "regulation.usSub250" : "regulation.usRegistration",
      warnings: [],
    };
  }

  if (region === "EU_EASA") {
    return {
      region,
      purpose,
      estimatedTakeoffWeightG,
      weightThresholdG,
      status: estimatedTakeoffWeightG < 250 ? "LIGHTWEIGHT_BENEFIT" : "REGISTRATION_REQUIRED",
      messageKey: estimatedTakeoffWeightG < 250 ? "regulation.euSub250" : "regulation.euRegistration",
      warnings: [],
    };
  }

  return {
    region,
    purpose,
    estimatedTakeoffWeightG,
    weightThresholdG,
    status: "CHECK_LOCAL_RULES",
    messageKey: "regulation.generalDisclaimer",
    warnings: [],
  };
}

export function regulatoryBadgeText(
  assessment: RegulatoryAssessment,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (assessment.estimatedTakeoffWeightG === null) {
    return t("regulation.unknownWeight");
  }
  const weight = Math.round(assessment.estimatedTakeoffWeightG);
  return t(assessment.messageKey, { weight });
}
