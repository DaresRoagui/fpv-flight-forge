import { test, expect, Page } from "@playwright/test";

async function completeQuiz(
  page: Page,
  {
    scope = "FULL_KIT",
    budget = "900",
    style = "tinywhoop",
    experience = "beginner",
    environment = "MIXED",
    video = "analog",
    priority = "BALANCED",
    ownedGoggles,
    ownedRadio,
  }: {
    scope?: string;
    budget?: string;
    style?: string;
    experience?: string;
    environment?: string;
    video?: string;
    priority?: string;
    ownedGoggles?: string;
    ownedRadio?: string;
  } = {}
) {
  await page.goto("/");
  await page.getByTestId("start-button").click();
  await page.getByTestId(`option-scope-${scope}`).click();
  await page.locator('input[type="range"]').fill(budget);
  await page.getByTestId("continue-button").click();
  await page.getByTestId(`option-style-${style}`).click();
  await page.getByTestId(`option-experience-${experience}`).click();

  if (["tinywhoop", "freestyle", "cinematic"].includes(style)) {
    await page.getByTestId(`option-environment-${environment}`).click();
  }

  await page.getByTestId(`option-video-${video}`).click();

  if (scope === "COMPLETE_EXISTING_SETUP") {
    if (ownedGoggles) await page.getByTestId("owned-goggles").selectOption(ownedGoggles);
    if (ownedRadio) await page.getByTestId("owned-radio").selectOption(ownedRadio);
    await page.getByTestId("continue-button").click();
  }

  if (experience === "advanced") {
    await page.getByTestId(`option-advancedPriority-${priority}`).click();
    await page.getByTestId("continue-button").click();
  }
}

test.describe("Iteration 4 high-value browser flows", () => {
  test("beginner full kit stays progressive and shows separated practical extras", async ({ page }) => {
    await completeQuiz(page, { budget: "900", style: "tinywhoop", experience: "beginner", environment: "INDOOR_TIGHT", video: "analog" });
    await expect(page.getByTestId("result-title")).toBeVisible();
    await expect(page.getByTestId("result-products").getByTestId("product-card")).toHaveCount(5);
    await expect(page.getByTestId("recommended-extras")).toBeVisible();
    await expect(page.getByTestId("beginner-learning-note")).toBeVisible();
  });

  test("budget shortfall keeps the closest valid kit and minimum budget on screen", async ({ page }) => {
    await completeQuiz(page, { budget: "100", style: "tinywhoop", experience: "beginner", environment: "INDOOR_TIGHT", video: "analog" });
    await expect(page.getByTestId("insufficient-title")).toBeVisible();
    await expect(page.getByTestId("kit-composition")).toBeVisible();
    await expect(page.getByTestId("recommended-extras")).toBeVisible();
  });

  test("drone-only does not force goggles/radio/charger into budget and still shows references", async ({ page }) => {
    await completeQuiz(page, { scope: "DRONE_ONLY", budget: "600", style: "freestyle", experience: "intermediate", environment: "OUTDOOR", video: "analog" });
    await expect(page.getByTestId("result-title")).toBeVisible();
    await expect(page.getByTestId("compatibility-references")).toBeVisible();
    await expect(page.getByTestId("result-products").getByTestId("product-card")).toHaveCount(1);
  });

  test("existing compatible DJI/ELRS gear is reused instead of duplicated", async ({ page }) => {
    await completeQuiz(page, {
      scope: "COMPLETE_EXISTING_SETUP",
      budget: "1500",
      style: "cinematic",
      experience: "intermediate",
      environment: "MIXED",
      video: "dji_o4",
      ownedGoggles: "dji-goggles-3",
      ownedRadio: "radiomaster-pocket-elrs",
    });
    await expect(page.getByTestId("result-title")).toBeVisible();
    await expect(page.getByTestId("kit-composition")).toContainText(/Goggles 3/i);
    await expect(page.getByTestId("kit-composition")).toContainText(/Pocket/i);
  });

  test("advanced racing exposes HDZero/priority and returns a recommendation", async ({ page }) => {
    await completeQuiz(page, { budget: "2700", style: "racing", experience: "advanced", video: "hdzero", priority: "LOW_LATENCY" });
    await expect(page.getByTestId("result-title")).toBeVisible();
    await expect(page.getByTestId("kit-composition")).toContainText(/HDZero|Mach R5|Hawk Apex/i);
  });

  test("language currency and regulation settings persist independently", async ({ page }) => {
    await page.goto("/");
    await page.selectOption("#language-select", "en");
    await page.selectOption("#currency-select", "usd");
    await page.selectOption("#region-select", "US");
    await page.reload();
    await expect(page.locator("#language-select")).toHaveValue("en");
    await expect(page.locator("#currency-select")).toHaveValue("usd");
    await expect(page.locator("#region-select")).toHaveValue("US");

    await completeQuiz(page, { budget: "1100", style: "tinywhoop", experience: "beginner", environment: "INDOOR_TIGHT", video: "dji_o4" });
    await expect(page.getByTestId("result-title")).toContainText(/kit/i);
    await expect(page.getByTestId("regulatory-badge")).toBeVisible();
    await expect(page.getByTestId("regulatory-badge")).toContainText(/United States|U\.S\.|FAA/i);
  });
});
