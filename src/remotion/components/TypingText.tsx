import { useCurrentFrame } from "remotion";
import { COLOR } from "../design";

interface TypingTextProps {
  text: string;
  startFrame: number;
  charsPerFrame?: number;
  style?: React.CSSProperties;
  caretColor?: string;
}

export function TypingText({
  text,
  startFrame,
  charsPerFrame = 0.5,
  style,
  caretColor = COLOR.brand,
}: TypingTextProps) {
  const frame = useCurrentFrame();
  const f = frame - startFrame;
  if (f < 0) return null;

  const charCount = Math.min(Math.floor(f * charsPerFrame), text.length);
  const isDone = charCount >= text.length;
  const showCaret = !isDone || Math.floor(f / 18) % 2 === 0;

  return (
    <span style={{ display: "inline", ...style }}>
      {text.slice(0, charCount)}
      {showCaret && (
        <span style={{
          display: "inline-block",
          width: 1.5, height: "1em",
          background: caretColor,
          marginLeft: 1,
          verticalAlign: "text-bottom",
        }} />
      )}
    </span>
  );
}
