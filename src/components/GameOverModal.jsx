function GameOverModal({ levelName, score, onRestart, onMenu }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-card__art is-warning" aria-hidden="true">
          <img src="/assets/legacy/review-pipe.svg" alt="" />
        </div>
        <div className="modal-card__eyebrow">Vrijeme je isteklo</div>
        <div className="modal-card__title">Mreža nije povezana na vrijeme</div>
        <p className="modal-card__copy">
          Mreža nije povezana na vrijeme. Pokušaj ponovo ili se vrati na meni.
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

        <div className="modal-actions">
          <button
            type="button"
            className="modal-button"
            onClick={onRestart}
            aria-label="Pokušaj ponovo"
          >
            <img src="/assets/ui/btn-restart.png" alt="" />
            <span className="sr-only">Pokušaj ponovo</span>
          </button>

          <button
            type="button"
            className="modal-button"
            onClick={onMenu}
            aria-label="Nazad na meni"
          >
            <img src="/assets/ui/btn-menu.png" alt="" />
            <span className="sr-only">Nazad na meni</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameOverModal;
