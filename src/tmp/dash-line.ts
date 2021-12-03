let ex = 0;
let dashOrSpace = true;

export function drawDashLine(
  target,
  x1,
  y1,
  x2,
  y2,
  dashLength = 5,
  spaceLength = 5
) {
  let x = x2 - x1;
  let y = y2 - y1;
  let hyp = Math.sqrt(x * x + y * y);
  let units = hyp / (dashLength + spaceLength);
  let dashSpaceRatio = dashLength / (dashLength + spaceLength);
  let dashX = (x / units) * dashSpaceRatio;
  let spaceX = x / units - dashX;
  let dashY = (y / units) * dashSpaceRatio;
  let spaceY = y / units - dashY;

  let x0 = x1;
  let y0 = y1;

  target.moveTo(x0, y0);
  let dx;
  let dy;
  let dd;

  while (hyp > 0) {
    if (dashOrSpace) {
      dx = dashX;
      dy = dashY;
      dd = dashLength;
    } else {
      dx = spaceX;
      dy = spaceY;
      dd = spaceLength;
    }
    if (ex > 0) {
      if (hyp < ex) {
        x0 = x2;
        y0 = y2;
        hyp -= ex;
      } else {
        x0 += (ex / dd) * dx;
        y0 += (ex / dd) * dy;
        hyp -= ex;
      }
      ex = 0;
    } else {
      x0 += dx;
      y0 += dy;
      hyp -= dd;
      if (hyp < 0) {
        x0 = x2;
        y0 = y2;
      }
    }

    if (dashOrSpace) {
      target.lineTo(x0, y0);
    } else {
      target.moveTo(x0, y0);
    }
    if (hyp > 0) {
      dashOrSpace = !dashOrSpace;
    }
  }
  ex = Math.abs(hyp);
  target.moveTo(x2, y2);
}
