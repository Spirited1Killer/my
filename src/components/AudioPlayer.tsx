"use client";

import { useCallback, useEffect, useRef, useState, type ChangeEvent } from "react";

type Track = {
  id: string;
  title: string;
  src: string;
};

const TRACKS: Track[] = [
  { id: "xiatou", title: "下头", src: "/audio/xiatou.mp3" },
  { id: "sad-squaad", title: "伤心游击队", src: "/audio/sad-squaad.mp3" },
  { id: "qianqianwanwan", title: "千千万万", src: "/audio/qianqianwanwan.mp3" },
  { id: "neverseemeagain", title: "Never See Me Again", src: "/audio/neverseemeagain.mp3" },
  { id: "yikou", title: "一口", src: "/audio/yikou.mp3" },
  { id: "zhongguoren-neng-fei", title: "中国人能飞", src: "/audio/zhongguoren-neng-fei.mp3" },
  { id: "alasong", title: "阿拉松", src: "/audio/alasong.mp3" },
  { id: "t-e5bca0e696b9", title: "唉", src: "/audio/t-e5bca0e696b9.mp3" },
  { id: "pt-6", title: "唉 (pt.6)", src: "/audio/pt-6.mp3" },
  { id: "pt-7", title: "唉 (pt.7)", src: "/audio/pt-7.mp3" },
  { id: "t-e6b395e88081", title: "城西舞厅", src: "/audio/t-e6b395e88081.mp3" },
  { id: "t-e5bca0e696b9-3", title: "尴尬的", src: "/audio/t-e5bca0e696b9-3.mp3" },
  { id: "t-e4b881e4b896", title: "蝴蝶山", src: "/audio/t-e4b881e4b896.mp3" },
  { id: "t-e5bca0e696b9-4", title: "回避依恋", src: "/audio/t-e5bca0e696b9-4.mp3" },
  { id: "t-e5bca0e696b9-6", title: "简单的", src: "/audio/t-e5bca0e696b9-6.mp3" },
  { id: "t-e999b6e59686", title: "今天没回家", src: "/audio/t-e999b6e59686.mp3" },
  { id: "tour-live", title: "就算我放棄了世界", src: "/audio/tour-live.mp3" },
  { id: "t-e5bca0e99c87", title: "亏欠", src: "/audio/t-e5bca0e99c87.mp3" },
  { id: "t-e5bca0e696b9-2", title: "离歌", src: "/audio/t-e5bca0e696b9-2.mp3" },
  { id: "t-e9babbe59bad", title: "泸沽湖", src: "/audio/t-e9babbe59bad.mp3" },
  { id: "t-e999b6e59686-2", title: "似曾相识", src: "/audio/t-e999b6e59686-2.mp3" },
  { id: "t-e999b6e59686-3", title: "讨厌红楼梦", src: "/audio/t-e999b6e59686-3.mp3" },
  { id: "t-e9babbe59bad-2", title: "现在现在", src: "/audio/t-e9babbe59bad-2.mp3" },
  { id: "t-e5bca0e696b9-5", title: "潇洒无意义", src: "/audio/t-e5bca0e696b9-5.mp3" },
  { id: "t-e6b395e88081-2", title: "邮差", src: "/audio/t-e6b395e88081-2.mp3" },
  { id: "t-44697a7a7920", title: "雨过后的风景", src: "/audio/t-44697a7a7920.mp3" },
  { id: "t-e78e8be4bba5", title: "周旋", src: "/audio/t-e78e8be4bba5.mp3" },
  { id: "all-i-have", title: "All I Have", src: "/audio/all-i-have.mp3" },
  { id: "bossa-no-se", title: "Bossa No Sé", src: "/audio/bossa-no-se.mp3" },
  { id: "charlene", title: "Charlene", src: "/audio/charlene.mp3" },
  { id: "come-back-to-me", title: "Come Back To Me", src: "/audio/come-back-to-me.mp3" },
  { id: "heartbreak-anniversary", title: "Heartbreak Anniversary", src: "/audio/heartbreak-anniversary.mp3" },
  { id: "i-think-i-love-you-again", title: "I Think I Love You Again", src: "/audio/i-think-i-love-you-again.mp3" },
  { id: "outro", title: "Outro", src: "/audio/outro.mp3" },
  { id: "thank-you", title: "Thank You", src: "/audio/thank-you.mp3" },
  { id: "this-is-america", title: "This Is America", src: "/audio/this-is-america.mp3" },
  { id: "toosie-slide", title: "Toosie Slide", src: "/audio/toosie-slide.mp3" },
  { id: "wassuh", title: "Wassuh", src: "/audio/wassuh.mp3" },
  { id: "t-e5bca0e4b880", title: "เนื้อคู่ฉันอยู่ไหน", src: "/audio/t-e5bca0e4b880.mp3" },
  { id: "run-tha-streetz", title: "Run Tha Streetz", src: "/audio/run-tha-streetz.mp3" },
  { id: "love-like-this", title: "Love Like This", src: "/audio/love-like-this.mp3" },
  { id: "say-you-love-me", title: "Say You Love Me", src: "/audio/say-you-love-me.mp3" },
  { id: "attachments", title: "Attachments", src: "/audio/attachments.mp3" },
  { id: "take-time", title: "Take Time", src: "/audio/take-time.mp3" },
  { id: "gotta-have-you", title: "Gotta Have You", src: "/audio/gotta-have-you.mp3" },
  { id: "no-bad-grades", title: "No Bad Grades", src: "/audio/no-bad-grades.mp3" },
  { id: "t-e894a1e68caf", title: "金包银", src: "/audio/t-e894a1e68caf.mp3" },
  { id: "t-e98293e69983", title: "一直很安静", src: "/audio/t-e98293e69983.mp3" },
];

const PLAYING_KEY = "bgm-playing";
const TRACK_KEY = "bgm-track";
const LOOP_KEY = "bgm-loop";
const VOLUME_KEY = "bgm-volume";
const LIST_VISIBLE = 10;
const UNLOCK_EVENTS = ["mousemove", "pointerdown"] as const;

type LoopMode = "list" | "one";

function readWantPlay(): boolean {
  try {
    return localStorage.getItem(PLAYING_KEY) !== "0";
  } catch {
    return true;
  }
}

function writeWantPlay(value: boolean) {
  try {
    localStorage.setItem(PLAYING_KEY, value ? "1" : "0");
  } catch {
    // ignore
  }
}

function readTrackIndex(): number {
  try {
    const raw = localStorage.getItem(TRACK_KEY);
    const n = raw == null ? 0 : Number(raw);
    if (!Number.isFinite(n) || n < 0 || n >= TRACKS.length) return 0;
    return n;
  } catch {
    return 0;
  }
}

function writeTrackIndex(index: number) {
  try {
    localStorage.setItem(TRACK_KEY, String(index));
  } catch {
    // ignore
  }
}

function readLoopMode(): LoopMode {
  try {
    const raw = localStorage.getItem(LOOP_KEY);
    if (raw === "list") return "list";
    return "one";
  } catch {
    return "one";
  }
}

function writeLoopMode(mode: LoopMode) {
  try {
    localStorage.setItem(LOOP_KEY, mode);
  } catch {
    // ignore
  }
}

function readVolume(): number {
  try {
    const raw = localStorage.getItem(VOLUME_KEY);
    if (raw == null) return 0.7;
    const n = Number(raw);
    if (!Number.isFinite(n)) return 0.7;
    return Math.min(1, Math.max(0, n));
  } catch {
    return 0.7;
  }
}

function writeVolume(value: number) {
  try {
    localStorage.setItem(VOLUME_KEY, String(value));
  } catch {
    // ignore
  }
}

function wrapIndex(index: number) {
  const len = TRACKS.length;
  return ((index % len) + len) % len;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const wantPlayRef = useRef(false);
  const [index, setIndex] = useState(() => readTrackIndex());
  const indexRef = useRef(index);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [awaitingMove, setAwaitingMove] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [loopMode, setLoopMode] = useState<LoopMode>(() => readLoopMode());
  const loopModeRef = useRef(loopMode);
  const [volume, setVolume] = useState(() => readVolume());
  const volumeRef = useRef(volume);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const seekingRef = useRef(false);
  const seekDraftRef = useRef(0);

  const current = TRACKS[index] ?? TRACKS[0];

  const applyLoopMode = useCallback((mode: LoopMode) => {
    loopModeRef.current = mode;
    setLoopMode(mode);
    writeLoopMode(mode);
    const audio = audioRef.current;
    if (audio) audio.loop = mode === "one";
  }, []);

  const toggleLoopMode = useCallback(() => {
    applyLoopMode(loopModeRef.current === "list" ? "one" : "list");
  }, [applyLoopMode]);

  const applyVolume = useCallback((value: number) => {
    const next = Math.min(1, Math.max(0, value));
    volumeRef.current = next;
    setVolume(next);
    writeVolume(next);
    const audio = audioRef.current;
    if (audio) audio.volume = next;
  }, []);

  const onVolumeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      applyVolume(Number(e.target.value));
    },
    [applyVolume],
  );

  const onSeekChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const next = Number(e.target.value);
    if (!Number.isFinite(next)) return;
    seekingRef.current = true;
    seekDraftRef.current = next;
    setCurrentTime(next);
    const audio = audioRef.current;
    if (audio) audio.currentTime = next;
  }, []);

  const endSeek = useCallback(() => {
    seekingRef.current = false;
    const audio = audioRef.current;
    if (audio) audio.currentTime = seekDraftRef.current;
  }, []);

  const loadAndMaybePlay = useCallback(async (nextIndex: number, autoPlay: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    const track = TRACKS[nextIndex];
    if (!track) return;

    indexRef.current = nextIndex;
    setIndex(nextIndex);
    writeTrackIndex(nextIndex);
    setReady(false);
    setCurrentTime(0);
    setDuration(0);

    const sameSrc =
      audio.src.endsWith(track.src) || audio.getAttribute("src") === track.src;
    if (!sameSrc) {
      audio.src = track.src;
      audio.load();
    }
    audio.loop = loopModeRef.current === "one";
    audio.volume = volumeRef.current;

    if (autoPlay) {
      wantPlayRef.current = true;
      writeWantPlay(true);
      try {
        await audio.play();
      } catch {
        // 交给 unlock / 媒体事件
      }
    }
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    wantPlayRef.current = true;
    writeWantPlay(true);
    try {
      await audio.play();
    } catch {
      // ignore
    }
  }, []);

  const pause = useCallback(() => {
    wantPlayRef.current = false;
    writeWantPlay(false);
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (playing) pause();
    else void play();
  }, [pause, play, playing]);

  const playPrev = useCallback(() => {
    const next = wrapIndex(indexRef.current - 1);
    void loadAndMaybePlay(next, wantPlayRef.current || playing);
  }, [loadAndMaybePlay, playing]);

  const playNext = useCallback(() => {
    const next = wrapIndex(indexRef.current + 1);
    void loadAndMaybePlay(next, wantPlayRef.current || playing);
  }, [loadAndMaybePlay, playing]);

  const selectTrack = useCallback(
    (i: number) => {
      if (i === indexRef.current) {
        if (!playing) void play();
        return;
      }
      void loadAndMaybePlay(i, true);
    },
    [loadAndMaybePlay, play, playing],
  );

  useEffect(() => {
    const initial = readTrackIndex();
    indexRef.current = initial;
    wantPlayRef.current = readWantPlay();
    loopModeRef.current = readLoopMode();
    volumeRef.current = readVolume();

    const audio = new Audio(TRACKS[initial].src);
    audio.loop = loopModeRef.current === "one";
    audio.volume = volumeRef.current;
    audio.preload = "auto";
    audioRef.current = audio;

    let cleaned = false;

    const syncTime = () => {
      if (!seekingRef.current) setCurrentTime(audio.currentTime || 0);
      const d = audio.duration;
      if (Number.isFinite(d) && d > 0) setDuration(d);
    };

    const onPlaying = () => {
      setPlaying(true);
      setAwaitingMove(false);
    };
    const onPause = () => setPlaying(false);
    const onCanPlay = () => {
      setReady(true);
      syncTime();
    };
    const onLoadedMetadata = () => syncTime();
    const onTimeUpdate = () => syncTime();
    const onDurationChange = () => syncTime();
    const onEnded = () => {
      if (loopModeRef.current === "one") {
        void audio.play().catch(() => {});
        return;
      }
      const next = wrapIndex(indexRef.current + 1);
      void loadAndMaybePlay(next, true);
    };

    const removeUnlockListeners = (unlock: () => void) => {
      UNLOCK_EVENTS.forEach((event) => {
        window.removeEventListener(event, unlock);
      });
    };

    const unlock = () => {
      if (!wantPlayRef.current) {
        removeUnlockListeners(unlock);
        return;
      }
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
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);

    if (wantPlayRef.current) {
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
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [loadAndMaybePlay]);

  useEffect(() => {
    if (!listOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const root = rootRef.current;
      if (!root) return;
      if (e.target instanceof Node && !root.contains(e.target)) {
        setListOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [listOpen]);

  const status = playing
    ? loopMode === "one"
      ? "单曲循环"
      : "列表循环"
    : awaitingMove
      ? "滑动鼠标开始"
      : ready
        ? "已暂停"
        : "准备中";

  const listMaxHeight = `calc(${Math.min(TRACKS.length, LIST_VISIBLE)} * 2.15rem)`;
  const progressMax = duration > 0 ? duration : 0;

  return (
    <div
      ref={rootRef}
      className={`audio-player${listOpen ? " is-open" : ""}`}
      aria-label="背景音乐播放器"
    >
      <div className="audio-player__main">
        <div className={`audio-player__eq ${playing ? "is-playing" : ""}`} aria-hidden>
          <span />
          <span />
          <span />
        </div>
        <div className="audio-player__meta">
          <p className="audio-player__title">{current.title}</p>
          <p className="audio-player__status">{status}</p>
        </div>
        <div className="audio-player__controls">
          <button
            type="button"
            className="audio-player__btn audio-player__btn--ghost"
            onClick={playPrev}
            aria-label="上一首"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path d="M6 5h2v14H6V5zm3.5 7 8.5 6.5V5.5L9.5 12z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className="audio-player__btn"
            onClick={toggle}
            aria-label={playing ? "暂停音乐" : "播放音乐"}
          >
            {playing ? (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" />
                <rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path d="M8 5.5v13l11-6.5-11-6.5z" fill="currentColor" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className="audio-player__btn audio-player__btn--ghost"
            onClick={playNext}
            aria-label="下一首"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden>
              <path d="M16 5h2v14h-2V5zM6 5.5v13L14.5 12 6 5.5z" fill="currentColor" />
            </svg>
          </button>
          <button
            type="button"
            className={`audio-player__btn audio-player__btn--ghost audio-player__btn--loop${loopMode === "one" ? " is-active-mode" : ""}`}
            onClick={toggleLoopMode}
            aria-label={loopMode === "one" ? "切换为列表循环" : "切换为单曲循环"}
            title={loopMode === "one" ? "单曲循环" : "列表循环"}
          >
            {loopMode === "one" ? (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                <path
                  d="M7 7h8a4 4 0 1 1 0 8H9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path d="M7 7 4.8 9.2 7 11.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 15l2.2 2.2L9 19.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <text x="12" y="13.2" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="currentColor">
                  1
                </text>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                <path
                  d="M7 7h8a4 4 0 1 1 0 8H9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
                <path d="M7 7 4.8 9.2 7 11.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M9 15l2.2 2.2L9 19.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <button
            type="button"
            className={`audio-player__btn audio-player__btn--ghost${listOpen ? " is-active-mode" : ""}`}
            onClick={() => setListOpen((open) => !open)}
            aria-label={listOpen ? "关闭歌曲列表" : "打开歌曲列表"}
            aria-expanded={listOpen}
            title="歌曲列表"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
              <path
                d="M8 7h12M8 12h12M8 17h12M4 7h.01M4 12h.01M4 17h.01"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
          <label className="audio-player__volume" title={`音量 ${Math.round(volume * 100)}%`}>
            <span className="audio-player__volume-icon" aria-hidden>
              {volume === 0 ? (
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    d="M4 10v4h3l4 3V7L7 10H4zm11.5 1.5 2 2m0-2-2 2M15 9.5a4.5 4.5 0 0 1 0 5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path
                    d="M4 10v4h3l4 3V7L7 10H4zm11 1.2a3.2 3.2 0 0 1 0 1.6M15 8.5a5.5 5.5 0 0 1 0 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
            <input
              type="range"
              className="audio-player__volume-slider"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={onVolumeChange}
              aria-label="音量"
            />
          </label>
        </div>
      </div>

      <div className="audio-player__progress">
        <span className="audio-player__time">{formatTime(currentTime)}</span>
        <input
          type="range"
          className="audio-player__seek"
          min={0}
          max={progressMax || 1}
          step={0.1}
          value={Math.min(currentTime, progressMax || 0)}
          disabled={!progressMax}
          onChange={onSeekChange}
          onPointerUp={endSeek}
          onPointerCancel={endSeek}
          onBlur={endSeek}
          aria-label="播放进度"
        />
        <span className="audio-player__time">{formatTime(duration)}</span>
      </div>

      <div
        className="audio-player__list"
        role="listbox"
        aria-label="播放列表"
        aria-hidden={!listOpen}
        style={{ maxHeight: listMaxHeight }}
      >
        {TRACKS.map((track, i) => {
          const active = i === index;
          return (
            <div
              key={track.id}
              role="option"
              aria-selected={active}
              className={`audio-player__track${active ? " is-active" : ""}`}
            >
              <button
                type="button"
                className="audio-player__track-main"
                onClick={() => selectTrack(i)}
              >
                <span className="audio-player__track-index">{i + 1}</span>
                <span className="audio-player__track-title">{track.title}</span>
                {active && playing ? (
                  <span className="audio-player__track-now" aria-hidden>
                    ▶
                  </span>
                ) : null}
              </button>
              <a
                className="audio-player__track-download"
                href={track.src}
                download={`${track.title}.mp3`}
                aria-label={`下载 ${track.title}`}
                title="下载"
                onClick={(e) => e.stopPropagation()}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden>
                  <path
                    d="M12 4v10m0 0 4-4m-4 4-4-4M5 18h14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
