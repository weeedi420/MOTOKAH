// Single import point for all scene/component files.
// useCurrentFrame & useVideoConfig come from our own context (no Remotion React root needed).
// interpolate & spring are pure math — safe to import directly from remotion.
export { useCurrentFrame, useVideoConfig, AbsoluteFill, Sequence } from "./compat";
export { interpolate, spring } from "remotion";
