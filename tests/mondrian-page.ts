import { expect, Locator, Page, TestInfo } from "@playwright/test";

const TEST_URL = "http://localhost:8080";
const API_URL = "http://localhost:3000";
const DEFAULT_CHANNEL_NAME = "playwright_test";

export class MondrianPage {
  readonly page: Page;

  readonly container: Locator;

  readonly loading: Locator;

  constructor(page: Page, readonly testInfo?: TestInfo) {
    this.page = page;
    this.container = page.locator(".mondrian-container");
    this.loading = page.locator(".mondrian-loading");
  }

  async init() {
    await this.resetChannel();
    await this.goto();
    await this.start();
    await this.page.waitForTimeout(1000);
  }

  async resetChannel() {
    const response = await this.page.evaluate(
      async ([API_URL, DEFAULT_CHANNEL_NAME]) => {
        return await fetch(
          `${API_URL}/clearChannel?mark=${DEFAULT_CHANNEL_NAME}`,
          {
            method: "GET",
          }
        ).then((res) => (res.ok ? res.json() : Promise.reject(res)));
      },
      [API_URL, DEFAULT_CHANNEL_NAME]
    );
    if (!response.success) {
      throw new Error("reset channel fails.");
    }
  }

  async goto() {
    await this.page.goto(TEST_URL);
    // hide lil-gui
    // Click text=Mondrian
    // await this.page.click("text=Mondrian");
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
      return (window as any).mo.renderer.pixiApp.renderer.context.webGLVersion;
    });
  }

  async isRunning() {
    return await this.page.evaluate(() => {
      return (window as any).mo.running;
    });
  }

  async hideUI() {
    return await this.page.evaluate(() => {
      return (window as any).moApp.hideUI();
    });
  }

  async screenshotAndCompare() {
    expect(
      await this.container.screenshot({
        omitBackground: true,
      })
    ).toMatchSnapshot({
      name: `${testTitleFileName(this.testInfo.title)}.png`,
      threshold: 0.01,
    });
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