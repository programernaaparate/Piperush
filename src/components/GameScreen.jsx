import { useEffect, useRef, useState } from "react";
import { getBossVisual } from "../data/bossVisuals.js";
import { difficultyConfig, levelsByDifficulty } from "../data/levels.js";
import { audioManager } from "../utils/audio.js";
import { getLevelProgress } from "../utils/progress.js";
import {
  applyAutoRotateTiles,
  analyzeFlow,
  createBoardFromLevel,
  getDamagePenalty,
  getHintRecommendation,
  getLockMovesRemaining,
  isRotatable,
  isTileLocked,
  rotateTile,
} from "../utils/pipeLogic.js";
import BossIntroModal from "./BossIntroModal.jsx";
import GameBoard from "./GameBoard.jsx";
import GameOverModal from "./GameOverModal.jsx";
import HUD from "./HUD.jsx";
import LevelCompleteModal from "./LevelCompleteModal.jsx";
import PauseModal from "./PauseModal.jsx";
import TutorialOverlay from "./TutorialOverlay.jsx";
import UltraBossMonitor from "./UltraBossMonitor.jsx";

const COMPLETION_DELAY_MS = 700;
const FEEDBACK_DURATION_MS = 1500;
const BOSS_EVENT_FLASH_MS = 1800;
const ROUND_RESET_OUT_MS = 160;
const ROUND_RESET_IN_MS = 320;
const POWER_UP_TIME_BONUS = {
  easy: 16,
  medium: 14,
  hard: 12,
  daily: 14,
};

const BACKGROUND_CLASS_BY_DIFFICULTY = {
  easy: "game-screen--easy",
  medium: "game-screen--medium",
  hard: "game-screen--hard",
  daily: "game-screen--hard",
};

function formatTime(seconds) {
  const safeSeconds = Math.max(seconds, 0);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const remainingSeconds = (safeSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainingSeconds}`;
}

function calculateLevelScore({ timeLeft, moves }) {
  return Math.max(100, 1000 + timeLeft * 10 - moves * 5);
}

function calculateLiveScorePreview({ timeLeft, moves, pathProgress }) {
  const projectedClearScore = calculateLevelScore({
    timeLeft,
    moves,
  });
  const progressFactor = Math.max(
    moves > 0 || pathProgress > 0 ? 0.18 : 0.12,
    Math.min(0.92, 0.18 + (pathProgress / 100) * 0.66),
  );

  return Math.max(0, Math.round(projectedClearScore * progressFactor));
}

function buildPowerUpLoadout(level, difficultyDetails) {
  const defaultPowerUps = difficultyDetails.defaultPowerUps ?? {};
  const levelPowerUps = level.powerUps ?? {};

  return {
    boost: levelPowerUps.boost ?? defaultPowerUps.boost ?? 0,
    stabilizer: levelPowerUps.stabilizer ?? defaultPowerUps.stabilizer ?? 0,
  };
}

function buildSpecialRuleLabel(level) {
  const tags = [];

  if (level.isDaily) {
    tags.push("Dnevni");
  }

  if (level.isUltra) {
    tags.push("Ultra");
  } else if (level.isBoss) {
    tags.push("Boss");
  }

  if (level.specials?.some((item) => item.modifier === "locked")) {
    tags.push("Lock");
  }

  if (level.specials?.some((item) => item.modifier === "auto")) {
    tags.push("Rotor");
  }

  if (level.specials?.some((item) => item.modifier === "damaged")) {
    tags.push("Šteta");
  }

  return tags.length > 0 ? tags.join(" / ") : "Standard";
}

function getGameBackgroundClass(level, difficulty) {
  if (level?.isUltra) {
    return "game-screen--ultra";
  }

  const resolvedDifficulty = level?.difficulty ?? difficulty;

  return BACKGROUND_CLASS_BY_DIFFICULTY[resolvedDifficulty] ?? "game-screen--easy";
}

function shouldSkipDebugBossIntro() {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return false;
  }

  return new URLSearchParams(window.location.search).get("debugAutoStartBoss") === "1";
}

function calculateLevelStars({ timeLeft, timeLimit, moves, moveTarget, hintsUsed }) {
  let stars = 1;

  if (timeLeft >= timeLimit * 0.35 || moves <= moveTarget + 2) {
    stars += 1;
  }

  if (timeLeft >= timeLimit * 0.6 && moves <= moveTarget && hintsUsed === 0) {
    stars += 1;
  }

  return Math.min(stars, 3);
}

function createRoundState(level, difficultyDetails) {
  const board = createBoardFromLevel(level);
  const initialFlow = analyzeFlow(board);

  return {
    board,
    timeLeft: level.timeLimit ?? difficultyDetails.defaultTime,
    moves: 0,
    hintsLeft: level.hints ?? difficultyDetails.defaultHints,
    powerUps: buildPowerUpLoadout(level, difficultyDetails),
    hintedTileId: null,
    hintMessage: "",
    hintBadgeLabel: "",
    aiInsight: "",
    aiSolverLabel: "",
    flowTrail: initialFlow.success ? initialFlow.path : initialFlow.reachable,
    isPaused: false,
    showLevelComplete: false,
    showGameOver: false,
    scoreAward: 0,
    earnedStars: 0,
    bossEventsTriggered: 0,
  };
}

function getBossEventLabel(level) {
  return level?.bossEvent?.label ?? "Boss talas";
}

function getBossThreatSummary(level) {
  const eventType = level?.bossEvent?.type;

  if (eventType === "pressure-surge") {
    return "siječe vrijeme";
  }

  if (eventType === "rotor-wave") {
    return "rotira kritična polja";
  }

  if (eventType === "lockdown") {
    return "zaključava ključnu cijev";
  }

  return "pritiska glavnu rutu";
}

function getBossPhaseState({
  pathProgress,
  bossEventsTriggered,
  isCriticalTime,
  isBossEventActive,
  isLevelCleared,
  showGameOver,
}) {
  if (isLevelCleared) {
    return {
      label: "Slomljen",
      description: "Ruta je zaključana i sistem ostaje bez pritiska.",
    };
  }

  if (showGameOver) {
    return {
      label: "Dominacija",
      description: "Boss je zadržao mrežu pod pritiskom i zatvorio prolaz.",
    };
  }

  if (pathProgress >= 84 || isCriticalTime) {
    return {
      label: "Bijes",
      description: "Ruta je blizu kraja. Svaki potez mora ostati čist.",
    };
  }

  if (isBossEventActive || pathProgress >= 48 || bossEventsTriggered >= 2) {
    return {
      label: "Nervoza",
      description: "Glavni tok je otvoren. Očekuj napad na ključni segment.",
    };
  }

  return {
    label: "Posmatra",
    description: "Boss prati rutu i čeka prvi slab spoj.",
  };
}

function getBossPressureValue({
  pathProgress,
  bossEventsTriggered,
  moves,
  isCriticalTime,
  isBossEventActive,
  isLevelCleared,
}) {
  if (isLevelCleared) {
    return 100;
  }

  return Math.max(
    8,
    Math.min(
      100,
      pathProgress +
        bossEventsTriggered * 11 +
        Math.min(moves, 10) * 2 +
        (isCriticalTime ? 16 : 0) +
        (isBossEventActive ? 12 : 0),
    ),
  );
}

function BackGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.5 7.5L9.5 12L14.5 16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 12H16.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function findTileById(board, tileId) {
  for (const row of board) {
    for (const tile of row) {
      if (tile.id === tileId) {
        return tile;
      }
    }
  }

  return null;
}

function applyBossEvent({ board, level, moveCount, timeLeft, eventCount = 1 }) {
  const eventConfig = level.bossEvent;

  if (!eventConfig) {
    return null;
  }

  if (eventConfig.type === "pressure-surge") {
    const basePenalty = Math.max(Number(eventConfig.timePenalty) || 0, 0);
    const timePenalty = basePenalty + Math.min(Math.max(eventCount - 1, 0), 2);

    return {
      board,
      timeLeft: Math.max(timeLeft - timePenalty, 0),
      message: `${eventConfig.label}: sistem je izbacio ${timePenalty}s iz tajmera.`,
      badgeLabel: `-${timePenalty}s`,
      hintedTileId: null,
      type: eventConfig.type,
    };
  }

  if (eventConfig.type === "rotor-wave") {
    const autoRotateResult = applyAutoRotateTiles(board);
    const rotatedCount = autoRotateResult.rotatedTileIds.length;

    return {
      board: autoRotateResult.board,
      timeLeft,
      message:
        rotatedCount > 0
          ? `${eventConfig.label}: rotor talas je pomjerio ${rotatedCount} kritična polja.`
          : `${eventConfig.label}: mreža je odoljela rotoru ovog talasa.`,
      badgeLabel: rotatedCount > 0 ? "AUTO" : "SAFE",
      hintedTileId: rotatedCount > 0 ? autoRotateResult.rotatedTileIds[0] : null,
      type: eventConfig.type,
    };
  }

  if (eventConfig.type === "lockdown") {
    const recommendation = getHintRecommendation(board, level, moveCount);
    let targetTile = recommendation?.id ? findTileById(board, recommendation.id) : null;

    if (
      !targetTile ||
      !isRotatable(targetTile) ||
      targetTile.type === "start" ||
      targetTile.type === "end" ||
      isTileLocked(targetTile, moveCount)
    ) {
      targetTile =
        board
          .flat()
          .find(
            (tile) =>
              isRotatable(tile) &&
              tile.type !== "start" &&
              tile.type !== "end" &&
              !isTileLocked(tile, moveCount),
          ) ?? null;
    }

    if (!targetTile) {
      return {
        board,
        timeLeft,
        message: `${eventConfig.label}: nije pronađena slobodna cijev za zaključavanje.`,
        badgeLabel: "SAFE",
        hintedTileId: null,
        type: eventConfig.type,
      };
    }

    const lockDurationMoves = Math.max(Number(eventConfig.lockDurationMoves) || 2, 1);
    const bossLockUntilMove = moveCount + lockDurationMoves;

    return {
      board: board.map((row) =>
        row.map((tile) =>
          tile.id === targetTile.id
            ? {
                ...tile,
                bossLockUntilMove,
              }
            : tile,
        ),
      ),
      timeLeft,
      message: `${eventConfig.label}: polje ${targetTile.row + 1}-${targetTile.column + 1} je privremeno zaključano.`,
      badgeLabel: `L${lockDurationMoves}`,
      hintedTileId: targetTile.id,
      type: eventConfig.type,
    };
  }

  return null;
}

function GameScreen({
  difficulty,
  startingLevelIndex,
  progress,
  audioMuted,
  onExitToMenu,
  onTrackLevel,
  onToggleAudio,
  onLevelComplete,
  onTutorialSeen,
}) {
  const levels = levelsByDifficulty[difficulty];
  const difficultyDetails = difficultyConfig[difficulty];
  const [levelIndex, setLevelIndex] = useState(startingLevelIndex);
  const [score, setScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(() => !progress.tutorialSeen);
  const [showBossIntro, setShowBossIntro] = useState(
    () => Boolean(levels[startingLevelIndex]?.isBoss) && !shouldSkipDebugBossIntro(),
  );
  const [bossEventState, setBossEventState] = useState({
    active: false,
    type: "",
    message: "",
  });
  const [roundState, setRoundState] = useState(() =>
    createRoundState(levels[startingLevelIndex], difficultyDetails),
  );
  const completionHandledRef = useRef(false);
  const completionTimeoutRef = useRef(null);
  const hintTimeoutRef = useRef(null);
  const bossEventTimeoutRef = useRef(null);
  const fxTimeoutRef = useRef(null);
  const roundTransitionTimeoutRef = useRef(null);
  const roundTransitionRafRef = useRef(null);
  const topbarRef = useRef(null);
  const hudRef = useRef(null);
  const [fxState, setFxState] = useState({
    boardMode: "",
    tileFxById: {},
  });
  const [boardFitWidth, setBoardFitWidth] = useState(null);
  const [isBoardZoneSplit, setIsBoardZoneSplit] = useState(false);
  const [roundResetPhase, setRoundResetPhase] = useState("");

  const currentLevel = levels[levelIndex];
  const isBossLevel = Boolean(currentLevel.isBoss);
  const isUltraLevel = Boolean(currentLevel.isUltra);
  const bossProfile = currentLevel.bossProfile ?? null;
  const bossVisual = bossProfile ? getBossVisual(bossProfile, { isUltra: isUltraLevel }) : null;
  const isFinalLevel = levelIndex === levels.length - 1;
  const levelProgress = getLevelProgress(progress, difficulty, currentLevel.id);
  const {
    board,
    timeLeft,
    moves,
    hintsLeft,
    powerUps,
    hintedTileId,
    hintMessage,
    hintBadgeLabel,
    aiInsight,
    aiSolverLabel,
    flowTrail,
    isPaused,
    showLevelComplete,
    showGameOver,
    scoreAward,
    earnedStars,
    bossEventsTriggered,
  } = roundState;

  const timeLimit = currentLevel.timeLimit ?? difficultyDetails.defaultTime;
  const defaultHints = difficultyDetails.defaultHints;
  const timeRatio = timeLimit > 0 ? timeLeft / timeLimit : 1;
  const gameplayPaused = isPaused || showTutorial || showBossIntro || roundResetPhase !== "";
  const isCriticalTime =
    timeRatio <= 0.25 && !showLevelComplete && !showGameOver && !showTutorial;
  const pathProgress = Math.min(
    100,
    Math.round((flowTrail.length / Math.max(currentLevel.path.length, 1)) * 100),
  );
  const hintsUsed = Math.max((currentLevel.hints ?? defaultHints) - hintsLeft, 0);
  const isLevelCleared = scoreAward > 0 || showLevelComplete;
  const hasResolvedLevel = showGameOver || showLevelComplete || scoreAward > 0;
  const liveScorePreview = hasResolvedLevel
    ? 0
    : calculateLiveScorePreview({
        timeLeft,
        moves,
        pathProgress,
      });
  const displayLevelName = currentLevel.name;
  const displayBriefing = currentLevel.briefing;
  const displayDifficultyLabel = difficultyDetails.label;
  const displayPlayerName = progress.playerName;
  const displayBossCodename = bossProfile?.codename ?? "";
  const displayBossName = bossVisual?.displayName ?? bossProfile?.title ?? "Boss sistem";
  const bossPortraitStyle = bossVisual?.previewImage
    ? {
        backgroundImage: `url("${bossVisual.previewImage}")`,
        backgroundPosition: bossVisual.previewPosition ?? "center",
        backgroundSize: bossVisual.previewSize ?? "cover",
      }
    : null;
  const displayedScore = score + liveScorePreview;
  const scoreDetail =
    scoreAward > 0
      ? `Bonus +${scoreAward}`
      : liveScorePreview > 0
        ? `U toku +${liveScorePreview}`
        : "Čeka prvi tok";
  const specialRuleLabel = buildSpecialRuleLabel(currentLevel);
  const bossEventLabel = getBossEventLabel(currentLevel);
  const bossThreatSummary = getBossThreatSummary(currentLevel);
  const bossPhaseState = getBossPhaseState({
    pathProgress,
    bossEventsTriggered,
    isCriticalTime,
    isBossEventActive: bossEventState.active,
    isLevelCleared,
    showGameOver,
  });
  const bossPressureValue = getBossPressureValue({
    pathProgress,
    bossEventsTriggered,
    moves,
    isCriticalTime,
    isBossEventActive: bossEventState.active,
    isLevelCleared,
  });
  const bossBannerDefaultMessage = isBossLevel
    ? `${bossEventLabel}: ${bossThreatSummary} na ${currentLevel.bossEvent?.interval}s. ${bossPhaseState.description}`
    : "";
  const objectiveCopy = `Poveži START sa END prije isteka vremena. Savjet otkriva sljedeću kritičnu cijev. Režim: ${specialRuleLabel}.`;
  const fallbackHintMessage = isBossLevel
    ? `${bossEventLabel}: čuvaj glavni tok i ostavi rezervu za lock.`
    : "Savjet otkriva prvu pogrešnu cijev na glavnoj ruti.";
  const ultraWarningCopy =
    "Nema savjeta ni rezervnih poteza. Lock, rotor i šteta traže skoro savršen redoslijed.";
  const defaultAiInsight = isBossLevel
    ? `${displayBossCodename || "Boss AI"} prati glavni tok i čeka trenutak da zaključa najvažniju cijev.`
    : isUltraLevel
      ? "Ultra mreža traži zatvaranje glavnog prstena bez praznih rotacija. Svaki potez mora vratiti stvarnu vezu."
      : pathProgress >= 55
        ? "AI analiza vidi stabilan front i prati prvi segment koji još ne vraća vezu ka rješenju."
        : "AI analiza kreće od START-a i BFS logikom traži prvo polje koje prekida glavni tok.";
  const displayedAiInsight = aiInsight || defaultAiInsight;
  const displayedAiLabel = aiSolverLabel || (isBossLevel ? "Analiza bossa" : "AI analiza");
  const stabilizerRecommendation = getHintRecommendation(board, currentLevel, moves, {
    skipLocked: true,
    allowResolvedFallback: false,
  });
  const showPauseModal =
    isPaused && !isLevelCleared && !showGameOver && !showTutorial && !showBossIntro;
  const flowStateLabel = isLevelCleared
    ? "Nivo završen"
    : showGameOver
      ? "Tok izgubljen"
      : gameplayPaused
        ? showTutorial
          ? "Tutorijal"
          : showBossIntro
            ? "Upozorenje bossa"
            : "Pauza"
        : isCriticalTime
          ? "Kritičan pritisak"
          : isUltraLevel && pathProgress >= 70
            ? "Ultra završnica"
            : pathProgress >= 85
              ? "Finalni spoj"
              : pathProgress >= 55
                ? "Pun protok"
                : pathProgress >= 25
                  ? "Mreža se puni"
                  : moves > 0
                    ? "Traži sljedeći zavoj"
                    : "Poravnaj ulaz";
  const boardLegendItems = [
    currentLevel.specials?.some((item) => item.modifier === "locked")
      ? { key: "locked", badge: "L", label: "Zaključano polje" }
      : null,
    currentLevel.specials?.some((item) => item.modifier === "auto")
      ? { key: "auto", badge: "R", label: "Rotor cijev" }
      : null,
    currentLevel.specials?.some((item) => item.modifier === "damaged")
      ? { key: "damaged", badge: "!", label: "Oštećena cijev" }
      : null,
  ].filter(Boolean);

  useEffect(() => {
    return () => {
      window.clearTimeout(completionTimeoutRef.current);
      window.clearTimeout(hintTimeoutRef.current);
      window.clearTimeout(bossEventTimeoutRef.current);
      window.clearTimeout(fxTimeoutRef.current);
      window.clearTimeout(roundTransitionTimeoutRef.current);
      window.cancelAnimationFrame(roundTransitionRafRef.current);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const recomputeBoardFit = () => {
      const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
      const boardZoneWidth = Math.min(
        viewportWidth - (viewportWidth < 640 ? 24 : viewportWidth < 1180 ? 36 : 48),
        viewportWidth >= 1500 ? 1540 : 1320,
      );
      const splitGap = viewportWidth >= 1500 ? 28 : 22;
      const splitSidebarWidth = isUltraLevel
        ? viewportWidth >= 1500
          ? 320
          : 292
        : viewportWidth >= 1500
          ? 340
          : 310;
      const minimumBoardWidth =
        currentLevel.gridSize >= 7 ? 390 : currentLevel.gridSize === 6 ? 380 : 350;
      const preferredBoardWidth =
        currentLevel.gridSize >= 7
          ? isUltraLevel
            ? 900
            : 860
          : currentLevel.gridSize === 6
            ? 720
            : 600;
      const splitCandidate =
        viewportWidth >= 1180 &&
        boardZoneWidth - splitSidebarWidth - splitGap >=
          (currentLevel.gridSize >= 7 ? 520 : 460);
      const canSplit = splitCandidate;
      const widthBudget = canSplit
        ? boardZoneWidth - splitSidebarWidth - splitGap
        : boardZoneWidth;
      const safeWidthBudget = Math.max(Math.floor(widthBudget), 0);
      const nextFitWidth =
        safeWidthBudget >= minimumBoardWidth
          ? Math.min(preferredBoardWidth, safeWidthBudget)
          : safeWidthBudget;

      setIsBoardZoneSplit(canSplit);
      setBoardFitWidth(nextFitWidth);
    };

    recomputeBoardFit();
    window.addEventListener("resize", recomputeBoardFit);

    return () => {
      window.removeEventListener("resize", recomputeBoardFit);
    };
  }, [
    currentLevel.gridSize,
    isUltraLevel,
    showBossIntro,
    showTutorial,
    showPauseModal,
  ]);

  useEffect(() => {
    onTrackLevel?.(difficulty, levelIndex);
  }, [difficulty, levelIndex, onTrackLevel]);

  function scheduleFeedbackReset(durationMs = FEEDBACK_DURATION_MS) {
    window.clearTimeout(hintTimeoutRef.current);

    if (durationMs <= 0) {
      return;
    }

    hintTimeoutRef.current = window.setTimeout(() => {
      setRoundState((current) => ({
        ...current,
        hintedTileId: null,
        hintMessage: "",
        hintBadgeLabel: "",
      }));
    }, durationMs);
  }

  function activateBossFx(type, message) {
    window.clearTimeout(bossEventTimeoutRef.current);
    setBossEventState({
      active: true,
      type,
      message,
    });

    bossEventTimeoutRef.current = window.setTimeout(() => {
      setBossEventState((current) => ({
        ...current,
        active: false,
      }));
    }, BOSS_EVENT_FLASH_MS);
  }

  function triggerFx({ boardMode = "", tileEffects = {}, durationMs = 980 } = {}) {
    window.clearTimeout(fxTimeoutRef.current);
    setFxState({
      boardMode,
      tileFxById: tileEffects,
    });

    if (durationMs <= 0) {
      return;
    }

    fxTimeoutRef.current = window.setTimeout(() => {
      setFxState({
        boardMode: "",
        tileFxById: {},
      });
    }, durationMs);
  }

  useEffect(() => {
    if (gameplayPaused || showLevelComplete || showGameOver) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      let shouldPlayFail = false;
      let nextBossFx = null;
      let resolvedBossClear = null;

      setRoundState((current) => {
        if (current.isPaused || current.showLevelComplete || current.showGameOver) {
          return current;
        }

        if (current.timeLeft <= 1) {
          shouldPlayFail = true;
          return {
            ...current,
            timeLeft: 0,
            isPaused: true,
            showGameOver: true,
          };
        }

        let nextTimeLeft = current.timeLeft - 1;
        let nextBoard = current.board;
        let nextHintMessage = current.hintMessage;
        let nextHintBadgeLabel = current.hintBadgeLabel;
        let nextHintedTileId = current.hintedTileId;
        let nextShowGameOver = current.showGameOver;
        let nextIsPaused = current.isPaused;
        let nextBossEventsTriggered = current.bossEventsTriggered;

        if (currentLevel.bossEvent) {
          const elapsedAfterTick = timeLimit - nextTimeLeft;
          const interval = Math.max(Number(currentLevel.bossEvent.interval) || 0, 0);
          const expectedEventCount =
            interval > 0 ? Math.floor(elapsedAfterTick / interval) : current.bossEventsTriggered;

          if (expectedEventCount > current.bossEventsTriggered) {
            const eventResult = applyBossEvent({
              board: current.board,
              level: currentLevel,
              moveCount: current.moves,
              timeLeft: nextTimeLeft,
              eventCount: expectedEventCount,
            });

            if (eventResult) {
              nextBoard = eventResult.board;
              nextTimeLeft = eventResult.timeLeft;
              nextHintMessage = eventResult.message;
              nextHintBadgeLabel = eventResult.badgeLabel;
              nextHintedTileId = eventResult.hintedTileId;
              nextBossEventsTriggered = expectedEventCount;
              nextBossFx = {
                type: eventResult.type,
                message: eventResult.message,
                tileId: eventResult.hintedTileId ?? null,
              };
            }
          }
        }

        if (nextTimeLeft <= 0) {
          shouldPlayFail = true;
          nextTimeLeft = 0;
          nextShowGameOver = true;
          nextIsPaused = true;
        }

        const result = analyzeFlow(nextBoard);
        const nextFlowTrail = result.success ? result.path : result.reachable;

        if (result.success && !completionHandledRef.current) {
          const currentHintsUsed = Math.max(
            (currentLevel.hints ?? defaultHints) - current.hintsLeft,
            0,
          );
          const award = calculateLevelScore({
            timeLeft: nextTimeLeft,
            moves: current.moves,
          });
          const stars = calculateLevelStars({
            timeLeft: nextTimeLeft,
            timeLimit,
            moves: current.moves,
            moveTarget: currentLevel.moveTarget,
            hintsUsed: currentHintsUsed,
          });
          const nextTotalScore = score + award;

          completionHandledRef.current = true;
          resolvedBossClear = {
            award,
            nextTotalScore,
            stars,
            timeLeft: nextTimeLeft,
            moves: current.moves,
          };

          return {
            ...current,
            board: nextBoard,
            timeLeft: nextTimeLeft,
            hintedTileId: nextHintedTileId,
            hintMessage: nextHintMessage,
            hintBadgeLabel: nextHintBadgeLabel,
            aiInsight: "",
            aiSolverLabel: "",
            flowTrail: nextFlowTrail,
            bossEventsTriggered: nextBossEventsTriggered,
            isPaused: true,
            scoreAward: award,
            earnedStars: stars,
          };
        }

        return {
          ...current,
          board: nextBoard,
          timeLeft: nextTimeLeft,
          hintedTileId: nextHintedTileId,
          hintMessage: nextHintMessage,
          hintBadgeLabel: nextHintBadgeLabel,
          aiInsight: "",
          aiSolverLabel: "",
          flowTrail: nextFlowTrail,
          bossEventsTriggered: nextBossEventsTriggered,
          isPaused: nextIsPaused,
          showGameOver: nextShowGameOver,
        };
      });

      if (nextBossFx) {
        activateBossFx(nextBossFx.type, nextBossFx.message);
        audioManager.playWarning();
        triggerFx({
          boardMode: nextBossFx.type,
          tileEffects: nextBossFx.tileId
            ? {
                [nextBossFx.tileId]:
                  nextBossFx.type === "lockdown" ? "lock" : "auto",
              }
            : {},
          durationMs: 1200,
        });
        scheduleFeedbackReset();
      }

      if (resolvedBossClear) {
        setScore(resolvedBossClear.nextTotalScore);
        audioManager.playSuccess();
        onLevelComplete?.({
          difficulty,
          levelId: currentLevel.id,
          levelIndex,
          score: resolvedBossClear.award,
          totalScore: resolvedBossClear.nextTotalScore,
          stars: resolvedBossClear.stars,
          timeLeft: resolvedBossClear.timeLeft,
          moves: resolvedBossClear.moves,
        });

        completionTimeoutRef.current = window.setTimeout(() => {
          setRoundState((current) => ({
            ...current,
            showLevelComplete: true,
          }));
        }, COMPLETION_DELAY_MS);
      }

      if (shouldPlayFail) {
        audioManager.playFail();
      }
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [
    bossProfile?.codename,
    bossProfile?.phaseLabel,
    currentLevel,
    defaultHints,
    difficulty,
    gameplayPaused,
    levelIndex,
    onLevelComplete,
    score,
    showGameOver,
    showLevelComplete,
    timeLimit,
  ]);

  function resetRound(level, { showBossIntroOnReset = Boolean(level.isBoss) } = {}) {
    completionHandledRef.current = false;
    window.clearTimeout(completionTimeoutRef.current);
    window.clearTimeout(hintTimeoutRef.current);
    window.clearTimeout(bossEventTimeoutRef.current);
    window.clearTimeout(fxTimeoutRef.current);
    window.clearTimeout(roundTransitionTimeoutRef.current);
    window.cancelAnimationFrame(roundTransitionRafRef.current);
    setRoundResetPhase("is-resetting-out");

    roundTransitionTimeoutRef.current = window.setTimeout(() => {
      setRoundState(createRoundState(level, difficultyDetails));
      setFxState({
        boardMode: "",
        tileFxById: {},
      });
      setShowBossIntro(showBossIntroOnReset && !shouldSkipDebugBossIntro());
      setBossEventState({
        active: false,
        type: "",
        message: "",
      });
      roundTransitionRafRef.current = window.requestAnimationFrame(() => {
        setRoundResetPhase("is-resetting-in");
        roundTransitionTimeoutRef.current = window.setTimeout(() => {
          setRoundResetPhase("");
        }, ROUND_RESET_IN_MS);
      });
    }, ROUND_RESET_OUT_MS);
  }

  function handleRotate(tileId) {
    if (gameplayPaused || showLevelComplete || showGameOver) {
      return;
    }

    const selectedTile = board.flat().find((tile) => tile.id === tileId);

    if (!selectedTile || !isRotatable(selectedTile)) {
      return;
    }

    const lockMovesRemaining = getLockMovesRemaining(selectedTile, moves);

    if (lockMovesRemaining > 0 || isTileLocked(selectedTile, moves)) {
      triggerFx({
        boardMode: "lock",
        tileEffects: {
          [tileId]: "lock",
        },
        durationMs: 900,
      });
      window.clearTimeout(hintTimeoutRef.current);
      setRoundState((current) => ({
        ...current,
        hintedTileId: tileId,
        hintMessage: `Zaključana cijev: otvara se za još ${lockMovesRemaining} poteza.`,
        hintBadgeLabel: `L${lockMovesRemaining}`,
        aiInsight:
          "AI analiza prepoznaje tačan segment, ali ga zaključavanje trenutno drži van rotacije.",
        aiSolverLabel: "Zaključano polje",
      }));
      scheduleFeedbackReset(1800);
      audioManager.playWarning();
      return;
    }

    let rotated = false;
    const rotatedBoard = board.map((row) =>
      row.map((tile) => {
        if (tile.id !== tileId || !isRotatable(tile)) {
          return tile;
        }

        rotated = true;
        return rotateTile(tile);
      }),
    );

    if (!rotated) {
      return;
    }

    const damagePenalty = getDamagePenalty(selectedTile);
    const nextTimeLeft = Math.max(timeLeft - damagePenalty, 0);
    const autoRotateResult = applyAutoRotateTiles(rotatedBoard, {
      skipTileId: tileId,
    });
    const nextBoard = autoRotateResult.board;
    const nextMoves = moves + 1;
    const result = analyzeFlow(nextBoard);
    const nextFlowTrail = result.success ? result.path : result.reachable;
    const feedbackParts = [];

    if (damagePenalty > 0) {
      feedbackParts.push(`Oštećena cijev je ispustila ${damagePenalty}s.`);
    }

    if (autoRotateResult.rotatedTileIds.length > 0) {
      feedbackParts.push(
        autoRotateResult.rotatedTileIds.length === 1
          ? "Jedna rotor cijev se sama pomjerila."
          : `Rotor cijevi su pomjerile ${autoRotateResult.rotatedTileIds.length} polja.`,
      );
    }

    const feedbackMessage = feedbackParts.join(" ");
    const feedbackBadge =
      damagePenalty > 0
        ? `-${damagePenalty}s`
        : autoRotateResult.rotatedTileIds.length > 0
          ? "AUTO"
          : "";
    const tileEffects = {
      [tileId]: damagePenalty > 0 ? "damage" : "rotate",
    };

    autoRotateResult.rotatedTileIds.forEach((id) => {
      tileEffects[id] = "auto";
    });

    triggerFx({
      boardMode: damagePenalty > 0 ? "damage" : autoRotateResult.rotatedTileIds.length > 0 ? "auto" : "rotate",
      tileEffects,
      durationMs: damagePenalty > 0 ? 1200 : 860,
    });

    if (result.success && !completionHandledRef.current) {
      const award = calculateLevelScore({
        timeLeft: nextTimeLeft,
        moves: nextMoves,
      });
      const stars = calculateLevelStars({
        timeLeft: nextTimeLeft,
        timeLimit,
        moves: nextMoves,
        moveTarget: currentLevel.moveTarget,
        hintsUsed,
      });
      const nextTotalScore = score + award;

      completionHandledRef.current = true;
      setScore(nextTotalScore);
      setRoundState((current) => ({
        ...current,
        board: nextBoard,
        moves: nextMoves,
        hintedTileId: null,
        hintMessage: feedbackMessage,
        hintBadgeLabel: feedbackBadge,
        flowTrail: nextFlowTrail,
        timeLeft: nextTimeLeft,
        isPaused: true,
        scoreAward: award,
        earnedStars: stars,
      }));
      triggerFx({
        boardMode: "solve",
        tileEffects: {
          [tileId]: damagePenalty > 0 ? "damage" : "rotate",
        },
        durationMs: 1400,
      });
      audioManager.playRotate();
      audioManager.playSuccess();
      onLevelComplete?.({
        difficulty,
        levelId: currentLevel.id,
        levelIndex,
        score: award,
        totalScore: nextTotalScore,
        stars,
        timeLeft: nextTimeLeft,
        moves: nextMoves,
      });

      completionTimeoutRef.current = window.setTimeout(() => {
        setRoundState((current) => ({
          ...current,
          showLevelComplete: true,
        }));
      }, COMPLETION_DELAY_MS);
      return;
    }

    window.clearTimeout(hintTimeoutRef.current);
    const isTimedOut = nextTimeLeft <= 0;
    setRoundState((current) => ({
      ...current,
      board: nextBoard,
      moves: nextMoves,
      timeLeft: nextTimeLeft,
      hintedTileId: null,
      hintMessage: feedbackMessage,
      hintBadgeLabel: feedbackBadge,
      flowTrail: nextFlowTrail,
      isPaused: isTimedOut ? true : current.isPaused,
      showGameOver: isTimedOut ? true : current.showGameOver,
    }));

    if (feedbackMessage) {
      scheduleFeedbackReset();
    }

    if (isTimedOut) {
      audioManager.playFail();
      return;
    }

    audioManager.playRotate();
  }

  function handleHint() {
    if (gameplayPaused || showLevelComplete || showGameOver || hintsLeft <= 0) {
      return;
    }

    const recommendation = getHintRecommendation(board, currentLevel, moves);

    if (!recommendation) {
      return;
    }

    window.clearTimeout(hintTimeoutRef.current);
    setRoundState((current) => ({
      ...current,
      hintsLeft: Math.max(current.hintsLeft - 1, 0),
      hintedTileId: recommendation.id,
      hintMessage: recommendation.message,
      hintBadgeLabel: recommendation.badgeLabel,
      aiInsight: "",
      aiSolverLabel: "",
    }));
    scheduleFeedbackReset();
    audioManager.playHint();
  }

  function handleUseTimeBoost() {
    if (gameplayPaused || showLevelComplete || showGameOver || (powerUps.boost ?? 0) <= 0) {
      return;
    }

    const addedTime = POWER_UP_TIME_BONUS[difficulty] ?? 12;
    triggerFx({
      boardMode: "boost",
      durationMs: 1100,
    });

    window.clearTimeout(hintTimeoutRef.current);
    setRoundState((current) => ({
      ...current,
      timeLeft: current.timeLeft + addedTime,
      powerUps: {
        ...current.powerUps,
        boost: Math.max((current.powerUps?.boost ?? 0) - 1, 0),
      },
      hintMessage: `Overclock aktivan: +${addedTime}s dodatnog vremena.`,
      hintBadgeLabel: "+T",
      hintedTileId: null,
      aiInsight: "",
      aiSolverLabel: "",
    }));
    scheduleFeedbackReset(2200);
    audioManager.playClick();
  }

  function handleUseStabilizer() {
    if (
      gameplayPaused ||
      showLevelComplete ||
      showGameOver ||
      (powerUps.stabilizer ?? 0) <= 0
    ) {
      return;
    }

    const recommendation = stabilizerRecommendation;

    if (!recommendation) {
      const blockedRecommendation = getHintRecommendation(board, currentLevel, moves);

      if (blockedRecommendation?.lockMovesRemaining > 0) {
        triggerFx({
          boardMode: "lock",
          tileEffects: {
            [blockedRecommendation.id]: "lock",
          },
          durationMs: 900,
        });
        window.clearTimeout(hintTimeoutRef.current);
        setRoundState((current) => ({
          ...current,
          hintedTileId: blockedRecommendation.id,
          hintMessage: `Stabilizator čeka otključavanje polja ${
            blockedRecommendation.row + 1
          }-${blockedRecommendation.column + 1}. Još ${
            blockedRecommendation.lockMovesRemaining
          } poteza.`,
          hintBadgeLabel: `L${blockedRecommendation.lockMovesRemaining}`,
          aiInsight:
            "Stabilizator ne može da poravna ključnu cijev dok je boss drži pod lock efektom.",
          aiSolverLabel: "Stabilizator blokiran",
        }));
        scheduleFeedbackReset(2200);
        audioManager.playWarning();
      }

      return;
    }

    const nextBoard = board.map((row) =>
      row.map((tile) =>
        tile.id === recommendation.id
          ? { ...tile, rotation: tile.correctRotation }
          : tile,
      ),
    );
    const result = analyzeFlow(nextBoard);
    const nextFlowTrail = result.success ? result.path : result.reachable;
    const positionLabel = `${recommendation.row + 1}-${recommendation.column + 1}`;
    triggerFx({
      boardMode: "stabilize",
      tileEffects: {
        [recommendation.id]: "stabilize",
      },
      durationMs: 1150,
    });

    if (result.success && !completionHandledRef.current) {
      const award = calculateLevelScore({
        timeLeft,
        moves,
      });
      const stars = calculateLevelStars({
        timeLeft,
        timeLimit,
        moves,
        moveTarget: currentLevel.moveTarget,
        hintsUsed,
      });
      const nextTotalScore = score + award;

      completionHandledRef.current = true;
      setScore(nextTotalScore);
      setRoundState((current) => ({
        ...current,
        board: nextBoard,
        powerUps: {
          ...current.powerUps,
          stabilizer: Math.max((current.powerUps?.stabilizer ?? 0) - 1, 0),
        },
        hintedTileId: recommendation.id,
        hintMessage: `Stabilizator je zaključao cijev na polju ${positionLabel}.`,
        hintBadgeLabel: "FIX",
        aiInsight: "",
        aiSolverLabel: "",
        flowTrail: nextFlowTrail,
        isPaused: true,
        scoreAward: award,
        earnedStars: stars,
      }));
      audioManager.playRotate();
      audioManager.playSuccess();
      onLevelComplete?.({
        difficulty,
        levelId: currentLevel.id,
        levelIndex,
        score: award,
        totalScore: nextTotalScore,
        stars,
        timeLeft,
        moves,
      });

      completionTimeoutRef.current = window.setTimeout(() => {
        setRoundState((current) => ({
          ...current,
          showLevelComplete: true,
        }));
      }, COMPLETION_DELAY_MS);
      return;
    }

    window.clearTimeout(hintTimeoutRef.current);
    setRoundState((current) => ({
      ...current,
      board: nextBoard,
      powerUps: {
        ...current.powerUps,
        stabilizer: Math.max((current.powerUps?.stabilizer ?? 0) - 1, 0),
      },
      hintedTileId: recommendation.id,
      hintMessage: `Stabilizator je poravnao ključnu cijev na polju ${positionLabel}.`,
      hintBadgeLabel: "FIX",
      aiInsight: "",
      aiSolverLabel: "",
      flowTrail: nextFlowTrail,
    }));
    scheduleFeedbackReset(2200);
    audioManager.playRotate();
  }

  function handleRestart() {
    audioManager.playClick();
    resetRound(currentLevel);
  }

  function handlePauseToggle() {
    if (showLevelComplete || showGameOver || showTutorial || showBossIntro) {
      return;
    }

    audioManager.playClick();
    setRoundState((current) => ({
      ...current,
      isPaused: !current.isPaused,
    }));
  }

  function handleNextLevel() {
    audioManager.playClick();

    if (isFinalLevel) {
      onExitToMenu();
      return;
    }

    const nextIndex = levelIndex + 1;
    setLevelIndex(nextIndex);
    resetRound(levels[nextIndex], {
      showBossIntroOnReset: Boolean(levels[nextIndex].isBoss),
    });
  }

  function handleDismissTutorial() {
    setShowTutorial(false);
    onTutorialSeen?.();
  }

  function handleStartBossLevel() {
    setShowBossIntro(false);
  }

  function handleExitToMenuClick() {
    audioManager.playClick();
    onExitToMenu();
  }

  const completionMode = difficulty === "daily" ? "daily" : isFinalLevel ? "campaign" : "level";
  const backgroundClassName = getGameBackgroundClass(currentLevel, difficulty);
  const backgroundImage = currentLevel.background ?? "/assets/backgrounds/bg-game.png";

  return (
    <section
      className={`scene-frame game-screen ${isCriticalTime ? "is-time-critical" : ""} ${
        isLevelCleared ? "is-level-cleared" : ""
      } ${isBossLevel ? "is-boss-stage" : ""} ${isUltraLevel ? "is-ultra-stage" : ""} ${
        bossEventState.active ? "is-boss-event-active" : ""
      } ${fxState.boardMode ? `is-fx-${fxState.boardMode}` : ""} ${
        bossProfile ? `boss-theme-${bossProfile.id}` : ""
      } ${backgroundClassName}`}
      style={{ backgroundImage: `url("${backgroundImage}")` }}
    >
      <div className="game-screen__fx-layer" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((index) => (
          <span key={index} className={`game-screen__fx-orb game-screen__fx-orb--${index + 1}`} />
        ))}
        {isUltraLevel ? (
          <div
            className={`game-screen__ultra-atmo ${bossEventState.active ? "is-alert" : ""} ${
              isLevelCleared ? "is-cleared" : ""
            }`}
          >
            <img
              className="game-screen__ultra-atmo-ring"
              src="/assets/boss/ultra-fx-ring.png"
              alt=""
            />
            {!isBoardZoneSplit ? (
              <>
                <img
                  className="game-screen__ultra-atmo-steam game-screen__ultra-atmo-steam--left"
                  src="/assets/boss/ultra-fx-steam.png"
                  alt=""
                />
                <img
                  className="game-screen__ultra-atmo-steam game-screen__ultra-atmo-steam--right"
                  src="/assets/boss/ultra-fx-steam.png"
                  alt=""
                />
              </>
            ) : null}
            {bossEventState.active && !isBoardZoneSplit ? (
              <img
                className="game-screen__ultra-atmo-crack"
                src="/assets/boss/ultra-fx-crack.png"
                alt=""
              />
            ) : null}
            {isCriticalTime && !isBoardZoneSplit ? (
              <img
                className="game-screen__ultra-atmo-alert"
                src="/assets/boss/ultra-fx-alert.png"
                alt=""
              />
            ) : null}
          </div>
        ) : null}
        <span className="game-screen__scanline" />
        <span className="game-screen__pulse-ring" />
      </div>

      <div className="game-screen__content">
        <div ref={topbarRef} className="game-screen__topbar">
          <div className="game-screen__topbar-brand">
            <button
              type="button"
              className="game-screen__back-button"
              onClick={handleExitToMenuClick}
              aria-label="Povratak na početni meni"
              title="Nazad na početni"
            >
              <span className="game-screen__back-button-shell" aria-hidden="true">
                <BackGlyph />
              </span>
              <span className="game-screen__back-button-label">Nazad</span>
            </button>

            <img
              className="game-screen__mini-logo"
              src="/assets/logo/piperush-logo.png"
              alt="PipeRush"
            />
          </div>

          <div className="game-screen__topbar-actions">
            <div className="game-screen__topbar-controls">
              <button
                type="button"
                className="secondary-button secondary-button--compact"
                onClick={onToggleAudio}
                aria-label={audioMuted ? "Uključi zvuk" : "Isključi zvuk"}
              >
                Zvuk: {audioMuted ? "OFF" : "ON"}
              </button>
            </div>

            <div className="game-screen__topbar-meta">
              <div className="mode-chip">Težina: {displayDifficultyLabel}</div>
              <div className="mode-chip">Igrač: {displayPlayerName}</div>
              {currentLevel.isDaily ? <div className="mode-chip is-daily">Dnevni izazov</div> : null}
              {isBossLevel ? <div className="mode-chip is-boss">Boss nivo</div> : null}
              {isUltraLevel ? <div className="mode-chip is-ultra">Ultra hard</div> : null}
              {isBossLevel && bossProfile?.codename ? (
                <div className="mode-chip is-boss-profile">{displayBossCodename}</div>
              ) : null}
            </div>

            <div className="game-screen__topbar-state">
              {showPauseModal ? (
                <div className="top-status-chip">{flowStateLabel}</div>
              ) : isCriticalTime ? (
                <div className="top-status-chip is-warning">Požuri</div>
              ) : isLevelCleared ? (
                <div className="top-status-chip is-success">{flowStateLabel}</div>
              ) : (
                <div className="top-status-chip">{flowStateLabel}</div>
              )}
            </div>
          </div>
        </div>

        {isBossLevel ? (
          <div
            className={`boss-status-banner ${bossEventState.active ? "is-active" : ""} ${
              isUltraLevel ? "is-ultra" : ""
            }`}
          >
            <div className="boss-status-banner__portrait" aria-hidden="true">
              {bossPortraitStyle ? (
                <span
                  className="boss-status-banner__portrait-image"
                  style={bossPortraitStyle}
                />
              ) : (
                <span className="boss-status-banner__portrait-fallback">!</span>
              )}
              <span className="boss-status-banner__portrait-tag">
                {isUltraLevel ? "ULTRA" : "BOSS"}
              </span>
            </div>
            <div className="boss-status-banner__label">
              <span>Upozorenje bossa</span>
              <strong>{displayBossName}</strong>
            </div>
            <div className="boss-status-banner__value">
              {bossEventState.active ? (
                <span className="boss-status-banner__event-pill">Efekat bossa aktiviran</span>
              ) : null}
              <span className="boss-status-banner__message">
                {bossEventState.active
                  ? bossEventState.message
                  : bossBannerDefaultMessage}
              </span>
            </div>
            <div className="boss-status-banner__count">
              <span>{bossPhaseState.label} · Talasi {String(bossEventsTriggered).padStart(2, "0")}</span>
              <strong>Pritisak {bossPressureValue}%</strong>
            </div>
            <div className="boss-status-banner__meter" aria-hidden="true">
              <span
                className="boss-status-banner__meter-fill"
                style={{ width: `${Math.max(bossPressureValue, 10)}%` }}
              />
            </div>
          </div>
        ) : null}

        <div ref={hudRef} className={`game-screen__hud-wrap ${roundResetPhase}`}>
          <HUD
            score={displayedScore}
            scoreDetail={scoreDetail}
            timeDisplay={formatTime(timeLeft)}
            levelDisplay={`${String(levelIndex + 1).padStart(2, "0")} / ${String(
              levels.length,
            ).padStart(2, "0")}`}
            moves={moves}
            hintsLeft={hintsLeft}
            powerUps={powerUps}
            timeRatio={timeRatio}
            isCriticalTime={isCriticalTime}
            isPaused={gameplayPaused}
            onHint={handleHint}
            onRestart={handleRestart}
            onPauseToggle={handlePauseToggle}
            onMenu={handleExitToMenuClick}
            onUseTimeBoost={handleUseTimeBoost}
            onUseStabilizer={handleUseStabilizer}
            canUseHint={hintsLeft > 0 && !showLevelComplete && !showGameOver && !showTutorial && !showBossIntro}
            canUseTimeBoost={
              (powerUps.boost ?? 0) > 0 &&
              !showLevelComplete &&
              !showGameOver &&
              !showTutorial &&
              !showBossIntro
            }
            canUseStabilizer={
              (powerUps.stabilizer ?? 0) > 0 &&
              Boolean(stabilizerRecommendation) &&
              !showLevelComplete &&
              !showGameOver &&
              !showTutorial &&
              !showBossIntro
            }
            compact={isUltraLevel}
          />
        </div>

        <div
          className={`game-screen__board-zone ${isBoardZoneSplit ? "is-split" : ""} ${roundResetPhase}`}
        >
          <GameBoard
            board={board}
            gridSize={currentLevel.gridSize}
            levelName={displayLevelName}
            difficultyLabel={displayDifficultyLabel}
            levelDisplay={`${String(levelIndex + 1).padStart(2, "0")} / ${String(
              levels.length,
            ).padStart(2, "0")}`}
            activeFlowTiles={flowTrail}
            hintedTileId={hintedTileId}
            hintBadgeLabel={hintBadgeLabel}
            onRotate={handleRotate}
            isPaused={showPauseModal}
            isSolved={isLevelCleared}
            moveCount={moves}
            isBoss={isBossLevel}
            isUltra={isUltraLevel}
            boardFxMode={fxState.boardMode}
            tileFxById={fxState.tileFxById}
            fitWidth={boardFitWidth}
            resetPhase={roundResetPhase}
          />

          <div
            className={`game-screen__aside-column ${isUltraLevel ? "is-ultra" : ""}`}
          >
            <div className="status-card">
              <div className="status-card__content">
                <div className="status-card__eyebrow">Cilj</div>
                <div className="status-card__title">{displayBriefing}</div>
                <p className="status-card__copy">{objectiveCopy}</p>
                <div
                  className={`status-card__hint ${hintMessage ? "is-active" : ""}`}
                  aria-live="polite"
                >
                  {hintMessage || fallbackHintMessage}
                </div>
                <div className="status-card__analysis">
                    <span className="status-card__analysis-label">{displayedAiLabel}</span>
                    <p>{displayedAiInsight}</p>
                </div>
                {isUltraLevel ? (
                  <div className="status-card__analysis status-card__analysis--danger">
                    <span className="status-card__analysis-label">Ultra hard</span>
                    <p>{ultraWarningCopy}</p>
                  </div>
                ) : null}
                <div className="status-card__progress">
                  <div className="status-card__progress-topline">
                    <span>Napredak protoka</span>
                    <strong>{pathProgress}%</strong>
                  </div>
                  <div className="status-card__progress-track" aria-hidden="true">
                    <span
                      className="status-card__progress-fill"
                      style={{ width: `${pathProgress}%` }}
                    />
                  </div>
                </div>
                {boardLegendItems.length > 0 ? (
                  <div className="status-card__legend" aria-label="Specijalna polja">
                    {boardLegendItems.map((item) => (
                      <span
                        key={item.key}
                        className={`status-card__legend-chip is-${item.key}`}
                      >
                        <strong>{item.badge}</strong>
                        <span>{item.label}</span>
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              {!isUltraLevel ? (
                <div className="status-card__visual" aria-hidden="true">
                  <img src="/assets/legacy/review-pipe.svg" alt="" />
                </div>
              ) : null}

              <div className="status-card__cluster">
                <div className="status-card__pill">
                  {showLevelComplete
                    ? "Mreža stabilna"
                    : showGameOver
                      ? "Tok prekinut"
                      : flowTrail.length > 1
                        ? `${flowStateLabel} ${String(flowTrail.length).padStart(2, "0")}`
                        : "Čeka povezivanje"}
                </div>
                <div className="status-card__subpill">
                  Rekord nivoa {levelProgress.bestScore > 0 ? levelProgress.bestScore : "000"}
                </div>
                <div className="status-card__subpill">
                  Meta poteza {String(currentLevel.moveTarget).padStart(2, "0")}
                </div>
                {!isUltraLevel ? (
                  <>
                    <div className="status-card__subpill">Režim {specialRuleLabel}</div>
                    <div className="status-card__subpill">Igrač {displayPlayerName}</div>
                    <div
                      className="status-card__subpill status-card__subpill--powerups"
                      data-boost={powerUps.boost ?? 0}
                      data-stabilizer={powerUps.stabilizer ?? 0}
                    >
                      Pojačanja B{powerUps.boost ?? 0} / S{powerUps.stabilizer ?? 0}
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {isUltraLevel ? (
              <UltraBossMonitor
                levelName={currentLevel.name}
                progress={pathProgress}
                moves={moves}
                bossWaves={bossEventsTriggered}
                isCritical={isCriticalTime}
                isBossEventActive={bossEventState.active}
                bossEventMessage={bossEventState.message}
                isSolved={isLevelCleared}
                isGameOver={showGameOver}
              />
            ) : null}
          </div>
        </div>
      </div>

      {showTutorial ? <TutorialOverlay onContinue={handleDismissTutorial} /> : null}

      {showBossIntro ? (
        <BossIntroModal
          levelName={displayLevelName}
          bossProfile={bossProfile}
          difficultyLabel={difficultyDetails.label}
          eventLabel={bossEventLabel}
          briefing={displayBriefing}
          timeLimit={timeLimit}
          moveTarget={currentLevel.moveTarget}
          hintCount={currentLevel.hints ?? defaultHints}
          isUltra={isUltraLevel}
          onStart={handleStartBossLevel}
          onClose={onExitToMenu}
        />
      ) : null}

      {showPauseModal ? (
        <PauseModal
          onResume={handlePauseToggle}
          onRestart={handleRestart}
          onMenu={handleExitToMenuClick}
        />
      ) : null}

      {showLevelComplete ? (
        <LevelCompleteModal
          levelName={displayLevelName}
          scoreAward={scoreAward}
          totalScore={score}
          moves={moves}
          timeLeft={timeLeft}
          stars={earnedStars}
          completionMode={completionMode}
          isUltraLevel={isUltraLevel}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
          onMenu={handleExitToMenuClick}
        />
      ) : null}

      {showGameOver ? (
        <GameOverModal
          levelName={displayLevelName}
          score={score}
          onRestart={handleRestart}
          onMenu={handleExitToMenuClick}
        />
      ) : null}
    </section>
  );
}

export default GameScreen;

