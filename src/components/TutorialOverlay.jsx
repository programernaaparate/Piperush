import { audioManager } from "../utils/audio.js";

function TutorialOverlay({ onContinue }) {
  function handleContinue() {
    audioManager.playClick();
    onContinue();
  }

  return (
    <div className="modal-backdrop tutorial-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card tutorial-card">
        <div className="modal-card__eyebrow">Prvi ulazak</div>
        <div className="modal-card__title">Kako se igra</div>
        <p className="modal-card__copy">
          Klikni cijev da je okreneš za 90 stepeni, poveži ULAZ sa IZLAZOM i zatvori tok
          prije isteka vremena.
        </p>

        <div className="tutorial-steps">
          <div className="tutorial-step">
            <span className="tutorial-step__index">01</span>
            <div>
              <strong>Rotacija</strong>
              <p>Svaki klik mijenja smjer cijevi. Prazna i blokirana polja ne reaguju.</p>
            </div>
          </div>
          <div className="tutorial-step">
            <span className="tutorial-step__index">02</span>
            <div>
              <strong>Savjet</strong>
              <p>
                Savjet obilježava sljedeću važnu cijev na glavnoj ruti i pokazuje koliko
                puta da je okreneš.
              </p>
            </div>
          </div>
          <div className="tutorial-step">
            <span className="tutorial-step__index">03</span>
            <div>
              <strong>Pojačanja</strong>
              <p>Ubrzanje dodaje vrijeme, a Stabilizator poravnava jednu ključnu cijev.</p>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="secondary-button" onClick={handleContinue}>
            Pokreni mrežu
          </button>
        </div>
      </div>
    </div>
  );
}

export default TutorialOverlay;
