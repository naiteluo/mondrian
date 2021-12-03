import { defaultBrushOptions } from "./brush";
import { DataType } from "./data-manager";
import { Modrian } from "./modrian";
import { PlayerState } from "./player/player";

// reset css
const html = document.getElementsByTagName("html")[0];
const body = document.body;
html.style.margin = `0px`;
html.style.padding = `0px`;
html.style.height = "100%";
body.style.margin = `0px`;
body.style.padding = `0px`;
body.style.height = `100%`;
body.style.lineHeight = `0px`;
body.style.overflow = `hidden`;

// initial page

const $div = document.createElement("div");
document.body.appendChild($div);

const modrian = new Modrian({
  container: $div,
  isProducer: true,
});

const testPlayerState: PlayerState = { selectedBrush: defaultBrushOptions };

modrian.player.consume([
  {
    type: DataType.STATE,
    data: testPlayerState,
  },
]);

// import "./tmp/app";
