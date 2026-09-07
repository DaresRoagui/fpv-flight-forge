import { Product, RegulatoryRegion, OperationPurpose, RegulatoryAssessment } from "@/lib/schema";
import { parseWeightG } from "@/lib/compat";

export function getProductWeightG(product: Product): number | null {
  if (product.weightG !== undefined) return product.weightG;
  return parseWeightG(product.keySpecs?.weight);
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

  const assessment: RegulatoryAssessment = {
    jurisdiction: region,
    operationPurpose: purpose,
    estimatedTakeoffWeightG,
    weightThresholdG,
    status: "UNKNOWN",
    warningKeys: [],
    badgeKey: "",
    detailKeys: [],
  };

  if (estimatedTakeoffWeightG === null) {
    assessment.status = "UNKNOWN";
    assessment.warningKeys.push("NO_EXACT_TAKEOFF_WEIGHT");
    assessment.badgeKey = "regulation.unknownWeight";
    return assessment;
  }

  if (region === "CO") {
    const threshold = 200;
    if (purpose === "COMMERCIAL_OR_SPECIFIC") {
      assessment.status = "REGISTRATION_REQUIRED";
      assessment.warningKeys.push("REGULATORY_THRESHOLD_CROSSED");
      assessment.badgeKey = "regulation.coCommercial";
      assessment.detailKeys.push("regulation.coFpvObserver");
    } else if (estimatedTakeoffWeightG < threshold) {
      assessment.status = "NO_REGISTRATION_BY_WEIGHT";
      assessment.badgeKey = "regulation.coSub200";
      assessment.detailKeys.push("regulation.coFpvObserver");
    } else {
      assessment.status = "REGISTRATION_REQUIRED";
      assessment.badgeKey = "regulation.coRegistration";
      assessment.detailKeys.push("regulation.coFpvObserver");
    }
  } else if (region === "US") {
    const threshold = 250;
    if (purpose === "COMMERCIAL_OR_SPECIFIC") {
      assessment.status = "REGISTRATION_REQUIRED";
      assessment.warningKeys.push("REGULATORY_THRESHOLD_CROSSED");
      assessment.badgeKey = "regulation.usPart107";
      assessment.detailKeys.push("regulation.usTrust");
    } else if (estimatedTakeoffWeightG < threshold) {
      assessment.status = "NO_REGISTRATION_BY_WEIGHT";
      assessment.badgeKey = "regulation.usSub250";
      assessment.detailKeys.push("regulation.usTrust");
    } else {
      assessment.status = "REGISTRATION_REQUIRED";
      assessment.badgeKey = "regulation.usRegistration";
      assessment.detailKeys.push("regulation.usTrust");
    }
  } else if (region === "EU_EASA") {
    const threshold = 250;
    if (estimatedTakeoffWeightG < threshold) {
      assessment.status = "A1_WEIGHT_ADVANTAGE";
      assessment.badgeKey = "regulation.euSub250";
    } else {
      assessment.status = "OPERATOR_REGISTRATION_REQUIRED";
      assessment.badgeKey = "regulation.euRegistration";
    }
  } else {
    assessment.status = "UNKNOWN";
    assessment.badgeKey = "regulation.unknownWeight";
  }

  assessment.detailKeys.push("regulation.generalDisclaimer");
  return assessment;
}

export function regulatoryBadgeText(assessment: RegulatoryAssessment, t: (key: string, params?: Record<string, string | number>) => string): string {
  if (assessment.estimatedTakeoffWeightG === null) {
    return t("regulation.unknownWeight");
  }
  const weight = Math.round(assessment.estimatedTakeoffWeightG);
  return t(assessment.badgeKey, { weight });
}
