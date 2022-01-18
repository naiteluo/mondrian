import { Mondrian } from "mondrian/lib/mondrian";

/**
 * attach properties to global window for testing or hacking
 */
declare global {
  interface Window {
    mo: Mondrian;
    moApp: {
      mondrian: Mondrian;
    };
  }
}
