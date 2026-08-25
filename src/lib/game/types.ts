export type GameState = "menu" | "playing" | "paused" | "gameover";

export type HudSnapshot = {
  state: GameState;
  score: number;
  highScore: number;
  distance: number;
  feathers: number;
  speed: number;
  isNewRecord: boolean;
};

export type HudListener = (snap: HudSnapshot) => void;

export const HIGH_SCORE_KEY = "niulai-dream-run-highscore";

export const LANES = [-2.6, 0, 2.6] as const;
