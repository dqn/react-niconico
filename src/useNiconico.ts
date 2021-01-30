import { MutableRefObject, useEffect, useRef, useState } from "react";

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

export function useNiconico(
  options?: UseNiconicoOptions,
): [MutableRefObject<null | HTMLCanvasElement>, (text: string) => void] {
  const { displayMillis, fontSize, lineWidth } = {
    displayMillis: 5_000,
    fontSize: 36,
    lineWidth: 4,
    ...options,
  };

  const ref = useRef<null | HTMLCanvasElement>(null);
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
    const ctx = ref.current?.getContext("2d");

    if (!ref.current || !ctx) {
      return;
    }

    const { width, height } = ref.current;
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

    return () => cancelAnimationFrame(handle);
  }, [ref, setEmitText]);

  return [ref, emitText.fn];
}
