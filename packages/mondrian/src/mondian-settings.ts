/**
 * Mondrian Settings
 *
 * @remarks
 *
 * main settings of Mondrian instance
 *
 * @public
 */
export interface IMondrianSettings {
  /**
   * mondrian container
   *
   * @remarks
   *
   * mondrian will create and put canvas in it.
   */
  container: HTMLElement | null;
  /**
   * is producer role enable
   *
   * @remarks
   *
   * if set `false`, client will only received and draw data from other clients.
   * but will not react to user interaction.
   */
  isProducer?: boolean;
  /**
   * resolution to use
   *
   * @remarks
   *
   * by default we use msaa
   *
   * @defaultValue 1
   */
  resolution?: number;
  autoStart?: boolean;
  chunkLimit?: number;
  channel?: string;
  disableCursor?: boolean;
  debug?: boolean;
  /**
   * enable viewport
   *
   * @remarks
   *
   * enable viewport controls like wheel, drag and pinch.
   */
  viewport?: boolean;
  /**
   * enable background of stage
   *
   * @defaultValue `false`
   */
  background?: boolean;
  /**
   * width of the world
   *
   * @remarks
   *
   * logic width, not pixel width
   *
   * @defaultValue 1280
   */
  worldWidth: number;
  /**
   * height of the world
   *
   * @remarks
   *
   * logic height, not pixel height
   *
   * @defaultValue 720
   */
  worldHeight: number;
}

/**
 *
 * default mondrian settings
 *
 * @public
 */
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
  worldWidth: 1280,
  worldHeight: 760,
};
