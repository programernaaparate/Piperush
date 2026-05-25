import {
  analyzeFlow,
  createBoardFromLevel,
  getConnections,
  OPPOSITE_DIRECTION,
} from "../utils/pipeLogic.js";
import { validateAllLevels as validateLevelSet } from "../utils/levelValidator.js";

const tile = (type, rotation = 0, correctRotation = rotation) => ({
  type,
  rotation,
  correctRotation,
});

const extra = (at, type, correctRotation = 0, rotation) => ({
  at,
  type,
  correctRotation,
  rotation,
});

const special = (at, properties) => ({
  at,
  ...properties,
});

const DIRECTIONS = ["up", "right", "down", "left"];

const DIRECTION_VECTORS = {
  up: [-1, 0],
  right: [0, 1],
  down: [1, 0],
  left: [0, -1],
};

const BASE_CONNECTIONS = {
  straight: ["left", "right"],
  corner: ["up", "right"],
  t: ["left", "right", "down"],
  cross: ["up", "right", "down", "left"],
  start: ["right"],
  end: ["left"],
  empty: [],
  blocked: [],
  "dead-end": ["up"],
  valve: ["left", "right"],
};

const SCRAMBLE_PROFILES = {
  easy: [
    {
      endpointMode: "none",
      pathStride: 4,
      pathOffset: 1,
      extraEvery: 4,
      extraOffset: 0,
      aggressivePathTurns: false,
      aggressiveExtraTurns: false,
      keepPathIndices: [1, 2],
    },
    {
      endpointMode: "none",
      pathStride: 3,
      pathOffset: 0,
      extraEvery: 3,
      extraOffset: 1,
      aggressivePathTurns: false,
      aggressiveExtraTurns: false,
      keepPathIndices: [1],
    },
    {
      endpointMode: "start",
      pathStride: 3,
      pathOffset: 1,
      extraEvery: 2,
      extraOffset: 0,
      aggressivePathTurns: false,
      aggressiveExtraTurns: false,
    },
    {
      endpointMode: "start",
      pathStride: 2,
      pathOffset: 1,
      extraEvery: 2,
      extraOffset: 1,
      aggressivePathTurns: true,
      aggressiveExtraTurns: false,
    },
    {
      endpointMode: "end",
      pathStride: 2,
      pathOffset: 0,
      extraEvery: 2,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: false,
      forcePathIndices: [1],
    },
    {
      endpointMode: "both",
      pathStride: 2,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 1,
      aggressivePathTurns: true,
      aggressiveExtraTurns: false,
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: false,
      forcePathIndices: [1, 3],
    },
  ],
  medium: [
    {
      endpointMode: "end",
      pathStride: 3,
      pathOffset: 1,
      extraEvery: 2,
      extraOffset: 1,
      aggressivePathTurns: true,
      aggressiveExtraTurns: false,
      keepPathIndices: [1],
    },
    {
      endpointMode: "start",
      pathStride: 2,
      pathOffset: 0,
      extraEvery: 2,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: false,
    },
    {
      endpointMode: "both",
      pathStride: 2,
      pathOffset: 1,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      keepPathIndices: [2],
    },
    {
      endpointMode: "both",
      pathStride: 2,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 1,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      forcePathIndices: [1, 3],
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 1,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      forcePathIndices: [1, 4],
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      forcePathIndices: [1, 3, 5],
    },
  ],
  hard: [
    {
      endpointMode: "start",
      pathStride: 2,
      pathOffset: 1,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: false,
      keepPathIndices: [1, 2],
    },
    {
      endpointMode: "end",
      pathStride: 2,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 1,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      keepPathIndices: [1],
    },
    {
      endpointMode: "both",
      pathStride: 2,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      forcePathIndices: [2, 4],
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 1,
      extraEvery: 1,
      extraOffset: 1,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      forcePathIndices: [1, 3],
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      forcePathIndices: [1, 4, 7],
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      forcePathIndices: [1, 3, 6, 9],
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 1,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      forcePathIndices: [1, 4, 8, 11],
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
      forcePathIndices: [1, 2, 5, 8, 11, 14],
    },
  ],
  daily: [
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 0,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
    },
    {
      endpointMode: "both",
      pathStride: 1,
      pathOffset: 0,
      extraEvery: 1,
      extraOffset: 1,
      aggressivePathTurns: true,
      aggressiveExtraTurns: true,
    },
  ],
};

const VALIDATION_THRESHOLDS = {
  easy: {
    minPathLength: 7,
    minWrongPathTiles: 3,
  },
  medium: {
    minPathLength: 10,
    minWrongPathTiles: 5,
  },
  hard: {
    minPathLength: 13,
    minWrongPathTiles: 8,
  },
  daily: {
    minPathLength: 12,
    minWrongPathTiles: 7,
  },
};

const BACKGROUND_BY_DIFFICULTY = {
  easy: "/assets/backgrounds/bg-easy-lab.png",
  medium: "/assets/backgrounds/bg-medium-factory.png",
  hard: "/assets/backgrounds/bg-hard-reactor.png",
  daily: "/assets/backgrounds/bg-hard-reactor.png",
  boss: "/assets/backgrounds/bg-boss-core.png",
};

export const campaignDifficultyKeys = ["easy", "medium", "hard"];

const difficultyBlueprints = {
  easy: [
    {
      id: "easy-1",
      name: "Hladni start",
      briefing: "Pokreni levi ulaz i sprovedi impuls do izlaznog modula.",
      difficulty: "easy",
      scrambleProfileIndex: 2,
      gridSize: 5,
      timeLimit: 140,
      hints: 3,
      moveTarget: 8,
      path: [
        [2, 0],
        [2, 1],
        [2, 2],
        [3, 2],
        [4, 2],
        [4, 3],
        [4, 4],
      ],
      blocked: [
        [0, 0],
        [1, 3],
        [3, 1],
        [4, 1],
      ],
      extras: [
        extra([0, 1], "dead-end", 180),
        extra([0, 3], "corner", 90),
        extra([1, 1], "valve", 0),
        extra([1, 4], "t", 90),
        extra([3, 4], "cross"),
      ],
    },
    {
      id: "easy-2",
      name: "Lift okno",
      briefing: "Spusti signal niz centralnu kolonu, pa ga savij ka donjem prijemniku.",
      difficulty: "easy",
      gridSize: 5,
      timeLimit: 130,
      hints: 3,
      moveTarget: 9,
      path: [
        [0, 2],
        [1, 2],
        [2, 2],
        [2, 3],
        [2, 4],
        [3, 4],
        [4, 4],
      ],
      blocked: [
        [0, 0],
        [1, 1],
        [3, 2],
        [4, 1],
      ],
      extras: [
        extra([0, 4], "dead-end", 270),
        extra([1, 0], "corner", 180),
        extra([2, 0], "valve", 0),
        extra([3, 0], "cross"),
        extra([4, 2], "t", 180),
      ],
    },
    {
      id: "easy-3",
      name: "Ledeni Most",
      briefing: "Prevedi tok preko sredine table i izvuci ga do gornjeg izlaza.",
      difficulty: "easy",
      gridSize: 5,
      timeLimit: 128,
      hints: 3,
      moveTarget: 10,
      path: [
        [4, 0],
        [3, 0],
        [2, 0],
        [2, 1],
        [2, 2],
        [1, 2],
        [1, 3],
        [1, 4],
      ],
      blocked: [
        [0, 1],
        [0, 3],
        [3, 2],
        [4, 3],
      ],
      extras: [
        extra([0, 4], "dead-end", 180),
        extra([1, 0], "t", 180),
        extra([2, 4], "dead-end", 90),
        extra([3, 4], "valve", 0),
        extra([4, 1], "corner", 270),
      ],
    },
    {
      id: "easy-4",
      name: "Bocni Kolektor",
      briefing: "Sakupi plavi tok sa leve strane i prosledi ga u desni terminal.",
      difficulty: "easy",
      gridSize: 5,
      timeLimit: 122,
      hints: 3,
      moveTarget: 11,
      path: [
        [0, 0],
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 2],
        [3, 2],
        [3, 3],
        [3, 4],
        [4, 4],
      ],
      blocked: [
        [0, 3],
        [1, 4],
        [2, 0],
        [4, 1],
      ],
      extras: [
        extra([0, 1], "valve", 90),
        extra([0, 2], "corner", 180),
        extra([2, 3], "t", 0),
        extra([2, 4], "dead-end", 270),
        extra([4, 2], "straight", 90),
      ],
    },
    {
      id: "easy-5",
      name: "Plava Komora",
      briefing: "Provedi energiju kroz komoru i podigni je do gornjeg izlaza.",
      difficulty: "easy",
      gridSize: 5,
      timeLimit: 118,
      hints: 3,
      moveTarget: 12,
      path: [
        [4, 0],
        [4, 1],
        [3, 1],
        [2, 1],
        [2, 2],
        [2, 3],
        [1, 3],
        [0, 3],
        [0, 4],
      ],
      blocked: [
        [0, 0],
        [1, 1],
        [1, 4],
        [3, 3],
        [4, 3],
      ],
      extras: [
        extra([0, 2], "straight", 90),
        extra([1, 2], "t", 180),
        extra([2, 4], "dead-end", 180),
        extra([3, 0], "corner", 0),
        extra([3, 2], "valve", 0),
      ],
    },
    {
      id: "easy-6",
      name: "Neonski Kanal",
      briefing: "Savij tok kroz središnji kanal i izbaci ga u donji desni terminal.",
      difficulty: "easy",
      gridSize: 5,
      timeLimit: 112,
      hints: 3,
      moveTarget: 12,
      path: [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
        [2, 3],
        [3, 3],
        [4, 3],
        [4, 4],
      ],
      blocked: [
        [0, 3],
        [1, 4],
        [3, 1],
        [4, 1],
      ],
      extras: [
        extra([0, 2], "valve", 90),
        extra([1, 0], "corner", 180),
        extra([1, 3], "dead-end", 180),
        extra([3, 0], "straight", 90),
        extra([3, 4], "t", 180),
      ],
    },
    {
      id: "easy-6a",
      name: "Servisni Most",
      briefing: "Podigni tok iz donjeg ulaza, premosti sredinu i izbaci ga kroz gornji desni modul.",
      difficulty: "easy",
      gridSize: 5,
      timeLimit: 108,
      hints: 3,
      moveTarget: 13,
      path: [
        [4, 0],
        [3, 0],
        [3, 1],
        [3, 2],
        [2, 2],
        [1, 2],
        [1, 3],
        [1, 4],
        [0, 4],
      ],
      blocked: [
        [0, 1],
        [0, 3],
        [2, 0],
        [4, 2],
      ],
      extras: [
        extra([0, 0], "dead-end", 180),
        extra([2, 1], "corner", 270),
        extra([2, 4], "valve", 90),
        extra([4, 3], "t", 180),
        extra([4, 4], "straight", 90),
      ],
    },
    {
      id: "easy-6b",
      name: "Rezervni Kolektor",
      briefing: "Prevedi tok preko gornjeg prilaza i spusti ga u donji desni kolektor bez pogrešnog skretanja.",
      difficulty: "easy",
      gridSize: 5,
      timeLimit: 104,
      hints: 3,
      moveTarget: 14,
      path: [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
        [2, 3],
        [3, 3],
        [4, 3],
        [4, 4],
      ],
      blocked: [
        [0, 3],
        [1, 4],
        [3, 1],
        [4, 1],
      ],
      extras: [
        extra([0, 4], "dead-end", 180),
        extra([1, 0], "valve", 90),
        extra([1, 2], "corner", 0),
        extra([3, 0], "straight", 90),
        extra([3, 4], "t", 180),
      ],
    },
    {
      id: "easy-6c",
      name: "Povratni Krak",
      briefing: "Povuci tok kroz lijevi servisni stub, pa ga vrati preko gornjeg mosta do desnog izlaza.",
      difficulty: "easy",
      scrambleProfileIndex: 5,
      gridSize: 5,
      timeLimit: 100,
      hints: 3,
      moveTarget: 14,
      path: [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [3, 1],
        [3, 2],
        [3, 3],
        [2, 3],
        [1, 3],
        [1, 4],
      ],
      blocked: [
        [0, 3],
        [2, 0],
        [2, 4],
        [4, 1],
      ],
      extras: [
        extra([0, 2], "valve", 90),
        extra([1, 0], "dead-end", 180),
        extra([2, 2], "corner", 0),
        extra([4, 2], "t", 180),
        extra([4, 4], "straight", 90),
      ],
    },
    {
      id: "easy-6d",
      name: "Servisna Komora",
      briefing: "Spusti signal iz gornjeg lijevog ugla, provuci ga kroz komoru i zatvori donji izlaz.",
      difficulty: "easy",
      scrambleProfileIndex: 6,
      gridSize: 5,
      timeLimit: 96,
      hints: 2,
      moveTarget: 14,
      path: [
        [4, 4],
        [3, 4],
        [2, 4],
        [2, 3],
        [2, 2],
        [1, 2],
        [0, 2],
        [0, 1],
        [0, 0],
      ],
      blocked: [
        [1, 4],
        [3, 1],
        [4, 1],
        [4, 3],
      ],
      extras: [
        extra([1, 0], "corner", 180),
        extra([1, 3], "valve", 0),
        extra([2, 0], "t", 90),
        extra([3, 2], "dead-end", 270),
        extra([4, 0], "straight", 90),
      ],
    },
    {
      id: "easy-6e",
      name: "Mrezni Filter",
      briefing: "Podigni tok kroz srednji filter i izbaci ga u donji desni kolektor bez rasipanja.",
      difficulty: "easy",
      scrambleProfileIndex: 6,
      gridSize: 5,
      timeLimit: 92,
      hints: 2,
      moveTarget: 15,
      path: [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
        [2, 2],
        [3, 2],
        [4, 2],
        [4, 3],
        [4, 4],
      ],
      blocked: [
        [0, 3],
        [1, 4],
        [3, 0],
        [3, 4],
      ],
      extras: [
        extra([0, 1], "valve", 90),
        extra([1, 2], "corner", 180),
        extra([1, 3], "dead-end", 180),
        extra([3, 1], "straight", 90),
        extra([0, 4], "t", 180),
      ],
    },
    {
      id: "easy-7",
      name: "Gornji Bypass",
      briefing: "Podigni tok lijevim stubom, prebaci ga preko sredine i završi desnim izlazom.",
      difficulty: "easy",
      isBoss: true,
      background: "/assets/backgrounds/bg-easy-lab.png",
      gridSize: 5,
      timeLimit: 104,
      hints: 1,
      moveTarget: 14,
      powerUps: {
        boost: 1,
        stabilizer: 0,
      },
      path: [
        [4, 0],
        [3, 0],
        [2, 0],
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 2],
        [3, 2],
        [3, 3],
        [3, 4],
      ],
      blocked: [
        [0, 1],
        [0, 4],
        [2, 4],
        [4, 2],
      ],
      extras: [
        extra([0, 0], "dead-end", 180),
        extra([1, 4], "corner", 180),
        extra([2, 3], "valve", 0),
        extra([4, 1], "t", 90),
        extra([4, 4], "straight", 90),
      ],
      specials: [
        special([1, 2], {
          modifier: "locked",
          unlockAfterMoves: 4,
        }),
        special([3, 2], {
          modifier: "damaged",
          damagePenalty: 3,
        }),
      ],
      bossEvent: {
        type: "pressure-surge",
        interval: 14,
        timePenalty: 3,
        label: "Pritisni talas",
      },
      bossProfile: {
        id: "aegis",
        title: "Aegis Pulse",
        codename: "PRESSURE CORE",
        threat: "Svaki talas krade vrijeme i tjera te da zatvaraš rutu bez praznih poteza.",
        signature: "Ovo je uvodni boss koji kažnjava spor tempo i loše čitanje glavne linije.",
        phaseLabel: "Surge analiza",
      },
    },
  ],
  medium: [
    {
      id: "medium-1",
      name: "Pritisna Petlja",
      briefing: "Proslijedi rashladni tok uz donju liniju, pa ga vrati do krajnjeg priključka.",
      difficulty: "medium",
      gridSize: 6,
      timeLimit: 110,
      hints: 2,
      moveTarget: 12,
      path: [
        [5, 0],
        [5, 1],
        [5, 2],
        [4, 2],
        [3, 2],
        [3, 3],
        [3, 4],
        [4, 4],
        [5, 4],
        [5, 5],
      ],
      blocked: [
        [0, 2],
        [1, 0],
        [2, 3],
        [3, 5],
        [4, 1],
      ],
      extras: [
        extra([0, 1], "corner", 0),
        extra([0, 4], "dead-end", 180),
        extra([1, 3], "valve", 0),
        extra([1, 4], "corner", 90),
        extra([2, 1], "cross"),
        extra([4, 5], "t", 180),
      ],
    },
    {
      id: "medium-2",
      name: "Kaskadno Skretanje",
      briefing: "Spusti neon tok sredinom table, pa ga vrati u donji povratni kanal.",
      difficulty: "medium",
      gridSize: 6,
      timeLimit: 104,
      hints: 2,
      moveTarget: 13,
      path: [
        [1, 0],
        [1, 1],
        [1, 2],
        [2, 2],
        [3, 2],
        [3, 3],
        [3, 4],
        [4, 4],
        [5, 4],
        [5, 3],
        [5, 2],
        [5, 1],
      ],
      blocked: [
        [0, 2],
        [1, 5],
        [3, 1],
        [4, 2],
        [5, 0],
      ],
      extras: [
        extra([0, 1], "t", 0),
        extra([0, 4], "corner", 90),
        extra([2, 4], "cross"),
        extra([2, 5], "dead-end", 180),
        extra([4, 0], "valve", 90),
        extra([4, 5], "straight", 90),
      ],
    },
    {
      id: "medium-3",
      name: "Termalni Luk",
      briefing: "Prevedi toplotni impuls od gornjeg ulaza do donjeg kolektora kroz uski prolaz.",
      difficulty: "medium",
      gridSize: 6,
      timeLimit: 100,
      hints: 2,
      moveTarget: 14,
      path: [
        [0, 5],
        [1, 5],
        [2, 5],
        [2, 4],
        [2, 3],
        [1, 3],
        [1, 2],
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1],
        [5, 1],
      ],
      blocked: [
        [0, 0],
        [0, 3],
        [2, 0],
        [3, 3],
        [4, 4],
        [5, 4],
      ],
      extras: [
        extra([0, 1], "corner", 180),
        extra([1, 0], "dead-end", 90),
        extra([3, 5], "valve", 0),
        extra([4, 2], "t", 270),
        extra([5, 5], "cross"),
      ],
    },
    {
      id: "medium-4",
      name: "Plavi Obilazak",
      briefing: "Zaobiđi blokiranu zonu i vrati tok kroz desni zavoj do poslednje stanice.",
      difficulty: "medium",
      gridSize: 6,
      timeLimit: 96,
      hints: 2,
      moveTarget: 15,
      path: [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
        [2, 3],
        [3, 3],
        [4, 3],
        [4, 4],
        [4, 5],
        [5, 5],
      ],
      blocked: [
        [0, 4],
        [1, 4],
        [3, 0],
        [3, 5],
        [5, 1],
      ],
      extras: [
        extra([1, 0], "valve", 90),
        extra([1, 2], "corner", 0),
        extra([1, 5], "dead-end", 270),
        extra([3, 2], "t", 90),
        extra([5, 3], "straight", 0),
        extra([5, 4], "corner", 270),
      ],
    },
    {
      id: "medium-5",
      name: "Turbinski Hodnik",
      briefing: "Povedi tok kroz lijevi hodnik, pa ga prebaci u desni izlazni kanal.",
      difficulty: "medium",
      gridSize: 6,
      timeLimit: 92,
      hints: 2,
      moveTarget: 16,
      path: [
        [5, 0],
        [4, 0],
        [3, 0],
        [3, 1],
        [3, 2],
        [2, 2],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 4],
        [3, 4],
        [3, 5],
      ],
      blocked: [
        [0, 1],
        [0, 4],
        [2, 0],
        [4, 3],
        [5, 3],
      ],
      extras: [
        extra([0, 2], "t", 180),
        extra([0, 5], "dead-end", 180),
        extra([2, 5], "corner", 180),
        extra([4, 1], "valve", 0),
        extra([4, 5], "straight", 90),
        extra([5, 1], "cross"),
      ],
    },
    {
      id: "medium-6",
      name: "Sifonski Koridor",
      briefing: "Spusti signal kroz gornji prilaz, prevezi ga preko dna i vrati ga u desni kolektor.",
      difficulty: "medium",
      gridSize: 6,
      timeLimit: 88,
      hints: 2,
      moveTarget: 17,
      path: [
        [0, 5],
        [1, 5],
        [1, 4],
        [1, 3],
        [2, 3],
        [3, 3],
        [3, 2],
        [3, 1],
        [4, 1],
        [5, 1],
        [5, 2],
        [5, 3],
        [4, 3],
        [4, 4],
        [4, 5],
      ],
      blocked: [
        [0, 1],
        [0, 3],
        [1, 1],
        [2, 0],
        [2, 5],
        [5, 5],
      ],
      extras: [
        extra([0, 0], "corner", 90),
        extra([0, 2], "dead-end", 180),
        extra([1, 0], "valve", 90),
        extra([2, 2], "t", 180),
        extra([3, 0], "cross"),
        extra([5, 0], "straight", 0),
        extra([5, 4], "corner", 270),
      ],
      specials: [
        special([2, 2], {
          modifier: "auto",
        }),
        special([4, 3], {
          modifier: "damaged",
          damagePenalty: 4,
        }),
      ],
    },
    {
      id: "medium-6a",
      name: "Relejna Komora",
      briefing: "Podigni tok kroz lijevi servisni zid, provuci ga preko jezgra i zatvori izlaz u donjem desnom kanalu.",
      difficulty: "medium",
      gridSize: 6,
      timeLimit: 86,
      hints: 2,
      moveTarget: 18,
      path: [
        [5, 0],
        [4, 0],
        [3, 0],
        [3, 1],
        [3, 2],
        [2, 2],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [4, 5],
        [5, 5],
      ],
      blocked: [
        [0, 1],
        [0, 4],
        [2, 0],
        [2, 5],
        [4, 2],
        [5, 2],
      ],
      extras: [
        extra([0, 0], "dead-end", 180),
        extra([0, 2], "corner", 90),
        extra([1, 0], "valve", 90),
        extra([2, 3], "t", 180),
        extra([3, 5], "corner", 180),
        extra([5, 3], "cross"),
        extra([5, 4], "straight", 0),
      ],
    },
    {
      id: "medium-6b",
      name: "Bypass Matrica",
      briefing: "Siđi iz gornjeg desnog ulaza, zaobiđi centralne blokade i vrati tok u lijevi završni priključak.",
      difficulty: "medium",
      gridSize: 6,
      timeLimit: 84,
      hints: 2,
      moveTarget: 19,
      path: [
        [0, 5],
        [1, 5],
        [2, 5],
        [2, 4],
        [2, 3],
        [3, 3],
        [4, 3],
        [4, 2],
        [4, 1],
        [3, 1],
        [2, 1],
        [1, 1],
        [1, 0],
      ],
      blocked: [
        [0, 1],
        [0, 3],
        [1, 3],
        [3, 5],
        [5, 1],
        [5, 4],
      ],
      extras: [
        extra([0, 0], "corner", 0),
        extra([0, 4], "dead-end", 180),
        extra([1, 2], "valve", 0),
        extra([3, 0], "straight", 90),
        extra([3, 2], "cross"),
        extra([4, 5], "t", 180),
        extra([5, 3], "corner", 270),
      ],
    },
    {
      id: "medium-6c",
      name: "Povratni Most",
      briefing: "Povezi ulaz sa gornje lijeve strane, spusti tok kroz srednji most i zakljucaj desni izlaz.",
      difficulty: "medium",
      scrambleProfileIndex: 5,
      gridSize: 6,
      timeLimit: 80,
      hints: 2,
      moveTarget: 18,
      powerUps: {
        boost: 1,
        stabilizer: 0,
      },
      path: [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
        [2, 3],
        [3, 3],
        [4, 3],
        [4, 4],
        [4, 5],
        [5, 5],
      ],
      blocked: [
        [0, 4],
        [1, 5],
        [3, 1],
        [3, 5],
        [5, 1],
      ],
      extras: [
        extra([0, 2], "valve", 90),
        extra([0, 5], "dead-end", 180),
        extra([1, 3], "corner", 90),
        extra([2, 5], "straight", 90),
        extra([4, 1], "t", 90),
        extra([5, 3], "cross"),
      ],
      specials: [
        special([3, 3], {
          modifier: "damaged",
          damagePenalty: 3,
        }),
      ],
    },
    {
      id: "medium-6d",
      name: "Rotorna Veza",
      briefing: "Proguraj tok kroz donju magistralu, uhvati srednji rotor i izvuci ga u gornji desni izlaz.",
      difficulty: "medium",
      scrambleProfileIndex: 6,
      gridSize: 6,
      timeLimit: 76,
      hints: 1,
      moveTarget: 19,
      powerUps: {
        boost: 1,
        stabilizer: 0,
      },
      path: [
        [5, 0],
        [5, 1],
        [5, 2],
        [4, 2],
        [3, 2],
        [2, 2],
        [2, 3],
        [2, 4],
        [1, 4],
        [0, 4],
        [0, 5],
      ],
      blocked: [
        [0, 1],
        [1, 1],
        [3, 0],
        [3, 4],
        [4, 5],
        [5, 4],
      ],
      extras: [
        extra([0, 2], "corner", 0),
        extra([1, 0], "valve", 90),
        extra([1, 3], "t", 180),
        extra([2, 0], "dead-end", 90),
        extra([4, 0], "cross"),
        extra([4, 4], "corner", 180),
      ],
      specials: [
        special([3, 2], {
          modifier: "auto",
        }),
        special([1, 4], {
          modifier: "locked",
          unlockAfterMoves: 3,
        }),
      ],
    },
    {
      id: "medium-6e",
      name: "Sigurnosni Razvod",
      briefing: "Spusti impuls iz gornjeg desnog kraka, zaobidji sigurnosnu zonu i vrati tok u lijevi zavrsni vod.",
      difficulty: "medium",
      scrambleProfileIndex: 6,
      gridSize: 6,
      timeLimit: 72,
      hints: 1,
      moveTarget: 20,
      powerUps: {
        boost: 0,
        stabilizer: 0,
      },
      path: [
        [5, 5],
        [4, 5],
        [3, 5],
        [3, 4],
        [3, 3],
        [2, 3],
        [1, 3],
        [1, 2],
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1],
        [4, 0],
      ],
      blocked: [
        [0, 1],
        [0, 4],
        [2, 0],
        [2, 5],
        [5, 1],
        [5, 4],
      ],
      extras: [
        extra([0, 0], "dead-end", 180),
        extra([0, 3], "corner", 90),
        extra([1, 5], "valve", 90),
        extra([2, 2], "t", 180),
        extra([4, 3], "cross"),
        extra([5, 0], "straight", 0),
        extra([5, 3], "corner", 270),
      ],
      specials: [
        special([3, 4], {
          modifier: "auto",
        }),
        special([1, 2], {
          modifier: "damaged",
          damagePenalty: 4,
        }),
      ],
    },
    {
      id: "medium-7",
      name: "Delta Razvod",
      briefing: "Podigni tok iz donjeg levog ulaza i provuci ga kroz desni distributivni krak.",
      difficulty: "medium",
      isBoss: true,
      background: "/assets/backgrounds/bg-medium-factory.png",
      gridSize: 6,
      timeLimit: 84,
      hints: 1,
      moveTarget: 18,
      powerUps: {
        boost: 0,
        stabilizer: 0,
      },
      path: [
        [5, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [3, 2],
        [2, 2],
        [2, 3],
        [2, 4],
        [1, 4],
        [0, 4],
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
      ],
      blocked: [
        [0, 1],
        [1, 1],
        [1, 3],
        [3, 0],
        [4, 4],
        [5, 3],
      ],
      extras: [
        extra([0, 2], "corner", 0),
        extra([1, 0], "valve", 0),
        extra([2, 0], "dead-end", 90),
        extra([3, 3], "t", 90),
        extra([4, 5], "straight", 90),
        extra([5, 1], "cross"),
        extra([5, 4], "corner", 270),
      ],
      specials: [
        special([2, 4], {
          modifier: "locked",
          unlockAfterMoves: 5,
        }),
        special([3, 3], {
          modifier: "auto",
        }),
        special([2, 5], {
          modifier: "damaged",
          damagePenalty: 4,
        }),
      ],
      bossEvent: {
        type: "rotor-wave",
        interval: 13,
        label: "Rotor talas",
      },
      bossProfile: {
        id: "gyro",
        title: "Gyro Phantom",
        codename: "ROTOR SWARM",
        threat: "Rotor talasi pomjeraju kritične segmente i remete stabilan ritam rješavanja.",
        signature: "Srednji boss tjera igrača da predvidi pomjeranje table i da ostavi rezervni plan.",
        phaseLabel: "Rotor analiza",
      },
    },
  ],
  hard: [
    {
      id: "hard-1",
      name: "Kvantni Relej",
      briefing: "Spoji dugi relejni lanac prije nego što jezgro izgubi stabilnost.",
      difficulty: "hard",
      gridSize: 7,
      timeLimit: 90,
      hints: 1,
      moveTarget: 18,
      path: [
        [0, 0],
        [1, 0],
        [2, 0],
        [2, 1],
        [2, 2],
        [3, 2],
        [4, 2],
        [4, 3],
        [4, 4],
        [3, 4],
        [2, 4],
        [2, 5],
        [2, 6],
      ],
      blocked: [
        [0, 3],
        [1, 2],
        [1, 5],
        [3, 0],
        [3, 6],
        [5, 1],
        [5, 5],
        [6, 3],
      ],
      extras: [
        extra([0, 1], "valve", 90),
        extra([0, 5], "dead-end", 180),
        extra([1, 4], "corner", 90),
        extra([3, 1], "t", 0),
        extra([4, 6], "corner", 180),
        extra([5, 3], "straight", 0),
        extra([6, 1], "cross"),
        extra([6, 5], "t", 270),
      ],
    },
    {
      id: "hard-2",
      name: "Jezgreni Lavirint",
      briefing: "Spusti tok kroz donji sektor i vrati ga u desni relejni izlaz.",
      difficulty: "hard",
      gridSize: 7,
      timeLimit: 88,
      hints: 1,
      moveTarget: 19,
      path: [
        [6, 0],
        [5, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [3, 2],
        [2, 2],
        [2, 3],
        [2, 4],
        [3, 4],
        [4, 4],
        [5, 4],
        [5, 5],
        [5, 6],
      ],
      blocked: [
        [0, 2],
        [0, 5],
        [1, 1],
        [1, 6],
        [3, 0],
        [3, 6],
        [6, 2],
        [6, 4],
      ],
      extras: [
        extra([0, 0], "dead-end", 90),
        extra([0, 4], "corner", 180),
        extra([2, 1], "valve", 90),
        extra([2, 5], "cross"),
        extra([4, 6], "t", 180),
        extra([5, 2], "corner", 0),
        extra([6, 6], "straight", 90),
        extra([6, 1], "t", 90),
      ],
    },
    {
      id: "hard-3",
      name: "Duboki Prekidac",
      briefing: "Usmeri impuls sa gornje ivice kroz centralni stub do levog donjeg kolektora.",
      difficulty: "hard",
      gridSize: 7,
      timeLimit: 86,
      hints: 1,
      moveTarget: 20,
      path: [
        [0, 6],
        [1, 6],
        [2, 6],
        [2, 5],
        [2, 4],
        [1, 4],
        [0, 4],
        [0, 3],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [4, 1],
        [4, 0],
      ],
      blocked: [
        [0, 0],
        [1, 0],
        [1, 3],
        [2, 0],
        [3, 4],
        [5, 1],
        [5, 4],
        [6, 6],
      ],
      extras: [
        extra([0, 1], "valve", 0),
        extra([1, 5], "corner", 180),
        extra([2, 3], "t", 90),
        extra([3, 6], "dead-end", 270),
        extra([4, 4], "cross"),
        extra([5, 6], "straight", 0),
        extra([6, 2], "corner", 90),
        extra([6, 4], "valve", 90),
      ],
    },
    {
      id: "hard-4",
      name: "Omega Magistrala",
      briefing: "Sprovedi energiju iz gornjeg levog sektora do izlaza u donjem desnom luku.",
      difficulty: "hard",
      gridSize: 7,
      timeLimit: 82,
      hints: 1,
      moveTarget: 21,
      path: [
        [6, 6],
        [6, 5],
        [5, 5],
        [4, 5],
        [4, 4],
        [4, 3],
        [3, 3],
        [2, 3],
        [2, 2],
        [2, 1],
        [1, 1],
        [0, 1],
        [0, 0],
      ],
      blocked: [
        [0, 3],
        [1, 5],
        [2, 5],
        [3, 0],
        [3, 6],
        [5, 1],
        [5, 3],
        [6, 1],
      ],
      extras: [
        extra([0, 6], "dead-end", 180),
        extra([1, 3], "corner", 90),
        extra([2, 0], "valve", 90),
        extra([2, 6], "straight", 0),
        extra([4, 1], "t", 180),
        extra([4, 6], "cross"),
        extra([5, 6], "dead-end", 270),
        extra([6, 4], "valve", 0),
      ],
    },
    {
      id: "hard-5",
      name: "Završni tok",
      briefing: "Poveži glavni tok kroz više preloma i održi mrežu aktivnom do poslednjeg izlaza.",
      difficulty: "hard",
      gridSize: 7,
      timeLimit: 78,
      hints: 1,
      moveTarget: 23,
      path: [
        [3, 0],
        [3, 1],
        [2, 1],
        [1, 1],
        [1, 2],
        [1, 3],
        [2, 3],
        [3, 3],
        [4, 3],
        [5, 3],
        [5, 4],
        [5, 5],
        [4, 5],
        [3, 5],
        [2, 5],
        [1, 5],
        [0, 5],
      ],
      blocked: [
        [0, 0],
        [0, 2],
        [0, 6],
        [2, 0],
        [2, 4],
        [4, 1],
        [4, 6],
        [6, 2],
        [6, 6],
      ],
      extras: [
        extra([1, 0], "dead-end", 90),
        extra([1, 4], "valve", 0),
        extra([2, 6], "corner", 180),
        extra([3, 2], "cross"),
        extra([3, 6], "dead-end", 270),
        extra([4, 4], "t", 90),
        extra([5, 1], "corner", 0),
        extra([6, 4], "valve", 90),
      ],
    },
    {
      id: "hard-6",
      name: "Prizma Magistrala",
      briefing: "Vodi impuls kroz centralne vertikale, pa ga lansiraj u gornji izlaz bez gubitka pritiska.",
      difficulty: "hard",
      gridSize: 7,
      timeLimit: 74,
      hints: 1,
      moveTarget: 24,
      path: [
        [6, 0],
        [5, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [3, 2],
        [2, 2],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 4],
        [3, 4],
        [3, 5],
        [3, 6],
        [2, 6],
        [1, 6],
        [0, 6],
      ],
      blocked: [
        [0, 1],
        [0, 4],
        [1, 0],
        [2, 0],
        [2, 5],
        [4, 4],
        [5, 2],
        [5, 5],
        [6, 3],
      ],
      extras: [
        extra([0, 2], "t", 180),
        extra([0, 5], "dead-end", 180),
        extra([1, 5], "corner", 90),
        extra([3, 1], "valve", 0),
        extra([4, 6], "corner", 180),
        extra([5, 3], "cross"),
        extra([6, 1], "dead-end", 0),
        extra([6, 5], "t", 270),
      ],
      specials: [
        special([3, 4], {
          modifier: "auto",
        }),
        special([1, 3], {
          modifier: "damaged",
          damagePenalty: 5,
        }),
      ],
    },
    {
      id: "hard-6a",
      name: "Vektorski Prsten",
      briefing: "Izvuci tok iz donjeg lijevog sektora, provuci ga kroz gornji prsten i zatvori desni izlaz bez praznog hoda.",
      difficulty: "hard",
      gridSize: 7,
      timeLimit: 72,
      hints: 1,
      moveTarget: 25,
      path: [
        [6, 0],
        [5, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [3, 2],
        [2, 2],
        [1, 2],
        [1, 3],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
        [5, 4],
        [5, 5],
        [5, 6],
        [4, 6],
      ],
      blocked: [
        [0, 1],
        [0, 5],
        [1, 0],
        [2, 0],
        [2, 5],
        [3, 0],
        [3, 6],
        [6, 2],
        [6, 5],
      ],
      extras: [
        extra([0, 2], "dead-end", 180),
        extra([0, 4], "valve", 90),
        extra([1, 6], "straight", 90),
        extra([2, 3], "cross"),
        extra([3, 1], "t", 90),
        extra([4, 5], "corner", 180),
        extra([5, 2], "valve", 0),
        extra([6, 4], "t", 270),
      ],
    },
    {
      id: "hard-6b",
      name: "Prelomni Reaktor",
      briefing: "Spusti impuls iz gornjeg desnog ulaza, slomi ga kroz sredinu i vrati do završnog lijevog kolektora.",
      difficulty: "hard",
      gridSize: 7,
      timeLimit: 66,
      hints: 1,
      moveTarget: 25,
      powerUps: {
        boost: 0,
        stabilizer: 1,
      },
      path: [
        [0, 6],
        [1, 6],
        [2, 6],
        [2, 5],
        [2, 4],
        [1, 4],
        [0, 4],
        [0, 3],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [4, 1],
        [4, 0],
        [5, 0],
        [6, 0],
      ],
      blocked: [
        [0, 0],
        [1, 0],
        [1, 5],
        [2, 0],
        [3, 4],
        [4, 4],
        [5, 2],
        [5, 5],
        [6, 3],
      ],
      extras: [
        extra([0, 1], "valve", 0),
        extra([1, 3], "corner", 90),
        extra([2, 3], "t", 180),
        extra([3, 0], "dead-end", 90),
        extra([3, 6], "straight", 90),
        extra([5, 4], "cross"),
        extra([6, 2], "corner", 0),
        extra([6, 6], "valve", 90),
      ],
    },
    {
      id: "hard-6c",
      name: "Slojni Difuzor",
      briefing: "Prevedi tok kroz donji prsten, povuci ga preko jezgra i zakljucaj gornji izlaz prije pada pritiska.",
      difficulty: "hard",
      scrambleProfileIndex: 6,
      gridSize: 7,
      timeLimit: 62,
      hints: 1,
      moveTarget: 26,
      powerUps: {
        boost: 0,
        stabilizer: 1,
      },
      path: [
        [6, 0],
        [5, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [5, 2],
        [6, 2],
        [6, 3],
        [6, 4],
        [5, 4],
        [4, 4],
        [3, 4],
        [2, 4],
        [2, 3],
        [2, 2],
        [1, 2],
        [0, 2],
        [0, 3],
        [0, 4],
      ],
      blocked: [
        [0, 0],
        [0, 1],
        [0, 6],
        [1, 0],
        [1, 6],
        [2, 0],
        [2, 6],
        [3, 1],
        [3, 6],
        [5, 3],
        [5, 5],
      ],
      extras: [
        extra([1, 1], "dead-end", 180),
        extra([1, 3], "t", 180),
        extra([1, 4], "corner", 90),
        extra([2, 1], "valve", 0),
        extra([3, 0], "corner", 0),
        extra([3, 2], "cross"),
        extra([4, 6], "dead-end", 270),
        extra([5, 1], "t", 90),
        extra([6, 1], "straight", 0),
        extra([6, 5], "valve", 90),
      ],
      specials: [
        special([4, 4], {
          modifier: "locked",
          unlockAfterMoves: 6,
        }),
        special([2, 4], {
          modifier: "auto",
        }),
        special([6, 3], {
          modifier: "damaged",
          damagePenalty: 6,
        }),
      ],
    },
    {
      id: "hard-6d",
      name: "Relejni Tjesnac",
      briefing: "Stabilizuj gornji prsten, spusti ga kroz uski relejni prolaz i zatvori finalni izlaz na desnom dnu.",
      difficulty: "hard",
      scrambleProfileIndex: 7,
      gridSize: 7,
      timeLimit: 58,
      hints: 1,
      moveTarget: 27,
      powerUps: {
        boost: 0,
        stabilizer: 0,
      },
      path: [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
        [2, 3],
        [1, 3],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [4, 4],
        [4, 3],
        [5, 3],
        [6, 3],
        [6, 4],
        [6, 5],
        [6, 6],
      ],
      blocked: [
        [1, 0],
        [1, 6],
        [2, 0],
        [2, 6],
        [3, 1],
        [3, 3],
        [3, 6],
        [5, 1],
        [5, 5],
        [6, 1],
      ],
      extras: [
        extra([0, 2], "valve", 90),
        extra([0, 6], "dead-end", 180),
        extra([1, 2], "corner", 180),
        extra([1, 4], "t", 90),
        extra([2, 4], "cross"),
        extra([3, 0], "corner", 0),
        extra([3, 4], "valve", 0),
        extra([4, 1], "dead-end", 270),
        extra([5, 4], "corner", 90),
        extra([6, 2], "straight", 0),
      ],
      specials: [
        special([2, 3], {
          modifier: "locked",
          unlockAfterMoves: 6,
        }),
        special([4, 5], {
          modifier: "auto",
        }),
        special([6, 3], {
          modifier: "damaged",
          damagePenalty: 6,
        }),
        special([0, 5], {
          modifier: "locked",
          unlockAfterMoves: 8,
        }),
      ],
    },
    {
      id: "hard-7",
      name: "Hiper Jezgro",
      briefing: "Stabilizuj dugi prsten jezgra i dovrsi finalni lanac do krajnjeg desnog izlaza.",
      difficulty: "hard",
      scrambleProfileIndex: 7,
      isBoss: true,
      background: "/assets/backgrounds/bg-hard-reactor.png",
      gridSize: 7,
      timeLimit: 56,
      hints: 0,
      moveTarget: 25,
      powerUps: {
        boost: 0,
        stabilizer: 0,
      },
      path: [
        [0, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [2, 2],
        [2, 3],
        [1, 3],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [4, 4],
        [4, 3],
        [5, 3],
        [6, 3],
        [6, 4],
        [6, 5],
        [6, 6],
      ],
      blocked: [
        [1, 0],
        [1, 6],
        [2, 0],
        [2, 6],
        [3, 1],
        [3, 3],
        [3, 6],
        [5, 1],
        [5, 5],
        [6, 1],
      ],
      extras: [
        extra([0, 2], "valve", 90),
        extra([0, 6], "dead-end", 180),
        extra([1, 2], "corner", 180),
        extra([1, 4], "t", 90),
        extra([2, 4], "cross"),
        extra([3, 0], "corner", 0),
        extra([3, 4], "valve", 0),
        extra([4, 1], "dead-end", 270),
        extra([5, 4], "corner", 90),
        extra([6, 2], "straight", 0),
      ],
      specials: [
        special([2, 3], {
          modifier: "locked",
          unlockAfterMoves: 6,
        }),
        special([4, 5], {
          modifier: "auto",
        }),
        special([6, 3], {
          modifier: "damaged",
          damagePenalty: 6,
        }),
        special([0, 5], {
          modifier: "locked",
          unlockAfterMoves: 8,
        }),
        special([2, 5], {
          modifier: "damaged",
          damagePenalty: 7,
        }),
      ],
      bossEvent: {
        type: "lockdown",
        interval: 12,
        lockDurationMoves: 5,
        label: "Hiper zaključavanje",
      },
      bossProfile: {
        id: "warden",
        title: "Lockwyrm Core",
        codename: "LOCKDOWN WARDEN",
        threat: "Zaključava najvažnije polje baš kada ruta počne da se sklapa.",
        signature: "Završni boss testira čitanje putanje, strpljenje i tačan redosled poteza.",
        phaseLabel: "Lock analiza",
      },
    },
    {
      id: "hard-8",
      name: "Ultra Hard / Singularitet",
      briefing: "Preživi završni prsten reaktora, zatvori glavni tok i izbaci ga kroz donji desni izlaz bez ijednog praznog poteza.",
      difficulty: "hard",
      isBoss: true,
      isUltra: true,
      background: "/assets/backgrounds/bg-boss-core.png",
      gridSize: 7,
      timeLimit: 46,
      hints: 0,
      moveTarget: 25,
      powerUps: {
        boost: 0,
        stabilizer: 0,
      },
      path: [
        [6, 0],
        [5, 0],
        [4, 0],
        [4, 1],
        [4, 2],
        [5, 2],
        [6, 2],
        [6, 3],
        [6, 4],
        [5, 4],
        [4, 4],
        [3, 4],
        [2, 4],
        [2, 3],
        [2, 2],
        [1, 2],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [1, 5],
        [2, 5],
        [3, 5],
        [4, 5],
        [4, 6],
        [5, 6],
        [6, 6],
      ],
      blocked: [
        [0, 0],
        [0, 1],
        [0, 6],
        [1, 0],
        [1, 6],
        [2, 0],
        [2, 6],
        [3, 1],
        [3, 3],
        [3, 6],
        [5, 3],
        [5, 5],
      ],
      extras: [
        extra([1, 1], "dead-end", 180),
        extra([1, 3], "t", 180),
        extra([1, 4], "corner", 90),
        extra([2, 1], "valve", 0),
        extra([3, 0], "corner", 0),
        extra([3, 2], "cross"),
        extra([4, 3], "dead-end", 270),
        extra([5, 1], "t", 90),
        extra([6, 1], "straight", 0),
        extra([6, 5], "valve", 90),
      ],
      specials: [
        special([4, 2], {
          modifier: "locked",
          unlockAfterMoves: 6,
        }),
        special([2, 4], {
          modifier: "auto",
        }),
        special([0, 4], {
          modifier: "damaged",
          damagePenalty: 7,
        }),
        special([4, 5], {
          modifier: "locked",
          unlockAfterMoves: 11,
        }),
        special([6, 4], {
          modifier: "damaged",
          damagePenalty: 5,
        }),
        special([1, 5], {
          modifier: "locked",
          unlockAfterMoves: 8,
        }),
        special([6, 2], {
          modifier: "auto",
        }),
        special([4, 4], {
          modifier: "damaged",
          damagePenalty: 8,
        }),
        special([2, 2], {
          modifier: "locked",
          unlockAfterMoves: 9,
        }),
        special([0, 3], {
          modifier: "damaged",
          damagePenalty: 9,
        }),
      ],
      bossEvent: {
        type: "lockdown",
        interval: 8,
        lockDurationMoves: 6,
        label: "Singularno zaključavanje",
      },
      bossProfile: {
        id: "singularity",
        title: "Reaktorski vodoinstalater",
        codename: "MAJSTOR SINGULARITET",
        threat: "Zaključava prvi kritični segment tačno kada ruta počne da se sklapa.",
        signature: "Ultra finale traži gotovo savršenu sekvencu rotacija bez savjeta i bez sigurnih poteza.",
        phaseLabel: "Bes majstora",
      },
    },

  ],
};

const dailyTemplates = [
  {
    id: "daily-core-6",
    name: "Dnevni Relej",
    briefing: "Današnji tok traži precizan prolaz kroz rotor i zaključani most.",
    difficulty: "daily",
    gridSize: 6,
    timeLimit: 94,
    hints: 1,
    moveTarget: 17,
    powerUps: {
      boost: 1,
      stabilizer: 1,
    },
    path: [
      [5, 0],
      [4, 0],
      [4, 1],
      [4, 2],
      [3, 2],
      [2, 2],
      [1, 2],
      [1, 3],
      [1, 4],
      [2, 4],
      [3, 4],
      [4, 4],
      [4, 5],
    ],
    blocked: [
      [0, 0],
      [0, 3],
      [2, 0],
      [2, 5],
      [3, 0],
      [5, 3],
    ],
    extras: [
      extra([0, 1], "corner", 0),
      extra([0, 5], "dead-end", 180),
      extra([1, 0], "valve", 90),
      extra([2, 3], "cross"),
      extra([3, 5], "t", 180),
      extra([5, 5], "straight", 90),
    ],
    specials: [
      special([1, 4], {
        modifier: "locked",
        unlockAfterMoves: 3,
      }),
      special([3, 4], {
        modifier: "auto",
      }),
      special([4, 2], {
        modifier: "damaged",
        damagePenalty: 4,
      }),
    ],
  },
  {
    id: "daily-arc-7",
    name: "Dnevni Luk",
    briefing: "Dugi dnevni luk tera te da vodis racuna o svakom zakretanju i pritisku.",
    difficulty: "daily",
    gridSize: 7,
    timeLimit: 90,
    hints: 1,
    moveTarget: 20,
    powerUps: {
      boost: 1,
      stabilizer: 1,
    },
    path: [
      [6, 0],
      [5, 0],
      [4, 0],
      [4, 1],
      [4, 2],
      [3, 2],
      [2, 2],
      [2, 3],
      [2, 4],
      [1, 4],
      [0, 4],
      [0, 5],
      [0, 6],
    ],
    blocked: [
      [0, 1],
      [1, 1],
      [1, 6],
      [3, 0],
      [3, 6],
      [5, 2],
      [5, 5],
      [6, 3],
    ],
    extras: [
      extra([0, 2], "dead-end", 180),
      extra([1, 0], "valve", 90),
      extra([1, 3], "corner", 90),
      extra([2, 6], "straight", 0),
      extra([3, 4], "t", 180),
      extra([4, 6], "corner", 180),
      extra([5, 4], "cross"),
      extra([6, 6], "valve", 0),
    ],
    specials: [
      special([2, 4], {
        modifier: "locked",
        unlockAfterMoves: 4,
      }),
      special([4, 2], {
        modifier: "auto",
      }),
      special([0, 4], {
        modifier: "damaged",
        damagePenalty: 5,
      }),
    ],
  },
  {
    id: "daily-prism-7",
    name: "Dnevna Prizma",
    briefing: "Prebaci impuls kroz prizmu i nadmudri lazne krakove pre kriticnog pritiska.",
    difficulty: "daily",
    gridSize: 7,
    timeLimit: 88,
    hints: 1,
    moveTarget: 22,
    powerUps: {
      boost: 1,
      stabilizer: 1,
    },
    path: [
      [0, 0],
      [1, 0],
      [2, 0],
      [2, 1],
      [2, 2],
      [3, 2],
      [4, 2],
      [4, 3],
      [4, 4],
      [3, 4],
      [2, 4],
      [2, 5],
      [2, 6],
      [3, 6],
      [4, 6],
      [5, 6],
      [6, 6],
    ],
    blocked: [
      [0, 2],
      [0, 5],
      [1, 2],
      [1, 5],
      [3, 0],
      [3, 5],
      [5, 1],
      [5, 4],
      [6, 2],
    ],
    extras: [
      extra([0, 4], "corner", 180),
      extra([1, 4], "valve", 90),
      extra([2, 3], "cross"),
      extra([4, 0], "dead-end", 90),
      extra([4, 5], "t", 270),
      extra([5, 3], "corner", 0),
      extra([6, 4], "straight", 0),
      extra([6, 1], "valve", 90),
    ],
    specials: [
      special([2, 5], {
        modifier: "locked",
        unlockAfterMoves: 4,
      }),
      special([4, 4], {
        modifier: "auto",
      }),
      special([3, 4], {
        modifier: "damaged",
        damagePenalty: 5,
      }),
    ],
  },
];

function normalizeRotation(rotation = 0) {
  return ((rotation % 360) + 360) % 360;
}

function rotateDirection(direction, rotation) {
  const currentIndex = DIRECTIONS.indexOf(direction);
  const steps = normalizeRotation(rotation) / 90;
  return DIRECTIONS[(currentIndex + steps) % DIRECTIONS.length];
}

function rotateConnections(type, rotation) {
  return (BASE_CONNECTIONS[type] ?? []).map((direction) =>
    rotateDirection(direction, rotation),
  );
}

function normalizeConnections(connections) {
  return [...new Set(connections)].sort(
    (left, right) => DIRECTIONS.indexOf(left) - DIRECTIONS.indexOf(right),
  );
}

function sameConnections(left, right) {
  const normalizedLeft = normalizeConnections(left);
  const normalizedRight = normalizeConnections(right);

  return normalizedLeft.join("|") === normalizedRight.join("|");
}

function toKey([row, column]) {
  return `${row}-${column}`;
}

function directionBetween([fromRow, fromColumn], [toRow, toColumn]) {
  const rowOffset = toRow - fromRow;
  const columnOffset = toColumn - fromColumn;

  for (const [direction, [expectedRowOffset, expectedColumnOffset]] of Object.entries(
    DIRECTION_VECTORS,
  )) {
    if (rowOffset === expectedRowOffset && columnOffset === expectedColumnOffset) {
      return direction;
    }
  }

  throw new Error(`Neispravna putanja izmedju ${fromRow},${fromColumn} i ${toRow},${toColumn}.`);
}

function resolveTileForConnections(connections, { isStart = false, isEnd = false } = {}) {
  const desiredConnections = normalizeConnections(connections);
  const candidateTypes = isStart
    ?["start"]
    : isEnd
      ?["end"]
      : ["straight", "corner"];

  for (const type of candidateTypes) {
    for (const rotation of [0, 90, 180, 270]) {
      if (sameConnections(rotateConnections(type, rotation), desiredConnections)) {
        return {
          type,
          correctRotation: rotation,
        };
      }
    }
  }

  throw new Error(`Nema odgovarajuceg tile-a za veze: ${desiredConnections.join(", ")}`);
}

function buildPathTile(path, index) {
  const connections = [];

  if (index > 0) {
    connections.push(directionBetween(path[index], path[index - 1]));
  }

  if (index < path.length - 1) {
    connections.push(directionBetween(path[index], path[index + 1]));
  }

  return resolveTileForConnections(connections, {
    isStart: index === 0,
    isEnd: index === path.length - 1,
  });
}

function hashString(value) {
  let hash = 0;

  for (const character of value) {
    hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  }

  return hash;
}

function getAlternativeRotations(type, correctRotation) {
  const correctConnections = normalizeConnections(
    rotateConnections(type, correctRotation),
  );

  return [0, 90, 180, 270].filter((rotation) => {
    const candidateConnections = normalizeConnections(
      rotateConnections(type, rotation),
    );

    return !sameConnections(candidateConnections, correctConnections);
  });
}

function turnsToRestore(currentRotation, correctRotation) {
  return (
    (normalizeRotation(correctRotation) - normalizeRotation(currentRotation) + 360) %
    360
  ) / 90;
}

function pickScrambledRotation(type, correctRotation, key, aggressiveTurns = false) {
  if (type === "empty" || type === "blocked" || type === "cross") {
    return correctRotation;
  }

  const alternatives = getAlternativeRotations(type, correctRotation);

  if (!alternatives.length) {
    return correctRotation;
  }

  const sortedAlternatives = [...alternatives].sort((left, right) => {
    const leftTurns = turnsToRestore(left, correctRotation);
    const rightTurns = turnsToRestore(right, correctRotation);

    if (leftTurns !== rightTurns) {
      return aggressiveTurns ?rightTurns - leftTurns : leftTurns - rightTurns;
    }

    return left - right;
  });

  const preferredPool = aggressiveTurns
    ?sortedAlternatives.slice(0, Math.min(2, sortedAlternatives.length))
    : sortedAlternatives.slice(0, 1);

  return preferredPool[hashString(key) % preferredPool.length];
}

function matchesEndpointMode(endpointMode, endpoint) {
  if (endpointMode === "both") {
    return true;
  }

  return endpointMode === endpoint;
}

function isCornerTile(type) {
  return type === "corner";
}

function shouldScramblePathTile(tileType, pathIndex, pathLength, profile) {
  if (pathIndex === 0) {
    return matchesEndpointMode(profile.endpointMode, "start");
  }

  if (pathIndex === pathLength - 1) {
    return matchesEndpointMode(profile.endpointMode, "end");
  }

  if (profile.forcePathIndices?.includes(pathIndex)) {
    return true;
  }

  if (profile.keepPathIndices?.includes(pathIndex)) {
    return false;
  }

  if (isCornerTile(tileType)) {
    return true;
  }

  return (
    profile.pathStride > 0 &&
    (pathIndex + profile.pathOffset) % profile.pathStride === 0
  );
}

function shouldScrambleExtraTile(extraIndex, profile) {
  if (profile.extraEvery <= 0) {
    return false;
  }

  return (extraIndex + profile.extraOffset) % profile.extraEvery === 0;
}

function getConnectedNeighbors(board, tile) {
  const neighbors = [];

  for (const direction of getConnections(tile)) {
    const [rowOffset, columnOffset] = DIRECTION_VECTORS[direction];
    const nextTile = board[tile.row + rowOffset]?.[tile.column + columnOffset];

    if (
      !nextTile ||
      nextTile.type === "empty" ||
      nextTile.type === "blocked" ||
      !getConnections(nextTile).includes(OPPOSITE_DIRECTION[direction])
    ) {
      continue;
    }

    neighbors.push(nextTile);
  }

  return neighbors;
}

function countSolvedPaths(board, limit = 2) {
  const startTile = board.flat().find((tile) => tile.type === "start");
  const endTile = board.flat().find((tile) => tile.type === "end");

  if (!startTile || !endTile) {
    return 0;
  }

  let total = 0;
  const visited = new Set([startTile.id]);

  function dfs(tile) {
    if (total >= limit) {
      return;
    }

    if (tile.id === endTile.id) {
      total += 1;
      return;
    }

    for (const neighbor of getConnectedNeighbors(board, tile)) {
      if (visited.has(neighbor.id)) {
        continue;
      }

      visited.add(neighbor.id);
      dfs(neighbor);
      visited.delete(neighbor.id);
    }
  }

  dfs(startTile);
  return total;
}

export function createSolvedLevel(level) {
  const solvedGrid = level.grid.map((row) =>
    row.map((currentTile) => ({
      ...currentTile,
      rotation: normalizeRotation(currentTile.correctRotation ?? currentTile.rotation),
    })),
  );

  return {
    ...level,
    grid: solvedGrid,
    layout: solvedGrid,
  };
}

function buildLevel(blueprint, levelIndex) {
  const profilesForDifficulty = SCRAMBLE_PROFILES[blueprint.difficulty] ?? [];
  const requestedProfileIndex =
    typeof blueprint.scrambleProfileIndex === "number"
      ? blueprint.scrambleProfileIndex
      : levelIndex;
  const profile =
    profilesForDifficulty[requestedProfileIndex] ??
    profilesForDifficulty[profilesForDifficulty.length - 1];
  const pathMap = new Map(blueprint.path.map((position, index) => [toKey(position), index]));
  const blockedSet = new Set((blueprint.blocked ?? []).map(toKey));
  const extrasMap = new Map((blueprint.extras ?? []).map((item) => [toKey(item.at), item]));
  const specialsMap = new Map(
    (blueprint.specials ?? []).map((item) => [toKey(item.at), item]),
  );
  const extraOrderMap = new Map(
    (blueprint.extras ?? []).map((item, extraIndex) => [toKey(item.at), extraIndex]),
  );

  const layout = [];

  for (let rowIndex = 0; rowIndex < blueprint.gridSize; rowIndex += 1) {
    const row = [];

    for (let columnIndex = 0; columnIndex < blueprint.gridSize; columnIndex += 1) {
      const key = `${rowIndex}-${columnIndex}`;
      const specialConfig = specialsMap.get(key);

      const attachSpecialData = (baseTile) => {
        if (!specialConfig) {
          return baseTile;
        }

        const { ...specialProps } = specialConfig;
        return {
          ...baseTile,
          ...specialProps,
        };
      };

      if (pathMap.has(key)) {
        const pathIndex = pathMap.get(key);
        const solvedTile = buildPathTile(blueprint.path, pathIndex);
        const initialRotation = shouldScramblePathTile(
          solvedTile.type,
          pathIndex,
          blueprint.path.length,
          profile,
        )
          ?pickScrambledRotation(
              solvedTile.type,
              solvedTile.correctRotation,
              `${blueprint.id}-${key}-path`,
              profile.aggressivePathTurns,
            )
          : solvedTile.correctRotation;

        row.push(
          attachSpecialData(
            tile(solvedTile.type, initialRotation, solvedTile.correctRotation),
          ),
        );
        continue;
      }

      if (extrasMap.has(key)) {
        const extraTile = extrasMap.get(key);
        const correctRotation = normalizeRotation(extraTile.correctRotation ?? 0);
        const initialRotation =
          extraTile.rotation !== undefined
            ? normalizeRotation(extraTile.rotation)
            : shouldScrambleExtraTile(extraOrderMap.get(key) ?? 0, profile)
              ? pickScrambledRotation(
                  extraTile.type,
                  correctRotation,
                  `${blueprint.id}-${key}-extra`,
                  profile.aggressiveExtraTurns,
                )
            : correctRotation;

        row.push(
          attachSpecialData(tile(extraTile.type, initialRotation, correctRotation)),
        );
        continue;
      }

      if (blockedSet.has(key)) {
        row.push(attachSpecialData(tile("blocked")));
        continue;
      }

      row.push(attachSpecialData(tile("empty")));
    }

    layout.push(row);
  }

  return {
    ...blueprint,
    name: blueprint.name,
    briefing: blueprint.briefing,
    bossProfile: blueprint.bossProfile
      ? {
          ...blueprint.bossProfile,
          title: blueprint.bossProfile.title,
          codename: blueprint.bossProfile.codename,
          threat: blueprint.bossProfile.threat,
          signature: blueprint.bossProfile.signature,
          phaseLabel: blueprint.bossProfile.phaseLabel,
        }
      : undefined,
    size: blueprint.gridSize,
    background:
      blueprint.background ??
      (blueprint.isBoss
        ? BACKGROUND_BY_DIFFICULTY.boss
        : BACKGROUND_BY_DIFFICULTY[blueprint.difficulty] ?? BACKGROUND_BY_DIFFICULTY.easy),
    startPosition: blueprint.path[0],
    endPosition: blueprint.path[blueprint.path.length - 1],
    grid: layout,
    layout,
  };
}

function getTodayChallengeKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createDailyBlueprint(dateKey = getTodayChallengeKey()) {
  const templateIndex = hashString(`daily:${dateKey}`) % dailyTemplates.length;
  const scrambleProfileIndex =
    hashString(`daily-scramble:${dateKey}`) % SCRAMBLE_PROFILES.daily.length;
  const template = dailyTemplates[templateIndex];

  return {
    ...template,
    id: `daily-${dateKey}`,
    name: `${template.name} ${dateKey.slice(5)}`,
    dateKey,
    scrambleProfileIndex,
    isDaily: true,
  };
}

export function getDailyChallengeLevel(dateKey = getTodayChallengeKey()) {
  const blueprint = createDailyBlueprint(dateKey);
  return buildLevel(blueprint, blueprint.scrambleProfileIndex ?? 0);
}

export function validateLevel(level) {
  const issues = [];
  const { difficulty, grid, size, path } = level;
  const thresholds = VALIDATION_THRESHOLDS[difficulty];

  if (!level.id) {
    issues.push("Nivo nema id.");
  }

  if (!difficulty || !VALIDATION_THRESHOLDS[difficulty]) {
    issues.push("Nivo nema validnu tezinu.");
  }

  if (!Array.isArray(grid) || grid.length !== size) {
    issues.push(`Grid ne odgovara velicini ${size}.`);
  }

  if (!Array.isArray(grid) || grid.some((row) => !Array.isArray(row) || row.length !== size)) {
    issues.push("Bar jedan red nema ispravnu sirinu.");
  }

  if (!Array.isArray(path) || path.length < (thresholds?.minPathLength ?? 1)) {
    issues.push("Putanja je prekratka za zadatu tezinu.");
  }

  const flatTiles = grid.flat();
  const startCount = flatTiles.filter((currentTile) => currentTile.type === "start").length;
  const endCount = flatTiles.filter((currentTile) => currentTile.type === "end").length;

  if (startCount !== 1 || endCount !== 1) {
    issues.push("Nivo mora imati tacno jedan START i jedan END.");
  }

  for (const currentTile of flatTiles) {
    if (
      currentTile.type !== "empty" &&
      currentTile.type !== "blocked" &&
      typeof currentTile.correctRotation !== "number"
    ) {
      issues.push(`Tile ${currentTile.type} nema correctRotation.`);
      break;
    }
  }

  const wrongPathTiles = path.reduce((count, [row, column]) => {
    const currentTile = grid[row]?.[column];

    if (
      !currentTile ||
      currentTile.type === "empty" ||
      currentTile.type === "blocked" ||
      normalizeRotation(currentTile.rotation) ===
        normalizeRotation(currentTile.correctRotation)
    ) {
      return count;
    }

    return count + 1;
  }, 0);

  if (wrongPathTiles < (thresholds?.minWrongPathTiles ?? 1)) {
    issues.push("Premalo kljucnih cevi je izmesano na pocetku.");
  }

  const initialFlow = analyzeFlow(createBoardFromLevel(level));

  if (initialFlow.success) {
    issues.push("Nivo krece vec resen.");
  }

  const solvedLevel = createSolvedLevel(level);
  const solvedBoard = createBoardFromLevel(solvedLevel);
  const solvedFlow = analyzeFlow(solvedBoard);

  if (!solvedFlow.success) {
    issues.push("Nivo nije resiv kada se vrate correctRotation vrednosti.");
  }

  const solutionPathCount = countSolvedPaths(solvedBoard, 2);

  if (solutionPathCount !== 1) {
    issues.push(`Resenje mora imati jednu jasnu rutu, pronadjeno: ${solutionPathCount}.`);
  }

  return issues;
}

export function validateAllLevels(levelMap = levelsByDifficulty) {
  const issues = [];

  for (const [difficulty, levels] of Object.entries(levelMap)) {
    const seenIds = new Set();

    for (const level of levels) {
      if (seenIds.has(level.id)) {
        issues.push({
          difficulty,
          levelId: level.id,
          issues: ["ID nivoa mora biti jedinstven."],
        });
        continue;
      }

      seenIds.add(level.id);
      const levelIssues = validateLevel(level);

      if (levelIssues.length > 0) {
        issues.push({
          difficulty,
          levelId: level.id,
          issues: levelIssues,
        });
      }
    }
  }

  return issues;
}

export const difficultyConfig = {
  easy: {
    key: "easy",
    label: "Lako",
    campaignLabel: "Laka kampanja",
    gridSize: 5,
    defaultTime: 140,
    defaultHints: 3,
    defaultPowerUps: {
      boost: 1,
      stabilizer: 1,
    },
    summary: "Mreža 5 x 5, više vremena i lakši uvod u tok cijevi.",
  },
  medium: {
    key: "medium",
    label: "Srednje",
    campaignLabel: "Srednja kampanja",
    gridSize: 6,
    defaultTime: 110,
    defaultHints: 2,
    defaultPowerUps: {
      boost: 1,
      stabilizer: 1,
    },
    summary: "Mreža 6 x 6, duže rute i više lažnih pravaca.",
  },
  hard: {
    key: "hard",
    label: "Teško",
    campaignLabel: "Teška kampanja",
    gridSize: 7,
    defaultTime: 90,
    defaultHints: 1,
    defaultPowerUps: {
      boost: 1,
      stabilizer: 1,
    },
    summary: "Mreža 7 x 7, kompleksne putanje i manji prostor za grešku.",
  },
  daily: {
    key: "daily",
    label: "Dnevni",
    campaignLabel: "Dnevni izazov",
    gridSize: 7,
    defaultTime: 90,
    defaultHints: 1,
    defaultPowerUps: {
      boost: 1,
      stabilizer: 1,
    },
    summary: "Nova dnevna misija sa istim pravilima i ozbiljnim pritiskom.",
  },
};

export const levelsByDifficulty = {
  easy: difficultyBlueprints.easy.map((blueprint, levelIndex) =>
    buildLevel(blueprint, levelIndex),
  ),
  medium: difficultyBlueprints.medium.map((blueprint, levelIndex) =>
    buildLevel(blueprint, levelIndex),
  ),
  hard: difficultyBlueprints.hard.map((blueprint, levelIndex) =>
    buildLevel(blueprint, levelIndex),
  ),
  daily: [getDailyChallengeLevel()],
};

if (import.meta.env?.DEV) {
  const validationIssues = validateLevelSet(levelsByDifficulty);

  if (validationIssues.length > 0) {
    console.warn("[PipeRush] Level validation warnings:", validationIssues);
  }

  if (typeof window !== "undefined") {
    window.__PIPE_RUSH_DEBUG__ = {
      levelsByDifficulty,
      validateAllLevels,
      createSolvedLevel,
    };
  }
}


