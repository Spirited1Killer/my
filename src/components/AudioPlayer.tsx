"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const AUDIO_SRC = "/audio/zhongguoren-neng-fei.mp3";

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, []);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setPlaying(false);
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

    const onPlaying = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onCanPlay = () => setReady(true);

    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("canplay", onCanPlay);

    void audio.play().then(
      () => setPlaying(true),
      () => {
        // 浏览器拦截自动播放时，等用户首次交互再播
        const resume = () => {
          void audio.play().then(() => setPlaying(true)).catch(() => {});
          window.removeEventListener("pointerdown", resume);
          window.removeEventListener("keydown", resume);
        };
        window.addEventListener("pointerdown", resume, { once: true });
        window.addEventListener("keydown", resume, { once: true });
      },
    );

    return () => {
      audio.pause();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("canplay", onCanPlay);
      audioRef.current = null;
    };
  }, []);

  return (
    <div className="audio-player" aria-label="背景音乐播放器">
      <div className={`audio-player__eq ${playing ? "is-playing" : ""}`} aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <div className="audio-player__meta">
        <p className="audio-player__title">中国人能飞</p>
        <p className="audio-player__status">
          {playing ? "循环播放中" : ready ? "已暂停" : "准备中"}
        </p>
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
