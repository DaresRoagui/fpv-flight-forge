import type { UserPreferences } from "@/lib/schema";

export type QuestionnaireStepId =
  | "scope"
  | "budget"
  | "style"
  | "experience"
  | "environment"
  | "video"
  | "ownedGear"
  | "advancedPriority";

export function questionnaireSteps(prefs: UserPreferences): QuestionnaireStepId[] {
  const steps: QuestionnaireStepId[] = ["scope", "budget", "style", "experience"];

  // The current schema groups micro freestyle under freestyle, so environment is
  // useful for that family as well as tinywhoop/cinematic.
  if (["tinywhoop", "freestyle", "cinematic"].includes(prefs.style)) {
    steps.push("environment");
  }

  steps.push("video");

  if (prefs.scope === "COMPLETE_EXISTING_SETUP") {
    steps.push("ownedGear");
  }

  // Keep beginner/intermediate onboarding short. Advanced tuning of the result
  // remains opt-in through this extra step.
  if (prefs.experience === "advanced") {
    steps.push("advancedPriority");
  }

  return steps;
}

export function shouldShowAdvancedPriority(prefs: UserPreferences): boolean {
  return questionnaireSteps(prefs).includes("advancedPriority");
}

export function shouldShowOwnedGear(prefs: UserPreferences): boolean {
  return questionnaireSteps(prefs).includes("ownedGear");
}
