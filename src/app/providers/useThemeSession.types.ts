import type { ThemeControls } from "@/theme/ThemeContext.types";

/** Session theme name and the controls that change it. */
export interface ThemeSession {
  /** Theme name the provider resolves, including a live preview. */
  readonly activeName: string;
  /** Session-only preview, commit, and restore controls. */
  readonly controls: ThemeControls;
}
