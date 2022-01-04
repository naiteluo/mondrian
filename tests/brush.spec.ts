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

    await page.selectOption('[data-test-id="brushName"] select', "Eraser");
    await page.fill('[data-test-id="brushWidth"] input[type="number"]', "10");

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

    await page.selectOption('[data-test-id="brushName"] select', "Highlighter");
    await page.fill('[data-test-id="brushWidth"] input[type="number"]', "20");
    await page.fill('[data-test-id="brushColor"] input[type="text"]', "eeff00");

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

  /**
   * multi lines blend test
   */
  test("lines blend", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();

    const sx = 300;
    const sy = 300;

    const ex = 900;
    const ey = 300;

    await mp.brushName.selectOption("Pencil");
    await mp.brushWidth.fill("50");
    await mp.brushColor.fill("ff6666");

    await mp.page.mouse.move(sx, sy);
    await mp.page.mouse.down();
    await mp.page.mouse.move(ex, ey, { steps: 10 });
    await mp.page.mouse.up();

    await mp.brushName.selectOption("Eraser");
    await mp.brushWidth.fill("20");

    await mp.page.mouse.move(sx + 100, sy);
    await mp.page.mouse.down();
    await mp.page.mouse.move(ex - 100, ey, { steps: 10 });
    await mp.page.mouse.up();

    await mp.brushName.selectOption("Highlighter");
    await mp.brushWidth.fill("20");
    await mp.brushColor.fill("eeff00");

    await mp.page.mouse.move(sx - 100, sy - 50);
    await mp.page.mouse.down();
    await mp.page.mouse.move(ex + 100, ey + 50, { steps: 10 });
    await mp.page.mouse.up();

    await mp.brushName.selectOption("Eraser");
    await mp.brushWidth.fill("50");

    await mp.page.mouse.move(sx + 100, sy - 100);
    await mp.page.mouse.down();
    await mp.page.mouse.move(sx + 100, sy + 100, { steps: 10 });
    await mp.page.mouse.up();

    await mp.brushName.selectOption("Pencil");
    await mp.brushWidth.fill("20");
    await mp.brushColor.fill("ff6666");

    await mp.page.mouse.move(ex - 200, sy - 100);
    await mp.page.mouse.down();
    await mp.page.mouse.move(ex - 200, sy + 100, { steps: 10 });
    await mp.page.mouse.up();

    await mp.hideUI();
    await mp.screenshotAndCompare();
  });
});
