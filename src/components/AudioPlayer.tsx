"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/zhongguoren-neng-fei.mp3";
const STORAGE_KEY = "bgm-playing";
const UNLOCK_EVENTS = ["mousemove", "wheel"] as const;

function readWantPlay(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    return true;
  }
}

function writeWantPlay(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
  } catch {
    // ignore quota / private mode
  }
}

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [awaitingMove, setAwaitingMove] = useState(false);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    writeWantPlay(true);
    try {
      await audio.play();
    } catch {
      // 状态交给 audio 事件同步，这里不 setState
    }
  }, []);

  const pause = useCallback(() => {
    writeWantPlay(false);
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (playing) pause();
    else void play();
  }, [pause, play, playing]);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audioRef.current = audio;

    let cleaned = false;
    const wantPlay = readWantPlay();

    const onPlaying = () => {
      setPlaying(true);
      setAwaitingMove(false);
    };
    const onPause = () => setPlaying(false);
    const onCanPlay = () => setReady(true);

    const removeUnlockListeners = (unlock: () => void) => {
      UNLOCK_EVENTS.forEach((event) => {
        window.removeEventListener(event, unlock);
      });
    };

    const unlock = () => {
      void audio.play().then(
        () => removeUnlockListeners(unlock),
        () => {},
      );
    };

    const addUnlockListeners = () => {
      if (cleaned) return;
      setAwaitingMove(true);
      UNLOCK_EVENTS.forEach((event) => {
        window.addEventListener(event, unlock, { passive: true });
      });
    };

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("canplay", onCanPlay);

    // 用户曾暂停则保持静音，刷新不再自动播放
    if (wantPlay) {
      void audio.play().then(
        () => {},
        () => addUnlockListeners(),
      );
    }

    return () => {
      cleaned = true;
      removeUnlockListeners(unlock);
      audio.pause();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("canplay", onCanPlay);
      audioRef.current = null;
    };
  }, []);

  const status = playing
    ? "循环播放中"
    : awaitingMove
      ? "滑动鼠标开始"
      : ready
        ? "已暂停"
        : "准备中";

  return (
    <div className="audio-player" aria-label="背景音乐播放器">
      <div className={`audio-player__eq ${playing ? "is-playing" : ""}`} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="audio-player__meta">
        <p className="audio-player__title">中国人能飞</p>
        <p className="audio-player__status">{status}</p>
      </div>
      <button
        type="button"
        className="audio-player__btn"
        onClick={toggle}
        aria-label={playing ? "暂停音乐" : "播放音乐"}
      >
        {playing ? (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
            <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
            <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
          </svg>
        )}
      </button>
    </div>
  );
}
