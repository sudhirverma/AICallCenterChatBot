import { useEffect, useState } from "react";

export function useDotsAnimation(baseText: string = "loading", intervalMs = 400) {
  const [text, setText] = useState(baseText);

  useEffect(() => {
    let dotCount = 0;
    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4; // 0, 1, 2, 3 dots
      setText(baseText + ".".repeat(dotCount));
    }, intervalMs);

    return () => clearInterval(interval);
  }, [baseText, intervalMs]);

  return text;
}
