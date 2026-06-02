import { useState } from "react";
import {
  campaignDifficultyKeys,
  difficultyConfig,
  levelsByDifficulty,
} from "../data/levels.js";
import { showcaseArt } from "../data/showcaseArt.js";
import { getBossVisual } from "../data/bossVisuals.js";
import { audioManager } from "../utils/audio.js";
import {
  getDifficultySummary,
  getLeaderboardEntries,
  getLevelProgress,
  getProgressTotals,
  getSuggestedLevelIndex,
} from "../utils/progress.js";
import CampaignMap from "./CampaignMap.jsx";
import LeaderboardModal from "./LeaderboardModal.jsx";
import LevelSelectModal from "./LevelSelectModal.jsx";

const difficultyAssets = {
  easy: "/assets/ui/btn-easy.png",
  medium: "/assets/ui/btn-medium.png",
  hard: "/assets/ui/btn-hard.png",
};

const difficultyStars = {
  easy: 1,
  medium: 2,
  hard: 3,
};

const menuHeroArtwork = showcaseArt.menuHeroScene;

function formatCountLabel(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function MenuGlyph({ name, className = "" }) {
  const classes = ["menu-glyph", className].filter(Boolean).join(" ");

  switch (name) {
    case "drop":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 3.4C12 3.4 6 10 6 14.2A6 6 0 0 0 18 14.2C18 10 12 3.4 12 3.4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M9.4 14.8C9.4 16.2 10.6 17.4 12 17.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    case "volume-on":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 14H8.6L13 18V6L8.6 10H5V14Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M16.4 9.2C17.6 10 18.4 11.4 18.4 13S17.6 16 16.4 16.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M18.6 6.8C20.6 8.2 22 10.4 22 13S20.6 17.8 18.6 19.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "volume-off":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 14H8.6L13 18V6L8.6 10H5V14Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M17 10L22 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M22 10L17 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "stack":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3L21 8L12 13L3 8L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M3 12L12 17L21 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M3 16L12 21L21 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "shield":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M12 3L19 6V11.4C19 16.2 15.9 19.4 12 21C8.1 19.4 5 16.2 5 11.4V6L12 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M9.2 12.2L11.2 14.2L15.2 10.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "diamond":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 4H16L21 10L12 20L3 10L8 4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 4L12 10L16 4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M3 10H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "clock":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 7.4V12L15.2 13.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "user":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M5.4 19C6.8 16.2 9 14.8 12 14.8C15 14.8 17.2 16.2 18.6 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "check":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8.4 12.2L10.8 14.6L15.8 9.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "trophy":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M8 4H16V8.6C16 10.8 14.2 12.6 12 12.6C9.8 12.6 8 10.8 8 8.6V4Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M8 5.4H5.8C5.4 5.4 5 5.8 5 6.2V6.8C5 8.8 6.6 10.4 8.6 10.4H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 5.4H18.2C18.6 5.4 19 5.8 19 6.2V6.8C19 8.8 17.4 10.4 15.4 10.4H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 12.8V17.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M8.6 20H15.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "medal":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 3H15L13.2 8H10.8L9 3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <circle cx="12" cy="14.4" r="5.6" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 11.6L12.9 13.4L14.8 13.7L13.4 15.1L13.8 17L12 16L10.2 17L10.6 15.1L9.2 13.7L11.1 13.4L12 11.6Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4.2" y="5.8" width="15.6" height="13.6" rx="2.4" stroke="currentColor" strokeWidth="1.8" />
          <path d="M8 3.8V7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M16 3.8V7.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M4.2 9.4H19.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "grid":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="4.2" y="4.2" width="5.4" height="5.4" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14.4" y="4.2" width="5.4" height="5.4" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="4.2" y="14.4" width="5.4" height="5.4" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
          <rect x="14.4" y="14.4" width="5.4" height="5.4" rx="1.2" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "arrow-right":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 12H18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M13 7L18 12L13 17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "play":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="8.8" stroke="currentColor" strokeWidth="1.8" />
          <path d="M10 8.9L15.2 12L10 15.1V8.9Z" fill="currentColor" />
        </svg>
      );
    case "reset":
      return (
        <svg className={classes} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M8.2 8.4H4.6V4.8"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5 12C5 8.1 8.1 5 12 5C14.2 5 16.2 6 17.5 7.6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M15.8 15.6H19.4V19.2"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M19 12C19 15.9 15.9 19 12 19C9.8 19 7.8 18 6.5 16.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </svg>
      );
    default:
      return null;
  }
}

function HeroPreview() {
  return (
    <div className="menu-hero-preview menu-hero-preview--artwork">
      <span className="menu-hero-preview__halo" aria-hidden="true" />
      <span className="menu-hero-preview__glass" aria-hidden="true" />
      <span className="menu-hero-preview__frame" aria-hidden="true" />
      <span className="menu-hero-preview__art-shell" aria-hidden="true">
        <span className="menu-hero-preview__art-backdrop" />
        <img
          className="menu-hero-preview__image"
          src={menuHeroArtwork}
          alt=""
        />
      </span>
      <span className="menu-hero-preview__status menu-hero-preview__status--artwork">
        <span>Primarna ruta</span>
        <strong>Tok spreman</strong>
      </span>
    </div>
  );
}

function MainMenu({
  progress,
  audioMuted,
  audioStatus,
  selectedDifficulty,
  onSelectDifficulty,
  onToggleAudio,
  onPlay,
  onUpdatePlayerName,
  onResetProgress,
}) {
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const difficulty = difficultyConfig[selectedDifficulty];
  const levels = levelsByDifficulty[selectedDifficulty];
  const availableLevels = levels.length;
  const difficultySummary = getDifficultySummary(progress, selectedDifficulty);
  const campaignTotals = getProgressTotals(progress);
  const difficultyLeaderboard = getLeaderboardEntries(progress, {
    difficulty: selectedDifficulty,
    limit: 5,
  });
  const globalLeaderboard = getLeaderboardEntries(progress, { limit: 10 });
  const suggestedLevelIndex = getSuggestedLevelIndex(progress, selectedDifficulty);
  const suggestedLevel = levels[suggestedLevelIndex];
  const bossLevelCount = levels.filter((level) => level.isBoss).length;
  const bossLevel = levels.find((level) => level.isBoss) ?? null;
  const bossLevelIndex = levels.findIndex((level) => level.isBoss);
  const ultraLevel = levels.find((level) => level.isUltra) ?? null;
  const bossVisual = bossLevel?.bossProfile
    ? getBossVisual(bossLevel.bossProfile, { isUltra: bossLevel.isUltra })
    : null;
  const dailyLevel = levelsByDifficulty.daily[0];
  const dailyProgress = getLevelProgress(progress, "daily", dailyLevel.id);
  const dailyLabel = dailyLevel.dateKey ?? dailyLevel.id.replace("daily-", "");
  const difficultyCompletionRate =
    availableLevels > 0
      ? Math.round((difficultySummary.completedCount / availableLevels) * 100)
      : 0;
  const remainingMissionCount = Math.max(availableLevels - difficultySummary.completedCount, 0);
  const bossDistance = bossLevelIndex >= 0 ? Math.max(bossLevelIndex - suggestedLevelIndex, 0) : 0;
  const bossApproachRate =
    bossLevelIndex > 0
      ? Math.max(0, Math.min(100, Math.round((suggestedLevelIndex / bossLevelIndex) * 100)))
      : bossLevel
        ? 100
        : 0;
  const isBossEncounterImminent = Boolean(
    bossLevel?.id && suggestedLevel?.id && bossLevel.id === suggestedLevel.id,
  );
  const isUltraEncounterImminent = Boolean(
    ultraLevel?.id && suggestedLevel?.id && ultraLevel.id === suggestedLevel.id,
  );
  const campaignAlertLabel = isUltraEncounterImminent
    ? "Ultra završnica je sljedeća."
    : isBossEncounterImminent
      ? "Boss susret je sljedeći."
      : bossLevel?.bossProfile
        ? "Boss sektor čeka dublje u ruti."
        : "";
  const threatMeterLabel = isUltraEncounterImminent
    ? "Ultra susret"
    : isBossEncounterImminent
      ? "Boss susret"
        : bossLevel?.bossProfile
          ? `Boss za ${formatCountLabel(bossDistance, "misiju", "misija")}`
          : "Ruta čista";

  const playerDisplayName = progress.playerName.trim();
  const playerCardTitle = playerDisplayName || "Unesi ime";
  const heroChips = [
    {
      key: "levels",
      icon: "stack",
      label: formatCountLabel(availableLevels, "nivo", "nivoa"),
    },
    {
      key: "bosses",
      icon: "shield",
      label: formatCountLabel(bossLevelCount, "boss nivo", "boss nivoa"),
    },
    {
      key: "time",
      icon: "clock",
      label: `Vrijeme ${difficulty.defaultTime}s`,
    },
    {
      key: "player",
      icon: "user",
      label: playerDisplayName ? `Igrač ${playerDisplayName}` : "Ime nije postavljeno",
    },
  ];
  const summaryCards = [
    {
      key: "completed",
      icon: "check",
      label: "Završeni nivoi",
      value: `${campaignTotals.completedCount} / ${campaignTotals.totalLevels}`,
      detail: "Kampanja ukupno",
    },
    {
      key: "score",
      icon: "trophy",
      label: "Ukupan rekord",
      value: String(campaignTotals.bestScore),
      detail: "Najbolji zbirni rezultat",
    },
    {
      key: "medals",
      icon: "medal",
      label: "Medalje",
      value: `${campaignTotals.starsEarned} / ${campaignTotals.totalLevels * 3}`,
      detail: "Sakupljene zvjezdice",
    },
  ];
  const audioStatusLabel = audioMuted ? "UGAŠEN" : audioStatus === "on" ? "AKTIVAN" : "SPREMAN";
  const audioToggleTitle = audioMuted
    ? "Uključi zvuk"
    : audioStatus === "on"
      ? "Isključi zvuk"
      : "Zvuk je uključen. Prvi dodir pokreće muziku.";

  function primeAudio() {
    audioManager.startBackground();
    audioManager.playClick();
  }

  function handleResetClick() {
    primeAudio();

    if (
      typeof window !== "undefined" &&
      !window.confirm("Resetovati kampanju i obrisati lokalni progres?")
    ) {
      return;
    }

    onResetProgress();
  }

  function handleDifficultyPointerDown(event) {
    event.preventDefault();
  }

  function handleSelectDifficultyChange(difficultyKey, event) {
    const scrollY = typeof window === "undefined" ? 0 : window.scrollY;

    primeAudio();
    onSelectDifficulty(difficultyKey);

    event.currentTarget.blur();

    if (typeof window !== "undefined") {
      window.requestAnimationFrame(() => {
        window.scrollTo(window.scrollX, scrollY);
      });
    }
  }

  function handleStartCampaign() {
    primeAudio();
    onPlay({
      difficulty: selectedDifficulty,
      levelIndex: getSuggestedLevelIndex(progress, selectedDifficulty),
    });
  }

  function handleStartDaily() {
    primeAudio();
    onPlay({
      difficulty: "daily",
      levelIndex: 0,
    });
  }

  function handleOpenLevelSelect() {
    primeAudio();
    setShowLevelSelect(true);
  }

  function handleOpenLeaderboard() {
    primeAudio();
    setShowLeaderboard(true);
  }

  function handleSelectLevel(levelIndex) {
    primeAudio();
    onPlay({
      difficulty: selectedDifficulty,
      levelIndex,
    });
  }

  return (
    <section
      className="scene-frame menu-screen"
      style={{ backgroundImage: 'url("/assets/backgrounds/bg-menu.png")' }}
    >
      <div className="menu-screen__fx" aria-hidden="true">
        <span className="menu-screen__caustic" />
        <span className="menu-screen__glow menu-screen__glow--1" />
        <span className="menu-screen__glow menu-screen__glow--2" />
        <span className="menu-screen__trace menu-screen__trace--1" />
        <span className="menu-screen__trace menu-screen__trace--2" />
        <span className="menu-screen__trace menu-screen__trace--3" />
        <span className="menu-screen__bubble menu-screen__bubble--1" />
        <span className="menu-screen__bubble menu-screen__bubble--2" />
        <span className="menu-screen__bubble menu-screen__bubble--3" />
        <span className="menu-screen__bubble menu-screen__bubble--4" />
        <span className="menu-screen__ripple menu-screen__ripple--1" />
        <span className="menu-screen__ripple menu-screen__ripple--2" />
      </div>

      <div className="menu-content">
        <div className="menu-command-shell">
          <div className="menu-utility-bar">
            <div className="menu-utility-pill">
              <span className="menu-utility-pill__icon">
                <MenuGlyph name="drop" />
              </span>
              <span>PipeRush kampanja</span>
            </div>
            <button
              type="button"
              className="secondary-button secondary-button--compact menu-audio-toggle"
              onClick={onToggleAudio}
              data-audio-control="toggle"
              aria-label={audioMuted ? "Uključi zvuk" : "Isključi zvuk"}
              title={audioToggleTitle}
            >
              <span className="menu-audio-toggle__icon">
                <MenuGlyph name={audioMuted ? "volume-off" : "volume-on"} />
              </span>
              <span>Zvuk: {audioStatusLabel}</span>
            </button>
          </div>

          <div className="menu-hero-panel">
            <div className="menu-hero-copy">
              <div className="menu-hero-label">
                <MenuGlyph name="shield" />
                <span>Kampanja</span>
              </div>
              <div className="menu-logo-shell">
                <span className="menu-logo-shell__beam" aria-hidden="true" />
                <span className="menu-logo-shell__node menu-logo-shell__node--left" aria-hidden="true" />
                <img
                  className="menu-logo"
                  src="/assets/logo/piperush-logo.png"
                  alt="PipeRush"
                />
                <span className="menu-logo-shell__node menu-logo-shell__node--right" aria-hidden="true" />
              </div>
              <p className="menu-tagline">
                Rotiraj cijevi i zatvori tok prije isteka vremena.
              </p>
              <div className="menu-hero-chips">
                {heroChips.map((chip) => (
                  <span key={chip.key} className="menu-hero-chip">
                    <span className="menu-hero-chip__icon">
                      <MenuGlyph name={chip.icon} />
                    </span>
                    <span>{chip.label}</span>
                  </span>
                ))}
              </div>
              <div className="menu-hero-progress" aria-label={`Napredak za ${difficulty.label}`}>
                <div className="menu-hero-progress__meta">
                  <span>Kampanja {difficulty.label}</span>
                  <strong>{difficultyCompletionRate}% završeno</strong>
                </div>
                <div className="menu-hero-progress__track" aria-hidden="true">
                  <span style={{ width: `${Math.max(difficultyCompletionRate, 6)}%` }} />
                </div>
              </div>
            </div>

            <div className="menu-hero-visual" aria-hidden="true">
              <div className="menu-hero-orbit">
                <span className="menu-hero-visual-ring" />
                <span className="menu-hero-visual-ring menu-hero-visual-ring--inner" />
                <HeroPreview />
              </div>
            </div>
          </div>

          <div className="menu-progress-summary">
            {summaryCards.map((card, index) => (
              <div
                key={card.key}
                className="menu-progress-summary__item"
                style={{ "--summary-delay": `${index * 90}ms` }}
              >
                <span className="menu-progress-summary__icon" aria-hidden="true">
                  <MenuGlyph name={card.icon} />
                </span>
                <div className="menu-progress-summary__body">
                  <span className="menu-progress-summary__label">{card.label}</span>
                  <strong className="menu-progress-summary__value">{card.value}</strong>
                  <span className="menu-progress-summary__detail">{card.detail}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="menu-controls">
            <div className="menu-player-row">
              <label className="menu-player-card" htmlFor="pilot-tag">
                <div className="menu-player-card__visual" aria-hidden="true">
                  <span className="menu-player-card__avatar menu-player-card__avatar--art">
                    <img src={showcaseArt.playerCardBot} alt="" />
                  </span>
                </div>
                <div className="menu-player-card__content">
                  <span className="menu-player-card__label">Ime igrača</span>
                  <strong className="menu-player-card__title">{playerCardTitle}</strong>
                  <span className="menu-player-card__hint">
                    Ime se prikazuje u igri, dnevnom izazovu i na rang listi.
                  </span>
                  <input
                    id="pilot-tag"
                    className="menu-player-card__input"
                    type="text"
                    value={progress.playerName}
                    maxLength={12}
                    spellCheck="false"
                    onChange={(event) => onUpdatePlayerName(event.target.value)}
                    placeholder="Upiši ime"
                  />
                </div>
              </label>

              <button
                type="button"
                className="menu-daily-card"
                onClick={handleStartDaily}
              >
                <div className="menu-daily-card__visual" aria-hidden="true">
                  <span className="menu-daily-card__gem menu-daily-card__gem--art">
                    <img src={showcaseArt.dailyBot} alt="" />
                  </span>
                </div>
                <div className="menu-daily-card__content">
                  <span className="menu-daily-card__label">Dnevni izazov</span>
                  <strong className="menu-daily-card__title">{dailyLevel.name}</strong>
                  <div className="menu-daily-card__stats">
                    <span>
                      <MenuGlyph name="calendar" />
                      {dailyLabel}
                    </span>
                    <span>
                      <MenuGlyph name="grid" />
                      {dailyLevel.gridSize} x {dailyLevel.gridSize}
                    </span>
                    <span>
                      <MenuGlyph name="clock" />
                      {dailyLevel.timeLimit}s
                    </span>
                  </div>
                  <span className="menu-daily-card__meta">
                    {dailyProgress.completed
                      ? `Rekord ${dailyProgress.bestScore}`
                      : "Nova dnevna misija"}
                  </span>
                </div>
                <span className="menu-daily-card__cta" aria-hidden="true">
                  <MenuGlyph name="arrow-right" />
                </span>
              </button>
            </div>

            <div className="menu-launch-deck">
              <div className="menu-launch-deck__header">
                <div className="menu-launch-deck__heading">
                  <div className="menu-details__eyebrow">Početak igre</div>
                  <div className="menu-launch-deck__title">
                    Odaberi težinu i pokreni kampanju
                  </div>
                </div>
                <div className="menu-launch-note">
                  <span className="menu-launch-note__label">Sljedeći nivo</span>
                  <strong className="menu-launch-note__value">
                    {String(suggestedLevelIndex + 1).padStart(2, "0")} / {levels.length}
                  </strong>
                </div>
              </div>

              <div className="difficulty-grid">
                {campaignDifficultyKeys.map((difficultyKey) => {
                  const option = difficultyConfig[difficultyKey];

                  return (
                    <div
                      key={option.key}
                      className={`difficulty-option ${
                        selectedDifficulty === option.key ? "is-selected" : ""
                      }`}
                    >
                      <button
                        type="button"
                        className={`difficulty-button ${
                          selectedDifficulty === option.key ? "is-selected" : ""
                        }`}
                        onMouseDown={handleDifficultyPointerDown}
                        onClick={(event) => handleSelectDifficultyChange(option.key, event)}
                        aria-label={`Izaberi težinu ${option.label}`}
                        aria-pressed={selectedDifficulty === option.key}
                      >
                        <img
                          className="difficulty-button__image"
                          src={difficultyAssets[option.key]}
                          alt=""
                        />
                        <span className="difficulty-button__stars" aria-hidden="true">
                          {Array.from({ length: difficultyStars[option.key] }).map((_, index) => (
                            <span key={`${option.key}-star-${index}`}>{"\u2605"}</span>
                          ))}
                        </span>
                        <span className="sr-only">{option.label}</span>
                      </button>

                      {selectedDifficulty === option.key ? (
                        <span className="difficulty-option__active-badge">Aktivno</span>
                      ) : null}

                      <div className="difficulty-option__meta">
                        <span>
                          {option.gridSize} x {option.gridSize}
                        </span>
                        <span>{option.defaultTime}s</span>
                        <span>{formatCountLabel(option.defaultHints, "savjet", "savjeta")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="menu-start-rack">
                <button
                  type="button"
                  className="menu-start-button"
                  onClick={handleStartCampaign}
                  aria-label={`Pokreni kampanju za težinu ${difficulty.label}`}
                >
                  <span className="menu-start-button__glow" aria-hidden="true" />
                  <span className="menu-start-button__icon" aria-hidden="true">
                    <MenuGlyph name="play" />
                  </span>
                  <span className="menu-start-button__copy">
                    <span className="menu-start-button__eyebrow">Pokreni kampanju</span>
                    <strong className="menu-start-button__title">KRENI</strong>
                  </span>
                  <span className="menu-start-button__shine" aria-hidden="true" />
                  <span className="sr-only">Pokreni kampanju</span>
                </button>
                <p className="menu-start-rack__copy">
                  Pokreće prvi otključani nivo za težinu {difficulty.label}.
                </p>
              </div>
            </div>

            <div className="menu-mission-grid">
              <div className="menu-details menu-details--mission">
                <div className="menu-details__eyebrow">Operativni pregled</div>
                <div className="menu-details__title">{difficulty.label}</div>
                <p className="menu-details__copy">{difficulty.summary}</p>

                <div className="menu-metric-grid">
                  <div className="menu-metric-card">
                    <span className="menu-metric-card__label">Mreža</span>
                    <strong className="menu-metric-card__value">
                      {difficulty.gridSize} x {difficulty.gridSize}
                    </strong>
                  </div>
                  <div className="menu-metric-card">
                    <span className="menu-metric-card__label">Vrijeme</span>
                    <strong className="menu-metric-card__value">
                      {difficulty.defaultTime}s
                    </strong>
                  </div>
                  <div className="menu-metric-card">
                    <span className="menu-metric-card__label">Savjeti</span>
                    <strong className="menu-metric-card__value">
                      {difficulty.defaultHints} po nivou
                    </strong>
                  </div>
                  <div className="menu-metric-card">
                    <span className="menu-metric-card__label">Boss nivoi</span>
                    <strong className="menu-metric-card__value">
                      {bossLevelCount} ukupno
                    </strong>
                  </div>
                </div>

                <div className="menu-stats">
                  <div className="menu-stat-pill">
                    Otključano {difficultySummary.unlockedLevelCount} / {availableLevels}
                  </div>
                  <div className="menu-stat-pill">
                    Završeno {difficultySummary.completedCount}
                  </div>
                  <div className="menu-stat-pill">
                    Rekord {difficultySummary.bestScore}
                  </div>
                  <div className="menu-stat-pill">
                    Medalje {difficultySummary.starsEarned} / {availableLevels * 3}
                  </div>
                </div>
              </div>

              <div className="menu-campaign-card menu-campaign-card--feature">
                <div className="menu-campaign-card__content">
                  <CampaignMap
                    difficultyKey={selectedDifficulty}
                    difficultyLabel={difficulty.label}
                    levels={levels}
                    progress={progress}
                    suggestedLevelIndex={suggestedLevelIndex}
                    onSelectLevel={handleSelectLevel}
                  />

                  <div
                    className={`menu-campaign-stack ${isBossEncounterImminent ? "is-boss-target" : ""} ${
                      isUltraEncounterImminent ? "is-ultra-target" : ""
                    }`}
                  >
                    <div
                      className={`menu-campaign-brief menu-campaign-focus ${
                        isBossEncounterImminent ? "is-boss-target" : ""
                      } ${isUltraEncounterImminent ? "is-ultra-target" : ""}`}
                    >
                      <div className="menu-campaign-card__eyebrow">Sljedeća misija</div>
                      <div className="menu-campaign-card__title">
                        Nivo {String(suggestedLevelIndex + 1).padStart(2, "0")} - {suggestedLevel.name}
                      </div>
                      <p className="menu-campaign-card__copy">{suggestedLevel.briefing}</p>
                      <div className="menu-stats">
                        <div className="menu-stat-pill">
                          {suggestedLevel.isUltra ? "Ultra teško" : `Težina ${difficulty.label}`}
                        </div>
                        <div className="menu-stat-pill">Vrijeme {suggestedLevel.timeLimit}s</div>
                        <div className="menu-stat-pill">
                          Meta {String(suggestedLevel.moveTarget).padStart(2, "0")} poteza
                        </div>
                      </div>
                      {bossLevel?.bossProfile ? (
                        <div className="menu-threat-meter">
                          <div className="menu-threat-meter__topline">
                            <span>Boss pritisak</span>
                            <strong>{threatMeterLabel}</strong>
                          </div>
                          <div className="menu-threat-meter__track" aria-hidden="true">
                            <span
                              className="menu-threat-meter__fill"
                              style={{ width: `${Math.max(bossApproachRate, 10)}%` }}
                            />
                          </div>
                        </div>
                      ) : null}
                      {campaignAlertLabel ? (
                        <div className="menu-campaign-focus__alert">{campaignAlertLabel}</div>
                      ) : null}
                      <div className="menu-campaign-focus__note">
                        {remainingMissionCount === 0
                          ? "Kampanja za ovu težinu je očišćena. Možeš juriti bolji rezultat i sve medalje."
                          : `Preostalo ${formatCountLabel(remainingMissionCount, "misija", "misija")} do punog čišćenja ove rute.`}
                      </div>
                    </div>

                    {bossLevel?.bossProfile ? (
                      <div
                        className={`menu-boss-card ${
                          isBossEncounterImminent ? "is-live-threat" : ""
                        } ${isUltraEncounterImminent ? "is-ultra-threat" : ""}`}
                        style={{
                          "--boss-accent": bossVisual?.accent,
                          "--boss-accent-soft": bossVisual?.accentSoft,
                          "--boss-accent-strong": bossVisual?.accentStrong,
                        }}
                      >
                        <div className="menu-boss-card__visual" aria-hidden="true">
                          <div
                            className="menu-boss-card__visual-art"
                            style={{
                              backgroundImage: `url("${bossVisual?.previewImage}")`,
                              backgroundPosition: bossVisual?.previewPosition,
                              backgroundSize: bossVisual?.previewSize,
                            }}
                          />
                          {bossVisual?.portraitImage ? (
                            <div className="menu-boss-card__avatar">
                              <img src={bossVisual.portraitImage} alt="" />
                            </div>
                          ) : null}
                          <div className="menu-boss-card__visual-frame">
                            <span>Upozorenje bossa</span>
                            <strong>
                              {isUltraEncounterImminent
                                ? "SLJEDEĆI"
                                : isBossEncounterImminent
                                  ? "AKTIVNO"
                                  : bossVisual?.difficultyLabel ?? difficulty.label}
                            </strong>
                          </div>
                        </div>

                        <div className="menu-boss-card__body">
                          <div className="menu-boss-card__eyebrow">Upozorenje bossa</div>
                          <div className="menu-boss-card__title">
                            {bossVisual?.displayName ?? bossLevel.bossProfile.title}
                          </div>
                          <div className="menu-boss-card__chips" aria-hidden="true">
                            <span className="menu-boss-card__chip">{bossLevel.name}</span>
                            <span className="menu-boss-card__chip">
                              {bossLevel.bossProfile.codename}
                            </span>
                          </div>
                          <p className="menu-boss-card__copy">
                            {bossLevel.bossProfile.threat}
                          </p>
                          <p className="menu-boss-card__copy menu-boss-card__copy--secondary">
                            {bossLevel.bossProfile.signature}
                          </p>
                          {ultraLevel ? (
                            <p className="menu-boss-card__copy menu-boss-card__copy--secondary">
                              Završni izazov: {ultraLevel.name} / {ultraLevel.timeLimit}s /{" "}
                              {ultraLevel.hints} savjeta
                            </p>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <div className="menu-secondary-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={handleOpenLevelSelect}
              >
                <span className="secondary-button__icon" aria-hidden="true">
                  <MenuGlyph name="stack" />
                </span>
                <span>Izbor nivoa</span>
              </button>
              <button
                type="button"
                className="secondary-button"
                onClick={handleOpenLeaderboard}
              >
                <span className="secondary-button__icon" aria-hidden="true">
                  <MenuGlyph name="trophy" />
                </span>
                <span>Rang lista</span>
              </button>
              <button
                type="button"
                className="secondary-button secondary-button--reset is-ghost"
                onClick={handleResetClick}
              >
                <span className="secondary-button__icon" aria-hidden="true">
                  <MenuGlyph name="reset" />
                </span>
                <span>Reset progresa</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {showLevelSelect ? (
        <LevelSelectModal
          difficulty={selectedDifficulty}
          difficultyDetails={difficulty}
          levels={levels}
          progress={progress}
          onSelectLevel={handleSelectLevel}
          onClose={() => setShowLevelSelect(false)}
        />
      ) : null}

      {showLeaderboard ? (
        <LeaderboardModal
          globalEntries={globalLeaderboard}
          difficultyEntries={difficultyLeaderboard}
          dailyEntry={
            dailyProgress.completed
              ? {
                  id: `daily-${dailyLevel.id}`,
                  playerName: dailyProgress.bestPlayerName?.trim() || playerDisplayName || "Igrač",
                  difficultyLabel: "Dnevni",
                  levelName: dailyLevel.name,
                  levelIndex: 0,
                  timeLeft: dailyProgress.bestTimeLeft,
                  moves: dailyProgress.bestMoves,
                  stars: dailyProgress.bestStars,
                  score: dailyProgress.bestScore,
                }
              : null
          }
          difficultyLabel={difficulty.label}
          onClose={() => setShowLeaderboard(false)}
        />
      ) : null}
    </section>
  );
}

export default MainMenu;
