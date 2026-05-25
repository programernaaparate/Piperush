import { getFlowMap } from "../utils/pipeLogic.js";
import Tile from "./Tile.jsx";

const boardWidths = {
  5: "640px",
  6: "800px",
  7: "980px",
};

function GameBoard({
  board,
  gridSize,
  levelName,
  difficultyLabel,
  levelDisplay,
  activeFlowTiles,
  hintedTileId,
  hintBadgeLabel,
  onRotate,
  isPaused,
  isSolved,
  moveCount,
  isBoss,
  isUltra = false,
  boardFxMode = "",
  tileFxById = {},
  fitWidth = null,
  resetPhase = "",
}) {
  const flowTileSet = new Set(activeFlowTiles);
  const flowMap = getFlowMap(board, activeFlowTiles);
  const compactBoard = typeof fitWidth === "number" && fitWidth < (gridSize >= 7 ? 500 : 460);
  const gapSize =
    typeof fitWidth === "number" && fitWidth < 400
      ? "5px"
      : typeof fitWidth === "number" && fitWidth < 500
        ? "7px"
        : "clamp(6px, 1vw, 12px)";
  const tileRadius =
    typeof fitWidth === "number" && fitWidth < 400
      ? "14px"
      : typeof fitWidth === "number" && fitWidth < 500
        ? "16px"
        : "20px";
  const framePadding =
    typeof fitWidth === "number" && fitWidth < 400
      ? "10px"
      : typeof fitWidth === "number" && fitWidth < 500
        ? "12px"
        : "clamp(14px, 2vw, 22px)";
  const statusItems = [
    levelDisplay,
    `${gridSize} x ${gridSize}`,
    difficultyLabel,
    ...(isUltra ? ["Ultra hard"] : []),
  ];

  return (
    <div
      className={`board-frame ${compactBoard ? "is-compact" : ""} ${isSolved ? "is-solved" : ""} ${isBoss ? "is-boss" : ""} ${
        isUltra ? "is-ultra" : ""
      } ${boardFxMode ? `is-fx-${boardFxMode}` : ""} ${resetPhase}`}
      style={{
        "--board-columns": gridSize,
        "--board-max-width": boardWidths[gridSize] ?? "700px",
        "--board-fit-width": fitWidth ? `${fitWidth}px` : boardWidths[gridSize] ?? "700px",
        "--board-gap": gapSize,
        "--tile-radius": tileRadius,
        "--board-padding": framePadding,
      }}
    >
      <div className="board-meta">
        <div>
          <div className="board-meta__label">Trenutni nivo</div>
          <div className="board-meta__value">{levelName}</div>
        </div>
        <div>
          <div className="board-meta__label">Status mreže</div>
          <div className="board-meta__value board-meta__value--status">
            {statusItems.map((item) => (
              <span key={item} className="board-meta__chip">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {isPaused ? <div className="board-paused">Pauza</div> : null}

      <div
        className={`game-board ${isSolved ? "is-solved" : ""} ${isBoss ? "is-boss" : ""} ${
          isUltra ? "is-ultra" : ""
        } ${boardFxMode ? `is-fx-${boardFxMode}` : ""}`}
      >
        {boardFxMode ? (
          <span
            className={`game-board__impact game-board__impact--${boardFxMode}`}
            aria-hidden="true"
          />
        ) : null}
        {board.flat().map((tile) => (
          <Tile
            key={tile.id}
            tile={tile}
            isOnPath={flowTileSet.has(tile.id)}
            isHinted={hintedTileId === tile.id}
            isSolved={isSolved}
            hintBadgeLabel={hintedTileId === tile.id ? hintBadgeLabel : ""}
            flowDirections={flowMap[tile.id]?.directions ?? []}
            flowOrder={flowMap[tile.id]?.order ?? 0}
            flowLength={activeFlowTiles.length}
            moveCount={moveCount}
            fxType={tileFxById[tile.id] ?? ""}
            onRotate={onRotate}
          />
        ))}
      </div>
    </div>
  );
}

export default GameBoard;
