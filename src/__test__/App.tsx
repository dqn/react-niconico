import * as React from "react";
import { useEffect } from "react";
import { useNiconico } from "../useNiconico";

export const App: React.FC = () => {
  const [ref, sendComment] = useNiconico();

  useEffect(() => {
    const handle = setInterval(() => {
      const comments = [
        "1",
        "22",
        "333",
        "4444",
        "55555",
        "666666",
        "7777777",
        "88888888",
        "999999999",
      ] as const;

      const comment = comments[Math.floor(Math.random() * comments.length)];
      sendComment(comment);
    }, 400);
    return () => clearInterval(handle);
  }, [sendComment]);

  return (
    <>
      <canvas ref={ref} width={1000} height={500} />
    </>
  );
};
