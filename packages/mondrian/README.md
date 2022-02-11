[![LICENSE](https://img.shields.io/github/license/naiteluo/mondrian)](https://github.com/naiteluo/mondrian/blob/master/LICENSE)
[![libera manifesto](https://img.shields.io/badge/libera-manifesto-lightgrey.svg)](https://liberamanifesto.com)

# @mondrian/mondrian

This is a out-of-box drawing board library based on PIXI.js. (Piet Mondrian, one of the greatest abstract style artists of the 20th century.)

## Features

- Full abilities of drawing board likes:
  - line draw
  - shape draw
  - viewport support
  - history
- Multi client collaboration.
- High performance.
- Easy to use, easy to extends.
- Extendable.

## Demos

- [Simple codepen useing cdn released bundle](https://codepen.io/naiteluo/pen/abLgqpG)
- [Examples in github](https://github.com/naiteluo/mondrian/tree/master/examples)
- [Online mondrian client](http://naiteluo.cc/mondrian-dev/)

## Setup

### NPM Install

```bash
npm install --save @mondrian/mondrian
```

There is no default export. The way to import Mondrian is:

```ts
import { Mondrian } from "@mondrian/mondrian";
```

Learn more about Mondrian's APIs, check the [api docs](https://github.com/naiteluo/mondrian/blob/master/docs/mondrian/index.md) out.

### CDN Install

```html
<script src="https://unpkg.com/@mondrian/mondrian@latest/dist/index.umd.js"></script>
<script>
  const mondrian = new Mondrian.Mondrian({
    container: document.getElementById("draw-container"),
    viewport: true,
    background: true,
    debug: false,
  });
</script>
```

## APIs

- [API Docs](https://github.com/naiteluo/mondrian/master/docs/index.md)

## More about this libary

- [Github Poject](https://github.com/naiteluo/mondrian)
- [Issues](https://github.com/naiteluo/mondrian/issues)
