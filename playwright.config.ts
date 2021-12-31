import { PlaywrightTestConfig } from "@playwright/test";

const config: PlaywrightTestConfig = {
  use: {
    headless: true,
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
          ],
        },
      ],
    },
  },
};

export default config;
