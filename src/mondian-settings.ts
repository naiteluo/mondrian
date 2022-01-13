export interface IMondrianSettings {
  container: HTMLElement;
  isProducer?: boolean;
  resolution?: number;
  autoStart?: boolean;
  chunkLimit?: number;
  channel?: string;
  disableCursor?: boolean;
  debug?: boolean;
  /**
   * enable viewport
   */
  viewport?: boolean;
  /**
   * enable background
   */
  background?: boolean;
}

export const DefaultMondrianSettings: IMondrianSettings = {
  container: null,
  isProducer: true,
  resolution: 1,
  autoStart: true,
  chunkLimit: 1000,
  channel: "guest",
  disableCursor: false,
  debug: false,
  viewport: false,
  background: false,
};
