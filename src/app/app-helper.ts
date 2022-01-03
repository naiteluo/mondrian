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
  return "";
};

const __localIsProducerKey = "__mo_config_is_producer";
export const setIsProducer = (r: boolean) => {
  localStorage.setItem(__localIsProducerKey, JSON.stringify(r));
};
export const getIsProducer = () => {
  const r = localStorage.getItem(__localIsProducerKey);
  if (r) {
    return JSON.parse(r);
  }
  return true;
};

const __localDebugKey = "__mo_config_debug";
export const setDebug = (r: boolean) => {
  localStorage.setItem(__localDebugKey, JSON.stringify(r));
};
export const getDebug = () => {
  const r = localStorage.getItem(__localDebugKey);
  if (r) {
    return JSON.parse(r);
  }
  return false;
};

const __localDisableCursorKey = "__mo_config_disable_cursor";
export const setDisableCursor = (r: boolean) => {
  localStorage.setItem(__localDisableCursorKey, JSON.stringify(r));
};
export const getDisableCursor = () => {
  const r = localStorage.getItem(__localDisableCursorKey);
  if (r) {
    return JSON.parse(r);
  }
  return false;
};
