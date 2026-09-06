import { test, expect } from "@playwright/test";

test.describe("FPV recommender", () => {
  test("completes the quiz and shows a compatible kit", async ({ page }) => {
    await page.goto("/");

    await page.getByTestId("start-button").click();

    await page.getByTestId("continue-button").click();

    await page.getByTestId("option-experience-beginner").click();
    await page.getByTestId("option-style-tinywhoop").click();
    await page.getByTestId("option-video-analog").click();

    await expect(page.getByTestId("result-title")).toBeVisible();
    await expect(page.getByTestId("kit-composition")).toBeVisible();

    await expect(page.getByTestId("result-products").getByTestId("product-card")).toHaveCount(5);
  });

  test("shows details modal", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("start-button").click();
    await page.getByTestId("continue-button").click();
    await page.getByTestId("option-experience-beginner").click();
    await page.getByTestId("option-style-tinywhoop").click();
    await page.getByTestId("option-video-analog").click();

    await page.getByTestId("result-products").getByTestId("product-card-details").first().click();
    await expect(page.getByTestId("product-modal")).toBeVisible();
    await expect(page.getByTestId("close-modal")).toBeVisible();
  });
});
