import * as React from "react";
import { useEffect } from "react";
import { useNiconico } from "../useNiconico";

export const App: React.FC = () => {
  const [ref, emitText] = useNiconico();

  useEffect(() => {
    const handle = setInterval(() => {
      const comments = [
        "!",
        "short",
        "mediummediummedium",
        "loooooooooooooooooooooooooooong",
      ] as const;

      const comment = comments[Math.floor(Math.random() * comments.length)];
      emitText(comment);
    }, 200);

    return () => clearInterval(handle);
  }, [emitText]);

  return (
    <>
      <canvas ref={ref} width={1000} height={500} />
    </>
  );
};
