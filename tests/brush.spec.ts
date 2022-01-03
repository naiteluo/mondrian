import { test } from "@playwright/test";
import { MondrianPage } from "./mondrian-page";

const basicLineData = [
  [
    [150, 300],
    [300, 300],
  ],
  [
    [300, 150],
    [300, 300],
  ],
  [
    [450, 150],
    [650, 350],
    [800, 500],
  ],
  [
    [750, 150],
    [750, 250],
    [950, 350],
    [1100, 500],
  ],
];

test.describe("brush", () => {
  test("draw simple line", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();

    for (let i = 0; i < basicLineData.length; i++) {
      const lineData = basicLineData[i];
      for (let j = 0; j < lineData.length; j++) {
        const [x, y] = lineData[j];
        await mp.page.mouse.move(x, y);
        if (j === 0) {
          await mp.page.mouse.down();
        }
        if (j === lineData.length - 1) {
          await mp.page.mouse.up();
        }
      }
    }
    await mp.hideUI();
    await mp.screenshotAndCompare();
  });

  test("draw eraser", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();

    for (let i = 0; i < basicLineData.length; i++) {
      const lineData = basicLineData[i];
      for (let j = 0; j < lineData.length; j++) {
        const [x, y] = lineData[j];
        await mp.page.mouse.move(x, y);
        if (j === 0) {
          await mp.page.mouse.down();
        }
        if (j === lineData.length - 1) {
          await mp.page.mouse.up();
        }
      }
    }

    // Click text=Brush
    await page.click("text=Brush");

    // Select Eraser
    await page.selectOption('[data-test-id="BrushType"] select', "Eraser");

    // Fill [data-test-id="width"] input[type="number"]
    await page.fill('[data-test-id="width"] input[type="number"]', "10");

    for (let i = 0; i < basicLineData.length; i++) {
      const lineData = basicLineData[i];
      if (i % 2 === 0) {
        continue;
      }
      for (let j = 0; j < lineData.length; j++) {
        const [x, y] = lineData[j];
        await mp.page.mouse.move(x, y);
        if (j === 0) {
          await mp.page.mouse.down();
        }
        if (j === lineData.length - 1) {
          await mp.page.mouse.up();
        }
      }
    }

    await mp.hideUI();
    await mp.screenshotAndCompare();
  });

  test("draw highlighter line", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();

    // Click text=Brush
    await page.click("text=Brush");

    // Select Highlighter
    await page.selectOption('[data-test-id="BrushType"] select', "Highlighter");

    // Fill [data-test-id="width"] input[type="number"]
    await page.fill('[data-test-id="width"] input[type="number"]', "20");

    // Fill [data-test-id="color"] input[type="text"]
    await page.fill('[data-test-id="color"] input[type="text"]', "eeff00");

    for (let i = 0; i < basicLineData.length; i++) {
      const lineData = basicLineData[i];
      for (let j = 0; j < lineData.length; j++) {
        const [x, y] = lineData[j];
        await mp.page.mouse.move(x, y);
        if (j === 0) {
          await mp.page.mouse.down();
        }
        if (j === lineData.length - 1) {
          await mp.page.mouse.up();
        }
      }
    }
    await mp.hideUI();
    await mp.screenshotAndCompare();
  });
});
