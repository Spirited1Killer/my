export type Game2State = "menu" | "playing" | "paused" | "gameover";

export type Game2Hud = {
  state: Game2State;
  score: number;
  highScore: number;
  distance: number;
  calfCount: number;
  attackSpeed: number;
  kills: number;
  hp: number;
  maxHp: number;
  bossIncoming: boolean;
};

export type Game2HudListener = (snap: Game2Hud) => void;

export const GAME2_HIGH_SCORE_KEY = "niulai-mama-shooter-highscore";
