import { expect, Locator, Page, TestInfo, TestType } from "@playwright/test";

const TEST_URL = "http://localhost:8080";
const API_URL = "http://localhost:3000";
// const TEST_URL = "http://naiteluo.cc/mondrian/";
// const API_URL = "http://naiteluo.cc:3000";

import { MondrianTestSettings } from "./mondrian-test-settings";

export class MondrianPage {
  readonly page: Page;

  readonly container: Locator;

  readonly loading: Locator;

  readonly brushName: Locator;

  readonly brushWidth: Locator;

  readonly brushColor: Locator;

  constructor(page: Page, readonly testInfo?: TestInfo) {
    this.page = page;
    this.container = page.locator(".mondrian-container");
    this.loading = page.locator(".mondrian-loading");
    this.brushName = page.locator('[data-test-id="brushName"] select');
    this.brushWidth = page.locator(
      '[data-test-id="brushWidth"] input[type="number"]'
    );
    this.brushColor = page.locator(
      '[data-test-id="brushColor"] input[type="text"]'
    );
  }

  async init(channelName: string) {
    await this.resetChannel(channelName);
    await this.goto();
    await this.start();
    await this.page.waitForTimeout(1000);
  }

  async getMondrianHandle() {
    return await this.page.evaluateHandle(() => {
      return window.mo;
    });
  }

  async getDynamicLayerLength() {
    const mo = await this.getMondrianHandle();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    return await mo.evaluate((mo) => mo.renderer.dynamicLayer.children.length);
  }

  async resetChannel(channelName: string) {
    const response = await this.page.evaluate(
      async ([API_URL, channelName]) => {
        return await fetch(`${API_URL}/clearChannel?mark=${channelName}`, {
          method: "GET",
        }).then((res) => (res.ok ? res.json() : Promise.reject(res)));
      },
      [API_URL, channelName]
    );
    if (!response.success) {
      throw new Error("reset channel fails.");
    }
  }

  async goto() {
    await this.page.goto(TEST_URL);
  }

  async start() {
    // Click button:has-text("Start")
    await this.page.click('button:has-text("Start")');
  }

  async startAutoDraw() {
    // Click button:has-text("Start Auto Draw")
    await this.page.click('button:has-text("Start Auto Draw")');
  }

  async stopAutoDraw() {
    // Click button:has-text("Stop Auto Draw")
    await this.page.click('button:has-text("Stop Auto Draw")');
  }

  async getWebGLVersion() {
    return await this.page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      return window.mo.renderer.pixiApp.renderer.context.webGLVersion;
    });
  }

  async isRunning() {
    return await this.page.evaluate(() => {
      return window.mo.running;
    });
  }

  /**
   * show ui
   * @returns
   */
  async showUI() {
    return await this.page.evaluate(() => {
      return (window.moApp.showUI as () => void)();
    });
  }

  /**
   * ui might capture some mouseevent, cause unexpected results in test
   * hide ui before doing complicated draw test
   * @returns
   */
  async hideUI() {
    return await this.page.evaluate(() => {
      return (window.moApp.hideUI as () => void)();
    });
  }

  /**
   * take screenshot and do assertions
   * @param suffix screenshot local identifier suffix
   */
  async screenshotAndCompare(suffix = "") {
    expect(
      await this.container.screenshot({
        omitBackground: true,
      })
    ).toMatchSnapshot({
      name: `${testTitleFileName(this.testInfo.title)}${
        suffix ? "-" + suffix : ""
      }.png`,
      threshold: 0.001,
    });
  }

  /**
   *
   * automatically draw lines for easy testing
   *
   * @param count lines count
   * @param sx start x
   * @param sy start y
   * @param length line length
   * @param span space between lines
   */
  async quickFill(count = 20, sx = 100, sy = 100, length = 200, span = 10) {
    for (let i = 0; i < count; i++) {
      await this.page.mouse.move(sx + span, sy + i * span);
      await this.page.mouse.down();
      await this.page.mouse.move(sx + length, sy + i * span, { steps: 10 });
      await this.page.mouse.up();
    }
  }

  static setTestOptions(
    test: TestType<unknown, unknown>,
    title: string
  ): string {
    const channelName = `playwright_test_${title}`;
    test.use({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: "http://localhost:8080/",
            localStorage: [
              {
                name: "__mo_config_mondrian_settings",
                value: JSON.stringify({
                  ...MondrianTestSettings,
                  channel: `playwright_test_${title}`,
                }),
              },
            ],
          },
          {
            origin: "http://naiteluo.cc",
            localStorage: [
              {
                name: "__mo_config_mondrian_settings",
                value: JSON.stringify({
                  ...MondrianTestSettings,
                  channel: `playwright_test_${title}`,
                }),
              },
            ],
          },
        ],
      },
    });
    return channelName;
  }
}

export function hasColor(r, g, b, a) {
  return r > 0 || g > 0 || b > 0 || a === 255;
}

export function expectAll(pixels: Buffer, rgbaPredicate) {
  const checkPixel = (i) => {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const alpha = pixels[i + 3];
    rgbaPredicate(r, g, b, alpha);
  };
  try {
    for (let i = 0, n = pixels.length; i < n; i += 4) checkPixel(i);
  } catch (e) {
    // Log pixel values on failure.
    e.message += `\n\nActual pixels=[${pixels.join(",")}]`;
    throw e;
  }
}

export function expectSome(pixels: Buffer, rgbaPredicate, count = 0) {
  let passCount = 0;
  const checkPixel = (i) => {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const alpha = pixels[i + 3];
    if (rgbaPredicate(r, g, b, alpha)) {
      passCount++;
    }
  };
  try {
    for (let i = 0, n = pixels.length; i < n; i += 4) checkPixel(i);
    expect(passCount).toBeGreaterThan(count);
  } catch (e) {
    // Log pixel values on failure.
    // e.message += `\n\nActual pixels=[${pixels.join(",")}]`;
    e.message += `\n\nActual Pass pixels count = ${passCount}`;
    throw e;
  }
}

export function testTitleFileName(title: string) {
  return title.replace(/ /g, "_");
}
