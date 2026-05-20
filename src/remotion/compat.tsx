// Re-export everything from real Remotion so scene files stay portable.
// compat.tsx exists purely as an indirection layer — no custom context needed now
// that Vite's optimizeDeps.include forces a single React instance.
export {
  useCurrentFrame,
  useVideoConfig,
  AbsoluteFill,
  Sequence,
} from "remotion";
