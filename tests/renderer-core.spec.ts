import { test, expect } from "@playwright/test";
import { MondrianPage } from "./mondrian-page";

test.describe("renderer core", () => {
  test("dynamic level less than 20", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();
    await mp.quickFill();
    expect(await mp.getDynamicLayerLength()).toBe(20);
    await mp.quickFill(1);
    expect(await mp.getDynamicLayerLength()).toBe(21);
    await mp.page.waitForTimeout(100);
    expect(await mp.getDynamicLayerLength()).toBe(20);
    await mp.quickFill(5);
    expect(await mp.getDynamicLayerLength()).toBe(21);
    await mp.page.waitForTimeout(100);
    expect(await mp.getDynamicLayerLength()).toBe(20);
  });
});
