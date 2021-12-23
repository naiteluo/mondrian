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
  return NaN;
};

const __localAutoStartKey = "__mo_config_chunk_limit";
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
