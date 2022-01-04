import { test, expect } from "@playwright/test";
import { MondrianPage } from "./mondrian-page";

async function quickFill(mp: MondrianPage, count = 20) {
  const sx = 100;
  const sy = 100;
  for (let i = 0; i < count; i++) {
    await mp.page.mouse.move(sx + 10, sy + i * 10);
    await mp.page.mouse.down();
    await mp.page.mouse.move(sx + 200, sy + i * 10, { steps: 10 });
    await mp.page.mouse.up();
  }
}

test.describe("renderer core", () => {
  test("dynamic level less than 20", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();
    await quickFill(mp);
    expect(await mp.getDynamicLayerLength()).toBe(20);
    await quickFill(mp, 1);
    expect(await mp.getDynamicLayerLength()).toBe(21);
    await mp.page.waitForTimeout(100);
    expect(await mp.getDynamicLayerLength()).toBe(20);
    await quickFill(mp, 5);
    expect(await mp.getDynamicLayerLength()).toBe(21);
    await mp.page.waitForTimeout(100);
    expect(await mp.getDynamicLayerLength()).toBe(20);
  });
});
