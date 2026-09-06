import { test, expect } from "@playwright/test";

test.describe("FPV recommender", () => {
  test("completes the quiz and shows a compatible kit", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Build your perfect FPV kit/i })).toBeVisible();
    await page.getByRole("button", { name: /Start the quiz/i }).click();

    await expect(page.getByText(/What is your budget/i)).toBeVisible();
    await page.getByRole("button", { name: /Continue/i }).click();

    await page.getByRole("button", { name: /Beginner/i }).click();
    await page.getByRole("button", { name: /Tiny Whoop/i }).click();
    await page.getByRole("button", { name: /Analog/i }).click();

    await expect(page.getByText(/Your kit/i)).toBeVisible();
    await expect(page.getByText('Total', { exact: true }).first()).toBeVisible();

    await expect(page.getByText('Drone', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Goggles', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Radio', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Charger', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Batteries', { exact: true }).first()).toBeVisible();
  });

  test("shows details modal", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Start the quiz/i }).click();
    await page.getByRole("button", { name: /Continue/i }).click();
    await page.getByRole("button", { name: /Beginner/i }).click();
    await page.getByRole("button", { name: /Tiny Whoop/i }).click();
    await page.getByRole("button", { name: /Analog/i }).click();

    await page.getByRole("button", { name: /Details/i }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("button", { name: /Close/i })).toBeVisible();
  });
});
