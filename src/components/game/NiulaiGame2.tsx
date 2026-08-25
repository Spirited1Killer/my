"use client";

import { useEffect, useRef, useState } from "react";
import { NiulaiGame2Engine } from "@/lib/game2/engine";
import type { Game2Hud } from "@/lib/game2/types";

const initial: Game2Hud = {
  state: "menu",
  score: 0,
  highScore: 0,
  distance: 0,
  calfCount: 1,
  attackSpeed: 1.2,
  kills: 0,
  hp: 1,
  maxHp: 5,
  bossIncoming: false,
};

export function NiulaiGame2() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NiulaiGame2Engine | null>(null);
  const [hud, setHud] = useState<Game2Hud>(initial);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const engine = new NiulaiGame2Engine(canvas);
    engineRef.current = engine;
    engine.onHud(setHud);
    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  return (
    <div className="niulai-game niulai-game--2">
      <canvas ref={canvasRef} className="niulai-game__canvas" />

      {hud.state === "playing" || hud.state === "paused" ? (
        <div className="niulai-hud">
          <div className="niulai-hud__item">
            <span>路程</span>
            <strong>{hud.distance}m</strong>
          </div>
          <div className="niulai-hud__item">
            <span>得分</span>
            <strong>{hud.score}</strong>
          </div>
          <div className="niulai-hud__item">
            <span>牛数</span>
            <strong>{hud.calfCount}</strong>
          </div>
          <div className="niulai-hud__item">
            <span>攻速</span>
            <strong>{hud.attackSpeed}</strong>
          </div>
          <div className="niulai-hud__item">
            <span>击杀</span>
            <strong>{hud.kills}</strong>
          </div>
          {hud.bossIncoming ? (
            <div className="niulai-hud__item niulai-hud__item--boss">
              <span>警告</span>
              <strong>首领接近</strong>
            </div>
          ) : null}
          <button
            type="button"
            className="niulai-hud__pause"
            onClick={() =>
              hud.state === "paused"
                ? engineRef.current?.resume()
                : engineRef.current?.pause()
            }
          >
            {hud.state === "paused" ? "继续" : "暂停"}
          </button>
        </div>
      ) : null}

      {hud.state === "menu" ? (
        <div className="niulai-panel">
          <p className="niulai-panel__eyebrow">游戏二</p>
          <h1 className="niulai-panel__title">牛来·妈妈出击</h1>
          <p className="niulai-panel__lead">
            三格路径，小牛从中间格出发。A / D 换格。自动吐出「妈妈」攻击同格墨狼。小怪血量随路程提升；每 1000 米出现中路 Boss。只有撞到小牛才掉牛，全灭才结束。
          </p>
          <ul className="niulai-panel__tips">
            <li>A / ← 左换格，D / → 右换格</li>
            <li>金色 = 加牛，蓝色 = 攻速 · 1000m / 2000m… 出 Boss</li>
            <li>P / Esc 暂停 · 漏过小牛的狼也会扣牛</li>
          </ul>
          <p className="niulai-panel__record">最高分 {hud.highScore}</p>
          <button
            type="button"
            className="niulai-btn"
            onClick={() => engineRef.current?.start()}
          >
            开始出击
          </button>
        </div>
      ) : null}

      {hud.state === "paused" ? (
        <div className="niulai-panel niulai-panel--dim">
          <h2 className="niulai-panel__title niulai-panel__title--sm">暂停</h2>
          <div className="niulai-panel__actions">
            <button
              type="button"
              className="niulai-btn"
              onClick={() => engineRef.current?.resume()}
            >
              继续
            </button>
            <button
              type="button"
              className="niulai-btn niulai-btn--ghost"
              onClick={() => engineRef.current?.backToMenu()}
            >
              返回标题
            </button>
          </div>
        </div>
      ) : null}

      {hud.state === "gameover" ? (
        <div className="niulai-panel">
          <p className="niulai-panel__eyebrow">阵线被突破</p>
          <h2 className="niulai-panel__title niulai-panel__title--sm">这一波结束了</h2>
          <p className="niulai-panel__lead">
            得分 {hud.score} · 击杀 {hud.kills} · 牛数 {hud.calfCount}
            <br />
            最高分 {hud.highScore}
          </p>
          <div className="niulai-panel__actions">
            <button
              type="button"
              className="niulai-btn"
              onClick={() => engineRef.current?.restart()}
            >
              再来一局
            </button>
            <button
              type="button"
              className="niulai-btn niulai-btn--ghost"
              onClick={() => engineRef.current?.backToMenu()}
            >
              返回标题
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
