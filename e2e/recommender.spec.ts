import { test, expect, Page } from "@playwright/test";

async function completeFullKit(
  page: Page,
  {
    budget = "400",
    experience = "beginner",
    style = "tinywhoop",
    environment = "MIXED",
    video = "analog",
    scope = "FULL_KIT",
    priority = "BALANCED",
  }: {
    budget?: string;
    experience?: string;
    style?: string;
    environment?: string;
    video?: string;
    scope?: string;
    priority?: string;
  } = {}
) {
  await page.goto("/");
  await page.getByTestId("start-button").click();

  await page.locator('input[type="range"]').fill(budget);
  await page.getByTestId("continue-button").click();

  await page.getByTestId(`option-experience-${experience}`).click();
  await page.getByTestId(`option-style-${style}`).click();

  if (style === "tinywhoop" || style === "cinematic") {
    await page.getByTestId(`option-environment-${environment}`).click();
  }

  await page.getByTestId(`option-video-${video}`).click();
  await page.getByTestId(`option-scope-${scope}`).click();
  await page.getByTestId(`option-advancedPriority-${priority}`).click();
}

test.describe("FPV recommender smoke flows", () => {
  test("completes the quiz and shows a compatible 5-item full kit", async ({ page }) => {
    await completeFullKit(page);
    await expect(page.getByTestId("result-title")).toBeVisible();
    await expect(page.getByTestId("kit-composition")).toBeVisible();
    await expect(page.getByTestId("result-products").getByTestId("product-card")).toHaveCount(5);
  });

  test("opens and closes the product detail modal", async ({ page }) => {
    await completeFullKit(page);
    await page.getByTestId("result-products").getByTestId("product-card-details").first().click();
    await expect(page.getByTestId("product-modal")).toBeVisible();
    await page.getByTestId("close-modal").click();
    await expect(page.getByTestId("product-modal")).toBeHidden();
  });

  test("locale and currency switcher updates the result language and currency", async ({ page }) => {
    await page.goto("/");
    await page.selectOption("#language-select", "en");
    await page.selectOption("#currency-select", "usd");

    await page.getByTestId("start-button").click();
    await page.locator('input[type="range"]').fill("700");
    await page.getByTestId("continue-button").click();

    await page.getByTestId("option-experience-beginner").click();
    await page.getByTestId("option-style-tinywhoop").click();
    await page.getByTestId("option-environment-INDOOR_TIGHT").click();
    await page.getByTestId("option-video-dji_o4").click();
    await page.getByTestId("option-scope-FULL_KIT").click();
    await page.getByTestId("option-advancedPriority-BALANCED").click();

    await expect(page.getByTestId("result-title")).toContainText(/kit/i);
    await expect(page.getByTestId("kit-composition")).toContainText("US$");
  });

  test("regulatory region badge appears for a Colombian selection", async ({ page }) => {
    await page.goto("/");
    await page.selectOption("#region-select", "CO");
    await completeFullKit(page, { budget: "1200", style: "cinematic", environment: "OUTDOOR", video: "dji_o4" });
    await expect(page.getByTestId("regulatory-badge")).toBeVisible();
    await expect(page.getByTestId("regulatory-badge")).toContainText("g");
  });

  test("DRONE_ONLY scope prices only drone and battery, with references for missing gear", async ({ page }) => {
    await completeFullKit(page, { budget: "600", scope: "DRONE_ONLY", style: "freestyle", video: "analog", environment: "OUTDOOR" });
    await expect(page.getByTestId("result-title")).toBeVisible();
    await expect(page.getByTestId("result-products").getByTestId("product-card")).toHaveCount(2);
    await expect(page.getByTestId("kit-composition")).toContainText("+");
  });

  test("insufficient budget shows the minimum configuration without navigating away", async ({ page }) => {
    await completeFullKit(page, { budget: "150" });
    await expect(page.getByTestId("insufficient-title")).toBeVisible();
    await expect(page.getByTestId("kit-composition")).toBeVisible();
    await expect(page.getByTestId("result-products").getByTestId("product-card")).toHaveCount(5);
  });
});
