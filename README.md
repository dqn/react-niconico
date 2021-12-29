# react-niconico

[![CI](https://github.com/dqn/react-niconico/workflows/CI/badge.svg)](https://github.com/dqn/react-niconico/actions)
[![npm version](https://img.shields.io/npm/v/react-niconico.svg)](https://www.npmjs.com/package/react-niconico)

Overlay text like Niconico.

Online demo: https://react-niconico.vercel.app/

## Installation

Using yarn:

```bash
$ yarn add react-niconico
```

Using npm:

```bash
$ npm install react-niconico
```

## Usage

```jsx
import { useEffect } from "react";
import { useNiconico } from "react-niconico";

export const App = () => {
  const [ref, emitText] = useNiconico();

  const handleClick = () => {
    emitText("Hello, World!");
  };

  return (
    <div>
      <video ref={ref} src="/sample.mp4" />
      <button onClick={handleClick}>Emit comment</button>
    </div>
  );
};
```

## Options

```ts
const [ref, emitText] = useNiconico({
  // options...
});
```

| name          | type   | required | description                          | default        |
| ------------- | ------ | -------- | ------------------------------------ | -------------- |
| displayMillis | number | optional | time to display text in milliseconds | 5000           |
| fontSize      | number | optional | font size of text (px)               | 1/10 of height |
| borderWidth   | number | optional | width of the border                  | 4              |

## License

MIT
