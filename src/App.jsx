import { useEffect, useState } from "react";
import GameScreen from "./components/GameScreen.jsx";
import MainMenu from "./components/MainMenu.jsx";
import { campaignDifficultyKeys, levelsByDifficulty } from "./data/levels.js";
import { audioManager } from "./utils/audio.js";
import {
  createDefaultProgress,
  getSuggestedLevelIndex,
  markTutorialSeen,
  readProgress,
  rememberSelection,
  recordLevelCompletion,
  resetStoredProgress,
  updatePlayerName,
  writeProgress,
} from "./utils/progress.js";

function readDebugStart() {
  if (!import.meta.env.DEV || typeof window === "undefined") {
    return null;
  }

  const debugStart = new URLSearchParams(window.location.search).get("debugStart");

  if (!debugStart) {
    return null;
  }

  const [difficulty, rawLevelIndex] = debugStart.split(":");
  const parsedLevelIndex = Number(rawLevelIndex);
  const levels = levelsByDifficulty[difficulty] ?? null;

  if (
    !difficulty ||
    !levels ||
    Number.isNaN(parsedLevelIndex) ||
    parsedLevelIndex < 0 ||
    parsedLevelIndex >= levels.length
  ) {
    return null;
  }

  return {
    difficulty,
    levelIndex: parsedLevelIndex,
  };
}

const CRITICAL_IMAGE_ASSETS = [
  "/assets/logo/piperush-logo.png",
  "/assets/backgrounds/bg-menu.png",
  "/assets/backgrounds/bg-game.png",
  "/assets/backgrounds/bg-boss-core.png",
  "/assets/illustrations/menu-hero-pipe-puzzle.png",
  "/assets/boss/concepts/boss-easy-card.png",
  "/assets/boss/concepts/boss-medium-card.png",
  "/assets/boss/concepts/boss-hard-card.png",
  "/assets/boss/concepts/boss-reactor-concept.png",
];

function App() {
  const debugStart = readDebugStart();
  const [isBooting, setIsBooting] = useState(true);
  const [progress, setProgress] = useState(() => {
    const initialProgress = readProgress();

    return debugStart
      ? {
          ...rememberSelection(initialProgress, debugStart.difficulty, debugStart.levelIndex),
          tutorialSeen: true,
        }
      : initialProgress;
  });
  const [audioMuted, setAudioMuted] = useState(() => {
    audioManager.initializeSettings();
    return audioManager.isMuted();
  });
  const [screen, setScreen] = useState(() => (debugStart ? "game" : "menu"));
  const [selectedDifficulty, setSelectedDifficulty] = useState(
    () => debugStart?.difficulty ?? progress.lastDifficulty ?? "easy",
  );
  const [startingLevelIndex, setStartingLevelIndex] = useState(() =>
    debugStart?.levelIndex ??
      getSuggestedLevelIndex(progress, debugStart?.difficulty ?? progress.lastDifficulty ?? "easy"),
  );
  const [sessionKey, setSessionKey] = useState(() => (debugStart ? 1 : 0));

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsBooting(false);
      return undefined;
    }

    const bootTimeout = window.setTimeout(() => {
      setIsBooting(false);
    }, 90);

    return () => {
      window.clearTimeout(bootTimeout);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const preloadedImages = CRITICAL_IMAGE_ASSETS.map((source) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = source;
      return image;
    });

    return () => {
      preloadedImages.length = 0;
    };
  }, []);

  useEffect(() => {
    writeProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        audioManager.pauseBackground();
        return;
      }

      if (!audioMuted) {
        audioManager.resumeBackground().catch(() => {});
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [audioMuted]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.scrollTo(0, 0);
  }, [screen, sessionKey]);

  useEffect(
    () => () => {
      audioManager.stopBackground();
    },
    [],
  );

  useEffect(() => {
    if (!import.meta.env.DEV || typeof window === "undefined") {
      return undefined;
    }

    window.__PIPE_RUSH_DEBUG__ = {
      ...(window.__PIPE_RUSH_DEBUG__ ?? {}),
      startLevel: (difficulty, levelIndex = 0) => {
        const nextLevelIndex =
          typeof levelIndex === "number"
            ? levelIndex
            : getSuggestedLevelIndex(progress, difficulty);

        setSelectedDifficulty(difficulty);
        setStartingLevelIndex(nextLevelIndex);
        setProgress((current) => rememberSelection(current, difficulty, nextLevelIndex));
        setSessionKey((current) => current + 1);
        audioManager.unlock();
        audioManager.startBackground();
        setScreen("game");
      },
      selectDifficulty: (difficulty) => {
        setSelectedDifficulty(difficulty);
        setStartingLevelIndex(getSuggestedLevelIndex(progress, difficulty));
        setProgress((current) =>
          rememberSelection(current, difficulty, getSuggestedLevelIndex(current, difficulty)),
        );
      },
      resetProgress: () => {
        resetStoredProgress();
        const nextProgress = createDefaultProgress();
        setProgress(nextProgress);
        setSelectedDifficulty(nextProgress.lastDifficulty);
        setStartingLevelIndex(0);
        setScreen("menu");
      },
    };

    return () => {
      if (!window.__PIPE_RUSH_DEBUG__) {
        return;
      }

      delete window.__PIPE_RUSH_DEBUG__.startLevel;
      delete window.__PIPE_RUSH_DEBUG__.selectDifficulty;
      delete window.__PIPE_RUSH_DEBUG__.resetProgress;
    };
  }, [progress]);

  function handleSelectDifficulty(difficulty) {
    setSelectedDifficulty(difficulty);
    setStartingLevelIndex(getSuggestedLevelIndex(progress, difficulty));
    setProgress((current) =>
      rememberSelection(current, difficulty, getSuggestedLevelIndex(current, difficulty)),
    );
  }

  function handleStartGame({ difficulty, levelIndex }) {
    const nextLevelIndex =
      typeof levelIndex === "number"
        ? levelIndex
        : getSuggestedLevelIndex(progress, difficulty);

    setSelectedDifficulty(difficulty);
    setStartingLevelIndex(nextLevelIndex);
    setProgress((current) => rememberSelection(current, difficulty, nextLevelIndex));
    setSessionKey((current) => current + 1);
    audioManager.unlock();
    audioManager.startBackground();
    setScreen("game");
  }

  function handleTrackLevel(difficulty, levelIndex) {
    setProgress((current) => rememberSelection(current, difficulty, levelIndex));
  }

  function handleLevelComplete(result) {
    setProgress((current) => recordLevelCompletion(current, result));
  }

  function handleTutorialSeen() {
    setProgress((current) => markTutorialSeen(current));
  }

  function handleUpdatePlayerName(playerName) {
    setProgress((current) => updatePlayerName(current, playerName));
  }

  function handleResetProgress() {
    resetStoredProgress();
    const nextProgress = createDefaultProgress();
    setProgress(nextProgress);
    setSelectedDifficulty(nextProgress.lastDifficulty);
    setStartingLevelIndex(0);
    setScreen("menu");
  }

  async function handleToggleAudio() {
    const wasMuted = audioManager.isMuted();

    if (!wasMuted) {
      await audioManager.playClick().catch(() => {});
    }

    const nextMuted = await audioManager.setMuted(!wasMuted).catch(() => !wasMuted);
    setAudioMuted(nextMuted);

    if (!nextMuted) {
      await audioManager.startBackground().catch(() => {});
      await audioManager.playClick().catch(() => {});
    }
  }

  function handleReturnToMenu() {
    if (!campaignDifficultyKeys.includes(selectedDifficulty)) {
      setSelectedDifficulty(progress.lastDifficulty ?? "easy");
    }

    setScreen("menu");
  }

  return (
    <div className={`app-shell ${isBooting ? "is-booting" : "is-ready"}`}>
      <div className="app-shell__veil" aria-hidden="true" />
      <div className="app-shell__stage">
        {screen === "menu" ? (
          <MainMenu
            progress={progress}
            audioMuted={audioMuted}
            selectedDifficulty={selectedDifficulty}
            onSelectDifficulty={handleSelectDifficulty}
            onToggleAudio={handleToggleAudio}
            onPlay={handleStartGame}
            onUpdatePlayerName={handleUpdatePlayerName}
            onResetProgress={handleResetProgress}
          />
        ) : (
          <GameScreen
            key={`${selectedDifficulty}-${startingLevelIndex}-${sessionKey}`}
            difficulty={selectedDifficulty}
            startingLevelIndex={startingLevelIndex}
            progress={progress}
            audioMuted={audioMuted}
            onExitToMenu={handleReturnToMenu}
            onTrackLevel={handleTrackLevel}
            onToggleAudio={handleToggleAudio}
            onLevelComplete={handleLevelComplete}
            onTutorialSeen={handleTutorialSeen}
          />
        )}
      </div>
    </div>
  );
}

export default App;
