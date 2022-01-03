import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
    actionTimeout: 100 * 1000,
    headless: true,
    video: {
      mode: "off",
    },
    launchOptions: { args: ["--use-gl=egl"] },
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    storageState: {
      cookies: [],
      origins: [
        {
          origin: "http://localhost:8080/",
          localStorage: [
            {
              name: "__mo_config_auto_start",
              value: "false",
            },
            {
              name: "__mo_config_channel",
              value: "playwright_test",
            },
            {
              name: "__mo_config_disable_cursor",
              value: "true",
            },
          ],
        },
      ],
    },
  },
  workers: 1,
};

export default config;
