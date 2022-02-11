import { IMondrianSettings, DefaultMondrianSettings } from "@mondrian/mondrian";

export const __localMondrianSettingsKey = "__mo_config_mondrian_settings";

export const setMondrianSettings = (r: Partial<IMondrianSettings>) => {
  localStorage.setItem(__localMondrianSettingsKey, JSON.stringify(r));
};

export const getMondrianSettings = () => {
  let r: Partial<IMondrianSettings> = {};
  const str = localStorage.getItem(__localMondrianSettingsKey);
  if (str) {
    try {
      r = JSON.parse(str);
    } catch (error) {
      console.error(
        "Error parsing local settings. Storage content will be clear now."
      );
      console.error(error);
      localStorage.removeItem(__localMondrianSettingsKey);
    }
  }

  return { ...DefaultMondrianSettings, ...r };
};
