"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type CigaretteBrand = {
  id: string;
  name: string;
  note: string;
  filter: string;
  paper: string;
  tip: string;
};

const BRANDS: CigaretteBrand[] = [
  {
    id: "zhonghua",
    name: "中华",
    note: "硬盒 · 偏醇",
    filter: "#c9a078",
    paper: "#f3eee6",
    tip: "#ff6a1a",
  },
  {
    id: "yuxi",
    name: "玉溪",
    note: "软包 · 清淡",
    filter: "#d2b087",
    paper: "#f6f1e9",
    tip: "#f06318",
  },
  {
    id: "furong",
    name: "芙蓉王",
    note: "硬盒 · 厚实",
    filter: "#b89068",
    paper: "#f0ebe3",
    tip: "#e05514",
  },
  {
    id: "nanjing",
    name: "南京",
    note: "十二 · 绵长",
    filter: "#c9a67a",
    paper: "#f4efe7",
    tip: "#ff681c",
  },
  {
    id: "liqun",
    name: "利群",
    note: "新版 · 顺口",
    filter: "#d0b48e",
    paper: "#f7f3eb",
    tip: "#ef5c16",
  },
  {
    id: "marlboro",
    name: "万宝路",
    note: "红 · 冲劲",
    filter: "#c2946c",
    paper: "#f2ede5",
    tip: "#d94812",
  },
];

type Phase = "pick" | "ready" | "lit" | "done";

type AshFlake = {
  id: string;
  x: number;
  drift: number;
  size: number;
  delay: number;
  spin: number;
};

type TrayClump = {
  id: string;
  left: number;
  bottom: number;
  width: number;
  height: number;
  rotate: number;
};

const BODY_LEN = 210;
const FILTER_LEN = 52;
const BAND_LEN = 6;
const CIG_H = 22;
const SVG_W = 340;
const SVG_H = 120;

function CigaretteSvg({
  brand,
  paperPct,
  ashLen,
  lit,
  done,
  puffing,
  uid,
}: {
  brand: CigaretteBrand;
  paperPct: number;
  ashLen: number;
  lit: boolean;
  done: boolean;
  puffing: boolean;
  uid: string;
}) {
  const y = (SVG_H - CIG_H) / 2;
  const paperLen = Math.max(14, (BODY_LEN * paperPct) / 100);
  const ash = lit || done ? Math.max(done ? 10 : 4, ashLen) : 0;
  const x0 = 24;
  const filterX = x0;
  const bandX = filterX + FILTER_LEN;
  const paperX = bandX + BAND_LEN;
  const ashX = paperX + paperLen;
  const tipX = ashX + ash;
  const totalW = FILTER_LEN + BAND_LEN + paperLen + ash;
  const r = CIG_H / 2;

  const corkPattern = useMemo(
    () =>
      Array.from({ length: 48 }, (_, i) => {
        const cx = 4 + (i % 8) * 6.2 + (i % 2) * 1.4;
        const cy = 3 + Math.floor(i / 8) * 4.2 + (i % 3) * 0.4;
        const rx = 0.7 + (i % 3) * 0.35;
        const ry = 0.45 + (i % 2) * 0.25;
        return { cx, cy, rx, ry, o: 0.18 + (i % 5) * 0.05 };
      }),
    [],
  );

  const ashSpeckles = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        cx: 2 + (i * 7.3) % Math.max(8, ash - 4),
        cy: 2 + ((i * 5.1) % (CIG_H - 4)),
        r: 0.5 + (i % 4) * 0.35,
        o: 0.2 + (i % 5) * 0.08,
        dark: i % 3 === 0,
      })),
    [ash],
  );

  const ashEdge = useMemo(() => {
    // Irregular tip path for ash column right edge
    const h = CIG_H;
    const w = Math.max(ash, 1);
    const pts: string[] = [`M 0 0`];
    pts.push(`L ${w - 3} 0`);
    pts.push(
      `C ${w + 1} ${h * 0.12}, ${w + 3} ${h * 0.22}, ${w - 1} ${h * 0.35}`,
    );
    pts.push(
      `C ${w + 2.5} ${h * 0.48}, ${w + 1} ${h * 0.58}, ${w - 0.5} ${h * 0.68}`,
    );
    pts.push(
      `C ${w + 2} ${h * 0.8}, ${w + 0.5} ${h * 0.9}, ${w - 2.5} ${h}`,
    );
    pts.push(`L 0 ${h} Z`);
    return pts.join(" ");
  }, [ash]);

  const gid = uid.replace(/:/g, "");

  return (
    <svg
      className="smoke__svg"
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      height="100%"
      aria-hidden
    >
      <defs>
        <linearGradient id={`${gid}-cyl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="18%" stopColor="#ffffff" stopOpacity="0.18" />
          <stop offset="55%" stopColor="#000000" stopOpacity="0" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.28" />
        </linearGradient>
        <linearGradient id={`${gid}-filter`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#e8d2b0" />
          <stop offset="35%" stopColor={brand.filter} />
          <stop offset="100%" stopColor="#8a6238" />
        </linearGradient>
        <linearGradient id={`${gid}-paper`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffcf8" />
          <stop offset="40%" stopColor={brand.paper} />
          <stop offset="100%" stopColor="#d8cfc3" />
        </linearGradient>
        <linearGradient id={`${gid}-band`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5e2a0" />
          <stop offset="50%" stopColor="#d4ad45" />
          <stop offset="100%" stopColor="#8f6c1e" />
        </linearGradient>
        <linearGradient id={`${gid}-ash`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#6a645c" />
          <stop offset="25%" stopColor="#a39c92" />
          <stop offset="55%" stopColor="#d4cdc2" />
          <stop offset="85%" stopColor="#9b948a" />
          <stop offset="100%" stopColor="#7a746c" />
        </linearGradient>
        <linearGradient id={`${gid}-ash-cyl`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.38" />
        </linearGradient>
        <linearGradient id={`${gid}-char`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2a2018" />
          <stop offset="55%" stopColor="#5c3014" />
          <stop offset="100%" stopColor="#a84818" />
        </linearGradient>
        <radialGradient id={`${gid}-ember`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff6d0" />
          <stop offset="28%" stopColor="#ffc056" />
          <stop offset="55%" stopColor={brand.tip} />
          <stop offset="78%" stopColor="#7a1808" />
          <stop offset="100%" stopColor="#7a1808" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${gid}-halo`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={brand.tip} stopOpacity="0.55" />
          <stop offset="45%" stopColor={brand.tip} stopOpacity="0.18" />
          <stop offset="100%" stopColor={brand.tip} stopOpacity="0" />
        </radialGradient>
        <filter id={`${gid}-soft`} x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="1.2" />
        </filter>
        <filter id={`${gid}-smoke`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.4" />
        </filter>
        <clipPath id={`${gid}-body`}>
          <rect
            x={filterX}
            y={y}
            width={totalW}
            height={CIG_H}
            rx={r}
            ry={r}
          />
        </clipPath>
      </defs>

      {/* soft contact shadow */}
      <ellipse
        cx={x0 + totalW * 0.48}
        cy={y + CIG_H + 14}
        rx={totalW * 0.42}
        ry={5}
        fill="#1a1c1b"
        opacity="0.18"
        filter={`url(#${gid}-soft)`}
      />

      <g clipPath={`url(#${gid}-body)`}>
        {/* filter */}
        <rect
          x={filterX}
          y={y}
          width={FILTER_LEN}
          height={CIG_H}
          fill={`url(#${gid}-filter)`}
        />
        <g transform={`translate(${filterX}, ${y})`} opacity="0.85">
          {corkPattern.map((d, i) => (
            <ellipse
              key={i}
              cx={d.cx}
              cy={d.cy}
              rx={d.rx}
              ry={d.ry}
              fill="#6e4a28"
              opacity={d.o}
            />
          ))}
        </g>
        <rect
          x={filterX}
          y={y}
          width={FILTER_LEN}
          height={CIG_H}
          fill={`url(#${gid}-cyl)`}
        />

        {/* gold band */}
        <rect
          x={bandX}
          y={y}
          width={BAND_LEN}
          height={CIG_H}
          fill={`url(#${gid}-band)`}
        />
        <rect
          x={bandX}
          y={y}
          width={BAND_LEN}
          height={CIG_H}
          fill={`url(#${gid}-cyl)`}
        />

        {/* white paper */}
        <rect
          x={paperX}
          y={y}
          width={paperLen}
          height={CIG_H}
          fill={`url(#${gid}-paper)`}
        />
        {/* tobacco flecks under paper */}
        <g opacity="0.16">
          {Array.from({ length: 20 }, (_, i) => (
            <circle
              key={i}
              cx={paperX + 8 + ((i * 17) % Math.max(10, paperLen - 10))}
              cy={y + 4 + (i % 5) * 3.2}
              r={0.55 + (i % 3) * 0.2}
              fill="#a89070"
            />
          ))}
        </g>
        {/* paper seam */}
        <line
          x1={paperX}
          y1={y + CIG_H * 0.42}
          x2={paperX + paperLen}
          y2={y + CIG_H * 0.42}
          stroke="#cfc5b8"
          strokeWidth="0.6"
          opacity="0.45"
        />
        <rect
          x={paperX}
          y={y}
          width={paperLen}
          height={CIG_H}
          fill={`url(#${gid}-cyl)`}
        />

        {/* thin char line between paper and ash */}
        {(lit || done) && ash > 0 && (
          <rect
            x={ashX - 2.5}
            y={y}
            width={4}
            height={CIG_H}
            fill={`url(#${gid}-char)`}
          />
        )}

        {/* ash column with irregular tip */}
        {(lit || done) && ash > 0 && (
          <g transform={`translate(${ashX}, ${y})`}>
            <path d={ashEdge} fill={`url(#${gid}-ash)`} />
            <path d={ashEdge} fill={`url(#${gid}-ash-cyl)`} />
            {/* crack lines */}
            <path
              d={`M 3 ${CIG_H * 0.28} Q ${ash * 0.35} ${CIG_H * 0.32}, ${ash * 0.7} ${CIG_H * 0.25}`}
              fill="none"
              stroke="#5c574f"
              strokeWidth="0.55"
              opacity="0.45"
            />
            <path
              d={`M 5 ${CIG_H * 0.68} Q ${ash * 0.4} ${CIG_H * 0.72}, ${ash * 0.75} ${CIG_H * 0.62}`}
              fill="none"
              stroke="#efe8dc"
              strokeWidth="0.5"
              opacity="0.35"
            />
            {ashSpeckles.map((s, i) => (
              <circle
                key={i}
                cx={s.cx}
                cy={s.cy}
                r={s.r}
                fill={s.dark ? "#4a4540" : "#ebe4d8"}
                opacity={s.o}
              />
            ))}
          </g>
        )}
      </g>

      {/* rounded outline for cylinder edge */}
      <rect
        x={filterX}
        y={y}
        width={totalW}
        height={CIG_H}
        rx={r}
        ry={r}
        fill="none"
        stroke="#1a1c1b"
        strokeOpacity="0.12"
        strokeWidth="0.8"
      />

      {/* ember + halo at tip */}
      {(lit || done) && !done && (
        <g className={puffing ? "smoke__ember-g is-puffing" : "smoke__ember-g"}>
          <circle
            cx={tipX + 1}
            cy={y + CIG_H / 2}
            r={puffing ? 22 : 16}
            fill={`url(#${gid}-halo)`}
          />
          <ellipse
            cx={tipX + 1}
            cy={y + CIG_H / 2}
            rx={puffing ? 7 : 5.2}
            ry={puffing ? 8.5 : 7}
            fill={`url(#${gid}-ember)`}
          />
          <circle
            cx={tipX}
            cy={y + CIG_H / 2 - 1}
            r={puffing ? 2.2 : 1.4}
            fill="#fff8e0"
            opacity="0.85"
          />
        </g>
      )}

      {/* wispy smoke from tip */}
      {(lit || done) && (
        <g
          className={`smoke__svg-plume${puffing ? " is-puffing" : ""}${done ? " is-done" : ""}`}
          filter={`url(#${gid}-smoke)`}
        >
          <g transform={`translate(${tipX + 2}, ${y - 4})`}>
            <g className="p1">
              <ellipse cx="0" cy="0" rx="4" ry="10" fill="#eef1ee" />
            </g>
          </g>
          <g transform={`translate(${tipX + 8}, ${y - 14})`}>
            <g className="p2">
              <ellipse cx="0" cy="0" rx="6" ry="14" fill="#e8ece8" />
            </g>
          </g>
          <g transform={`translate(${tipX + 4}, ${y - 24})`}>
            <g className="p3">
              <ellipse cx="0" cy="0" rx="8" ry="16" fill="#f2f4f2" />
            </g>
          </g>
          <g transform={`translate(${tipX + 14}, ${y - 36})`}>
            <g className="p4">
              <ellipse cx="0" cy="0" rx="10" ry="18" fill="#e6eae6" />
            </g>
          </g>
        </g>
      )}
    </svg>
  );
}

export function SmokeSession() {
  const uid = useId();
  const [brandId, setBrandId] = useState(BRANDS[0].id);
  const [phase, setPhase] = useState<Phase>("pick");
  const [burned, setBurned] = useState(0);
  const [ash, setAsh] = useState(0);
  const [puffs, setPuffs] = useState(0);
  const [flicks, setFlicks] = useState(0);
  const [puffing, setPuffing] = useState(false);
  const [flicking, setFlicking] = useState(false);
  const [flakes, setFlakes] = useState<AshFlake[]>([]);
  const [trayClumps, setTrayClumps] = useState<TrayClump[]>([]);
  const puffTimer = useRef<number | null>(null);
  const flickTimer = useRef<number | null>(null);
  const flakeSeq = useRef(0);

  const brand = BRANDS.find((b) => b.id === brandId) ?? BRANDS[0];
  const remaining = Math.max(0, 100 - burned);
  const paperPct = Math.max(8, remaining);
  const canPuff = phase === "lit" && remaining > 0 && !puffing;
  const canFlick = phase === "lit" && ash > 8 && !flicking;
  const ashPx = phase === "lit" || phase === "done" ? ash : 0;

  useEffect(() => {
    return () => {
      if (puffTimer.current) window.clearTimeout(puffTimer.current);
      if (flickTimer.current) window.clearTimeout(flickTimer.current);
    };
  }, []);

  useEffect(() => {
    if (phase === "lit" && burned >= 100) setPhase("done");
  }, [burned, phase]);

  const light = useCallback(() => {
    setPhase("lit");
    setBurned(4);
    setAsh(8);
    setPuffs(0);
    setFlicks(0);
    setFlakes([]);
  }, []);

  const reset = useCallback(() => {
    setPhase("pick");
    setBurned(0);
    setAsh(0);
    setPuffs(0);
    setFlicks(0);
    setPuffing(false);
    setFlicking(false);
    setFlakes([]);
    setTrayClumps([]);
  }, []);

  const takePuff = useCallback(() => {
    if (!canPuff) return;
    setPuffing(true);
    setPuffs((n) => n + 1);
    setBurned((b) => Math.min(100, b + 6 + Math.random() * 4));
    setAsh((a) => Math.min(58, a + 8 + Math.random() * 5));
    if (puffTimer.current) window.clearTimeout(puffTimer.current);
    puffTimer.current = window.setTimeout(() => setPuffing(false), 900);
  }, [canPuff]);

  const flickAsh = useCallback(() => {
    if (!canFlick) return;
    setFlicking(true);
    setFlicks((n) => n + 1);
    const drop = ash * (0.72 + Math.random() * 0.16);
    setAsh(Math.max(4, ash - drop));

    const tipApprox = 55 + paperPct * 0.28;
    const burst: AshFlake[] = Array.from(
      { length: 8 + Math.floor(Math.random() * 5) },
      () => {
        flakeSeq.current += 1;
        return {
          id: `${uid}-f-${flakeSeq.current}`,
          x: tipApprox + Math.random() * 12,
          drift: -22 + Math.random() * 52,
          size: 2.5 + Math.random() * 6,
          delay: Math.random() * 0.1,
          spin: -160 + Math.random() * 320,
        };
      },
    );
    setFlakes(burst);

    const clumps: TrayClump[] = Array.from(
      { length: 2 + Math.floor(Math.random() * 3) },
      () => {
        flakeSeq.current += 1;
        return {
          id: `${uid}-t-${flakeSeq.current}`,
          left: 16 + Math.random() * 62,
          bottom: 4 + Math.random() * 11,
          width: 7 + Math.random() * 16,
          height: 2.5 + Math.random() * 4.5,
          rotate: -30 + Math.random() * 60,
        };
      },
    );
    setTrayClumps((prev) => [...prev, ...clumps].slice(-20));

    if (flickTimer.current) window.clearTimeout(flickTimer.current);
    flickTimer.current = window.setTimeout(() => {
      setFlicking(false);
      setFlakes([]);
    }, 780);
  }, [ash, canFlick, paperPct, uid]);

  return (
    <div className="smoke">
      <div className="smoke__stage" aria-live="polite">
        <div className="smoke__sky" aria-hidden />

        <div className="smoke__tray" aria-hidden>
          <div className="smoke__tray-well" />
          {trayClumps.map((c) => (
            <i
              key={c.id}
              className="smoke__tray-clump"
              style={{
                left: `${c.left}%`,
                bottom: `${c.bottom}px`,
                width: `${c.width}px`,
                height: `${c.height}px`,
                transform: `rotate(${c.rotate}deg)`,
              }}
            />
          ))}
        </div>

        {flakes.map((f) => (
          <i
            key={f.id}
            className="smoke__fall"
            style={
              {
                left: `${f.x}%`,
                width: `${f.size}px`,
                height: `${f.size * 0.65}px`,
                animationDelay: `${f.delay}s`,
                "--fall-x": `${f.drift}px`,
                "--fall-spin": `${f.spin}deg`,
              } as CSSProperties
            }
            aria-hidden
          />
        ))}

        {phase !== "pick" ? (
          <div
            className={`smoke__cig${puffing ? " is-puffing" : ""}${flicking ? " is-flicking" : ""}${phase === "done" ? " is-done" : ""}`}
          >
            <CigaretteSvg
              brand={brand}
              paperPct={paperPct}
              ashLen={ashPx}
              lit={phase === "lit" || phase === "done"}
              done={phase === "done"}
              puffing={puffing}
              uid={uid}
            />
          </div>
        ) : (
          <p className="smoke__hint">先挑一根，再点火。</p>
        )}
      </div>

      <div className="smoke__panel">
        <div className="smoke__meta">
          <p className="smoke__eyebrow">Break</p>
          <h2 className="smoke__title">
            {phase === "pick" && "抽根烟"}
            {phase === "ready" && `点上这根 ${brand.name}`}
            {phase === "lit" && `${brand.name} · 燃着`}
            {phase === "done" && "抽完了"}
          </h2>
          <p className="smoke__desc">
            {phase === "pick" && "选个口味，慢一点也没关系。"}
            {phase === "ready" && brand.note}
            {phase === "lit" &&
              `抽了 ${puffs} 口 · 弹了 ${flicks} 次烟灰 · 还剩 ${Math.round(remaining)}%`}
            {phase === "done" && "灭了。要不再来一根？"}
          </p>
        </div>

        {phase === "pick" || phase === "ready" ? (
          <div className="smoke__brands" role="listbox" aria-label="烟的类别">
            {BRANDS.map((item) => {
              const active = item.id === brandId;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={`smoke__brand${active ? " is-active" : ""}`}
                  onClick={() => {
                    setBrandId(item.id);
                    setPhase("ready");
                    setBurned(0);
                    setAsh(0);
                  }}
                >
                  <span
                    className="smoke__brand-swatch"
                    style={{ background: item.filter }}
                  />
                  <span className="smoke__brand-text">
                    <strong>{item.name}</strong>
                    <em>{item.note}</em>
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}

        <div className="smoke__actions">
          {phase === "ready" ? (
            <button type="button" className="btn btn--pine" onClick={light}>
              点燃
            </button>
          ) : null}
          {phase === "lit" ? (
            <>
              <button
                type="button"
                className="btn btn--pine"
                onClick={takePuff}
                disabled={!canPuff}
              >
                抽一口
              </button>
              <button
                type="button"
                className="btn btn--ghost-dark"
                onClick={flickAsh}
                disabled={!canFlick}
              >
                弹烟灰
              </button>
            </>
          ) : null}
          {phase === "done" || phase === "lit" ? (
            <button type="button" className="btn btn--ghost-dark" onClick={reset}>
              换一根
            </button>
          ) : null}
          {phase === "pick" ? (
            <button
              type="button"
              className="btn btn--pine"
              onClick={() => setPhase("ready")}
            >
              就这根
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
