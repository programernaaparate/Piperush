import {
  campaignDifficultyKeys,
  difficultyConfig,
  levelsByDifficulty,
} from "../data/levels.js";

const STORAGE_KEY = "piperush-progress-v1";
const PLAYER_NAME_STORAGE_KEY = "piperush-player-name-v1";
const DEFAULT_DIFFICULTY = "easy";
const DEFAULT_PLAYER_NAME = "";
const FALLBACK_PLAYER_NAME = "Igrač";
const PLAYER_NAME_LIMIT = 12;
const LEGACY_TEXT_REPAIRS = [
  ["Ã„Â", "č"],
  ["Ã„â€¡", "ć"],
  ["Ã„â€˜", "đ"],
  ["Ã…Â¡", "š"],
  ["Ã…Â¾", "ž"],
  ["Ã„Å’", "Č"],
  ["Ã„â€ ", "Ć"],
  ["Ã„Â", "Đ"],
  ["Ã… ", "Š"],
  ["Ã…Â½", "Ž"],
];

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function createLevelState() {
  return {
    completed: false,
    bestScore: 0,
    bestStars: 0,
    bestTimeLeft: 0,
    bestMoves: null,
    bestPlayerName: DEFAULT_PLAYER_NAME,
  };
}

function normalizeLegacyPlayerName(value) {
  return LEGACY_TEXT_REPAIRS.reduce(
    (currentValue, [from, to]) => currentValue.split(from).join(to),
    value,
  );
}

function sanitizePlayerName(value) {
  const normalized = normalizeLegacyPlayerName(String(value ?? ""))
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, PLAYER_NAME_LIMIT);

  if (!normalized || normalized === "IGRAČ") {
    return DEFAULT_PLAYER_NAME;
  }

  return normalized;
}

function readStoredPlayerName() {
  if (typeof window === "undefined") {
    return DEFAULT_PLAYER_NAME;
  }

  try {
    return sanitizePlayerName(window.localStorage.getItem(PLAYER_NAME_STORAGE_KEY));
  } catch {
    return DEFAULT_PLAYER_NAME;
  }
}

function writeStoredPlayerName(playerName) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const normalizedName = sanitizePlayerName(playerName);

    if (normalizedName) {
      window.localStorage.setItem(PLAYER_NAME_STORAGE_KEY, normalizedName);
    } else {
      window.localStorage.removeItem(PLAYER_NAME_STORAGE_KEY);
    }
  } catch {
    // Ignore storage failures so the game remains playable.
  }
}

function createDifficultyState(levels) {
  return {
    unlockedLevelCount: 1,
    lastPlayedLevelIndex: 0,
    levels: Object.fromEntries(levels.map((level) => [level.id, createLevelState()])),
  };
}

export function createDefaultProgress(playerName = DEFAULT_PLAYER_NAME) {
  return {
    version: 3,
    lastDifficulty: DEFAULT_DIFFICULTY,
    playerName: sanitizePlayerName(playerName),
    tutorialSeen: false,
    difficulties: Object.fromEntries(
      Object.entries(levelsByDifficulty).map(([difficulty, levels]) => [
        difficulty,
        createDifficultyState(levels),
      ]),
    ),
  };
}

function sanitizeDifficultyState(candidate, levels) {
  const fallback = createDifficultyState(levels);

  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }

  const unlockedLevelCount = clamp(
    Number(candidate.unlockedLevelCount) || 1,
    1,
    levels.length,
  );
  const lastPlayedLevelIndex = clamp(
    Number(candidate.lastPlayedLevelIndex) || 0,
    0,
    Math.max(unlockedLevelCount - 1, 0),
  );

  const levelsState = Object.fromEntries(
    levels.map((level) => {
      const source = candidate.levels?.[level.id];

      return [
        level.id,
        {
          completed: Boolean(source?.completed),
          bestScore: Math.max(Number(source?.bestScore) || 0, 0),
          bestStars: clamp(Number(source?.bestStars) || 0, 0, 3),
          bestTimeLeft: Math.max(Number(source?.bestTimeLeft) || 0, 0),
          bestMoves:
            source?.bestMoves === null || source?.bestMoves === undefined
              ? null
              : Math.max(Number(source.bestMoves) || 0, 0),
          bestPlayerName: sanitizePlayerName(source?.bestPlayerName),
        },
      ];
    }),
  );

  return {
    unlockedLevelCount,
    lastPlayedLevelIndex,
    levels: levelsState,
  };
}

function sanitizeProgress(candidate, storedPlayerName = DEFAULT_PLAYER_NAME) {
  const fallback = createDefaultProgress(storedPlayerName);

  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }

  const progressPlayerName = sanitizePlayerName(candidate.playerName);

  return {
    version: 3,
    playerName: storedPlayerName || progressPlayerName,
    tutorialSeen: Boolean(candidate.tutorialSeen),
    lastDifficulty: levelsByDifficulty[candidate.lastDifficulty]
      ? candidate.lastDifficulty
      : fallback.lastDifficulty,
    difficulties: Object.fromEntries(
      Object.entries(levelsByDifficulty).map(([difficulty, levels]) => [
        difficulty,
        sanitizeDifficultyState(candidate.difficulties?.[difficulty], levels),
      ]),
    ),
  };
}

export function readProgress() {
  if (typeof window === "undefined") {
    return createDefaultProgress();
  }

  const storedPlayerName = readStoredPlayerName();

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (!raw) {
      return createDefaultProgress(storedPlayerName);
    }

    return sanitizeProgress(JSON.parse(raw), storedPlayerName);
  } catch {
    return createDefaultProgress(storedPlayerName);
  }
}

export function writeProgress(progress) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const sanitizedProgress = sanitizeProgress(progress, sanitizePlayerName(progress.playerName));
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizedProgress));
    writeStoredPlayerName(sanitizedProgress.playerName);
  } catch {
    // Ignore storage failures so the game remains playable.
  }
}

export function resetStoredProgress() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage failures so reset remains non-blocking.
  }
}

export function getDifficultyProgress(progress, difficulty) {
  return progress.difficulties[difficulty];
}

export function getLevelProgress(progress, difficulty, levelId) {
  return progress.difficulties[difficulty].levels[levelId] ?? createLevelState();
}

export function getUnlockedLevelCount(progress, difficulty) {
  return progress.difficulties[difficulty].unlockedLevelCount;
}

export function getDifficultySummary(progress, difficulty) {
  const difficultyProgress = getDifficultyProgress(progress, difficulty);
  const levelStates = Object.values(difficultyProgress.levels);

  return {
    unlockedLevelCount: difficultyProgress.unlockedLevelCount,
    completedCount: levelStates.filter((level) => level.completed).length,
    bestScore: levelStates.reduce((total, level) => total + level.bestScore, 0),
    starsEarned: levelStates.reduce((total, level) => total + level.bestStars, 0),
  };
}

export function getProgressTotals(progress) {
  return campaignDifficultyKeys.reduce(
    (totals, difficulty) => {
      const summary = getDifficultySummary(progress, difficulty);

      return {
        completedCount: totals.completedCount + summary.completedCount,
        totalLevels: totals.totalLevels + levelsByDifficulty[difficulty].length,
        bestScore: totals.bestScore + summary.bestScore,
        starsEarned: totals.starsEarned + summary.starsEarned,
      };
    },
    {
      completedCount: 0,
      totalLevels: 0,
      bestScore: 0,
      starsEarned: 0,
    },
  );
}

export function getLeaderboardEntries(
  progress,
  { difficulty = null, limit = 10 } = {},
) {
  const difficulties = difficulty
    ? [[difficulty, levelsByDifficulty[difficulty] ?? []]]
    : campaignDifficultyKeys.map((difficultyKey) => [
        difficultyKey,
        levelsByDifficulty[difficultyKey] ?? [],
      ]);

  const entries = [];

  for (const [difficultyKey, levels] of difficulties) {
    const difficultyProgress = getDifficultyProgress(progress, difficultyKey);

    levels.forEach((level, levelIndex) => {
      const levelState = difficultyProgress.levels[level.id];

      if (!levelState?.completed || levelState.bestScore <= 0) {
        return;
      }

      entries.push({
        id: `${difficultyKey}-${level.id}`,
        playerName:
          levelState.bestPlayerName?.trim() ||
          progress.playerName?.trim() ||
          FALLBACK_PLAYER_NAME,
        difficulty: difficultyKey,
        difficultyLabel: difficultyConfig[difficultyKey]?.label ?? difficultyKey,
        levelId: level.id,
        levelName: level.name,
        levelIndex,
        score: levelState.bestScore,
        stars: levelState.bestStars,
        timeLeft: levelState.bestTimeLeft,
        moves: levelState.bestMoves,
      });
    });
  }

  return entries
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (right.stars !== left.stars) {
        return right.stars - left.stars;
      }

      if (right.timeLeft !== left.timeLeft) {
        return right.timeLeft - left.timeLeft;
      }

      return (left.moves ?? Number.MAX_SAFE_INTEGER) - (right.moves ?? Number.MAX_SAFE_INTEGER);
    })
    .slice(0, limit);
}

export function getSuggestedLevelIndex(progress, difficulty) {
  const difficultyProgress = getDifficultyProgress(progress, difficulty);
  const levels = levelsByDifficulty[difficulty];

  for (let index = 0; index < difficultyProgress.unlockedLevelCount; index += 1) {
    const levelId = levels[index]?.id;

    if (levelId && !difficultyProgress.levels[levelId]?.completed) {
      return index;
    }
  }

  return clamp(
    difficultyProgress.lastPlayedLevelIndex,
    0,
    Math.max(difficultyProgress.unlockedLevelCount - 1, 0),
  );
}

export function rememberSelection(progress, difficulty, levelIndex) {
  const difficultyProgress = getDifficultyProgress(progress, difficulty);
  const clampedIndex = clamp(
    levelIndex,
    0,
    Math.max(difficultyProgress.unlockedLevelCount - 1, 0),
  );

  if (
    progress.lastDifficulty === difficulty &&
    difficultyProgress.lastPlayedLevelIndex === clampedIndex
  ) {
    return progress;
  }

  return {
    ...progress,
    lastDifficulty: campaignDifficultyKeys.includes(difficulty)
      ? difficulty
      : progress.lastDifficulty,
    difficulties: {
      ...progress.difficulties,
      [difficulty]: {
        ...difficultyProgress,
        lastPlayedLevelIndex: clampedIndex,
      },
    },
  };
}

export function updatePlayerName(progress, playerName) {
  const normalizedName = sanitizePlayerName(playerName);

  if (progress.playerName === normalizedName) {
    return progress;
  }

  return {
    ...progress,
    playerName: normalizedName,
  };
}

export function markTutorialSeen(progress) {
  if (progress.tutorialSeen) {
    return progress;
  }

  return {
    ...progress,
    tutorialSeen: true,
  };
}

function isCandidateRecordBetter(currentLevelProgress, candidateResult) {
  if (!currentLevelProgress.completed) {
    return true;
  }

  if (candidateResult.score !== currentLevelProgress.bestScore) {
    return candidateResult.score > currentLevelProgress.bestScore;
  }

  if (candidateResult.stars !== currentLevelProgress.bestStars) {
    return candidateResult.stars > currentLevelProgress.bestStars;
  }

  if (candidateResult.timeLeft !== currentLevelProgress.bestTimeLeft) {
    return candidateResult.timeLeft > currentLevelProgress.bestTimeLeft;
  }

  return (candidateResult.moves ?? Number.MAX_SAFE_INTEGER) <
    (currentLevelProgress.bestMoves ?? Number.MAX_SAFE_INTEGER);
}

export function recordLevelCompletion(
  progress,
  { difficulty, levelId, levelIndex, score, stars, timeLeft, moves },
) {
  const levels = levelsByDifficulty[difficulty];
  const difficultyProgress = getDifficultyProgress(progress, difficulty);
  const currentLevelProgress = getLevelProgress(progress, difficulty, levelId);
  const unlockedLevelCount = clamp(
    Math.max(difficultyProgress.unlockedLevelCount, levelIndex + 2),
    1,
    levels.length,
  );
  const nextLevelIndex =
    levelIndex >= levels.length - 1
      ? levels.length - 1
      : clamp(levelIndex + 1, 0, unlockedLevelCount - 1);
  const candidateRecord = { score, stars, timeLeft, moves };
  const shouldReplaceRecord = isCandidateRecordBetter(currentLevelProgress, candidateRecord);
  const bestPlayerName =
    shouldReplaceRecord
      ? progress.playerName?.trim() || FALLBACK_PLAYER_NAME
      : currentLevelProgress.bestPlayerName || progress.playerName?.trim() || FALLBACK_PLAYER_NAME;

  return {
    ...progress,
    lastDifficulty: campaignDifficultyKeys.includes(difficulty)
      ? difficulty
      : progress.lastDifficulty,
    difficulties: {
      ...progress.difficulties,
      [difficulty]: {
        ...difficultyProgress,
        unlockedLevelCount,
        lastPlayedLevelIndex: nextLevelIndex,
        levels: {
          ...difficultyProgress.levels,
          [levelId]: {
            completed: true,
            bestScore: shouldReplaceRecord ? score : currentLevelProgress.bestScore,
            bestStars: shouldReplaceRecord ? stars : currentLevelProgress.bestStars,
            bestTimeLeft: shouldReplaceRecord ? timeLeft : currentLevelProgress.bestTimeLeft,
            bestMoves: shouldReplaceRecord ? moves : currentLevelProgress.bestMoves,
            bestPlayerName,
          },
        },
      },
    },
  };
}
