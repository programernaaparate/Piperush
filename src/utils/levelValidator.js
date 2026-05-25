import {
  BASE_CONNECTIONS,
  analyzeFlow,
  createBoardFromLevel,
  getConnections,
  normalizeRotation,
} from "./pipeLogic.js";

const VALID_ROTATIONS = new Set([0, 90, 180, 270]);
const VALID_TILE_TYPES = new Set(Object.keys(BASE_CONNECTIONS));

function toTileId(row, column) {
  return `${row}-${column}`;
}

function createSolvedLevel(level) {
  const sourceGrid = level.grid ?? level.layout ?? [];
  const solvedGrid = sourceGrid.map((row) =>
    row.map((tile) => ({
      ...tile,
      rotation: normalizeRotation(tile.correctRotation ?? tile.rotation ?? 0),
    })),
  );

  return {
    ...level,
    grid: solvedGrid,
    layout: solvedGrid,
  };
}

function getConnectedNeighbors(board, tile) {
  const neighbors = [];

  for (const direction of getConnections(tile)) {
    const nextRow =
      direction === "up"
        ? tile.row - 1
        : direction === "down"
          ? tile.row + 1
          : tile.row;
    const nextColumn =
      direction === "left"
        ? tile.column - 1
        : direction === "right"
          ? tile.column + 1
          : tile.column;
    const nextTile = board[nextRow]?.[nextColumn];

    if (
      !nextTile ||
      nextTile.type === "empty" ||
      nextTile.type === "blocked" ||
      !getConnections(nextTile).includes(
        direction === "up"
          ? "down"
          : direction === "right"
            ? "left"
            : direction === "down"
              ? "up"
              : "right",
      )
    ) {
      continue;
    }

    neighbors.push(nextTile);
  }

  return neighbors;
}

function countSolvedRoutes(board, limit = 2) {
  const startTile = board.flat().find((tile) => tile.type === "start");
  const endTile = board.flat().find((tile) => tile.type === "end");

  if (!startTile || !endTile) {
    return 0;
  }

  const visited = new Set([toTileId(startTile.row, startTile.column)]);
  let routes = 0;

  function dfs(tile) {
    if (routes >= limit) {
      return;
    }

    if (tile.id === endTile.id) {
      routes += 1;
      return;
    }

    for (const neighbor of getConnectedNeighbors(board, tile)) {
      const neighborId = toTileId(neighbor.row, neighbor.column);

      if (visited.has(neighborId)) {
        continue;
      }

      visited.add(neighborId);
      dfs(neighbor);
      visited.delete(neighborId);
    }
  }

  dfs(startTile);
  return routes;
}

export function validateLevel(level) {
  const issues = [];
  const size = Number(level.size ?? level.gridSize ?? 0);
  const grid = level.grid ?? level.layout;

  if (!level?.id) {
    issues.push("Nedostaje id nivoa.");
  }

  if (!Array.isArray(grid) || grid.length !== size) {
    issues.push(`Mreza ne odgovara zadatoj velicini ${size}.`);
    return issues;
  }

  if (grid.some((row) => !Array.isArray(row) || row.length !== size)) {
    issues.push("Najmanje jedan red mreze nema ispravnu sirinu.");
  }

  let startCount = 0;
  let endCount = 0;
  let wrongRotationCount = 0;

  grid.forEach((row, rowIndex) => {
    row.forEach((tile, columnIndex) => {
      if (!VALID_TILE_TYPES.has(tile.type)) {
        issues.push(`Polje ${rowIndex + 1}-${columnIndex + 1} ima nevazeci tip ${tile.type}.`);
        return;
      }

      const rotation = normalizeRotation(tile.rotation ?? 0);
      const correctRotation = normalizeRotation(tile.correctRotation ?? 0);

      if (!VALID_ROTATIONS.has(rotation)) {
        issues.push(`Polje ${rowIndex + 1}-${columnIndex + 1} ima nevazecu rotaciju ${tile.rotation}.`);
      }

      if (tile.type !== "empty" && tile.type !== "blocked" && !VALID_ROTATIONS.has(correctRotation)) {
        issues.push(
          `Polje ${rowIndex + 1}-${columnIndex + 1} ima nevazeci correctRotation ${tile.correctRotation}.`,
        );
      }

      if (tile.type === "start") {
        startCount += 1;
      }

      if (tile.type === "end") {
        endCount += 1;
      }

      if (
        tile.type !== "empty" &&
        tile.type !== "blocked" &&
        rotation !== correctRotation
      ) {
        wrongRotationCount += 1;
      }
    });
  });

  if (startCount !== 1) {
    issues.push(`Nivo mora imati tacno jedan START. Trenutno: ${startCount}.`);
  }

  if (endCount !== 1) {
    issues.push(`Nivo mora imati tacno jedan END. Trenutno: ${endCount}.`);
  }

  if (wrongRotationCount === 0) {
    issues.push("Pocetna rotacija ne trazi nijedan potez.");
  }

  const initialBoard = createBoardFromLevel({
    ...level,
    layout: grid,
  });
  const initialFlow = analyzeFlow(initialBoard);

  if (initialFlow.success) {
    issues.push("Nivo krece vec rijesen.");
  }

  const solvedLevel = createSolvedLevel({
    ...level,
    layout: grid,
  });
  const solvedBoard = createBoardFromLevel(solvedLevel);
  const solvedFlow = analyzeFlow(solvedBoard);

  if (!solvedFlow.success) {
    issues.push("Nivo nije rjesiv kada se vrate tacne rotacije.");
  }

  const solvedRoutes = countSolvedRoutes(solvedBoard, 2);

  if (solvedRoutes !== 1) {
    issues.push(`Rijeseno stanje mora imati jednu jasnu rutu. Pronadjeno: ${solvedRoutes}.`);
  }

  if (!Array.isArray(level.path) || level.path.length < 2) {
    issues.push("Nivou nedostaje validna projektovana putanja START -> END.");
  }

  return issues;
}

export function validateAllLevels(levelMap) {
  const warnings = [];

  for (const [difficulty, levels] of Object.entries(levelMap ?? {})) {
    const seenIds = new Set();

    for (const level of levels ?? []) {
      if (seenIds.has(level.id)) {
        warnings.push({
          difficulty,
          levelId: level.id,
          issues: ["ID nivoa mora biti jedinstven."],
        });
        continue;
      }

      seenIds.add(level.id);
      const issues = validateLevel(level);

      if (issues.length > 0) {
        warnings.push({
          difficulty,
          levelId: level.id,
          issues,
        });
      }
    }
  }

  return warnings;
}
