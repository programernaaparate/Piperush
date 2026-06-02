function PauseModal({ onResume, onRestart, onMenu }) {
  return (
    <div className="modal-backdrop pause-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card pause-card">
        <div className="modal-card__eyebrow">Pauza</div>
        <div className="modal-card__title">Igra je zaustavljena</div>
        <p className="modal-card__copy">
          Tajmer miruje dok ne izabereš nastavak, ponavljanje nivoa ili povratak na meni.
        </p>

        <div className="modal-actions modal-actions--stack">
          <button type="button" className="secondary-button" onClick={onResume}>
            Nastavi
          </button>
          <button type="button" className="secondary-button" onClick={onRestart}>
            Ponovi nivo
          </button>
          <button type="button" className="secondary-button is-ghost" onClick={onMenu}>
            Meni
          </button>
        </div>
      </div>
    </div>
  );
}

export default PauseModal;
