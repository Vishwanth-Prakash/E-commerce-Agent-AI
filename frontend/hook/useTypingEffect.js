import { useEffect, useState } from "react";

export const useTypingEffect = (fullText, speed = 30) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    setDisplayedText("");
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + fullText.charAt(index));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [fullText, speed]);

  return displayedText;
};
