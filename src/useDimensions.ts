import { MutableRefObject, useEffect, useState } from "react";

export function useDimensions(
  ref: MutableRefObject<null | HTMLElement>,
): { width: number; height: number } {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length === 0) {
        return;
      }

      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref, setDimensions]);

  return dimensions;
}
