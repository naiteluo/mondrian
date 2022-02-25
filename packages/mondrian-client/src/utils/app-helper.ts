import {
  IMondrianSettings,
  DefaultMondrianSettings,
  BrushPluginState,
  DefaultMondrianBrushOptions,
} from "mondrian/lib/index";

let ResetSettings = false;

if (window.location.search.includes("reset=1")) {
  ResetSettings = true;
}

export const __localMondrianSettingsKey = "__mo_config_mondrian_settings";

// remove save settings when vivisting with reset search
if (ResetSettings) {
  localStorage.removeItem(__localMondrianSettingsKey);
}

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

export const __localBrushConfigKey = "__mo_config_mondrian_brush";

export const setBrushConfig = (r: Partial<BrushPluginState>) => {
  localStorage.setItem(__localBrushConfigKey, JSON.stringify(r));
};

export const getBrushConfig = () => {
  let r: Partial<IMondrianSettings> = {};
  const str = localStorage.getItem(__localBrushConfigKey);
  if (str) {
    try {
      r = JSON.parse(str);
    } catch (error) {
      console.error(
        "Error parsing local brush config. Storage content will be clear now."
      );
      console.error(error);
      localStorage.removeItem(__localBrushConfigKey);
    }
  }

  return { ...DefaultMondrianBrushOptions, ...r };
};

// remove save settings when vivisting with reset search
if (ResetSettings) {
  localStorage.removeItem(__localMondrianSettingsKey);
  localStorage.removeItem(__localBrushConfigKey);
}
