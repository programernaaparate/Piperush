import { showcaseArt } from "../data/showcaseArt.js";

function GameOverModal({ levelName, score, onRestart, onMenu }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-card__art modal-card__art--character is-warning" aria-hidden="true">
          <img src={showcaseArt.enemyCrab} alt="" />
        </div>
        <div className="modal-card__eyebrow">Vrijeme je isteklo</div>
        <div className="modal-card__title">Mreža nije povezana na vrijeme</div>
        <p className="modal-card__copy">
          Nisi zatvorio glavni tok prije isteka vremena. Pokušaj ponovo ili se vrati na meni.
        </p>

        <div className="modal-stats">
          <div className="modal-stat">
            <div className="modal-stat__label">Nivo</div>
            <div className="modal-stat__value">{levelName}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat__label">Rezultat</div>
            <div className="modal-stat__value">{score}</div>
          </div>
          <div className="modal-stat">
            <div className="modal-stat__label">Status</div>
            <div className="modal-stat__value">Pokušaj ponovo</div>
          </div>
        </div>

        <div className="modal-actions modal-actions--stack">
          <button
            type="button"
            className="secondary-button"
            onClick={onRestart}
            aria-label="Pokušaj ponovo"
          >
            Pokušaj ponovo
          </button>

          <button
            type="button"
            className="secondary-button is-ghost"
            onClick={onMenu}
            aria-label="Nazad na meni"
          >
            Nazad na meni
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
