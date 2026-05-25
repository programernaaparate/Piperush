const panelAsset = "/assets/ui/panel-blank.png";

function HudGlyph({ name }) {
  switch (name) {
    case "hint":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 4.2A6.2 6.2 0 0 0 7.4 14.6C8.2 15.5 8.8 16.4 9 17.4H15C15.2 16.4 15.8 15.5 16.6 14.6A6.2 6.2 0 0 0 12 4.2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9.8 20H14.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "restart":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M19 12A7 7 0 1 1 16.8 6.9"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path
            d="M16.4 4.8H20V8.4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "play":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M9 7.4L17 12L9 16.6V7.4Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "pause":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 6.6V17.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M15 6.6V17.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case "menu":
      return (
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 8H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 12H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M7 16H17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

function HUD({
  score,
  scoreDetail,
  timeDisplay,
  levelDisplay,
  moves,
  hintsLeft,
  powerUps,
  timeRatio,
  isCriticalTime,
  isPaused,
  onHint,
  onRestart,
  onPauseToggle,
  onMenu,
  onUseTimeBoost,
  onUseStabilizer,
  canUseHint,
  canUseTimeBoost,
  canUseStabilizer,
  compact = false,
}) {
  const formatCounter = (value, size = 2) => String(value).padStart(size, "0");
  const panels = [
    {
      key: "score",
      label: "Rezultat",
      badge: "RZ",
      value: formatCounter(score, 5),
      detail: scoreDetail,
    },
    { key: "time", label: "Vrijeme", badge: "VR", value: timeDisplay },
    { key: "level", label: "Nivo", badge: "NV", value: levelDisplay },
    { key: "moves", label: "Potezi", badge: "PT", value: formatCounter(moves) },
    { key: "hints", label: "Savjeti", badge: "SV", value: formatCounter(hintsLeft) },
  ];
  const actionButtons = [
    {
      key: "hint",
      label: "Hint",
      icon: "hint",
      disabled: !canUseHint,
      onClick: onHint,
      ariaLabel: "Iskoristi savjet",
      title: "Savjet",
    },
    {
      key: "restart",
      label: "Restart",
      icon: "restart",
      disabled: false,
      onClick: onRestart,
      ariaLabel: "Pokreni nivo ponovo",
      title: "Ponovi nivo",
    },
    {
      key: "pause",
      label: isPaused ? "Resume" : "Pause",
      icon: isPaused ? "play" : "pause",
      disabled: false,
      onClick: onPauseToggle,
      ariaLabel: isPaused ? "Nastavi igru" : "Pauziraj igru",
      title: isPaused ? "Nastavi" : "Pauza",
    },
    {
      key: "menu",
      label: "Menu",
      icon: "menu",
      disabled: false,
      onClick: onMenu,
      ariaLabel: "Vrati se u meni",
      title: "Izbor nivoa",
    },
  ];

  return (
    <section className={`hud-shell ${compact ? "is-compact" : ""}`} aria-label="Glavni panel igre">
      <div className="hud-panels">
        {panels.map((panel) => (
          <div
            key={panel.key}
            className={`hud-panel hud-panel--${panel.key} ${
              panel.key === "time" && isCriticalTime ? "is-critical" : ""
            }`}
            style={{ backgroundImage: `url("${panelAsset}")` }}
          >
            <span className="hud-panel__badge">{panel.badge}</span>
            <div className="hud-panel__content">
              <span className="hud-panel__label">{panel.label}</span>
              <span className="hud-panel__value">{panel.value}</span>
              {panel.detail ? <span className="hud-panel__detail">{panel.detail}</span> : null}
            </div>
            {panel.key === "time" ? (
              <span className="hud-panel__meter" aria-hidden="true">
                <span
                  className="hud-panel__meter-fill"
                  style={{ transform: `scaleX(${Math.max(timeRatio, 0)})` }}
                />
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <div className="hud-actions">
        {actionButtons.map((button) => (
          <button
            key={button.key}
            type="button"
            className={`hud-action ${button.disabled ? "is-disabled" : ""}`}
            disabled={button.disabled}
            onClick={button.onClick}
            aria-label={button.ariaLabel}
            title={button.title}
          >
            <span className="hud-action__icon" aria-hidden="true">
              <HudGlyph name={button.icon} />
            </span>
            <span className="hud-action__label">{button.label}</span>
          </button>
        ))}
      </div>

      <div className="hud-powerups">
        <button
          type="button"
          className={`powerup-chip ${canUseTimeBoost ? "" : "is-disabled"}`}
          disabled={!canUseTimeBoost}
          onClick={onUseTimeBoost}
          aria-label="Aktiviraj dodatno vrijeme"
        >
          <span className="powerup-chip__badge">+T</span>
          <span className="powerup-chip__content">
            <span className="powerup-chip__title">Overclock</span>
            <span className="powerup-chip__copy">Dodaje vrijeme</span>
          </span>
          <span className="powerup-chip__count">x{powerUps.boost ?? 0}</span>
        </button>

        <button
          type="button"
          className={`powerup-chip ${canUseStabilizer ? "" : "is-disabled"}`}
          disabled={!canUseStabilizer}
          onClick={onUseStabilizer}
          aria-label="Aktiviraj stabilizator"
        >
          <span className="powerup-chip__badge">FX</span>
          <span className="powerup-chip__content">
            <span className="powerup-chip__title">Stabilizator</span>
            <span className="powerup-chip__copy">Poravnava ključnu cijev</span>
          </span>
          <span className="powerup-chip__count">x{powerUps.stabilizer ?? 0}</span>
        </button>
      </div>
    </section>
  );
}

export default HUD;
