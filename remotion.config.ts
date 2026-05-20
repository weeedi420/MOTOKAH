import { Config } from "@remotion/cli/config";

export const config: Config = {
  // Studio runs on port 3003 so it doesn't conflict with Vite dev server
  setStudioPort: 3003,
  // Enable keyboard shortcuts for frame-by-frame inspection
  setKeyboardShortcutsEnabled: true,
  // Default composition settings
  setDefaultProps: {
    fps: 30,
    width: 1280,
    height: 720,
  },
};

export default config;
