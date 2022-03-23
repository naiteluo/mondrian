import { IMondrianDataClient } from "./data-manager";

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
  /**
   * history size
   *
   * @remarks
   *
   * size of grahpic handler cache. If cache exceeded, grahpic handler will be texturized.
   * if viewport controls is on,
   * cache will not be texturized and has no limit(might have performance issue when drawing tons of things).
   *
   * @defaultValue 20
   */
  historySize?: number;
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

  /**
   * determine if use builtin client instances
   *
   * @remarks use builtin ws client service
   *
   * @defaultValue false
   */
  useBuiltinClient: boolean;

  builtintClientUrl: string;

  /**
   * user defined client for data manager
   *
   * @remarks
   *
   * data manager only handle data flow inside mondrian
   * when you need to handle data flow between mondrian and out-of mondrian likes: sync draw data with server,
   * client will do the job.
   * client implements {@link IMondrianDataClient} interface, and extends base data client class {@link MondrianDataClient}, bind event to handle data in and do send data out.
   *
   * @example
   *
   * ```
   * export class CustomizedDataClient extends * MondrianDataClient {
   *   constructor() {
   *     super();
   *     // do something like create websocket * client instance
   *     console.log("my data client init");
   *   }
   *
   *   override start() {
   *     // do something like start websocket c lient
   *     console.log("my data client start");
   *
   *     // mock send data to let data manager * knows the last one of the first batch of * data recovered, and it is ready to tell * that recover process is finished, so * mondrian can do things likes removing * loading modal.
   *     this.receivedFromRemote([this.* generateLastData()]);
   *     this.recoveredFromRemote({ success: t rue, *size: 0 });
   *
   *     // mock received data synchronously
   *     setInterval(() => {
   *       // tell data manager to handle new * arrived data
   *       console.log("new data arrivied");
   *       this.receivedFromRemote([
   *         // data from remote
   *       ]);
   *     }, 3000);
   *   }
   *
   *   override sendToRemote(datasToSend: * IMondrianData[]) {
   *     // do something like emit data or do * request
   *     datasToSend.forEach((data) => {
   *       console.log("data to send", data);
   *     });
   *   }
   * }
   *
   * ```
   *
   */
  client?: IMondrianDataClient;
  /**
   * Set true to auto fit container to fullscreen size
   * and be automatically reponsive to window's resize event
   *
   * By default, user handle container's size. When container's size changed, resize api should be manually trigger to tell mondrian resize the pixi renderer.
   *
   * @defaultValue false
   */
  fullscreen?: boolean;
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
  useBuiltinClient: false,
  builtintClientUrl: "ws://localhost:3000",
  fullscreen: true,
  historySize: 20,
};
