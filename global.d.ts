import { Mondrian } from "mondrian/lib/mondrian";
declare module "*.svg" {
  const value: string;
  export default value;
}
declare module "*.jpg" {
  const value: string;
  export default value;
}

declare module "*.png" {
  const value: string;
  export default value;
}

declare module "*.frag" {
  const value: string;
  export default value;
}

declare module "*.vert" {
  const value: string;
  export default value;
}

declare global {
  interface Window {
    mo: Mondrian;
    moApp: {
      mo: Mondrian;
      [key: string]: unknown;
    };
  }
}

export {};
