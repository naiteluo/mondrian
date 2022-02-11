/**
 * mondrian events' names collection
 *
 * @public
 */
export class MondrianEvents {
  /**
   * trigger when recovered data has been consumed
   *
   * @public
   */
  static readonly EVENT_RECOVER_CONSUMED = "recover:consumed";

  /**
   *
   * trigger when recovered data has been received
   *
   * @public
   */
  static readonly EVNET_RECOVER_RECEIVED = "recover:received";

  /**
   * trigger when resize happens
   *
   * @public
   */
  static readonly EVENT_RESIZE = "resize";
}
