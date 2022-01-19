import { Mondrian } from "mondrian/lib/mondrian";
import { ClientApplication } from "mondrian-client/app";

/**
 * attach properties to global window for testing or hacking
 */
declare global {
  interface Window {
    mo: Mondrian;
    moApp: ClientApplication;
  }
}
