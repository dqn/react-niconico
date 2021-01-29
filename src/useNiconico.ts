import { MutableRefObject, useEffect, useRef, useState } from "react";

type Comment = {
  text: string;
  timestamp: number;
};

export function useNiconico(): [
  MutableRefObject<null | HTMLCanvasElement>,
  (text: string) => void,
] {
  const ref = useRef<null | HTMLCanvasElement>(null);
  const [sendComments, setSendComments] = useState({
    fn: (_: string) => {},
  });

  useEffect(() => {
    const ctx = ref.current?.getContext("2d");

    if (!ref.current || !ctx) {
      return;
    }

    let comments: Comment[] = [];

    setSendComments({
      fn: (text: string) => {
        comments.push({ text, timestamp: Date.now() });
      },
    });

    const frame = () => {
      if (!ref.current) {
        return requestAnimationFrame(frame);
      }

      const { width, height } = ref.current;
      ctx.clearRect(0, 0, width, height);

      ctx.font = `bold 14px sans-serif`;

      const nextComments: Comment[] = [];
      const now = Date.now();

      comments.forEach((comment) => {
        const x = width - (now - comment.timestamp) / 10;

        if (x < 0) {
          return;
        }

        ctx.strokeText(comment.text, x, 14);
        ctx.fillText(comment.text, x, 14);

        nextComments.push(comment);
      });

      comments = nextComments;

      return requestAnimationFrame(frame);
    };

    const handle = frame();

    return () => cancelAnimationFrame(handle);
  }, [ref, setSendComments]);

  return [ref, sendComments.fn];
}
