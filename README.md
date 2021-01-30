# react-niconico

Overlay text like Niconico.

Online demo: https://react-niconico.vercel.app/

## Usage

```jsx
import * as React from "react";
import { useEffect } from "react";
import { useNiconico } from "../useNiconico";

export const App = () => {
  const [ref, emitText] = useNiconico();

  useEffect(() => {
    emitText("short text");
    emitText("looooooooooooong text");
  }, [emitText]);

  return <canvas ref={ref} width={1200} height={800} />;
};
```

## Options

```ts
const [ref, emitText] = useNiconico({
  // options...
});
```

| name          | type   | required | description                          | default |
| ------------- | ------ | -------- | ------------------------------------ | ------- |
| displayMillis | number | optional | time to display text in milliseconds | 5_000   |
| fontSize      | number | optional | font size of text                    | 36      |
| lineWidth     | number | optional | width of the text border             | 4       |

## License

MIT
