import { audioManager } from "../utils/audio.js";
import { getBossVisual } from "../data/bossVisuals.js";

function BossIntroModal({
  levelName,
  bossProfile,
  difficultyLabel,
  eventLabel,
  briefing,
  timeLimit,
  moveTarget,
  hintCount,
  isUltra = false,
  onStart,
  onClose,
}) {
  const bossVisual = getBossVisual(bossProfile, { isUltra });

  function handleStart() {
    audioManager.playClick();
    onStart();
  }

  function handleClose() {
    audioManager.playClick();
    onClose?.();
  }

  return (
    <div className="modal-backdrop boss-intro-backdrop" role="dialog" aria-modal="true">
      <div
        className={`modal-card boss-intro-card ${isUltra ?"is-ultra" : ""}`}
        style={{
          "--boss-accent": bossVisual.accent,
          "--boss-accent-soft": bossVisual.accentSoft,
          "--boss-accent-strong": bossVisual.accentStrong,
        }}
      >
        <div className="boss-intro-card__hero" aria-hidden="true">
          <div
            className="boss-intro-card__hero-backdrop"
            style={{
              backgroundImage: `url("${bossVisual.heroImage}")`,
              backgroundPosition: bossVisual.heroPosition,
              backgroundSize: bossVisual.heroSize,
            }}
          />
          {bossVisual.portraitImage ? (
            <img
              className="boss-intro-card__hero-portrait"
              src={bossVisual.portraitImage}
              alt=""
            />
          ) : null}
          <div className="boss-intro-card__hero-chips">
            <span className="boss-intro-card__hero-chip">Boss nivo</span>
            <span className="boss-intro-card__hero-chip is-accent">
              {bossVisual.difficultyLabel || difficultyLabel}
            </span>
          </div>
          <div className="boss-intro-card__hero-copy">
            <strong className="boss-intro-card__hero-title">{bossVisual.displayName}</strong>
            <span className="boss-intro-card__hero-phase">
              {bossVisual.phaseLabel || eventLabel}
            </span>
          </div>
        </div>

        <div className="boss-intro-card__mission-bar">
          <span>{levelName}</span>
        </div>

        <div className="modal-card__eyebrow">{isUltra ?"Ultra izazov" : "Boss nivo"}</div>
        <div className="modal-card__title">{bossVisual.displayName}</div>
        {bossVisual.codename ?(
          <div className="boss-intro-card__codename">{bossVisual.codename}</div>
        ) : null}
        <p className="modal-card__copy">{briefing}</p>

        <div className="boss-intro-card__alert">
          <span className="boss-intro-card__alert-label">Posebna prijetnja</span>
          <strong>{eventLabel}</strong>
        </div>

        <div className="boss-intro-card__rules">
          <span>{bossVisual.threat || "Kritični talasi mijenjaju uslove na tabli."}</span>
          <span>{bossVisual.signature || "Pritisak ostaje visok dok ne zaključaš kompletnu rutu."}</span>
        </div>

        <div className="modal-stats boss-intro-card__stats">
          <div className="modal-stat">
            <div className="modal-stat__label">Vrijeme</div>
            <div className="modal-stat__value">{timeLimit}s</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat__label">Meta</div>
            <div className="modal-stat__value">{moveTarget}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat__label">Savjeti</div>
            <div className="modal-stat__value">{hintCount}</div>
          </div>
        </div>

        <div className="modal-actions boss-intro-card__actions">
          <button type="button" className="secondary-button" onClick={handleStart}>
            {isUltra ?"Započni ultra izazov" : "Započni nivo"}
          </button>
          <button type="button" className="secondary-button is-ghost" onClick={handleClose}>
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
}

export default BossIntroModal;
