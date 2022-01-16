import { test, expect } from "@playwright/test";
import { MondrianPage } from "./mondrian-page";

test.describe("command", () => {
  test("simple undo", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();
    await mp.quickFill(10);
    for (let i = 0; i < 5; i++) {
      // Click button:has-text("Undo")
      await page.click('button:has-text("Undo")');
      await page.waitForTimeout(60);
    }
    await mp.hideUI();
    await mp.screenshotAndCompare("5-lines-left");
  });

  test("simple redo", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();
    await mp.quickFill(10);
    for (let i = 0; i < 5; i++) {
      // Click button:has-text("Undo")
      await page.click('button:has-text("Undo")');
      await page.waitForTimeout(60);
    }
    for (let i = 0; i < 4; i++) {
      // Click button:has-text("Redo")
      await page.click('button:has-text("Redo")');
      await page.waitForTimeout(60);
    }
    await mp.hideUI();
    await mp.screenshotAndCompare("9-lines-left");
  });

  test("simple clear", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();
    await mp.quickFill(10);

    // Click [data-test-id="clear"] button:has-text("Clear")
    await page.click('[data-test-id="clear"] button:has-text("Clear")');

    await mp.quickFill(1);

    await mp.hideUI();
    await mp.screenshotAndCompare("1-lines-left");
  });
});
