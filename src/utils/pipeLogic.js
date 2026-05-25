const DIRECTIONS = ["up", "right", "down", "left"];

export const DIRECTION_VECTORS = {
  up: [-1, 0],
  right: [0, 1],
  down: [1, 0],
  left: [0, -1],
};

export const OPPOSITE_DIRECTION = {
  up: "down",
  right: "left",
  down: "up",
  left: "right",
};

export const BASE_CONNECTIONS = {
  straight: ["left", "right"],
  corner: ["up", "right"],
  t: ["left", "right", "down"],
  cross: ["up", "right", "down", "left"],
  start: ["right"],
  end: ["left"],
  empty: [],
  blocked: [],
  "dead-end": ["up"],
  valve: ["left", "right"],
};

const DIRECTION_LABELS = {
  up: "gore",
  right: "desno",
  down: "dole",
  left: "lijevo",
};

export function normalizeRotation(rotation = 0) {
  return ((rotation % 360) + 360) % 360;
}

export function rotateDirection(direction, rotation) {
  const currentIndex = DIRECTIONS.indexOf(direction);
  const steps = normalizeRotation(rotation) / 90;
  return DIRECTIONS[(currentIndex + steps) % DIRECTIONS.length];
}

export function getBaseConnections(type) {
  return [...(BASE_CONNECTIONS[type] ?? [])];
}

export function getRotatedConnections(type, rotation = 0) {
  return getBaseConnections(type).map((direction) =>
    rotateDirection(direction, rotation),
  );
}

export function getOppositeDirection(direction) {
  return OPPOSITE_DIRECTION[direction];
}

export function getConnections(tile) {
  if (!tile) {
    return [];
  }

  return getRotatedConnections(tile.type, tile.rotation);
}

export function isRotatable(tile) {
  return (
    Boolean(tile) &&
    tile.type !== "empty" &&
    tile.type !== "blocked" &&
    tile.rotatable !== false
  );
}

export function getLockMovesRemaining(tile, moveCount = 0) {
  const permanentLockRemaining =
    tile?.modifier === "locked"
      ? Math.max((tile.unlockAfterMoves ?? 0) - moveCount, 0)
      : 0;
  const transientLockRemaining = Math.max(
    Number(tile?.bossLockUntilMove ?? 0) - moveCount,
    0,
  );

  return Math.max(permanentLockRemaining, transientLockRemaining);
}

export function isTileLocked(tile, moveCount = 0) {
  return getLockMovesRemaining(tile, moveCount) > 0;
}

export function isAutoRotateTile(tile) {
  return tile?.modifier === "auto";
}

export function isDamagedTile(tile) {
  return tile?.modifier === "damaged";
}

export function getDamagePenalty(tile) {
  if (!isDamagedTile(tile)) {
    return 0;
  }

  return Math.max(Number(tile.damagePenalty) || 0, 0);
}

export function rotateTile(tile) {
  if (!isRotatable(tile)) {
    return tile;
  }

  return {
    ...tile,
    rotation: normalizeRotation(tile.rotation + 90),
  };
}

export function applyAutoRotateTiles(board, { skipTileId = null } = {}) {
  const rotatedTileIds = [];
  const nextBoard = board.map((row) =>
    row.map((tile) => {
      if (
        tile.id === skipTileId ||
        !isAutoRotateTile(tile) ||
        !isRotatable(tile)
      ) {
        return tile;
      }

      rotatedTileIds.push(tile.id);
      return rotateTile(tile);
    }),
  );

  return {
    board: nextBoard,
    rotatedTileIds,
  };
}

export function getNeighborPosition(row, column, direction, board) {
  const [rowOffset, columnOffset] = DIRECTION_VECTORS[direction];
  const nextRow = row + rowOffset;
  const nextColumn = column + columnOffset;

  if (!board) {
    return [nextRow, nextColumn];
  }

  if (nextRow < 0 || nextRow >= board.length) {
    return null;
  }

  if (nextColumn < 0 || nextColumn >= board[nextRow].length) {
    return null;
  }

  return [nextRow, nextColumn];
}

export function canConnect(currentTile, nextTile, direction) {
  const currentConnections = getConnections(currentTile);
  const nextConnections = getConnections(nextTile);

  return (
    currentConnections.includes(direction) &&
    nextConnections.includes(getOppositeDirection(direction))
  );
}

export function createBoardFromLevel(level) {
  return level.layout.map((row, rowIndex) =>
    row.map((currentTile, columnIndex) => ({
      ...currentTile,
      id: `${rowIndex}-${columnIndex}`,
      row: rowIndex,
      column: columnIndex,
      rotation: normalizeRotation(currentTile.rotation),
      correctRotation: normalizeRotation(
        currentTile.correctRotation ?? currentTile.rotation,
      ),
    })),
  );
}

export function analyzeFlow(board) {
  if (!board.length) {
    return { success: false, path: [], reachable: [] };
  }

  const startTile = board.flat().find((tile) => tile.type === "start");
  const endTile = board.flat().find((tile) => tile.type === "end");

  if (!startTile || !endTile) {
    return { success: false, path: [], reachable: [] };
  }

  const startKey = `${startTile.row}-${startTile.column}`;
  const queue = [[startTile.row, startTile.column]];
  const visited = new Set([startKey]);
  const parentMap = new Map();
  const reachable = [startKey];
  let endKey = null;

  while (queue.length > 0) {
    const [row, column] = queue.shift();
    const currentTile = board[row][column];
    const currentKey = `${row}-${column}`;

    if (currentTile.type === "end") {
      endKey = currentKey;
      break;
    }

    for (const direction of getConnections(currentTile)) {
      const nextPosition = getNeighborPosition(row, column, direction, board);

      if (!nextPosition) {
        continue;
      }

      const [nextRow, nextColumn] = nextPosition;
      const nextTile = board[nextRow][nextColumn];

      if (
        nextTile.type === "empty" ||
        nextTile.type === "blocked" ||
        !canConnect(currentTile, nextTile, direction)
      ) {
        continue;
      }

      const nextKey = `${nextRow}-${nextColumn}`;

      if (visited.has(nextKey)) {
        continue;
      }

      visited.add(nextKey);
      parentMap.set(nextKey, currentKey);
      queue.push([nextRow, nextColumn]);
      reachable.push(nextKey);

      if (nextTile.type === "end") {
        endKey = nextKey;
        queue.length = 0;
        break;
      }
    }
  }

  if (!endKey) {
    return { success: false, path: [], reachable };
  }

  const path = [];
  let currentKey = endKey;

  while (currentKey) {
    path.unshift(currentKey);
    currentKey = parentMap.get(currentKey);
  }

  return {
    success: true,
    path,
    reachable,
  };
}

export function findConnectedPath(board) {
  const result = analyzeFlow(board);
  return {
    success: result.success,
    path: result.path,
  };
}

export function checkSolvedPath(board) {
  const result = analyzeFlow(board);
  return {
    solved: result.success,
    path: result.success ? result.path : [],
  };
}

export function getSolvedPath(board) {
  return checkSolvedPath(board).path;
}

export function getFlowMap(board, activeTileIds) {
  const activeSet = new Set(activeTileIds);
  const orderMap = new Map(activeTileIds.map((id, index) => [id, index]));
  const flowMap = {};

  for (const tileId of activeTileIds) {
    const [row, column] = tileId.split("-").map(Number);
    const currentTile = board[row]?.[column];

    if (!currentTile) {
      continue;
    }

    const directions = [];

    for (const direction of getConnections(currentTile)) {
      const nextPosition = getNeighborPosition(row, column, direction, board);

      if (!nextPosition) {
        continue;
      }

      const [nextRow, nextColumn] = nextPosition;
      const nextTile = board[nextRow][nextColumn];
      const nextId = `${nextRow}-${nextColumn}`;

      if (
        activeSet.has(nextId) &&
        nextTile &&
        canConnect(currentTile, nextTile, direction)
      ) {
        directions.push(direction);
      }
    }

    flowMap[tileId] = {
      directions,
      order: orderMap.get(tileId) ?? 0,
    };
  }

  return flowMap;
}

function getTileById(board, tileId) {
  const [row, column] = tileId.split("-").map(Number);
  return board[row]?.[column] ?? null;
}

function tileHasCorrectRotation(tile) {
  return normalizeRotation(tile.rotation) === normalizeRotation(tile.correctRotation);
}

function getTurnsNeeded(tile) {
  return (
    (normalizeRotation(tile.correctRotation) - normalizeRotation(tile.rotation) + 360) %
    360
  ) / 90;
}

function getTargetConnections(tile) {
  return getRotatedConnections(tile.type, tile.correctRotation);
}

function formatDirectionList(directions) {
  const labels = directions.map((direction) => DIRECTION_LABELS[direction] ?? direction);

  if (labels.length === 0) {
    return "glavni tok";
  }

  if (labels.length === 1) {
    return labels[0];
  }

  if (labels.length === 2) {
    return `${labels[0]} i ${labels[1]}`;
  }

  return `${labels.slice(0, -1).join(", ")} i ${labels.at(-1)}`;
}

function describeConnections(directions) {
  return directions.length > 0 ? formatDirectionList(directions) : "nema izlaza";
}

function getDirectionDifference(baseDirections, comparisonDirections) {
  return baseDirections.filter((direction) => !comparisonDirections.includes(direction));
}

function buildHintReason({
  currentConnections,
  targetConnections,
  turnsNeeded,
  kind,
  lockMovesRemaining,
}) {
  const currentLabel = describeConnections(currentConnections);
  const targetLabel = describeConnections(targetConnections);
  const missingDirections = getDirectionDifference(targetConnections, currentConnections);
  const redundantDirections = getDirectionDifference(currentConnections, targetConnections);

  if (lockMovesRemaining > 0) {
    return `AI analiza je našla ključni segment, ali cijev još ${lockMovesRemaining} poteza ne može da se pomjeri zbog zaključavanja.`;
  }

  if (kind === "frontier") {
    return `AI analiza: glavni tok trenutno staje ovdje. Cijev sada vodi ka ${currentLabel}, a ruta mora nastaviti ka ${targetLabel}.`;
  }

  if (missingDirections.length > 0 && redundantDirections.length > 0) {
    return `AI analiza: trenutni izlazi su ${currentLabel}, ali rješenje traži ${targetLabel}. Nedostaje veza ka ${formatDirectionList(missingDirections)}.`;
  }

  if (missingDirections.length > 0) {
    return `AI analiza: ovoj cijevi nedostaje izlaz ka ${formatDirectionList(missingDirections)} da bi se ruta zatvorila.`;
  }

  if (redundantDirections.length > 0) {
    return `AI analiza: cijev baca tok ka ${formatDirectionList(redundantDirections)}, a glavni pravac traži ${targetLabel}.`;
  }

  if (turnsNeeded > 0) {
    return `AI analiza: ova cijev izgleda blizu rješenja, ali mora da se vrati na raspored ${targetLabel}.`;
  }

  return "AI analiza potvrđuje da je ovo sljedeći kritični segment glavne rute.";
}

function buildHintRecommendation(tile, kind = "fallback", moveCount = 0) {
  const turnsNeeded = getTurnsNeeded(tile);
  const positionLabel = `${tile.row + 1}-${tile.column + 1}`;
  const targetConnections = getTargetConnections(tile);
  const currentConnections = getConnections(tile);
  const connectionLabel = formatDirectionList(targetConnections);
  const lockMovesRemaining = getLockMovesRemaining(tile, moveCount);
  let message = `Polje ${positionLabel}: poravnaj cijev prema pravcu ${connectionLabel}.`;
  let badgeLabel = turnsNeeded > 0 ? `x${turnsNeeded}` : "TIP";
  let solverLabel = "AI analiza";

  if (lockMovesRemaining > 0) {
    message = `Polje ${positionLabel}: cijev je zaključana još ${lockMovesRemaining} poteza.`;
    badgeLabel = `L${lockMovesRemaining}`;
    solverLabel = "Zaključano polje";
  } else if (turnsNeeded > 0) {
    message = `Polje ${positionLabel}: okreni cijev ${turnsNeeded}x da spoji ${connectionLabel}.`;
    solverLabel = kind === "frontier" ? "Front analiza" : "Ruta analiza";
  } else if (kind === "frontier") {
    message = `Polje ${positionLabel}: ovdje treba da se nastavi glavni tok ka ${connectionLabel}.`;
    solverLabel = "Front analiza";
  } else if (kind === "path") {
    message = `Polje ${positionLabel}: sljedeći ključni spoj ide ka ${connectionLabel}.`;
    solverLabel = "Ruta analiza";
  }

  return {
    id: tile.id,
    row: tile.row,
    column: tile.column,
    turnsNeeded,
    targetRotation: normalizeRotation(tile.correctRotation),
    badgeLabel,
    kind,
    lockMovesRemaining,
    message,
    reason: buildHintReason({
      currentConnections,
      targetConnections,
      turnsNeeded,
      kind,
      lockMovesRemaining,
    }),
    solverLabel,
  };
}

function getContiguousPathIndex(pathIds, reachableSet) {
  let index = 0;

  while (index + 1 < pathIds.length && reachableSet.has(pathIds[index + 1])) {
    index += 1;
  }

  return index;
}

function isEligibleRecommendationTile(
  tile,
  moveCount = 0,
  { skipLocked = false } = {},
) {
  if (!tile || !isRotatable(tile)) {
    return false;
  }

  if (skipLocked && getLockMovesRemaining(tile, moveCount) > 0) {
    return false;
  }

  return true;
}

function getWrongPathTile(
  board,
  pathIds,
  startIndex = 0,
  moveCount = 0,
  { skipLocked = false } = {},
) {
  for (let index = startIndex; index < pathIds.length; index += 1) {
    const tile = getTileById(board, pathIds[index]);

    if (
      isEligibleRecommendationTile(tile, moveCount, { skipLocked }) &&
      !tileHasCorrectRotation(tile)
    ) {
      return {
        tile,
        index,
      };
    }
  }

  return null;
}

export function getHintRecommendation(
  board,
  level,
  moveCount = 0,
  { skipLocked = false, allowResolvedFallback = true } = {},
) {
  const pathIds = (level?.path ?? []).map(
    ([row, column]) => `${row}-${column}`,
  );
  const wrongRotationTiles = [];
  const fallbackTiles = [];

  for (const row of board) {
    for (const tile of row) {
      if (!isEligibleRecommendationTile(tile, moveCount, { skipLocked })) {
        continue;
      }

      if (!tileHasCorrectRotation(tile)) {
        wrongRotationTiles.push(tile);
      } else if (allowResolvedFallback) {
        fallbackTiles.push(tile);
      }
    }
  }

  if (pathIds.length > 1) {
    const flowState = analyzeFlow(board);
    const reachableSet = new Set(flowState.reachable);
    const contiguousIndex = getContiguousPathIndex(pathIds, reachableSet);
    const frontierCandidates = [];

    for (
      let index = Math.max(0, contiguousIndex - 1);
      index <= Math.min(pathIds.length - 1, contiguousIndex + 2);
      index += 1
    ) {
      const tile = getTileById(board, pathIds[index]);

      if (
        isEligibleRecommendationTile(tile, moveCount, { skipLocked }) &&
        !tileHasCorrectRotation(tile)
      ) {
        frontierCandidates.push({
          tile,
          distance: Math.abs(index - contiguousIndex),
          index,
        });
      }
    }

    if (frontierCandidates.length > 0) {
      const bestFrontierTile = [...frontierCandidates].sort((left, right) => {
        if (left.distance !== right.distance) {
          return left.distance - right.distance;
        }

        return left.index - right.index;
      })[0];

      return buildHintRecommendation(bestFrontierTile.tile, "frontier", moveCount);
    }

    const upcomingWrongTile = getWrongPathTile(
      board,
      pathIds,
      contiguousIndex + 1,
      moveCount,
      { skipLocked },
    );

    if (upcomingWrongTile) {
      return buildHintRecommendation(upcomingWrongTile.tile, "path", moveCount);
    }

    const firstWrongPathTile = getWrongPathTile(
      board,
      pathIds,
      0,
      moveCount,
      { skipLocked },
    );

    if (firstWrongPathTile) {
      return buildHintRecommendation(firstWrongPathTile.tile, "path", moveCount);
    }
  }

  if (wrongRotationTiles.length > 0) {
    return buildHintRecommendation(wrongRotationTiles[0], "fallback", moveCount);
  }

  if (fallbackTiles.length > 0) {
    return buildHintRecommendation(fallbackTiles[0], "fallback", moveCount);
  }

  return null;
}
