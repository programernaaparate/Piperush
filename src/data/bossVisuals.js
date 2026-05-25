const bossVisualById = {
  aegis: {
    displayName: "Luckasti vodoinstalater",
    difficultyLabel: "Lako",
    heroImage: "/assets/boss/concepts/boss-easy-card.png",
    heroPosition: "center top",
    heroSize: "cover",
    previewImage: "/assets/boss/concepts/boss-easy-card.png",
    previewPosition: "center 8%",
    previewSize: "cover",
    accent: "#59ff8a",
    accentSoft: "rgba(89, 255, 138, 0.3)",
    accentStrong: "rgba(89, 255, 138, 0.6)",
  },
  gyro: {
    displayName: "Industrijski inzenjer",
    difficultyLabel: "Srednje",
    heroImage: "/assets/boss/concepts/boss-medium-card.png",
    heroPosition: "center 14%",
    heroSize: "cover",
    previewImage: "/assets/boss/concepts/boss-medium-card.png",
    previewPosition: "center 18%",
    previewSize: "cover",
    accent: "#ffb24a",
    accentSoft: "rgba(255, 178, 74, 0.28)",
    accentStrong: "rgba(255, 178, 74, 0.58)",
  },
  warden: {
    displayName: "Reaktorski cuvar",
    difficultyLabel: "Tesko",
    heroImage: "/assets/boss/concepts/boss-hard-card.png",
    heroPosition: "center 12%",
    heroSize: "cover",
    previewImage: "/assets/boss/concepts/boss-hard-card.png",
    previewPosition: "center 18%",
    previewSize: "cover",
    accent: "#ff9751",
    accentSoft: "rgba(255, 151, 81, 0.28)",
    accentStrong: "rgba(255, 151, 81, 0.56)",
  },
  singularity: {
    displayName: "Reaktorski vodoinstalater",
    difficultyLabel: "Ultra hard",
    heroImage: "/assets/boss/concepts/boss-reactor-concept.png",
    heroPosition: "center 12%",
    heroSize: "cover",
    previewImage: "/assets/boss/concepts/boss-reactor-concept.png",
    previewPosition: "center 24%",
    previewSize: "cover",
    accent: "#ffb65e",
    accentSoft: "rgba(255, 182, 94, 0.32)",
    accentStrong: "rgba(255, 182, 94, 0.6)",
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
      visual.displayName || bossProfile?.title || (isUltra ? "Ultra boss" : "Boss nivo"),
    codename: bossProfile?.codename ?? "",
    phaseLabel: bossProfile?.phaseLabel ?? "",
    threat: bossProfile?.threat ?? "",
    signature: bossProfile?.signature ?? "",
  };
}
