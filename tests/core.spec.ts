import { test, expect } from "@playwright/test";
import { expectSome, hasColor, MondrianPage } from "./mondrian-page";
import { PNG } from "pngjs";

const testTitle = "core";

test.describe(testTitle, () => {
  const channelName = MondrianPage.setTestOptions(test, testTitle);
  test("initialization check", async ({ page }) => {
    const mp = new MondrianPage(page);
    await mp.resetChannel(channelName);
    await mp.goto();

    // should not have contianer before start
    expect(await mp.container.count()).toEqual(0);
    await mp.start();
    expect(await mp.container.count()).toEqual(1);
    expect(await mp.isRunning()).toBe(true);

    // check channel name
    const storageHandle = await page.evaluateHandle(() => window.localStorage);
    const _channelName = await storageHandle.evaluate((storage) => {
      return JSON.parse(storage.getItem("__mo_config_mondrian_settings"))
        .channel;
    });
    expect(_channelName).toEqual(channelName);
  });

  test("webgl detect", async ({ page }, { outputPath }) => {
    const mp = new MondrianPage(page);
    await mp.init(channelName);
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
    await mp.init(channelName);
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
