const portraitByReaction = {
  calm: "/assets/boss/ultra-plumber-calm.png",
  angry: "/assets/boss/ultra-plumber-angry.png",
  point: "/assets/boss/ultra-plumber-point.png",
  rage: "/assets/boss/ultra-plumber-rage.png",
};

function getBossReaction({
  progress,
  moves,
  isCritical,
  isBossEventActive,
  isSolved,
  isGameOver,
}) {
  if (isSolved) {
    return "rage";
  }

  if (isGameOver) {
    return "calm";
  }

  if (progress >= 88) {
    return "rage";
  }

  if (isBossEventActive || isCritical || progress >= 60) {
    return "point";
  }

  if (progress >= 24 || moves >= 6) {
    return "angry";
  }

  return "calm";
}

function getBossMoodLabel(reaction) {
  if (reaction === "rage") {
    return "Kolaps";
  }

  if (reaction === "point") {
    return "Panika";
  }

  if (reaction === "angry") {
    return "Nervoza";
  }

  return "Nadzor";
}

function getBossLine({
  reaction,
  progress,
  bossEventMessage,
  isCritical,
  isSolved,
  isGameOver,
}) {
  if (isSolved) {
    return "Ne. Zatvorio si cijeli prsten. Jezgro mi je ispalo iz ruku.";
  }

  if (isGameOver) {
    return "Vrijeme je prošlo. Mreža je ostala nestabilna i reaktor još drži pritisak.";
  }

  if (bossEventMessage) {
    return bossEventMessage;
  }

  if (reaction === "rage") {
    return "Stani. Još jedan čist spoj i cijeli ultra prsten ide pravo u stabilizaciju.";
  }

  if (reaction === "point") {
    return isCritical
      ?"Pritisak raste. Sad se lomi partija i svaki zavoj može da mi sruši plan."
      : "Vidim šta radiš. Glavni tok ti je otvoren i skoro si prošao kroz jezgro.";
  }

  if (reaction === "angry") {
    return progress >= 40
      ?"Nervira me kako čistiš lažne grane. Polako dolaziš do pravog prstena."
      : "Nemoj da mi poravnaš srednji kanal. Tu počinje pravi put kroz reaktor.";
  }

  return "Hajde, pokušaj. Ultra mreža izgleda pitomo samo dok je ne dotakneš.";
}

function UltraBossMonitor({
  levelName,
  progress,
  moves,
  bossWaves,
  isCritical,
  isBossEventActive,
  bossEventMessage,
  isSolved,
  isGameOver,
}) {
  const reaction = getBossReaction({
    progress,
    moves,
    isCritical,
    isBossEventActive,
    isSolved,
    isGameOver,
  });
  const moodLabel = getBossMoodLabel(reaction);
  const bossLine = getBossLine({
    reaction,
    progress,
    bossEventMessage,
    isCritical,
    isSolved,
    isGameOver,
  });
  const tensionValue = Math.min(
    100,
    progress + bossWaves * 9 + (isCritical ?14 : 0) + (isBossEventActive ?12 : 0),
  );
  const showSteam = isBossEventActive || reaction === "point" || reaction === "rage";
  const showCrack = isBossEventActive || reaction === "rage";
  const showAlert = isCritical || reaction === "point" || reaction === "rage";
  const showBurst = reaction === "rage" || isSolved;

  return (
    <section
      className={`ultra-boss-monitor is-${reaction} ${isBossEventActive ?"is-alert" : ""} ${
        isSolved ?"is-solved" : ""
      } ${isGameOver ?"is-game-over" : ""}`}
      aria-label="Ultra nadzor"
    >
      <div className="ultra-boss-monitor__header">
        <div>
          <div className="ultra-boss-monitor__eyebrow">Ultra nadzor</div>
          <div className="ultra-boss-monitor__title">{levelName}</div>
        </div>
        <div className="ultra-boss-monitor__badge">{moodLabel}</div>
      </div>

      <div className="ultra-boss-monitor__stage" aria-hidden="true">
        <div
          className="ultra-boss-monitor__backdrop"
          style={{ backgroundImage: 'url("/assets/backgrounds/bg-boss-core.png")' }}
        />
        <img
          className="ultra-boss-monitor__portrait"
          src={portraitByReaction[reaction]}
          alt=""
        />
        {showSteam ?(
          <>
            <img
              className="ultra-boss-monitor__steam ultra-boss-monitor__steam--left"
              src="/assets/boss/ultra-fx-steam.png"
              alt=""
            />
            <img
              className="ultra-boss-monitor__steam ultra-boss-monitor__steam--right"
              src="/assets/boss/ultra-fx-steam.png"
              alt=""
            />
          </>
        ) : null}
        {showCrack ?(
          <img className="ultra-boss-monitor__crack" src="/assets/boss/ultra-fx-crack.png" alt="" />
        ) : null}
        {showAlert ?(
          <img className="ultra-boss-monitor__alert" src="/assets/boss/ultra-fx-alert.png" alt="" />
        ) : null}
        {showBurst ?(
          <img className="ultra-boss-monitor__burst" src="/assets/boss/ultra-fx-burst.png" alt="" />
        ) : null}
      </div>

      <div className="ultra-boss-monitor__quote">{bossLine}</div>

      <div className="ultra-boss-monitor__meter">
        <div className="ultra-boss-monitor__meter-topline">
          <span>Bijes majstora</span>
          <strong>{tensionValue}%</strong>
        </div>
        <div className="ultra-boss-monitor__meter-track" aria-hidden="true">
          <span
            className="ultra-boss-monitor__meter-fill"
            style={{ width: `${Math.max(tensionValue, 8)}%` }}
          />
        </div>
      </div>

      <div className="ultra-boss-monitor__meta">
        <span>Talasi {String(bossWaves).padStart(2, "0")}</span>
        <span>Protok {String(progress).padStart(2, "0")}%</span>
        <span>Potezi {String(moves).padStart(2, "0")}</span>
      </div>
    </section>
  );
}

export default UltraBossMonitor;
