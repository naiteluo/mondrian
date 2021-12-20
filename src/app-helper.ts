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
