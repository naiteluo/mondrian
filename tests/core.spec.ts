import { test, expect } from "@playwright/test";
import { expectSome, hasColor, MondrianPage } from "./mondrian-page";
import { PNG } from "pngjs";

test.describe("core", () => {
  test("initialization check", async ({ page }) => {
    const mp = new MondrianPage(page);
    await mp.resetChannel();
    await mp.goto();

    // should not have contianer before start
    expect(await mp.container.count()).toEqual(0);
    await mp.start();
    expect(await mp.container.count()).toEqual(1);
    expect(await mp.isRunning()).toBe(true);

    // check channel name
    const storageHandle = await page.evaluateHandle(() => window.localStorage);
    const channelName = await storageHandle.evaluate((storage) => {
      return storage.getItem("__mo_config_channel");
    });
    expect(channelName).toEqual("playwright_test");
  });

  test("webgl detect", async ({ page }, { outputPath }) => {
    const mp = new MondrianPage(page);
    await mp.init();
    expect(await mp.getWebGLVersion()).toEqual(2);

    // take a snapshot of gpu info
    await mp.page.goto("chrome://gpu");
    await mp.page.screenshot({
      path: `${outputPath()}/gpu-info.png`,
      fullPage: true,
    });
  });

  test("draw lines", async ({ page }, { outputPath }) => {
    const mp = new MondrianPage(page);
    await mp.init();
    // Click button:has-text("Start Auto Draw")
    await mp.startAutoDraw();
    await page.waitForTimeout(2 * 1000);
    await mp.stopAutoDraw();
    await page.waitForTimeout(200);
    await mp.hideUI();
    const buffer = await mp.container.screenshot({
      path: `${outputPath()}/draw-lines-result.png`,
      omitBackground: true,
    });
    const png = PNG.sync.read(buffer);
    expectSome(png.data, hasColor, 100);
  });
});
