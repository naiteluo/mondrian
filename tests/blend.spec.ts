import { test } from "@playwright/test";
import { MondrianPage } from "./mondrian-page";

const testTitle = "blend";

test.describe(testTitle, () => {
  const channelName = MondrianPage.setTestOptions(test, testTitle);
  /**
   * multi lines blend test
   */
  test("brushes blend", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init(channelName);

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

    await mp.brushName.selectOption("Rectangle");
    await mp.brushWidth.fill("10");
    await mp.brushColor.fill("66ff66");

    await mp.page.mouse.move(sx + (ex - sx) / 2 - 50, sy - 100);
    await mp.page.mouse.down();
    await mp.page.mouse.move(sx + (ex - sx) / 2 + 50, sy + 100);
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

    await mp.brushName.selectOption("Highlighter");
    await mp.brushWidth.fill("20");
    await mp.brushColor.fill("6666ff");

    await mp.page.mouse.move(ex - 300, sy - 100);
    await mp.page.mouse.down();
    await mp.page.mouse.move(ex - 300, sy + 100, { steps: 10 });
    await mp.page.mouse.up();

    await mp.hideUI();
    await mp.screenshotAndCompare();
  });
});
