import { test } from "@playwright/test";
import { MondrianPage } from "./mondrian-page";

const basicShapeData = [
  [
    [150, 150],
    [200, 200],
    [300, 300],
  ],
  [
    [600, 300],
    [500, 200],
    [450, 150],
  ],

  [
    [150, 350],
    [200, 400],
    [500, 500],
  ],
  [
    [800, 300],
    [500, 400],
    [450, 550],
  ],
];

test.describe("shape", () => {
  test("rectangle", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();

    await page.selectOption('[data-test-id="brushName"] select', "Rectangle");

    for (let i = 0; i < basicShapeData.length; i++) {
      const lineData = basicShapeData[i];
      for (let j = 0; j < lineData.length; j++) {
        const [x, y] = lineData[j];
        if (i === 2) {
          mp.page.keyboard.down("Shift");
        }
        await mp.page.mouse.move(x, y);
        if (j === 0) {
          await mp.page.mouse.down();
        }
        if (j === lineData.length - 1) {
          await mp.page.mouse.up();
        }
        if (i === 2) {
          mp.page.keyboard.up("Shift");
        }
      }
    }

    await mp.hideUI();
    await mp.screenshotAndCompare();
  });

  test("circle", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();

    await page.selectOption('[data-test-id="brushName"] select', "Circle");

    for (let i = 0; i < basicShapeData.length; i++) {
      const lineData = basicShapeData[i];
      for (let j = 0; j < lineData.length; j++) {
        const [x, y] = lineData[j];
        if (i === 2) {
          mp.page.keyboard.down("Shift");
        }
        await mp.page.mouse.move(x, y);
        if (j === 0) {
          await mp.page.mouse.down();
        }
        if (j === lineData.length - 1) {
          await mp.page.mouse.up();
        }
        if (i === 2) {
          mp.page.keyboard.up("Shift");
        }
      }
    }

    await mp.hideUI();
    await mp.screenshotAndCompare();
  });

  test("triangle", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init();

    await page.selectOption('[data-test-id="brushName"] select', "Triangle");

    for (let i = 0; i < basicShapeData.length; i++) {
      const lineData = basicShapeData[i];
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
