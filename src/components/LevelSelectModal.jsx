import { audioManager } from "../utils/audio.js";
import {
  getDifficultySummary,
  getLevelProgress,
  getUnlockedLevelCount,
} from "../utils/progress.js";

const legacyAssets = {
  complete: "/assets/legacy/estimate-checkmark.svg",
};

const uiAssets = {
  back: "/assets/ui/icon-play.png",
};

function getLevelTags(level) {
  const tags = [];

  if (level.isUltra) {
    tags.push("Ultra");
  }

  if (level.isBoss) {
    tags.push("Boss");
  }

  if (level.specials?.some((item) => item.modifier === "locked")) {
    tags.push("Zaključano");
  }

  if (level.specials?.some((item) => item.modifier === "auto")) {
    tags.push("Rotor");
  }

  if (level.specials?.some((item) => item.modifier === "damaged")) {
    tags.push("Kvar");
  }

  return tags;
}

function MedalDots({ value }) {
  return (
    <div className="medal-dots" aria-label={`Ocjena ${value} od 3`}>
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={`medal-dots__item ${index < value ? "is-filled" : ""}`}
        />
      ))}
    </div>
  );
}

function LevelSelectModal({
  difficulty,
  difficultyDetails,
  levels,
  progress,
  onSelectLevel,
  onClose,
}) {
  const summary = getDifficultySummary(progress, difficulty);
  const unlockedLevelCount = getUnlockedLevelCount(progress, difficulty);
  const campaignLabel = difficultyDetails.campaignLabel ?? `${difficultyDetails.label} kampanja`;

  function handleClose() {
    audioManager.playClick();
    onClose();
  }

  function handleSelect(index) {
    audioManager.playClick();
    onSelectLevel(index);
  }

  return (
    <div className="modal-backdrop level-select-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card level-select-card">
        <div className="level-select-header">
          <button
            type="button"
            className="level-select-header__back"
            onClick={handleClose}
            aria-label="Nazad na početni meni"
          >
            <span className="level-select-header__back-shell" aria-hidden="true">
              <img src={uiAssets.back} alt="" />
            </span>
            <span className="level-select-header__back-label">Nazad</span>
          </button>

          <div className="level-select-header__status">{campaignLabel}</div>
        </div>

        <div className="modal-card__eyebrow">Izbor nivoa</div>
        <div className="modal-card__title">{campaignLabel}</div>
        <p className="modal-card__copy">
          Biraj otključane nivoe, prati rekord i nastavi tamo gdje je mreža stala.
        </p>

        <div className="level-select-summary">
          <div className="level-select-summary__item">
            <span className="level-select-summary__label">Otključano</span>
            <strong className="level-select-summary__value">
              {summary.unlockedLevelCount} / {levels.length}
            </strong>
          </div>
          <div className="level-select-summary__item">
            <span className="level-select-summary__label">Završeno</span>
            <strong className="level-select-summary__value">{summary.completedCount}</strong>
          </div>
          <div className="level-select-summary__item">
            <span className="level-select-summary__label">Rekord</span>
            <strong className="level-select-summary__value">{summary.bestScore}</strong>
          </div>
        </div>

        <div className="level-grid">
          {levels.map((level, index) => {
            const isLocked = index >= unlockedLevelCount;
            const levelProgress = getLevelProgress(progress, difficulty, level.id);
            const levelTags = getLevelTags(level);

            return (
              <button
                key={level.id}
                type="button"
                className={`level-card ${isLocked ? "is-locked" : ""} ${
                  levelProgress.completed ? "is-complete" : ""
                } ${level.isUltra ? "is-ultra" : ""}`}
                disabled={isLocked}
                onClick={() => handleSelect(index)}
                aria-label={
                  isLocked
                    ? `Nivo ${index + 1} je zaključan`
                    : `Pokreni nivo ${index + 1}`
                }
              >
                <div className="level-card__topline">
                  <span className="level-card__index">
                    Nivo {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="level-card__topline-right">
                    {levelProgress.completed ? (
                      <span className="level-card__complete-badge" aria-hidden="true">
                        <img src={legacyAssets.complete} alt="" />
                      </span>
                    ) : null}
                    <span className="level-card__badge">
                      {level.isUltra ? "ULTRA" : `${level.gridSize} x ${level.gridSize}`}
                    </span>
                  </div>
                </div>
                <div className="level-card__name">{level.name}</div>
                <p className="level-card__briefing">{level.briefing}</p>
                {levelTags.length > 0 ? (
                  <div className="level-card__event-tags" aria-hidden="true">
                    {levelTags.map((tag) => (
                      <span
                        key={`${level.id}-${tag}`}
                        className={`level-card__event-chip ${
                          tag === "Boss" || tag === "Ultra" ? "is-boss" : ""
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className="level-card__meta">
                  <span>{level.timeLimit}s</span>
                  <span>Meta {level.moveTarget}</span>
                </div>
                <div className="level-card__footer">
                  <MedalDots value={levelProgress.bestStars} />
                  <span className="level-card__score">
                    {levelProgress.bestScore > 0 ? levelProgress.bestScore : "Novo"}
                  </span>
                </div>
                {isLocked ? <span className="level-card__lock">Zaključano</span> : null}
              </button>
            );
          })}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleClose}
            aria-label="Zatvori izbor nivoa"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}

export default LevelSelectModal;
