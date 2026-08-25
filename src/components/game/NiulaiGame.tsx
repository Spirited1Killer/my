"use client";

import { useEffect, useRef, useState } from "react";
import { NiulaiEngine } from "@/lib/game/engine";
import type { HudSnapshot } from "@/lib/game/types";

const initialHud: HudSnapshot = {
  state: "menu",
  score: 0,
  highScore: 0,
  distance: 0,
  feathers: 0,
  speed: 10,
  isNewRecord: false,
};

export function NiulaiGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<NiulaiEngine | null>(null);
  const [hud, setHud] = useState<HudSnapshot>(initialHud);
  const [inkBurst, setInkBurst] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new NiulaiEngine(canvas);
    engineRef.current = engine;
    engine.onHud(setHud);

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, []);

  const triggerInk = (then?: () => void) => {
    setInkBurst(true);
    window.setTimeout(() => {
      then?.();
      setInkBurst(false);
    }, 280);
  };

  const start = () => {
    triggerInk(() => engineRef.current?.start());
  };

  const restart = () => {
    triggerInk(() => engineRef.current?.restart());
  };

  const showGameoverInk = hud.state === "gameover";

  return (
    <div className="niulai-game">
      <canvas ref={canvasRef} className="niulai-game__canvas" />

      <div
        className={`niulai-ink ${inkBurst || showGameoverInk ? "is-active" : ""}`}
        aria-hidden
      />

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
            <span>金羽</span>
            <strong>{hud.feathers}</strong>
          </div>
          <div className="niulai-hud__item">
            <span>速度</span>
            <strong>{hud.speed}</strong>
          </div>
          <button
            type="button"
            className="niulai-hud__pause"
            onClick={() => engineRef.current?.togglePause()}
          >
            {hud.state === "paused" ? "继续" : "暂停"}
          </button>
        </div>
      ) : null}

      {hud.state === "menu" ? (
        <div className="niulai-panel">
          <p className="niulai-panel__eyebrow">致敬水墨动画</p>
          <h1 className="niulai-panel__title">牛来·梦境奔跑</h1>
          <p className="niulai-panel__lead">
            化身初生小牛「牛来」，在宣纸梦境中无尽奔跑。拾取云雀金羽，躲避墨岩枯木与墨狼，跑完梦醒前的最后一程。
          </p>
          <ul className="niulai-panel__tips">
            <li>桌面：← → / A D 变道，↑ W 空格跳跃，P / Esc 暂停</li>
            <li>手机：左右滑动变道，上滑或轻点跳跃</li>
          </ul>
          <p className="niulai-panel__record">最高分 {hud.highScore}</p>
          <button type="button" className="niulai-btn" onClick={start}>
            入梦起跑
          </button>
        </div>
      ) : null}

      {hud.state === "paused" ? (
        <div className="niulai-panel niulai-panel--dim">
          <h2 className="niulai-panel__title niulai-panel__title--sm">片刻留白</h2>
          <p className="niulai-panel__lead">梦还在继续，轻点继续或返回。</p>
          <div className="niulai-panel__actions">
            <button
              type="button"
              className="niulai-btn"
              onClick={() => engineRef.current?.resume()}
            >
              继续奔跑
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
          <p className="niulai-panel__eyebrow">
            {hud.isNewRecord ? "新的足迹" : "梦醒时分"}
          </p>
          <h2 className="niulai-panel__title niulai-panel__title--sm">
            {hud.isNewRecord ? "新纪录！" : "这一程到此"}
          </h2>
          <p className="niulai-panel__lead">
            得分 {hud.score} · 金羽 {hud.feathers} · 路程 {hud.distance}m
            <br />
            最高分 {hud.highScore}
          </p>
          <div className="niulai-panel__actions">
            <button type="button" className="niulai-btn" onClick={restart}>
              再次入梦
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
