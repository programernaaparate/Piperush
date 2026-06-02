import { showcaseBossArtById } from "./showcaseArt.js";

const bossVisualById = {
  aegis: {
    displayName: "Luckasti vodoinstalater",
    difficultyLabel: "Lako",
    ...showcaseBossArtById.aegis,
    heroSize: "cover",
    previewSize: "cover",
    accent: "#59ff8a",
    accentSoft: "rgba(89, 255, 138, 0.3)",
    accentStrong: "rgba(89, 255, 138, 0.6)",
  },
  gyro: {
    displayName: "Industrijski inženjer",
    difficultyLabel: "Srednje",
    ...showcaseBossArtById.gyro,
    heroSize: "cover",
    previewSize: "cover",
    accent: "#ffb24a",
    accentSoft: "rgba(255, 178, 74, 0.28)",
    accentStrong: "rgba(255, 178, 74, 0.58)",
  },
  warden: {
    displayName: "Reaktorski čuvar",
    difficultyLabel: "Teško",
    ...showcaseBossArtById.warden,
    heroSize: "cover",
    previewSize: "cover",
    accent: "#74deff",
    accentSoft: "rgba(116, 222, 255, 0.28)",
    accentStrong: "rgba(116, 222, 255, 0.56)",
  },
  singularity: {
    displayName: "Reaktorski vodoinstalater",
    difficultyLabel: "Ultra teško",
    ...showcaseBossArtById.singularity,
    heroSize: "cover",
    previewSize: "cover",
    accent: "#84f0ff",
    accentSoft: "rgba(132, 240, 255, 0.32)",
    accentStrong: "rgba(132, 240, 255, 0.6)",
  },
};

const defaultBossVisual = {
  displayName: "",
  difficultyLabel: "Boss",
  heroImage: "/assets/backgrounds/bg-boss-core.png",
  heroPosition: "center",
  heroSize: "cover",
  previewImage: "/assets/backgrounds/bg-boss-core.png",
  previewPosition: "center",
  previewSize: "cover",
  portraitImage: "",
  portraitPosition: "center",
  portraitSize: "contain",
  accent: "#6ce7ff",
  accentSoft: "rgba(108, 231, 255, 0.24)",
  accentStrong: "rgba(108, 231, 255, 0.56)",
};

export function getBossVisual(bossProfile, { isUltra = false } = {}) {
  const bossId = bossProfile?.id ?? "";
  const visual = bossVisualById[bossId] ?? defaultBossVisual;

  return {
    ...defaultBossVisual,
    ...visual,
    displayName:
      visual.displayName || bossProfile?.title || (isUltra ? "Ultra nivo" : "Boss nivo"),
    codename: bossProfile?.codename ?? "",
    phaseLabel: bossProfile?.phaseLabel ?? "",
    threat: bossProfile?.threat ?? "",
    signature: bossProfile?.signature ?? "",
  };
}
