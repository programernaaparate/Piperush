import { getLevelProgress, getUnlockedLevelCount } from "../utils/progress.js";

function CampaignMap({
  difficultyKey,
  difficultyLabel,
  levels,
  progress,
  suggestedLevelIndex,
  onSelectLevel,
}) {
  const unlockedLevelCount = getUnlockedLevelCount(progress, difficultyKey);
  const completedCount = levels.reduce((total, level) => {
    const levelProgress = getLevelProgress(progress, difficultyKey, level.id);
    return total + (levelProgress.completed ? 1 : 0);
  }, 0);

  return (
    <div className="campaign-map">
      <div className="campaign-map__header">
        <div>
          <div className="campaign-map__eyebrow">Kampanja</div>
          <div className="campaign-map__title">Ruta / {difficultyLabel}</div>
        </div>
        <div className="campaign-map__summary">
          Otključano <strong>{unlockedLevelCount}</strong> / {levels.length} · Očišćeno{" "}
          <strong>{completedCount}</strong>
        </div>
      </div>

      <div className="campaign-map__rail" aria-label={`Mapa kampanje za ${difficultyLabel}`}>
        {levels.map((level, index) => {
          const levelProgress = getLevelProgress(progress, difficultyKey, level.id);
          const isUnlocked = index < unlockedLevelCount;
          const isCompleted = levelProgress.completed;
          const isSuggested = index === suggestedLevelIndex;
          const earnedStars = Math.max(0, Math.min(levelProgress.bestStars ?? 0, 3));
          const nodeStateClass = isCompleted
            ? "is-complete"
            : isSuggested
              ? "is-current"
              : isUnlocked
                ? "is-ready"
                : "is-locked";
          const nodeStateLabel = isCompleted
            ? "Očišćeno"
            : isSuggested
              ? "Trenutna meta"
              : isUnlocked
                ? "Otključano"
                : "Zaključano";

          return (
            <button
              key={level.id}
              type="button"
              className={`campaign-node ${isUnlocked ? "" : "is-locked"} ${
                isCompleted ? "is-complete" : ""
              } ${isSuggested ? "is-suggested" : ""} ${level.isBoss ? "is-boss" : ""} ${
                level.isUltra ? "is-ultra" : ""
              }`}
              disabled={!isUnlocked}
              onClick={() => onSelectLevel(index)}
              aria-label={
                isUnlocked
                  ? `Pokreni nivo ${index + 1} ${level.name}`
                  : `Nivo ${index + 1} ${level.name} je zaključan`
              }
            >
              <span className="campaign-node__shell">
                <span className="campaign-node__index">{String(index + 1).padStart(2, "0")}</span>
                {level.isUltra ? (
                  <span className="campaign-node__badge is-ultra">ULTRA</span>
                ) : level.isBoss ? (
                  <span className="campaign-node__badge is-boss">BOSS</span>
                ) : (
                  <span
                    className={`campaign-node__badge ${
                      isCompleted ? "is-complete" : isSuggested ? "is-current" : ""
                    }`}
                  >
                    {level.gridSize}x{level.gridSize}
                  </span>
                )}
              </span>

              <span className="campaign-node__name">{level.name}</span>

              <span className="campaign-node__footer">
                <span className="campaign-node__summary">
                  <span className={`campaign-node__state ${nodeStateClass}`}>{nodeStateLabel}</span>
                  <span className={`campaign-node__meta ${nodeStateClass}`}>
                    {isCompleted
                      ? `${levelProgress.bestStars}/3 medalje`
                      : isUnlocked
                        ? "Spremno"
                        : "Zaključano"}
                  </span>
                </span>

                <span className="campaign-node__track" aria-hidden="true">
                  {Array.from({ length: 3 }).map((_, starIndex) => (
                    <span
                      key={`${level.id}-star-${starIndex}`}
                      className={`campaign-node__track-dot ${
                        starIndex < earnedStars ? "is-filled" : ""
                      }`}
                    />
                  ))}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CampaignMap;
