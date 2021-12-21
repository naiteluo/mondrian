# Mondrian

Yet another drawing board. Piet Mondrian, one of the greatest abstract style artists of the 20th century.

## Background

We had make more than one broken drawing board, having problems like:

- Not well designed.
  - Hard to maintain.
  - Render logic and data logic not well split.
  - No central control or non-invasive mechanism to handle datas flow.
  - Brush or plugin unsupported.
- Low performance in extreme circumstance.

## Goals

To have a maintainable and flexible drawing board, here are our design goals:

- Full abilities of drawing board for teaching or presentation.
- High performance.
- Live share supported.
- Easy to build, easy to run.
- Maintainable, easy to learn, easy to code, easy to debug.
- Brush/Plugin extendable.

## Development

```
yarn
yarn dev
yarn build
```

## TODOs

- transform display objects to new center after resize
