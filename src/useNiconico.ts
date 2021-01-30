import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useDimensions } from "./useDimensions";

type Comment = {
  text: string;
  timestamp: number;
  rowNumber: number;
};

export type UseNiconicoOptions = {
  displayMillis?: number;
  fontSize?: number;
  lineWidth?: number;
};

export function useNiconico<T extends HTMLElement>(
  options?: UseNiconicoOptions,
): [MutableRefObject<null | T>, (text: string) => void] {
  const { displayMillis, fontSize, lineWidth } = {
    displayMillis: 5_000,
    fontSize: 36,
    lineWidth: 4,
    ...options,
  };

  const ref = useRef<null | T>(null);
  const { width, height } = useDimensions(ref);
  const [emitText, setEmitText] = useState({
    fn: (_: string) => {
      console.warn("Could not find canvas");
    },
  });

  const calcCommentX = (
    ctx: CanvasRenderingContext2D,
    comment: Pick<Comment, "text" | "timestamp">,
    timestamp: number,
  ) => {
    const canvasWidth = ctx.canvas.width;
    const textWidth = ctx.measureText(comment.text).width;
    const percentage = (timestamp - comment.timestamp) / displayMillis;
    const dx = (canvasWidth + textWidth) * percentage;

    return canvasWidth - dx;
  };

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    const maxRows = Math.floor(height / fontSize);
    let comments: Comment[] = [];

    setEmitText({
      fn: (text: string) => {
        const reservedRowNumbers = new Set<number>();
        const now = Date.now();

        comments.forEach((comment) => {
          const displayEndTime = comment.timestamp + displayMillis;
          const x = calcCommentX(ctx, { text, timestamp: now }, displayEndTime);

          if (x < 0) {
            // case of the comment catches up with previous comment
            reservedRowNumbers.add(comment.rowNumber);
            return;
          }

          const endOfCommentX =
            calcCommentX(ctx, comment, now) +
            ctx.measureText(comment.text).width;

          if (endOfCommentX > width) {
            // case of the end of comment is not displayed
            reservedRowNumbers.add(comment.rowNumber);
            return;
          }
        });

        for (let rowNumber = 0; rowNumber < maxRows; ++rowNumber) {
          if (!reservedRowNumbers.has(rowNumber)) {
            comments.push({ text, timestamp: now, rowNumber });
            break;
          }
        }
      },
    });

    canvas.width = width;
    canvas.height = height;
    canvas.style.position = "absolute";
    canvas.style.top = `${ref.current.offsetTop}px`;
    canvas.style.left = `${ref.current.offsetLeft}px`;

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.lineWidth = lineWidth;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.strokeStyle = "#8c8c8c";
    ctx.fillStyle = "#fff";

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

        const y = fontSize * comment.rowNumber;
        ctx.strokeText(comment.text, x, y);
        ctx.fillText(comment.text, x, y);

        nextComments.push(comment);
      });

      comments = nextComments;

      return requestAnimationFrame(frame);
    };

    const handle = frame();

    ref.current.parentNode?.insertBefore(canvas, ref.current);

    return () => {
      cancelAnimationFrame(handle);
      ref.current?.parentElement?.removeChild(canvas);
    };
  }, [displayMillis, fontSize, lineWidth, ref, setEmitText, width, height]);

  return [ref, emitText.fn];
}
