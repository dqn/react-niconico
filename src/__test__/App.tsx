import * as React from "react";
import { useEffect } from "react";
import { useNiconico } from "../useNiconico";

export const App: React.FC = () => {
  const [ref, sendComment] = useNiconico();

  useEffect(() => {
    const handle = setInterval(() => {
      const comments = [
        "!",
        "short",
        "mediummediummedium",
        "loooooooooooooooooooooooooooong",
      ] as const;

      const comment = comments[Math.floor(Math.random() * comments.length)];
      sendComment(comment);
    }, 200);

    return () => clearInterval(handle);
  }, [sendComment]);

  return (
    <>
      <canvas ref={ref} width={1000} height={500} />
    </>
  );
};
