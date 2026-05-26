import { motion, useInView } from 'motion/react';
import { useState, useEffect, useRef, useMemo } from 'react';
import glyphData from '../../caveat/glyphData.json';

// ─── Letter content ────────────────────────────────────────────────────────
const LETTER_TEXT =
  `My Dear Husband,\n\nHappy 1st Wedding Anniversary da \u2764\n\nNamma kalyanam aagi inniku oru varusham aagiduchu nu nenaicha romba santhosham aa iruku. Indha one year la nee en life ku kondu vandha love, care, happiness ellam words la solla mudiyadhu. Every single day with you became special and meaningful. You not only know the best and beauty in me but you know my worst side of everything and you still admire me -- thank you for accepting me as I am, luv u lotzzz \uD83E\uDD70\n\nNee en husband ah mattum illa, en best friend, strength, and biggest support um kooda. Naan happy aa irundhaalum, upset aa irundhaalum, nee always en kooda irundha. Adhan enaku biggest blessing.\n\nNa evlavo unta chinna vishayathukulam sanda poturukan but ne ennakaga vittu kudupa unna hurt pannirukan. Athuku ellam romba romba sry da.\n\nEnnaku ellamae nethan enga amma appa vida, yen enna vida unna mattum than romba pudikum da \uD83E\uDEC2\n\nNamma rendu perum share panna small small memories, late night talks, silly fights, laughter, trips -- ellame en heart ku romba precious. Indha one year la unna innum adhigama love panna kathukitten.\n\nThank you for loving me unconditionally and making me feel special every day. Future la innum neraya beautiful memories create pannalaam, together ah every challenge face pannalaam, and grow old together.\n\nOnce again,\nHappy Anniversary my love \u2764\n\n\n                                       Forever yours,\n                                       Shivani`;

// ─── Tegaki stroke rendering constants ────────────────────────────────────
const UNITS_PER_EM = 1000;
const ASCENDER = 960;
const DESCENDER = -300;
const EM_HEIGHT = ASCENDER - DESCENDER; // 1260

// How many "glyph units" tall one rendered line should be
const GLYPH_SCALE_PX = 42; // px height per em
const SCALE = GLYPH_SCALE_PX / UNITS_PER_EM;
const LINE_HEIGHT_PX = EM_HEIGHT * SCALE;        // ~53px
const BASELINE_OFFSET = ASCENDER * SCALE;        // ~40px (y-offset for baseline within a line)

const LINE_WIDTH_PX = 620; // canvas / viewBox width in px

// Ink colors with slight variation for realism
const INK_COLORS = ['#1c0f00', '#201205', '#1a0e00', '#231408'];

type GlyphStroke = { p: [number, number, number][]; d: number; a: number; r?: number };
type GlyphEntry  = { w: number; t: number; s: GlyphStroke[] };
type GlyphMap    = Record<string, GlyphEntry>;

const glyphs = glyphData as unknown as GlyphMap;

// ─── Emoji support ────────────────────────────────────────────────────────
const EMOJI_ADVANCE = 880; // glyph-units wide for all emoji
// Characters that are invisible variation/modifier selectors — just skip
const SKIP_CHARS = new Set(['️', '⃣', '‍']);
// The emoji we render as SVG
const EMOJI_CHARS = new Set(['\u2764', '\uD83E\uDD70', '\uD83E\uDEC2']);

// ─── Build lines of glyph-layout tokens ───────────────────────────────────
interface GlyphToken {
  char: string;
  glyph: GlyphEntry | null;
  x: number;     // pen position in pixels
  lineIdx: number;
  isEmoji?: boolean;
}

function layoutText(text: string): { lines: GlyphToken[][], totalLines: number } {
  const paragraphs = text.split('\n');
  const allLines: GlyphToken[][] = [];
  const spaceGlyph = glyphs[' '] ?? { w: 220, t: 0, s: [] };

  // Parse a paragraph into typed char entries (handles emoji / skip chars)
  interface CharInfo { char: string; glyph: GlyphEntry | null; advance: number; isEmoji: boolean; }

  function parseChars(para: string): CharInfo[] {
    const result: CharInfo[] = [];
    const chars = [...para];
    let i = 0;
    while (i < chars.length) {
      const ch = chars[i];
      if (SKIP_CHARS.has(ch) || ch === '\uFE0F') { i++; continue; }
      let j = i + 1;
      while (j < chars.length && (SKIP_CHARS.has(chars[j]) || chars[j] === '\uFE0F')) j++;
      i = j;
      const isEmoji = EMOJI_CHARS.has(ch);
      const glyph   = isEmoji ? null : (glyphs[ch] ?? null);
      const advance = isEmoji ? EMOJI_ADVANCE : (glyph?.w ?? spaceGlyph.w);
      result.push({ char: ch, glyph, advance, isEmoji });
    }
    return result;
  }

  for (const para of paragraphs) {
    if (para.trim() === '' || para.match(/^\s+$/)) {
      allLines.push([]);
      continue;
    }

    const charInfos = parseChars(para);

    // Group into atomic segments: a word (non-space run) or a space run
    type Seg = { chars: CharInfo[]; pxWidth: number; isSpace: boolean };
    const segments: Seg[] = [];
    let si = 0;
    while (si < charInfos.length) {
      const isSpace = charInfos[si].char === ' ';
      const seg: CharInfo[] = [];
      while (si < charInfos.length && (charInfos[si].char === ' ') === isSpace) {
        seg.push(charInfos[si++]);
      }
      segments.push({ chars: seg, pxWidth: seg.reduce((s, c) => s + c.advance * SCALE, 0), isSpace });
    }

    // Lay out segments with word-level wrapping
    let currentLine: GlyphToken[] = [];
    let penX = 0;

    for (const seg of segments) {
      if (seg.isSpace) {
        // Skip spaces at line start or that would overflow
        if (currentLine.length === 0 || penX + seg.pxWidth > LINE_WIDTH_PX) continue;
        for (const ci of seg.chars) {
          currentLine.push({ char: ci.char, glyph: ci.glyph, x: penX, lineIdx: allLines.length, isEmoji: ci.isEmoji });
          penX += ci.advance * SCALE;
        }
      } else {
        // Wrap before word if it doesn't fit (only if we're not at column 0)
        if (penX > 0 && penX + seg.pxWidth > LINE_WIDTH_PX) {
          allLines.push(currentLine);
          currentLine = [];
          penX = 0;
        }
        for (const ci of seg.chars) {
          currentLine.push({ char: ci.char, glyph: ci.glyph, x: penX, lineIdx: allLines.length, isEmoji: ci.isEmoji });
          penX += ci.advance * SCALE;
        }
      }
    }

    if (currentLine.length > 0) allLines.push(currentLine);
  }

  return { lines: allLines, totalLines: allLines.length };
}

// ─── Build a smooth bezier path from a tegaki stroke ─────────────────────
function strokeToPath(
  points: [number, number, number][],
  ox: number, // x-offset in px (glyph left edge)
  oy: number, // y-offset in px (baseline)
): { d: string; widths: number[] } {
  if (points.length < 2) return { d: '', widths: [] };

  const xs = points.map(([x]) => ox + x * SCALE);
  const ys = points.map(([, y]) => oy + y * SCALE);  // glyph y is already screen-oriented (negative = above baseline)
  const ws = points.map(([,, p]) => Math.max(0.5, (p / 1000) * 3.5)); // pen width from pressure

  // Build a smooth path using quadratic bezier between midpoints
  let d = `M ${xs[0].toFixed(2)} ${ys[0].toFixed(2)}`;
  for (let i = 1; i < xs.length - 1; i++) {
    const mx = (xs[i] + xs[i + 1]) / 2;
    const my = (ys[i] + ys[i + 1]) / 2;
    d += ` Q ${xs[i].toFixed(2)} ${ys[i].toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)}`;
  }
  const last = xs.length - 1;
  d += ` L ${xs[last].toFixed(2)} ${ys[last].toFixed(2)}`;

  return { d, widths: ws };
}

// ─── Single SVG glyph stroke (plain — no per-stroke animation for performance) ──────
function StrokePath({ points, ox, oy, color, isLatest }: {
  points: [number, number, number][]; ox: number; oy: number; color: string; isLatest: boolean;
}) {
  const { d, widths } = strokeToPath(points, ox, oy);
  if (!d) return null;
  const avgWidth = widths.reduce((a, b) => a + b, 0) / (widths.length || 1);
  return (
    <path
      d={d}
      stroke={color}
      strokeWidth={avgWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      // Only the most-recently revealed character gets a tiny fade-in
      style={isLatest ? { animation: 'stroke-appear 0.12s ease-out both' } : undefined}
    />
  );
}

// ─── Inline emoji SVG glyphs ─────────────────────────────────────────────
function EmojiGlyph({ char, x, baselineY, delay }: { char: string; x: number; baselineY: number; delay: number }) {
  const S = GLYPH_SCALE_PX * 1.1;  // slightly larger than a text char
  const ex = x;
  const ey = baselineY - S * 0.85; // sit above baseline like a cap-height letter

  let inner: React.ReactNode = null;

  if (char === '\u2764') {
    // ❤  hand-drawn red heart
    const hw = S * 0.5, hh = S * 0.48;
    inner = (
      <path
        d={`M ${ex + hw} ${ey + hh * 0.38}
            C ${ex + hw} ${ey + hh * 0.12}, ${ex + hw * 0.12} ${ey + hh * 0.12}, ${ex + hw * 0.12} ${ey + hh * 0.4}
            C ${ex + hw * 0.12} ${ey + hh * 0.68}, ${ex + hw} ${ey + hh * 0.94}, ${ex + hw} ${ey + hh * 0.94}
            C ${ex + hw} ${ey + hh * 0.94}, ${ex + hw * 1.88} ${ey + hh * 0.68}, ${ex + hw * 1.88} ${ey + hh * 0.4}
            C ${ex + hw * 1.88} ${ey + hh * 0.12}, ${ex + hw} ${ey + hh * 0.12}, ${ex + hw} ${ey + hh * 0.38} Z`}
        fill="#e03560"
        stroke="#c02040"
        strokeWidth="0.6"
        opacity="0.9"
      />
    );
  } else if (char === '\uD83E\uDD70') {
    // 🥰  yellow face with heart eyes
    const r = S * 0.46;
    const cx = ex + r, cy = ey + r;
    inner = (
      <g>
        {/* face */}
        <circle cx={cx} cy={cy} r={r} fill="#ffd04e" stroke="#c8900a" strokeWidth="0.7" opacity="0.92" />
        {/* rosy cheeks */}
        <ellipse cx={cx - r * 0.52} cy={cy + r * 0.2} rx={r * 0.28} ry={r * 0.18} fill="#f4a0a0" opacity="0.55" />
        <ellipse cx={cx + r * 0.52} cy={cy + r * 0.2} rx={r * 0.28} ry={r * 0.18} fill="#f4a0a0" opacity="0.55" />
        {/* heart eyes — two tiny hearts */}
        {[-1, 1].map((side, i) => {
          const hx = cx + side * r * 0.33;
          const hy = cy - r * 0.18;
          const hs = r * 0.22;
          return (
            <path key={i}
              d={`M ${hx} ${hy + hs * 0.3}
                  C ${hx} ${hy + hs * 0.05}, ${hx - hs * 0.88} ${hy + hs * 0.05}, ${hx - hs * 0.88} ${hy + hs * 0.38}
                  C ${hx - hs * 0.88} ${hy + hs * 0.7}, ${hx} ${hy + hs * 0.9}, ${hx} ${hy + hs * 0.9}
                  C ${hx} ${hy + hs * 0.9}, ${hx + hs * 0.88} ${hy + hs * 0.7}, ${hx + hs * 0.88} ${hy + hs * 0.38}
                  C ${hx + hs * 0.88} ${hy + hs * 0.05}, ${hx} ${hy + hs * 0.05}, ${hx} ${hy + hs * 0.3} Z`}
              fill="#e03560" opacity="0.9"
            />
          );
        })}
        {/* smile */}
        <path
          d={`M ${cx - r * 0.38} ${cy + r * 0.35} Q ${cx} ${cy + r * 0.65} ${cx + r * 0.38} ${cy + r * 0.35}`}
          stroke="#a06010" strokeWidth="1.2" fill="none" strokeLinecap="round"
        />
      </g>
    );
  } else if (char === '\uD83E\uDEC2') {
    // 🫂  two figures hugging — rendered as two overlapping warm-toned hearts
    const hs = S * 0.38;
    const leftCx  = ex + hs * 0.7;
    const rightCx = ex + hs * 1.9;
    const hY      = ey + S * 0.15;
    const heartPath = (cx: number, col: string) => (
      <path
        d={`M ${cx} ${hY + hs * 0.38}
            C ${cx} ${hY + hs * 0.12}, ${cx - hs * 0.88} ${hY + hs * 0.12}, ${cx - hs * 0.88} ${hY + hs * 0.4}
            C ${cx - hs * 0.88} ${hY + hs * 0.68}, ${cx} ${hY + hs * 0.92}, ${cx} ${hY + hs * 0.92}
            C ${cx} ${hY + hs * 0.92}, ${cx + hs * 0.88} ${hY + hs * 0.68}, ${cx + hs * 0.88} ${hY + hs * 0.4}
            C ${cx + hs * 0.88} ${hY + hs * 0.12}, ${cx} ${hY + hs * 0.12}, ${cx} ${hY + hs * 0.38} Z`}
        fill={col} stroke="#80304060" strokeWidth="0.5" opacity="0.85"
      />
    );
    inner = (
      <g>
        {heartPath(leftCx,  '#e07090')}
        {heartPath(rightCx, '#9070e0')}
      </g>
    );
  }

  if (!inner) return null;
  return (
    <motion.g
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.34, 1.56, 0.64, 1] }}
      style={{ transformOrigin: `${ex + S * 0.4}px ${ey + S * 0.4}px` }}
    >
      {inner}
    </motion.g>
  );
}

// ─── Decorations ─────────────────────────────────────────────────────────
function SakuraDoodle() {
  return (
    <svg viewBox="0 0 80 80" width="72" height="72" fill="none" aria-hidden="true"
      style={{ animation: 'petal-drift 4s ease-in-out infinite' }}>
      {[0, 72, 144, 216, 288].map((deg, i) => (
        <ellipse key={i} cx="40" cy="24" rx="8" ry="16"
          fill="#f2b8c6" opacity="0.72"
          transform={`rotate(${deg} 40 40)`} />
      ))}
      <circle cx="40" cy="40" r="6" fill="#fce4ec" opacity="0.9" />
      <circle cx="40" cy="40" r="3" fill="#f48fb1" opacity="0.85" />
    </svg>
  );
}

function SparklesSVG() {
  return (
    <svg viewBox="0 0 60 30" width="60" height="30" fill="none" aria-hidden="true">
      {([[10, 15, 8], [30, 8, 6], [50, 18, 7]] as const).map(([x, y, s], i) => (
        <g key={i} transform={`translate(${x},${y})`} opacity="0.5">
          <line x1={-s} y1="0" x2={s} y2="0" stroke="#c8a0a0" strokeWidth="1.2" />
          <line x1="0" y1={-s} x2="0" y2={s} stroke="#c8a0a0" strokeWidth="1.2" />
          <line x1={-s * .7} y1={-s * .7} x2={s * .7} y2={s * .7} stroke="#c8a0a0" strokeWidth="0.8" />
          <line x1={s * .7} y1={-s * .7} x2={-s * .7} y2={s * .7} stroke="#c8a0a0" strokeWidth="0.8" />
        </g>
      ))}
    </svg>
  );
}

interface WashiProps {
  color: string; pattern: string; top: string; left: string;
  rotate: string; delay: number; width?: string;
}
function WashiTape({ color, pattern, top, left, rotate, delay, width = '90px' }: WashiProps) {
  return (
    <div style={{
      position: 'absolute', top, left, width, height: '22px',
      background: color, backgroundImage: pattern, backgroundSize: '8px 8px',
      opacity: 0.82, borderRadius: '2px',
      transform: `rotate(${rotate})`,
      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
      animation: `washi-slide 0.6s ease-out ${delay}s both`,
      '--washi-rotate': rotate, zIndex: 20,
    } as React.CSSProperties} />
  );
}

// ─── Main letter canvas ───────────────────────────────────────────────────
interface TegakiCanvasProps {
  lines: GlyphToken[][];
  visibleCharCount: number;
  writingDone: boolean;
  isInView: boolean;
}

function TegakiCanvas({ lines, visibleCharCount }: TegakiCanvasProps) {
  let charsSoFar = 0;

  const totalH = lines.length * LINE_HEIGHT_PX + 24;
  const svgW = LINE_WIDTH_PX + 20;

  return (
    <svg
      viewBox={`0 0 ${svgW} ${totalH}`}
      width="100%"
      style={{ display: 'block', overflow: 'visible' }}
      aria-label="Handwritten letter"
    >
      {lines.map((line, lineIdx) => {
        const lineY = lineIdx * LINE_HEIGHT_PX + BASELINE_OFFSET + 12;
        return (
          <g key={lineIdx}>
            {line.map((token, tokenIdx) => {
              if (charsSoFar >= visibleCharCount) return null;
              charsSoFar++;
              const isLatest = charsSoFar === visibleCharCount; // last visible char

              const { glyph, x, isEmoji, char } = token;

              if (isEmoji) {
                return <EmojiGlyph key={tokenIdx} char={char} x={x} baselineY={lineY} delay={0} />;
              }

              if (!glyph || !glyph.s?.length) return null;

              const colorIdx = (lineIdx * 7 + tokenIdx * 3) % INK_COLORS.length;
              const color = INK_COLORS[colorIdx];

              return (
                <g key={tokenIdx}>
                  {glyph.s.map((stroke, sIdx) => (
                    <StrokePath
                      key={sIdx}
                      points={stroke.p}
                      ox={x}
                      oy={lineY}
                      color={color}
                      isLatest={isLatest}
                    />
                  ))}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

// ─── Root component ───────────────────────────────────────────────────────
export default function LoveLetter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  const [visibleCount, setVisibleCount] = useState(0);
  const [writingDone, setWritingDone] = useState(false);

  const { lines } = useMemo(() => layoutText(LETTER_TEXT), []);
  const totalChars = useMemo(
    () => lines.reduce((acc, l) => acc + l.length, 0),
    [lines]
  );

  useEffect(() => {
    if (!isInView) return;
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setVisibleCount(prev => {
          const next = prev + 3; // reveal 3 chars per tick — fast & smooth without animation overhead
          if (next >= totalChars) {
            clearInterval(interval);
            setWritingDone(true);
            return totalChars;
          }
          return next;
        });
      }, 40);
      return () => clearInterval(interval);
    }, 1200);
    return () => clearTimeout(startDelay);
  }, [isInView, totalChars]);

  const paperGrainStyle: React.CSSProperties = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'repeat',
  };

  return (
    <section className="py-32 bg-transparent" ref={sectionRef} id="love-letter-section">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div style={{ perspective: '800px' }} className="relative">

          {/* Paper unfold */}
          <motion.div
            initial={{ scaleY: 0, rotateX: -25, opacity: 0 }}
            animate={isInView ? { scaleY: 1, rotateX: 0, opacity: 1 } : {}}
            transition={{ duration: 1.1, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ transformOrigin: 'top center' }}
          >
            {/* Paper */}
            <div
              className="relative rounded-sm overflow-visible"
              style={{
                background: '#fdf8f0',
                boxShadow: '0 4px 6px rgba(0,0,0,0.08), 0 12px 40px rgba(0,0,0,0.35), 0 2px 2px rgba(0,0,0,0.06)',
                ...paperGrainStyle,
              }}
            >
              {/* Fold crease */}
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(135deg, transparent 49.5%, rgba(180,160,130,0.07) 49.5%, rgba(180,160,130,0.07) 50.5%, transparent 50.5%)',
                pointerEvents: 'none', borderRadius: 'inherit',
              }} />
              {/* Vignette */}
              <div aria-hidden="true" style={{
                position: 'absolute', inset: 0,
                background: 'radial-gradient(ellipse at center, transparent 70%, rgba(90,60,30,0.08) 100%)',
                pointerEvents: 'none', borderRadius: 'inherit',
              }} />

              {/* Washi tapes */}
              <WashiTape color="rgba(249,183,196,0.70)"
                pattern="repeating-linear-gradient(45deg,rgba(255,255,255,0.25) 0px,rgba(255,255,255,0.25) 2px,transparent 2px,transparent 6px)"
                top="-11px" left="18px" rotate="-3deg" delay={0.9} />
              <WashiTape color="rgba(174,232,216,0.70)"
                pattern="repeating-linear-gradient(-45deg,rgba(255,255,255,0.2) 0px,rgba(255,255,255,0.2) 2px,transparent 2px,transparent 7px)"
                top="-9px" left="130px" rotate="2deg" delay={1.0} width="70px" />
              <WashiTape color="rgba(253,230,138,0.70)"
                pattern="repeating-linear-gradient(90deg,rgba(255,255,255,0.2) 0px,rgba(255,255,255,0.2) 2px,transparent 2px,transparent 6px)"
                top="-12px" left="220px" rotate="-1.5deg" delay={1.1} width="80px" />

              {/* Ink splatters */}
              <svg aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}>
                {([[18,60,2.5],[22,68,1.2],[14,72,1.6],[310,340,2.0],[316,347,1.1],[20,320,1.8]] as const).map(([x,y,r], i) => (
                  <circle key={i} cx={x} cy={y} r={r} fill="#3a1a00"
                    style={{ animation: `splatter-pulse ${2 + r * 0.4}s ease-in-out infinite` }} />
                ))}
              </svg>

              {/* Sakura */}
              <div style={{ position: 'absolute', top: '18px', right: '20px', opacity: 0.62 }} aria-hidden="true">
                <SakuraDoodle />
              </div>

              {/* ── TEGAKI CANVAS ── */}
              <div className="relative z-10 px-8 py-14 md:px-12 md:py-16">
                <TegakiCanvas
                  lines={lines}
                  visibleCharCount={visibleCount}
                  writingDone={writingDone}
                  isInView={isInView}
                />

                {/* Sparkles near signature */}
                {writingDone && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.7 }}
                    style={{ marginTop: '12px', marginLeft: 'auto', width: 'fit-content' }}
                    aria-hidden="true"
                  >
                    <SparklesSVG />
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Fountain pen watermark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 0.15 } : {}}
            transition={{ delay: 1.5, duration: 1 }}
            style={{
              position: 'absolute', bottom: '-48px', right: '32px',
              fontSize: '2.5rem', color: '#4a2000',
              userSelect: 'none', pointerEvents: 'none',
              fontFamily: 'var(--font-tegaki)',
            }}
            aria-hidden="true"
          >
            ✒
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
