import { useId } from "react";

const bubbleMapByType = {
  straight: [
    { x: 34, y: 44, r: 4.2 },
    { x: 48, y: 58, r: 3.1 },
    { x: 62, y: 46, r: 2.5 },
    { x: 72, y: 57, r: 3.7 },
  ],
  corner: [
    { x: 50, y: 29, r: 2.5 },
    { x: 53, y: 45, r: 3.4 },
    { x: 67, y: 49, r: 2.6 },
  ],
  t: [
    { x: 33, y: 48, r: 2.8 },
    { x: 48, y: 47, r: 3.7 },
    { x: 63, y: 44, r: 2.6 },
    { x: 50, y: 67, r: 3 },
  ],
  cross: [
    { x: 50, y: 34, r: 2.8 },
    { x: 34, y: 50, r: 2.8 },
    { x: 50, y: 50, r: 4 },
    { x: 66, y: 50, r: 2.8 },
    { x: 50, y: 67, r: 3.2 },
  ],
  start: [
    { x: 44, y: 52, r: 2.8 },
    { x: 57, y: 46, r: 2.4 },
    { x: 70, y: 55, r: 3.2 },
  ],
  end: [
    { x: 29, y: 49, r: 2.6 },
    { x: 42, y: 58, r: 2.2 },
    { x: 57, y: 45, r: 3 },
  ],
  valve: [
    { x: 36, y: 46, r: 2.6 },
    { x: 63, y: 55, r: 3.1 },
  ],
  "dead-end": [
    { x: 50, y: 31, r: 2.5 },
    { x: 50, y: 43, r: 3 },
  ],
};

const bossPipeThemes = {
  aegis: {
    connectorStroke: "#4bdcff",
    connectorStrokeOpacity: 0.18,
    connectorLight: "#72eeff",
    ringFill: "#081629",
    ringStroke: "#1e5ea2",
    terminalStroke: "#2b6bb3",
    terminalCross: "#b6ff6f",
    hubOuterStroke: "#2361a7",
    hubCoreFill: "#0a1a2d",
    hubCoreStroke: "#9cf6ff",
    valveOuterFill: "#071326",
    valveOuterStroke: "#2361a7",
    valveInnerFill: "#0c2137",
    valveInnerStroke: "#afffff",
    valveBlade: "#d5fff0",
    blockedInnerFill: "#0a1b2c",
    blockedInnerStroke: "#2a6da5",
    blockedCross: "#96ff55",
    blockedDot: "#dfff8d",
    emptyFrameFill: "#09192a",
    emptyFrameStroke: "#215888",
    emptyInnerFill: "#0b2131",
    emptyGlowOuter: "#6cff4f",
    emptyGlowOuterOpacity: 0.12,
    emptyGlowInner: "#dfff88",
    emptyGlowInnerOpacity: 0.18,
    emptyLine: "#72eeff",
    bubbleOuter: "#dfff88",
    bubbleOuterOpacity: 0.22,
    bubbleInner: "#bbff46",
    bubbleInnerOpacity: 0.52,
    bubbleSpec: "#f8fff0",
    metalOuterStops: [
      { offset: "0", color: "#122a56" },
      { offset: "0.45", color: "#234f96" },
      { offset: "0.72", color: "#0b1f45" },
      { offset: "1", color: "#2c67bb" },
    ],
    metalInnerStops: [
      { offset: "0", color: "#0f2f62" },
      { offset: "1", color: "#071933" },
    ],
    pipeGlowStops: [
      { offset: "0", color: "#0e2b3f" },
      { offset: "0.5", color: "#144c3d" },
      { offset: "1", color: "#11253a" },
    ],
    pipeLiquidStops: [
      { offset: "0", color: "#3fd21e" },
      { offset: "0.34", color: "#6fff1e" },
      { offset: "0.7", color: "#54da1d" },
      { offset: "1", color: "#2b9d1d" },
    ],
    pipeHighlightStops: [
      { offset: "0", color: "#ffffff", opacity: 0.98 },
      { offset: "0.42", color: "#e4ffd4", opacity: 0.8 },
      { offset: "1", color: "#e4ffd4", opacity: 0 },
    ],
    portGlowStops: [
      { offset: "0", color: "#fff9b2" },
      { offset: "0.34", color: "#d7ff63" },
      { offset: "0.7", color: "#6cff30" },
      { offset: "1", color: "#12331c", opacity: 0 },
    ],
    terminalOuterStops: [
      { offset: "0", color: "#dfff8c" },
      { offset: "0.26", color: "#a3ff38" },
      { offset: "0.72", color: "#31a318" },
      { offset: "1", color: "#081629", opacity: 0 },
    ],
    terminalInnerStops: [
      { offset: "0", color: "#fffbd8" },
      { offset: "0.38", color: "#deff7b" },
      { offset: "1", color: "#67d921" },
    ],
    blockedFillStops: [
      { offset: "0", color: "#15334f" },
      { offset: "1", color: "#081629" },
    ],
    clampFillStops: [
      { offset: "0", color: "#9bff7b" },
      { offset: "0.45", color: "#5ddb56" },
      { offset: "1", color: "#2d8e2f" },
    ],
    showClampTabs: false,
    showHubBolts: false,
    showValveRing: false,
  },
  gyro: {
    connectorStroke: "#7fdcff",
    connectorStrokeOpacity: 0.22,
    connectorLight: "#7cecff",
    ringFill: "#08162a",
    ringStroke: "#2d6fca",
    terminalStroke: "#3174c9",
    terminalCross: "#ffc178",
    hubOuterStroke: "#2d6fca",
    hubCoreFill: "#0a1930",
    hubCoreStroke: "#9fe5ff",
    valveOuterFill: "#071528",
    valveOuterStroke: "#2d6fca",
    valveInnerFill: "#0b2242",
    valveInnerStroke: "#a9ebff",
    valveBlade: "#ffe0b5",
    blockedInnerFill: "#0a1830",
    blockedInnerStroke: "#3160a5",
    blockedCross: "#ffac66",
    blockedDot: "#ffd39a",
    emptyFrameFill: "#08182d",
    emptyFrameStroke: "#27589c",
    emptyInnerFill: "#0a1d38",
    emptyGlowOuter: "#47a2ff",
    emptyGlowOuterOpacity: 0.14,
    emptyGlowInner: "#b6f1ff",
    emptyGlowInnerOpacity: 0.2,
    emptyLine: "#76dcff",
    bubbleOuter: "#d3f4ff",
    bubbleOuterOpacity: 0.2,
    bubbleInner: "#57cfff",
    bubbleInnerOpacity: 0.54,
    bubbleSpec: "#fbffff",
    metalOuterStops: [
      { offset: "0", color: "#16386e" },
      { offset: "0.45", color: "#2f6bb6" },
      { offset: "0.72", color: "#0b1e44" },
      { offset: "1", color: "#4c84d0" },
    ],
    metalInnerStops: [
      { offset: "0", color: "#113463" },
      { offset: "1", color: "#08182f" },
    ],
    pipeGlowStops: [
      { offset: "0", color: "#0d2142" },
      { offset: "0.5", color: "#123f76" },
      { offset: "1", color: "#0b2245" },
    ],
    pipeLiquidStops: [
      { offset: "0", color: "#2d9eff" },
      { offset: "0.34", color: "#64e6ff" },
      { offset: "0.7", color: "#42c4ff" },
      { offset: "1", color: "#2368d4" },
    ],
    pipeHighlightStops: [
      { offset: "0", color: "#ffffff", opacity: 0.98 },
      { offset: "0.42", color: "#dcf8ff", opacity: 0.82 },
      { offset: "1", color: "#dcf8ff", opacity: 0 },
    ],
    portGlowStops: [
      { offset: "0", color: "#fffdf3" },
      { offset: "0.3", color: "#9de8ff" },
      { offset: "0.7", color: "#39a5ff" },
      { offset: "1", color: "#07182d", opacity: 0 },
    ],
    terminalOuterStops: [
      { offset: "0", color: "#dcfbff" },
      { offset: "0.26", color: "#6fdbff" },
      { offset: "0.72", color: "#276dd9" },
      { offset: "1", color: "#07182d", opacity: 0 },
    ],
    terminalInnerStops: [
      { offset: "0", color: "#ffffff" },
      { offset: "0.38", color: "#bcefff" },
      { offset: "1", color: "#3aa8ff" },
    ],
    blockedFillStops: [
      { offset: "0", color: "#173864" },
      { offset: "1", color: "#081629" },
    ],
    clampFillStops: [
      { offset: "0", color: "#ffcf85" },
      { offset: "0.42", color: "#ff9e43" },
      { offset: "0.78", color: "#c5621f" },
      { offset: "1", color: "#7a2f12" },
    ],
    showClampTabs: true,
    showHubBolts: true,
    showValveRing: true,
  },
  warden: {
    connectorStroke: "#8ed7ff",
    connectorStrokeOpacity: 0.24,
    connectorLight: "#52d2ff",
    ringFill: "#06111f",
    ringStroke: "#467fda",
    terminalStroke: "#4d88e0",
    terminalCross: "#d1f3ff",
    hubOuterStroke: "#467fda",
    hubCoreFill: "#08182c",
    hubCoreStroke: "#9adfff",
    valveOuterFill: "#061423",
    valveOuterStroke: "#467fda",
    valveInnerFill: "#0a1d36",
    valveInnerStroke: "#98e4ff",
    valveBlade: "#f0fdff",
    blockedInnerFill: "#08172a",
    blockedInnerStroke: "#2d5ea9",
    blockedCross: "#ffb86b",
    blockedDot: "#ffe0ae",
    emptyFrameFill: "#071526",
    emptyFrameStroke: "#27518d",
    emptyInnerFill: "#0a1a31",
    emptyGlowOuter: "#2b87ff",
    emptyGlowOuterOpacity: 0.18,
    emptyGlowInner: "#b4ecff",
    emptyGlowInnerOpacity: 0.22,
    emptyLine: "#80e6ff",
    bubbleOuter: "#d8f7ff",
    bubbleOuterOpacity: 0.18,
    bubbleInner: "#56beff",
    bubbleInnerOpacity: 0.56,
    bubbleSpec: "#fcffff",
    metalOuterStops: [
      { offset: "0", color: "#10284f" },
      { offset: "0.42", color: "#234d86" },
      { offset: "0.72", color: "#091a34" },
      { offset: "1", color: "#3d6cb2" },
    ],
    metalInnerStops: [
      { offset: "0", color: "#0d2a52" },
      { offset: "1", color: "#061321" },
    ],
    pipeGlowStops: [
      { offset: "0", color: "#081734" },
      { offset: "0.5", color: "#0f376a" },
      { offset: "1", color: "#081833" },
    ],
    pipeLiquidStops: [
      { offset: "0", color: "#205dff" },
      { offset: "0.28", color: "#2e97ff" },
      { offset: "0.56", color: "#62ecff" },
      { offset: "0.82", color: "#2f8bff" },
      { offset: "1", color: "#1848d6" },
    ],
    pipeHighlightStops: [
      { offset: "0", color: "#ffffff", opacity: 0.98 },
      { offset: "0.38", color: "#e4fbff", opacity: 0.86 },
      { offset: "1", color: "#d7f3ff", opacity: 0 },
    ],
    portGlowStops: [
      { offset: "0", color: "#ffffff" },
      { offset: "0.28", color: "#b7efff" },
      { offset: "0.64", color: "#308cff" },
      { offset: "1", color: "#051220", opacity: 0 },
    ],
    terminalOuterStops: [
      { offset: "0", color: "#f2ffff" },
      { offset: "0.24", color: "#8ce7ff" },
      { offset: "0.68", color: "#2a78ff" },
      { offset: "1", color: "#06111f", opacity: 0 },
    ],
    terminalInnerStops: [
      { offset: "0", color: "#ffffff" },
      { offset: "0.34", color: "#cbf7ff" },
      { offset: "1", color: "#45b9ff" },
    ],
    blockedFillStops: [
      { offset: "0", color: "#102c52" },
      { offset: "1", color: "#06111f" },
    ],
    clampFillStops: [
      { offset: "0", color: "#ffd499" },
      { offset: "0.38", color: "#d69254" },
      { offset: "0.76", color: "#85411f" },
      { offset: "1", color: "#4e1e0f" },
    ],
    showClampTabs: true,
    showHubBolts: true,
    showValveRing: true,
  },
  singularity: {
    connectorStroke: "#a4ebff",
    connectorStrokeOpacity: 0.26,
    connectorLight: "#7be4ff",
    ringFill: "#040d1a",
    ringStroke: "#5494ff",
    terminalStroke: "#5da2ff",
    terminalCross: "#e8fcff",
    hubOuterStroke: "#5494ff",
    hubCoreFill: "#061424",
    hubCoreStroke: "#b2efff",
    valveOuterFill: "#06111d",
    valveOuterStroke: "#5494ff",
    valveInnerFill: "#081c33",
    valveInnerStroke: "#b1efff",
    valveBlade: "#fbffff",
    blockedInnerFill: "#061220",
    blockedInnerStroke: "#3366b8",
    blockedCross: "#ffc981",
    blockedDot: "#ffe8be",
    emptyFrameFill: "#06111f",
    emptyFrameStroke: "#2a57a2",
    emptyInnerFill: "#091a2f",
    emptyGlowOuter: "#3174ff",
    emptyGlowOuterOpacity: 0.2,
    emptyGlowInner: "#ccf5ff",
    emptyGlowInnerOpacity: 0.24,
    emptyLine: "#8be8ff",
    bubbleOuter: "#e3fbff",
    bubbleOuterOpacity: 0.2,
    bubbleInner: "#6fd6ff",
    bubbleInnerOpacity: 0.58,
    bubbleSpec: "#ffffff",
    metalOuterStops: [
      { offset: "0", color: "#122d5b" },
      { offset: "0.36", color: "#295694" },
      { offset: "0.7", color: "#08162c" },
      { offset: "1", color: "#4b7edd" },
    ],
    metalInnerStops: [
      { offset: "0", color: "#10305c" },
      { offset: "1", color: "#050f1a" },
    ],
    pipeGlowStops: [
      { offset: "0", color: "#07152f" },
      { offset: "0.42", color: "#1548a4" },
      { offset: "0.76", color: "#0a1f4c" },
      { offset: "1", color: "#07152f" },
    ],
    pipeLiquidStops: [
      { offset: "0", color: "#265dff" },
      { offset: "0.22", color: "#2e89ff" },
      { offset: "0.52", color: "#7df3ff" },
      { offset: "0.78", color: "#43b6ff" },
      { offset: "1", color: "#2253ff" },
    ],
    pipeHighlightStops: [
      { offset: "0", color: "#ffffff", opacity: 1 },
      { offset: "0.34", color: "#f0fdff", opacity: 0.9 },
      { offset: "1", color: "#dff7ff", opacity: 0 },
    ],
    portGlowStops: [
      { offset: "0", color: "#ffffff" },
      { offset: "0.24", color: "#d4faff" },
      { offset: "0.56", color: "#56bfff" },
      { offset: "0.86", color: "#2d65ff" },
      { offset: "1", color: "#030d19", opacity: 0 },
    ],
    terminalOuterStops: [
      { offset: "0", color: "#ffffff" },
      { offset: "0.24", color: "#bdf5ff" },
      { offset: "0.62", color: "#4ab7ff" },
      { offset: "0.88", color: "#2556ff" },
      { offset: "1", color: "#040d1a", opacity: 0 },
    ],
    terminalInnerStops: [
      { offset: "0", color: "#ffffff" },
      { offset: "0.34", color: "#e2fbff" },
      { offset: "1", color: "#63d4ff" },
    ],
    blockedFillStops: [
      { offset: "0", color: "#133364" },
      { offset: "1", color: "#040d1a" },
    ],
    clampFillStops: [
      { offset: "0", color: "#ffe0ab" },
      { offset: "0.34", color: "#e0a25f" },
      { offset: "0.72", color: "#8d4722" },
      { offset: "1", color: "#552312" },
    ],
    showClampTabs: true,
    showHubBolts: true,
    showValveRing: true,
  },
};

function renderStops(stops) {
  return stops.map((stop, index) => (
    <stop
      key={`${stop.offset}-${index}`}
      offset={stop.offset}
      stopColor={stop.color}
      {...(stop.opacity !== undefined ? { stopOpacity: stop.opacity } : {})}
    />
  ));
}

function ClampTabs({ height, ids, enabled }) {
  if (!enabled) {
    return null;
  }

  return (
    <>
      <rect
        x="-7.5"
        y={-height / 2 - 2}
        width="15"
        height="7"
        rx="2.4"
        fill={`url(#${ids.clampFill})`}
        stroke="#ffcc89"
        strokeOpacity="0.6"
        strokeWidth="0.8"
      />
      <rect
        x="-7.5"
        y={height / 2 - 5}
        width="15"
        height="7"
        rx="2.4"
        fill={`url(#${ids.clampFill})`}
        stroke="#ffcc89"
        strokeOpacity="0.6"
        strokeWidth="0.8"
      />
    </>
  );
}

function Connector({ x, y, rotation = 0, ids, theme, compact = false }) {
  const width = compact ? 18 : 22;
  const height = compact ? 30 : 34;
  const bodyWidth = compact ? 12 : 14;
  const bodyHeight = compact ? 24 : 28;
  const outerRadius = compact ? 9.5 : 12;
  const innerRadius = compact ? 6.5 : 8.5;

  return (
    <g transform={`translate(${x} ${y}) rotate(${rotation})`}>
      <ClampTabs height={height} ids={ids} enabled={theme.showClampTabs} />
      <rect
        x={-width / 2}
        y={-height / 2}
        width={width}
        height={height}
        rx="8"
        fill={`url(#${ids.metalOuter})`}
        stroke={theme.connectorStroke}
        strokeOpacity={theme.connectorStrokeOpacity}
        strokeWidth="1.2"
      />
      <rect
        x={-bodyWidth / 2}
        y={-bodyHeight / 2}
        width={bodyWidth}
        height={bodyHeight}
        rx="6"
        fill={`url(#${ids.metalInner})`}
      />
      <rect
        x={-width / 2 + 1.5}
        y={-height / 2 + 3}
        width="2.6"
        height={height - 6}
        rx="1.3"
        fill={theme.connectorLight}
        fillOpacity="0.64"
      />
      <circle
        cx="0"
        cy="0"
        r={outerRadius}
        fill={theme.ringFill}
        stroke={theme.ringStroke}
        strokeWidth="2.2"
      />
      <circle
        cx="0"
        cy="0"
        r={innerRadius}
        fill={`url(#${ids.portGlow})`}
        fillOpacity="0.72"
      />
    </g>
  );
}

function ReactorTerminal({ x, y, flip = false, ids, theme }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <ClampTabs height={36} ids={ids} enabled={theme.showClampTabs} />
      <rect
        x="-16"
        y="-18"
        width="24"
        height="36"
        rx="10"
        fill={`url(#${ids.metalOuter})`}
        stroke={theme.connectorStroke}
        strokeOpacity={theme.connectorStrokeOpacity + 0.04}
        strokeWidth="1.2"
      />
      <circle cx="-2" cy="0" r="22" fill={theme.ringFill} stroke={theme.terminalStroke} strokeWidth="2.6" />
      <circle cx="-2" cy="0" r="17" fill={`url(#${ids.terminalOuter})`} />
      <circle cx="-2" cy="0" r="11" fill={`url(#${ids.terminalInner})`} />
      <circle cx="-2" cy="0" r="5" fill="#fffcd0" fillOpacity="0.92" />
      <path
        d="M-2 -14V14M-16 0H12M-12 -10L8 10M-12 10L8 -10"
        stroke={theme.terminalCross}
        strokeOpacity="0.32"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </g>
  );
}

function HubJoint({ ids, theme, ring = 17 }) {
  return (
    <g>
      <circle cx="50" cy="50" r={ring} fill={theme.ringFill} stroke={theme.hubOuterStroke} strokeWidth="2.4" />
      <circle cx="50" cy="50" r={ring - 5} fill={`url(#${ids.portGlow})`} fillOpacity="0.42" />
      <circle cx="50" cy="50" r={ring - 9} fill={theme.hubCoreFill} stroke={theme.hubCoreStroke} strokeOpacity="0.4" strokeWidth="1.4" />
      {theme.showHubBolts
        ? [
            { x: 50, y: 28, rotate: 0 },
            { x: 72, y: 50, rotate: 90 },
            { x: 50, y: 72, rotate: 0 },
            { x: 28, y: 50, rotate: 90 },
          ].map((bolt) => (
            <rect
              key={`${bolt.x}-${bolt.y}`}
              x={bolt.x - 5}
              y={bolt.y - 3.5}
              width="10"
              height="7"
              rx="2.2"
              transform={`rotate(${bolt.rotate} ${bolt.x} ${bolt.y})`}
              fill={`url(#${ids.clampFill})`}
              stroke="#ffd194"
              strokeOpacity="0.55"
              strokeWidth="0.8"
            />
          ))
        : null}
    </g>
  );
}

function ValveCore({ ids, theme }) {
  return (
    <g>
      {theme.showValveRing ? (
        <circle
          cx="50"
          cy="50"
          r="18.5"
          fill="none"
          stroke={`url(#${ids.clampFill})`}
          strokeWidth="3"
          opacity="0.76"
        />
      ) : null}
      <circle cx="50" cy="50" r="15.5" fill={theme.valveOuterFill} stroke={theme.valveOuterStroke} strokeWidth="2.2" />
      <circle cx="50" cy="50" r="11" fill={theme.valveInnerFill} stroke={theme.valveInnerStroke} strokeOpacity="0.34" strokeWidth="1.4" />
      <path
        d="M50 38V62M38 50H62M42 42L58 58M58 42L42 58"
        stroke={theme.valveBlade}
        strokeOpacity="0.74"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </g>
  );
}

function PipeStroke({ d, ids, theme }) {
  return (
    <>
      <path
        d={d}
        stroke={theme.ringFill}
        strokeWidth="30"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.94"
      />
      <path
        d={d}
        stroke={`url(#${ids.pipeGlow})`}
        strokeWidth="26"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.96"
      />
      <path
        d={d}
        stroke={`url(#${ids.pipeLiquid})`}
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={d}
        stroke={`url(#${ids.pipeHighlight})`}
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </>
  );
}

function Bubbles({ type, theme }) {
  const bubbles = bubbleMapByType[type] ?? [];

  return bubbles.map((bubble, index) => (
    <g key={`${type}-${index}`} opacity="0.92">
      <circle
        cx={bubble.x}
        cy={bubble.y}
        r={bubble.r}
        fill={theme.bubbleOuter}
        fillOpacity={theme.bubbleOuterOpacity}
      />
      <circle
        cx={bubble.x}
        cy={bubble.y}
        r={bubble.r - 0.9}
        fill={theme.bubbleInner}
        fillOpacity={theme.bubbleInnerOpacity}
      />
      <circle
        cx={bubble.x - bubble.r * 0.22}
        cy={bubble.y - bubble.r * 0.24}
        r={Math.max(0.65, bubble.r * 0.3)}
        fill={theme.bubbleSpec}
        fillOpacity="0.9"
      />
    </g>
  ));
}

function PipeScene({ type, ids, theme }) {
  if (type === "blocked") {
    return (
      <g>
        <rect x="20" y="20" width="60" height="60" rx="18" fill={`url(#${ids.blockedFill})`} />
        <rect
          x="27"
          y="27"
          width="46"
          height="46"
          rx="14"
          fill={theme.blockedInnerFill}
          stroke={theme.blockedInnerStroke}
          strokeWidth="2"
        />
        <path
          d="M34 34L66 66M66 34L34 66"
          stroke={theme.blockedCross}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="34" cy="34" r="3.2" fill={theme.blockedDot} />
        <circle cx="66" cy="66" r="3.2" fill={theme.blockedDot} />
      </g>
    );
  }

  if (type === "empty") {
    return (
      <g>
        <rect
          x="20"
          y="20"
          width="60"
          height="60"
          rx="18"
          fill={theme.emptyFrameFill}
          stroke={theme.emptyFrameStroke}
          strokeOpacity="0.56"
          strokeWidth="2"
        />
        <rect x="28" y="28" width="44" height="44" rx="13" fill={theme.emptyInnerFill} />
        <circle cx="50" cy="50" r="13" fill={theme.emptyGlowOuter} fillOpacity={theme.emptyGlowOuterOpacity} />
        <circle cx="50" cy="50" r="7" fill={theme.emptyGlowInner} fillOpacity={theme.emptyGlowInnerOpacity} />
        <path d="M36 50H64" stroke={theme.emptyLine} strokeOpacity="0.26" strokeWidth="2" strokeLinecap="round" />
      </g>
    );
  }

  if (type === "straight") {
    return (
      <g>
        <PipeStroke d="M18 50H82" ids={ids} theme={theme} />
        <Bubbles type={type} theme={theme} />
        <Connector x="18" y="50" rotation="90" ids={ids} theme={theme} />
        <Connector x="82" y="50" rotation="90" ids={ids} theme={theme} />
      </g>
    );
  }

  if (type === "corner") {
    return (
      <g>
        <PipeStroke d="M50 18V50H82" ids={ids} theme={theme} />
        <Bubbles type={type} theme={theme} />
        <Connector x="50" y="18" rotation="0" ids={ids} theme={theme} />
        <Connector x="82" y="50" rotation="90" ids={ids} theme={theme} />
      </g>
    );
  }

  if (type === "t") {
    return (
      <g>
        <PipeStroke d="M18 50H82M50 50V82" ids={ids} theme={theme} />
        <Bubbles type={type} theme={theme} />
        <Connector x="18" y="50" rotation="90" ids={ids} theme={theme} />
        <Connector x="82" y="50" rotation="90" ids={ids} theme={theme} />
        <Connector x="50" y="82" rotation="0" ids={ids} theme={theme} />
        <HubJoint ids={ids} theme={theme} />
      </g>
    );
  }

  if (type === "cross") {
    return (
      <g>
        <PipeStroke d="M18 50H82M50 18V82" ids={ids} theme={theme} />
        <Bubbles type={type} theme={theme} />
        <Connector x="18" y="50" rotation="90" ids={ids} theme={theme} />
        <Connector x="82" y="50" rotation="90" ids={ids} theme={theme} />
        <Connector x="50" y="18" rotation="0" ids={ids} theme={theme} />
        <Connector x="50" y="82" rotation="0" ids={ids} theme={theme} />
        <HubJoint ids={ids} theme={theme} ring={18} />
      </g>
    );
  }

  if (type === "start") {
    return (
      <g>
        <PipeStroke d="M28 50H82" ids={ids} theme={theme} />
        <Bubbles type={type} theme={theme} />
        <ReactorTerminal x="24" y="50" ids={ids} theme={theme} />
        <Connector x="82" y="50" rotation="90" ids={ids} theme={theme} />
      </g>
    );
  }

  if (type === "end") {
    return (
      <g>
        <PipeStroke d="M18 50H72" ids={ids} theme={theme} />
        <Bubbles type={type} theme={theme} />
        <Connector x="18" y="50" rotation="90" ids={ids} theme={theme} />
        <ReactorTerminal x="76" y="50" flip ids={ids} theme={theme} />
      </g>
    );
  }

  if (type === "valve") {
    return (
      <g>
        <PipeStroke d="M18 50H82" ids={ids} theme={theme} />
        <Bubbles type={type} theme={theme} />
        <Connector x="18" y="50" rotation="90" ids={ids} theme={theme} />
        <Connector x="82" y="50" rotation="90" ids={ids} theme={theme} />
        <ValveCore ids={ids} theme={theme} />
      </g>
    );
  }

  if (type === "dead-end") {
    return (
      <g>
        <PipeStroke d="M50 18V50" ids={ids} theme={theme} />
        <Bubbles type={type} theme={theme} />
        <Connector x="50" y="18" rotation="0" ids={ids} theme={theme} compact />
        <circle cx="50" cy="56" r="13.5" fill={theme.ringFill} stroke={theme.hubOuterStroke} strokeWidth="2.4" />
        <circle cx="50" cy="56" r="7.5" fill={`url(#${ids.portGlow})`} fillOpacity="0.35" />
      </g>
    );
  }

  return null;
}

function BossPipeArt({ type, variant = "aegis", className = "" }) {
  const resolvedVariant = variant === "warden" ? "singularity" : variant;
  const theme = bossPipeThemes[resolvedVariant] ?? bossPipeThemes.aegis;
  const rawId = useId().replace(/:/g, "");
  const ids = {
    metalOuter: `${rawId}-metal-outer`,
    metalInner: `${rawId}-metal-inner`,
    pipeGlow: `${rawId}-pipe-glow`,
    pipeLiquid: `${rawId}-pipe-liquid`,
    pipeHighlight: `${rawId}-pipe-highlight`,
    portGlow: `${rawId}-port-glow`,
    terminalOuter: `${rawId}-terminal-outer`,
    terminalInner: `${rawId}-terminal-inner`,
    blockedFill: `${rawId}-blocked-fill`,
    clampFill: `${rawId}-clamp-fill`,
  };

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={ids.metalOuter} x1="0" y1="0" x2="1" y2="1">
          {renderStops(theme.metalOuterStops)}
        </linearGradient>
        <linearGradient id={ids.metalInner} x1="0" y1="0" x2="0" y2="1">
          {renderStops(theme.metalInnerStops)}
        </linearGradient>
        <linearGradient id={ids.pipeGlow} x1="0" y1="0" x2="1" y2="1">
          {renderStops(theme.pipeGlowStops)}
        </linearGradient>
        <linearGradient id={ids.pipeLiquid} x1="0" y1="0" x2="1" y2="1">
          {renderStops(theme.pipeLiquidStops)}
        </linearGradient>
        <linearGradient id={ids.pipeHighlight} x1="0" y1="0" x2="0" y2="1">
          {renderStops(theme.pipeHighlightStops)}
        </linearGradient>
        <radialGradient id={ids.portGlow} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) scale(12)">
          {renderStops(theme.portGlowStops)}
        </radialGradient>
        <radialGradient id={ids.terminalOuter} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) scale(18)">
          {renderStops(theme.terminalOuterStops)}
        </radialGradient>
        <radialGradient id={ids.terminalInner} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0 0) scale(12)">
          {renderStops(theme.terminalInnerStops)}
        </radialGradient>
        <linearGradient id={ids.blockedFill} x1="0" y1="0" x2="1" y2="1">
          {renderStops(theme.blockedFillStops)}
        </linearGradient>
        <linearGradient id={ids.clampFill} x1="0" y1="0" x2="1" y2="1">
          {renderStops(theme.clampFillStops)}
        </linearGradient>
      </defs>

      <PipeScene type={type} ids={ids} theme={theme} />
    </svg>
  );
}

export default BossPipeArt;
