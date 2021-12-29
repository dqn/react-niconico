import { useEffect } from "react";
import { useNiconico } from "../src/useNiconico";

const sampleVideoUrl =
  "https://www.learningcontainer.com/wp-content/uploads/2020/05/sample-mp4-file.mp4";

export const App: React.VFC = () => {
  const [ref, emitText] = useNiconico<HTMLVideoElement>();

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

  return <video ref={ref} src={sampleVideoUrl} autoPlay muted controls loop />;
};
