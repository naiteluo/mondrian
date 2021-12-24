import { IMondrianSettings } from "mondrian";
import {
  getAutoStart,
  getChannel,
  getChunkLimit,
  getResolution,
  setAutoStart,
  setChannel,
  setChunkLimit,
  setResolution,
} from "./app-helper";

const mondrianSettings: Partial<IMondrianSettings> = {
  isProducer: true,

  get resolution() {
    return getResolution();
  },
  set resolution(v: number) {
    setResolution(v);
  },

  get autoStart() {
    return getAutoStart();
  },
  set autoStart(v) {
    setAutoStart(v);
  },

  get chunkLimit() {
    return getChunkLimit();
  },
  set chunkLimit(v) {
    setChunkLimit(v);
  },

  get channel() {
    return getChannel();
  },
  set channel(v) {
    setChannel(v);
  },
};

export const appSettings = {
  mondrianSettings: mondrianSettings,
};
