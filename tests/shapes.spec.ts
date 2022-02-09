import { test } from "@playwright/test";
import { MondrianPage } from "./mondrian-page";

const shapesList = [
  "Pencil",
  "Eraser",
  "Highlighter",
  "Stroke",

  // 2d shape brush
  "Rectangle",
  "Circle",
  "Triangle",
  "RightAngleTriangle",
  "Parallelogram",
  //   "RightAngleTrapezoid",
  //   "Trapezoid",
  //   "SemiCircle",

  // 3d shape brush
  //   "Cube",
  //   "Cuboid",
  //   "Sphere",
  //   "Cylinder",
  //   "Cone",
];

const ox = 1280 / 2;
const oy = 720 / 2;
const space = 20;
const stepX = 150;
const stepY = 100;

const basicShapeData = [
  // left-top to right-bottom
  [
    [ox - space - stepX * 2, oy - space - stepY * 2],
    [ox - space - stepX, oy - space - stepY],
    [ox - space, oy - space],
  ],
  // right-bottom to left-top
  [
    [ox + space + stepX * 2, oy - space],
    [ox + space + stepX, oy - space - stepY],
    [ox + space, oy - space - stepY * 2],
  ],
  // left-bottom to right-top
  [
    [ox - space - stepX * 3, oy + space + stepY * 2],
    [ox - space - stepX, oy + space + stepY],
    [ox - space, oy + space],
  ],
  // right-top to left-bottom
  [
    [ox + space + stepX * 2, oy + space],
    [ox + space + stepX, oy + space + stepY],
    [ox + space, oy + space + stepY],
  ],
];

const drawShapes = async (mp: MondrianPage) => {
  for (let i = 0; i < basicShapeData.length; i++) {
    const lineData = basicShapeData[i];
    for (let j = 0; j < lineData.length; j++) {
      const [x, y] = lineData[j];
      if (i === 1) {
        await mp.page.keyboard.down("Control");
      }
      if (i === 3) {
        await mp.page.keyboard.down("Control");
        await mp.page.keyboard.down("Shift");
      }
      await mp.page.mouse.move(x, y);
      if (j === 0) {
        await mp.page.mouse.down();
      }
      if (j === lineData.length - 1) {
        await mp.page.mouse.up();
      }
      if (i === 1) {
        await mp.page.keyboard.up("Control");
      }
      if (i === 3) {
        await mp.page.keyboard.up("Control");
        await mp.page.keyboard.up("Shift");
      }
    }
  }
};

const testTitle = "shapes";

test.describe(testTitle, () => {
  const channelName = MondrianPage.setTestOptions(test, testTitle);
  shapesList.forEach((brushName) => {
    test(brushName, async ({ page }, testInfo) => {
      const mp = new MondrianPage(page, testInfo);
      await mp.init(channelName);

      await page.selectOption('[data-test-id="brushName"] select', brushName);
      await mp.hideUI();

      await drawShapes(mp);

      await mp.screenshotAndCompare();
    });
  });
});
