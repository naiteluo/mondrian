import { IMondrianSettings } from "mondrian";
import {
  getAutoStart,
  getChannel,
  getChunkLimit,
  getIsProducer,
  getResolution,
  setAutoStart,
  setChannel,
  setChunkLimit,
  setIsProducer,
  setResolution,
} from "./app-helper";

const mondrianSettings: Partial<IMondrianSettings> = {
  get isProducer() {
    return getIsProducer();
  },

  set isProducer(v: boolean) {
    setIsProducer(v);
  },

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
