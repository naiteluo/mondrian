import { PlaywrightTestConfig } from "@playwright/test";

import { MondrianTestSettings } from "./tests/mondrian-test-settings";

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
              name: "__mo_config_mondrian_settings",
              value: JSON.stringify(MondrianTestSettings),
            },
          ],
        },
        {
          origin: "http://naiteluo.cc",
          localStorage: [
            {
              name: "__mo_config_mondrian_settings",
              value: JSON.stringify(MondrianTestSettings),
            },
          ],
        },
      ],
    },
  },
  // workers: 1,
};

export default config;
