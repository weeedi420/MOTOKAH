import { interpolate, useCurrentFrame } from "../frame";

export function CountUp({
  from = 0,
  to,
  startFrame,
  duration = 60,
  suffix = "",
  prefix = "",
}: {
  from?: number;
  to: number;
  startFrame: number;
  duration?: number;
  suffix?: string;
  prefix?: string;
}) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [startFrame, startFrame + duration], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: (t) => 1 - Math.pow(1 - t, 3),
  });
  const value = Math.round(from + (to - from) * progress);
  return <>{prefix}{value.toLocaleString()}{suffix}</>;
}
