# react-niconico

Overlay text like Niconico.

## Example

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

## License

MIT
