import {
  getLockMovesRemaining,
  isAutoRotateTile,
  isDamagedTile,
  isRotatable,
  isTileLocked,
} from "../utils/pipeLogic.js";

const tileAssets = {
  straight: "/assets/pipes/pipe-straight.png",
  corner: "/assets/pipes/pipe-corner.png",
  t: "/assets/pipes/pipe-t.png",
  cross: "/assets/pipes/pipe-cross.png",
  start: "/assets/pipes/pipe-start.png",
  end: "/assets/pipes/pipe-end.png",
  empty: "/assets/pipes/pipe-empty.png",
  blocked: "/assets/pipes/pipe-blocked.png",
  "dead-end": "/assets/pipes/pipe-dead-end.png",
  valve: "/assets/pipes/pipe-valve.png",
};

const tileGlowAssets = {
  straight: "/assets/pipes/pipe-straight-transparent.png",
  corner: "/assets/pipes/pipe-corner-transparent.png",
  t: "/assets/pipes/pipe-t-transparent.png",
  cross: "/assets/pipes/pipe-cross-transparent.png",
  start: "/assets/pipes/pipe-start-transparent.png",
  end: "/assets/pipes/pipe-end-transparent.png",
  "dead-end": "/assets/pipes/pipe-dead-end-transparent.png",
  valve: "/assets/pipes/pipe-valve-transparent.png",
};

function Tile({
  tile,
  isOnPath,
  isHinted,
  isSolved,
  hintBadgeLabel,
  flowDirections,
  flowOrder,
  flowLength,
  moveCount,
  fxType = "",
  onRotate,
}) {
  const rotatable = isRotatable(tile);
  const glowAsset = tileGlowAssets[tile.type];
  const isLocked = isTileLocked(tile, moveCount);
  const lockMovesRemaining = getLockMovesRemaining(tile, moveCount);
  const isAuto = isAutoRotateTile(tile);
  const isDamaged = isDamagedTile(tile);
  const modifierLabel = isLocked ? `L${lockMovesRemaining}` : isAuto ? "R" : isDamaged ? "!" : "";
  const modifierTitle = isLocked
    ? `Zaključana cijev: još ${lockMovesRemaining} poteza`
    : isAuto
      ? "Rotor cijev"
      : isDamaged
        ? "Oštećena cijev"
        : "";

  const className = [
    "tile",
    `tile--${tile.type}`,
    isOnPath ? "tile--path" : "",
    isHinted ? "tile--hinted" : "",
    isSolved && isOnPath ? "tile--solved" : "",
    isOnPath || isHinted ? "tile--energized" : "",
    tile.modifier === "locked" ? "tile--locked" : "",
    isLocked ? "tile--locked-active" : "",
    isAuto ? "tile--auto" : "",
    isDamaged ? "tile--damaged" : "",
    tile.type === "start" ? "tile--start" : "",
    tile.type === "end" ? "tile--end" : "",
    isSolved && tile.type === "end" ? "tile--end-burst" : "",
    fxType ? `tile--fx-${fxType}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={className}
      disabled={!rotatable}
      onClick={() => onRotate(tile.id)}
      style={{
        "--tile-enter-delay": `${(tile.row + tile.column) * 45}ms`,
        "--tile-rotation": `${tile.rotation}deg`,
      }}
      aria-label={
        isHinted && hintBadgeLabel
          ? `Cijev tipa ${tile.type}, savjet ${hintBadgeLabel}`
          : isLocked
            ? `Cijev tipa ${tile.type}, zaključana još ${lockMovesRemaining} poteza`
            : isAuto
              ? `Cijev tipa ${tile.type}, samorotirajuća`
              : isDamaged
                ? `Cijev tipa ${tile.type}, oštećena`
                : `Cijev tipa ${tile.type}`
      }
      title={modifierTitle || (tile.type === "start" ? "Početni ulaz" : tile.type === "end" ? "Krajnji izlaz" : "")}
    >
      {modifierLabel ? (
        <span
          className={`tile__modifier-badge ${
            isLocked
              ? "tile__modifier-badge--locked"
              : isAuto
                ? "tile__modifier-badge--auto"
                : "tile__modifier-badge--damaged"
          }`}
          title={modifierTitle}
          aria-hidden="true"
        >
          {modifierLabel}
        </span>
      ) : null}

      {tile.type === "start" ? (
        <span className="tile__terminal-label tile__terminal-label--start" aria-hidden="true">
          START
        </span>
      ) : null}

      {tile.type === "end" ? (
        <span className="tile__terminal-label tile__terminal-label--end" aria-hidden="true">
          END
        </span>
      ) : null}

      {isLocked ? <span className="tile__lock-ring" aria-hidden="true" /> : null}

      {fxType ? (
        <span className={`tile__fx-layer tile__fx-layer--${fxType}`} aria-hidden="true">
          <span className="tile__fx-core" />
          <span className="tile__fx-shard tile__fx-shard--a" />
          <span className="tile__fx-shard tile__fx-shard--b" />
          <span className="tile__fx-shard tile__fx-shard--c" />
          <span className="tile__fx-shard tile__fx-shard--d" />
          <span className="tile__fx-ring" />
          <span className="tile__fx-smoke tile__fx-smoke--a" />
          <span className="tile__fx-smoke tile__fx-smoke--b" />
          <span className="tile__fx-arc tile__fx-arc--a" />
          <span className="tile__fx-arc tile__fx-arc--b" />
        </span>
      ) : null}

      {isHinted && hintBadgeLabel ? (
        <span className="tile__hint-badge" aria-hidden="true">
          {hintBadgeLabel}
        </span>
      ) : null}

      {isOnPath ? (
        <span
          className="tile__flow-layer"
          aria-hidden="true"
          style={{
            "--flow-delay": `${flowOrder * 140}ms`,
            "--flow-duration": `${Math.max(1.05, flowLength * 0.16)}s`,
          }}
        >
          {flowDirections.map((direction) => (
            <span
              key={`${tile.id}-${direction}`}
              className={`tile__flow-segment tile__flow-segment--${direction}`}
            />
          ))}
          <span className="tile__flow-core" />
          {isSolved ? (
            <>
              <span className="tile__spark tile__spark--a" />
              <span className="tile__spark tile__spark--b" />
              {tile.type === "end" ? <span className="tile__end-burst" /> : null}
            </>
          ) : null}
        </span>
      ) : null}

      <span
        className="tile__image-wrap"
        style={{ transform: `rotate(${tile.rotation}deg)` }}
      >
        <img className="tile__image" src={tileAssets[tile.type]} alt="" />
        {glowAsset && (isOnPath || isHinted) ? (
          <img className="tile__image tile__image--glow" src={glowAsset} alt="" />
        ) : null}
      </span>
    </button>
  );
}

export default Tile;
