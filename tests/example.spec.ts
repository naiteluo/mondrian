import { test, expect } from "@playwright/test";

const TEST_URL = "http://localhost:8080";

test.describe("example", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(TEST_URL);
  });

  test("env check", async ({ page }) => {
    await expect(await page.title()).toEqual("Mondrian");
    const mainContainer = await page.locator(".mondrian-container");
    expect(await mainContainer.count()).toEqual(0);
    const storageHandle = await page.evaluateHandle(() => window.localStorage);

    const channelName = await storageHandle.evaluate((storage) => {
      return storage.getItem("__mo_config_channel");
    });
    expect(channelName).toEqual("playwright_test");
  });
});
