const __localStorageResolutionKey = "__mo_config_resolution";
export const setResolution = (r: number) => {
  localStorage.setItem(__localStorageResolutionKey, `${r}`);
};
export const getResolution = () => {
  const r = localStorage.getItem(__localStorageResolutionKey);
  if (r) {
    return +r;
  }
  return 1;
};

const __localChunkLimitKey = "__mo_config_chunk_limit";
export const setChunkLimit = (r: number) => {
  localStorage.setItem(__localChunkLimitKey, `${r}`);
};
export const getChunkLimit = () => {
  const r = localStorage.getItem(__localChunkLimitKey);
  if (r) {
    return +r;
  }
  return 2000;
};

const __localAutoStartKey = "__mo_config_auto_start";
export const setAutoStart = (r: boolean) => {
  localStorage.setItem(__localAutoStartKey, JSON.stringify(r));
};
export const getAutoStart = () => {
  const r = localStorage.getItem(__localAutoStartKey);
  if (r) {
    return JSON.parse(r);
  }
  return true;
};

const __localChannelKey = "__mo_config_channel";
const DEFAULT_CHANNEL_NAME = "guest";
export const setChannel = (r: string) => {
  localStorage.setItem(__localChannelKey, r.trim());
};
export const getChannel = () => {
  const r = localStorage.getItem(__localChannelKey);
  if (r) {
    return r;
  }
  return DEFAULT_CHANNEL_NAME;
};
