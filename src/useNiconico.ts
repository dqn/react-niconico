import { MutableRefObject, useEffect, useRef, useState } from "react";

const displayMillis = 5_000;
const fontSize = 36;
const lineWidth = 4;

type Comment = {
  text: string;
  timestamp: number;
};

export function useNiconico(): [
  MutableRefObject<null | HTMLCanvasElement>,
  (text: string) => void,
] {
  const ref = useRef<null | HTMLCanvasElement>(null);
  const [sendComment, setSendComment] = useState({
    fn: (_: string) => {
      console.warn("Could not find canvas");
    },
  });

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");

    if (!ref.current || !ctx) {
      return;
    }

    let comments: Comment[] = [];

    setSendComment({
      fn: (text: string) => {
        comments.push({ text, timestamp: Date.now() });
      },
    });

    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.lineWidth = lineWidth;
    ctx.textBaseline = "top";
    ctx.textAlign = "left";
    ctx.strokeStyle = "#8c8c8c";
    ctx.fillStyle = "#fff";

    const { width, height } = ref.current;

    const frame = () => {
      ctx.clearRect(0, 0, width, height);

      const nextComments: Comment[] = [];
      const now = Date.now();

      comments.forEach((comment) => {
        const canvasWidth = ctx.canvas.width;
        const textWidth = ctx.measureText(comment.text).width;

        const percentage = (now - comment.timestamp) / displayMillis;
        const dx = (canvasWidth + textWidth) * percentage;
        const x = canvasWidth - dx;

        if (x + textWidth < 0) {
          return;
        }

        ctx.strokeText(comment.text, x, 0);
        ctx.fillText(comment.text, x, 0);

        nextComments.push(comment);
      });

      comments = nextComments;

      return requestAnimationFrame(frame);
    };

    const handle = frame();

    return () => cancelAnimationFrame(handle);
  }, [ref, setSendComment]);

  return [ref, sendComment.fn];
}
