import { audioManager } from "../utils/audio.js";
import { showcaseArt } from "../data/showcaseArt.js";

const uiAssets = {
  back: "/assets/ui/icon-play.png",
};

function LeaderboardModal({
  globalEntries,
  difficultyEntries,
  dailyEntry,
  difficultyLabel,
  onClose,
}) {
  function handleClose() {
    audioManager.playClick();
    onClose();
  }

  function renderEntries(entries, emptyLabel) {
    if (!entries.length) {
      return <div className="leaderboard-empty">{emptyLabel}</div>;
    }

    return (
      <div className="leaderboard-list">
        {entries.map((entry, index) => (
          <div key={entry.id} className="leaderboard-row">
            <div className="leaderboard-row__rank">#{String(index + 1).padStart(2, "0")}</div>
            <div className="leaderboard-row__content">
              <div className="leaderboard-row__title">
                {entry.levelName} <span>{entry.difficultyLabel}</span>
              </div>
              <div className="leaderboard-row__meta">
                <strong>{entry.playerName}</strong> / Nivo{" "}
                {String(entry.levelIndex + 1).padStart(2, "0")} / Vrijeme {entry.timeLeft}s /{" "}
                Potezi {entry.moves ?? 0} / {entry.stars}/3
              </div>
            </div>
            <div className="leaderboard-row__score">{entry.score}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="modal-backdrop level-select-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card level-select-card leaderboard-card">
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

          <div className="level-select-header__status">Rang lista</div>
        </div>

        <div className="modal-card__eyebrow">Najbolji rezultati</div>
        <div className="modal-card__title">Rang lista mreže</div>
        <p className="modal-card__copy">
          Najbolji rezultati se automatski čuvaju po završenom nivou.
        </p>

        {dailyEntry ? (
          <div className="leaderboard-spotlight">
            <div className="leaderboard-spotlight__art" aria-hidden="true">
              <img src={showcaseArt.leaderboardDrone} alt="" />
            </div>
            <span className="leaderboard-spotlight__label">Dnevni rekord</span>
            <strong className="leaderboard-spotlight__value">
              {dailyEntry.playerName} / {dailyEntry.score}
            </strong>
            <span className="leaderboard-spotlight__meta">
              {dailyEntry.levelName} / Vrijeme {dailyEntry.timeLeft}s / Potezi{" "}
              {dailyEntry.moves ?? 0}
            </span>
          </div>
        ) : null}

        <div className="leaderboard-section">
          <div className="leaderboard-section__title">Top 5 / {difficultyLabel}</div>
          {renderEntries(
            difficultyEntries,
            `Još nema završenih partija za težinu ${difficultyLabel.toLowerCase()}.`,
          )}
        </div>

        <div className="leaderboard-section">
          <div className="leaderboard-section__title">Top 10 / Ukupno</div>
          {renderEntries(globalEntries, "Još nema završenih partija u kampanji.")}
        </div>

        <div className="modal-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={handleClose}
            aria-label="Zatvori rang listu"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardModal;
