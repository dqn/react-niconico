import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

const defaultBorderWidth = 4;

type Dimensions = {
  width: number;
  height: number;
};

function useDimensions(ref: MutableRefObject<null | HTMLElement>): Dimensions {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (entry === undefined) {
        return;
      }

      const { width, height } = entry.contentRect;

      setDimensions({ width, height });
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return dimensions;
}

// To receive any function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useFunctionState<T extends (...args: any[]) => unknown>(
  initialState: T,
): [T, (value: T) => void] {
  const [state, setState] = useState({
    fn: initialState,
  });

  const setFn = useCallback((value: T) => {
    setState({ fn: value });
  }, []);

  return [state.fn, setFn];
}

type Comment = {
  text: string;
  timestamp: number;
  row: number;
};

export type UseNiconicoOptions = {
  displayMillis?: number;
  fontSize?: number;
  borderWidth?: number;
};

export function useNiconico<T extends HTMLElement>(
  options?: UseNiconicoOptions,
): [MutableRefObject<null | T>, (text: string) => void] {
  const { displayMillis, fontSize, borderWidth } = {
    displayMillis: 5_000,
    ...options,
  };

  const ref = useRef<null | T>(null);
  const { width, height } = useDimensions(ref);

  const [emitText, setEmitText] = useFunctionState<(v: string) => void>(() => {
    console.warn("could not find canvas");
  });

  const calcCommentX = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      comment: Pick<Comment, "text" | "timestamp">,
      timestamp: number,
    ) => {
      const canvasWidth = ctx.canvas.width;
      const textWidth = ctx.measureText(comment.text).width;
      const elapsedRate = (timestamp - comment.timestamp) / displayMillis;
      const dx = (canvasWidth + textWidth) * elapsedRate;

      return canvasWidth - dx;
    },
    [displayMillis],
  );

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (ctx === null) {
      return;
    }

    canvas.width = width;
    canvas.height = height;
    canvas.style.position = "absolute";
    canvas.style.top = `${ref.current.offsetTop}px`;
    canvas.style.left = `${ref.current.offsetLeft}px`;

    const displayFontSize = fontSize ?? Math.floor(height / 10);

    ctx.font = `bold ${displayFontSize}px sans-serif`;
    ctx.lineWidth = borderWidth ?? defaultBorderWidth;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.strokeStyle = "#8c8c8c";
    ctx.fillStyle = "#fff";

    const maxRows = Math.floor(height / displayFontSize);
    let comments: Comment[] = [];

    setEmitText((text: string) => {
      const reservedRows = new Set<number>();
      const now = Date.now();

      comments.forEach((comment) => {
        const displayEndTime = comment.timestamp + displayMillis;
        const x = calcCommentX(ctx, { text, timestamp: now }, displayEndTime);

        if (x < 0) {
          // case of the comment catches up with previous comment
          reservedRows.add(comment.row);
          return;
        }

        const endOfCommentX =
          calcCommentX(ctx, comment, now) + ctx.measureText(comment.text).width;

        if (endOfCommentX > width) {
          // case of the end of comment is not displayed
          reservedRows.add(comment.row);
          return;
        }
      });

      for (let row = 0; row < maxRows; ++row) {
        if (!reservedRows.has(row)) {
          comments.push({ text, timestamp: now, row: row });
          break;
        }
      }
    });

    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      const nextComments: Comment[] = [];
      const now = Date.now();

      comments.forEach((comment) => {
        const x = calcCommentX(ctx, comment, now);
        const textWidth = ctx.measureText(comment.text).width;

        if (x + textWidth < 0) {
          return;
        }

        const y = displayFontSize * comment.row;
        ctx.strokeText(comment.text, x, y);
        ctx.fillText(comment.text, x, y);

        nextComments.push(comment);
      });

      comments = nextComments;

      return requestAnimationFrame(frame);
    };

    const handle = frame();

    const videoElement = ref.current;
    ref.current.parentNode?.insertBefore(canvas, videoElement);

    return () => {
      cancelAnimationFrame(handle);
      videoElement.parentElement?.removeChild(canvas);
    };
  }, [
    width,
    height,
    fontSize,
    borderWidth,
    calcCommentX,
    displayMillis,
    setEmitText,
  ]);

  return [ref, emitText];
}
