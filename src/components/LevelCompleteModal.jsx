const modalActionIcons = {
  next: "/assets/ui/icon-play.png",
  restart: "/assets/ui/icon-restart.png",
  menu: "/assets/ui/icon-menu.png",
};

function LevelCompleteModal({
  levelName,
  scoreAward,
  totalScore,
  moves,
  timeLeft,
  stars,
  completionMode = "level",
  isUltraLevel = false,
  onNextLevel,
  onRestart,
  onMenu,
}) {
  const isCampaignComplete = completionMode === "campaign";
  const isDailyComplete = completionMode === "daily";
  const eyebrow = isUltraLevel
    ? "Ultra hard savladan"
    : isCampaignComplete
      ? "Kampanja završena"
      : isDailyComplete
        ? "Dnevni izazov završen"
        : "Nivo završen";
  const copy = isUltraLevel
    ? "Najbrutalnija mreža je savladana. Završni prsten je stabilisan preciznim slijedom poteza."
    : isCampaignComplete
      ? "Završio si sve nivoe ove težine. Tok je stabilan i kampanja je kompletirana."
      : isDailyComplete
        ? "Dnevni izazov je završen. Vrati se u meni i sačekaj novi raspored."
        : "Mreža je uspješno povezana. Pokupi bonus, upiši medalje i nastavi dalje.";
  const nextStepLabel = isCampaignComplete || isDailyComplete ? "Izbor nivoa" : "Sljedeći nivo";
  const menuLabel = isCampaignComplete || isDailyComplete ? "Početni meni" : "Izbor nivoa";
  const statusLabel = isUltraLevel
    ? "Ultra tok stabilan"
    : isCampaignComplete || isDailyComplete
      ? "Kampanja puna"
      : "Tok aktivan";
  const medalLabel =
    stars >= 3 ? "Sve medalje" : stars === 2 ? "Dvije medalje" : "Jedna medalja";
  const displayLevelName = levelName;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div
        className={`modal-card modal-card--level-complete ${isUltraLevel ? "modal-card--ultra" : ""}`}
      >
        <div className="modal-card__hero" aria-hidden="true">
          <div className="modal-card__hero-art">
            <img src="/assets/legacy/scenario-pipe.svg" alt="" />
          </div>
          <div className="modal-card__hero-badge">
            <span className="modal-card__hero-star">★</span>
          </div>
          <span className="modal-card__hero-confetti modal-card__hero-confetti--a" />
          <span className="modal-card__hero-confetti modal-card__hero-confetti--b" />
          <span className="modal-card__hero-confetti modal-card__hero-confetti--c" />
          <span className="modal-card__hero-confetti modal-card__hero-confetti--d" />
        </div>
        <div className="modal-card__eyebrow">{eyebrow}</div>
        <div className="modal-card__title">{displayLevelName}</div>
        <p className="modal-card__copy">{copy}</p>

        <div className="modal-medal-band" aria-label={`Ukupna ocjena ${stars} od 3`}>
          <span className="modal-medal-band__label">{medalLabel}</span>
          <div className="modal-medal-band__stars">
            {[0, 1, 2].map((index) => (
              <span
                key={`medal-${index}`}
                className={`modal-medal-band__star ${index < stars ? "is-filled" : ""}`}
              />
            ))}
          </div>
        </div>

        <div className="modal-rating" aria-label={`Ocjena ${stars} od 3`}>
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className={`modal-rating__dot ${index < stars ? "is-filled" : ""}`}
            />
          ))}
        </div>

        <div className="modal-stats">
          <div className="modal-stat">
            <div className="modal-stat__label">Bonus</div>
            <div className="modal-stat__value">+{scoreAward}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat__label">Ukupno</div>
            <div className="modal-stat__value">{totalScore}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat__label">Preostalo vrijeme</div>
            <div className="modal-stat__value">{timeLeft}s</div>
          </div>
        </div>

        <div className="modal-stats">
          <div className="modal-stat">
            <div className="modal-stat__label">Potezi</div>
            <div className="modal-stat__value">{moves}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat__label">Status</div>
            <div className="modal-stat__value">{statusLabel}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat__label">Sljedeći korak</div>
            <div className="modal-stat__value">{nextStepLabel}</div>
          </div>
        </div>

        <div className="modal-actions modal-actions--stack">
          <button
            type="button"
            className="secondary-button modal-action-button"
            onClick={onNextLevel}
            aria-label={isCampaignComplete || isDailyComplete ? "Nazad na meni" : "Sljedeći nivo"}
          >
            <span className="modal-action-button__icon" aria-hidden="true">
              <img src={modalActionIcons.next} alt="" />
            </span>
            <span>{nextStepLabel}</span>
          </button>

          <button
            type="button"
            className="secondary-button modal-action-button"
            onClick={onRestart}
            aria-label="Ponovi nivo"
          >
            <span className="modal-action-button__icon" aria-hidden="true">
              <img src={modalActionIcons.restart} alt="" />
            </span>
            <span>Ponovi nivo</span>
          </button>

          <button
            type="button"
            className="secondary-button is-ghost modal-action-button modal-action-button--ghost"
            onClick={onMenu}
            aria-label="Nazad na meni"
          >
            <span className="modal-action-button__icon" aria-hidden="true">
              <img src={modalActionIcons.menu} alt="" />
            </span>
            <span>{menuLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default LevelCompleteModal;
