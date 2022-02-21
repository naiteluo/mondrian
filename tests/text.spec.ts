import { test } from "@playwright/test";
import { MondrianPage } from "./mondrian-page";
const testTitle = "text";
test.describe(testTitle, () => {
  const channelName = MondrianPage.setTestOptions(test, testTitle);
  test("simple text", async ({ page }, testInfo) => {
    const mp = new MondrianPage(page, testInfo);
    await mp.init(channelName);
    await page.selectOption('[data-test-id="brushName"] select', "Text");
    await mp.hideUI();

    await mp.page.mouse.click(50, 50, { delay: 1000 });

    await mp.page.fill("textarea:last-of-type", "abcdefghijk\nlmmopqrst");

    await mp.page.mouse.click(500, 500);

    await mp.page.mouse.click(400, 50, { delay: 1000 });

    await mp.page.fill(
      "textarea:last-of-type",
      "abcdefghijk\nlmmopqrst".toUpperCase()
    );

    await mp.page.mouse.click(500, 500);

    await mp.page.mouse.click(50, 200, { delay: 1000 });

    await mp.page.fill("textarea:last-of-type", "中文，你好！");

    await mp.page.mouse.move(400, 400);
    await mp.page.mouse.click(400, 400);

    await mp.screenshotAndCompare();
  });
});
