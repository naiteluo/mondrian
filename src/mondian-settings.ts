export interface IMondrianSettings {
  container: HTMLElement;
  isProducer?: boolean;
  resolution?: number;
  autoStart?: boolean;
  chunkLimit?: number;
  channel?: string;
  debug?: boolean;
}

export const DefaultMondrianSettings: IMondrianSettings = {
  container: null,
  isProducer: true,
  resolution: 1,
  autoStart: true,
  chunkLimit: 1000,
  channel: "guest",
  debug: false,
};
