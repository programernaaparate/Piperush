const SOUND_CANDIDATES = {
  // Sound effects currently use synth fallback until dedicated files are added.
  rotate: [],
  click: [],
  hint: [],
  success: [],
  fail: [],
  warning: [],
  music: [
    "/assets/audio/bg-music.wav",
  ],
};

const FALLBACK_TONES = {
  rotate: {
    frequencies: [680, 910],
    duration: 0.08,
    volume: 0.03,
    type: "triangle",
  },
  click: {
    frequencies: [420, 620],
    duration: 0.06,
    volume: 0.025,
    type: "triangle",
  },
  hint: {
    frequencies: [540, 720, 860],
    duration: 0.09,
    volume: 0.03,
    type: "sine",
  },
  success: {
    frequencies: [440, 554, 659, 880],
    duration: 0.12,
    volume: 0.04,
    type: "sine",
  },
  fail: {
    frequencies: [330, 262, 196],
    duration: 0.14,
    volume: 0.045,
    type: "sawtooth",
  },
  warning: {
    frequencies: [740, 620, 740],
    duration: 0.09,
    volume: 0.032,
    type: "triangle",
  },
};

const AUDIO_MUTED_STORAGE_KEY = "piperush-audio-muted";

class AudioManager {
  constructor() {
    this.context = null;
    this.availableSources = new Map();
    this.sourceLookupPromise = null;
    this.backgroundElement = null;
    this.backgroundEnabled = false;
    this.backgroundRequested = false;
    this.muted = false;
    this.settingsLoaded = false;
    this.fadeFrame = null;
  }

  initializeSettings() {
    if (this.settingsLoaded || typeof window === "undefined") {
      return;
    }

    this.settingsLoaded = true;

    try {
      this.muted = window.localStorage.getItem(AUDIO_MUTED_STORAGE_KEY) === "1";
    } catch {
      this.muted = false;
    }
  }

  persistMutedSetting() {
    if (typeof window === "undefined") {
      return;
    }

    try {
      window.localStorage.setItem(
        AUDIO_MUTED_STORAGE_KEY,
        this.muted ? "1" : "0",
      );
    } catch {
      // Silent storage failure keeps the game usable.
    }
  }

  isMuted() {
    this.initializeSettings();
    return this.muted;
  }

  getPlaybackStatus() {
    this.initializeSettings();

    if (this.muted) {
      return "off";
    }

    return this.backgroundEnabled ? "on" : "pending";
  }

  async unlock() {
    this.initializeSettings();

    if (this.muted) {
      return;
    }

    const context = await this.getContext();

    if (context && context.state === "suspended") {
      await context.resume().catch(() => {});
    }
  }

  async getContext() {
    if (typeof window === "undefined") {
      return null;
    }

    if (!this.context) {
      const AudioContextConstructor =
        window.AudioContext || window.webkitAudioContext;

      if (AudioContextConstructor) {
        this.context = new AudioContextConstructor();
      }
    }

    return this.context;
  }

  async prepareSources() {
    if (this.sourceLookupPromise) {
      return this.sourceLookupPromise;
    }

    this.sourceLookupPromise = (async () => {
      for (const [key, candidates] of Object.entries(SOUND_CANDIDATES)) {
        const source = await this.findFirstValidSource(candidates);
        this.availableSources.set(key, source);
      }
    })();

    return this.sourceLookupPromise;
  }

  async findFirstValidSource(candidates) {
    for (const candidate of candidates) {
      try {
        const response = await fetch(candidate, { method: "HEAD" });
        const contentType = response.headers.get("content-type") ?? "";

        if (response.ok && !contentType.includes("text/html")) {
          return candidate;
        }
      } catch {
        // Try the next candidate.
      }
    }

    return null;
  }

  getEffectVolume(effectName) {
    if (effectName === "rotate") {
      return 0.3;
    }

    if (effectName === "click") {
      return 0.16;
    }

    if (effectName === "hint") {
      return 0.18;
    }

    if (effectName === "success") {
      return 0.24;
    }

    if (effectName === "fail") {
      return 0.22;
    }

    if (effectName === "warning") {
      return 0.18;
    }

    return 0.26;
  }

  async playSource(source, volume) {
    try {
      const audio = new Audio(source);
      audio.volume = volume;
      await audio.play();
      return true;
    } catch {
      return false;
    }
  }

  async playFallback(effectName) {
    const tone = FALLBACK_TONES[effectName];
    const context = await this.getContext();

    if (!tone || !context) {
      return;
    }

    const startTime = context.currentTime;
    const step = tone.duration * 0.72;

    tone.frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = tone.type;
      oscillator.frequency.setValueAtTime(frequency, startTime + index * step);

      gain.gain.setValueAtTime(0.0001, startTime + index * step);
      gain.gain.linearRampToValueAtTime(
        tone.volume,
        startTime + index * step + 0.01,
      );
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        startTime + index * step + tone.duration,
      );

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime + index * step);
      oscillator.stop(startTime + index * step + tone.duration);
    });
  }

  async playEffect(effectName) {
    this.initializeSettings();

    if (this.muted) {
      return;
    }

    await this.unlock();
    await this.prepareSources();

    const source = this.availableSources.get(effectName);

    if (source) {
      const played = await this.playSource(source, this.getEffectVolume(effectName));

      if (played) {
        return;
      }
    }

    await this.playFallback(effectName);
  }

  async playRotate() {
    await this.playEffect("rotate");
  }

  async playClick() {
    await this.playEffect("click");
  }

  async playHint() {
    await this.playEffect("hint");
  }

  async playSuccess() {
    await this.playEffect("success");
  }

  async playFail() {
    await this.playEffect("fail");
  }

  async playWarning() {
    await this.playEffect("warning");
  }

  fadeBackgroundTo(targetVolume, durationMs = 600) {
    if (!this.backgroundElement || typeof window === "undefined") {
      return;
    }

    if (this.fadeFrame) {
      window.cancelAnimationFrame(this.fadeFrame);
      this.fadeFrame = null;
    }

    const audio = this.backgroundElement;
    const startVolume = audio.volume;
    const startedAt = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - startedAt) / durationMs, 1);
      audio.volume = startVolume + (targetVolume - startVolume) * progress;

      if (progress < 1) {
        this.fadeFrame = window.requestAnimationFrame(tick);
      } else {
        this.fadeFrame = null;
      }
    };

    this.fadeFrame = window.requestAnimationFrame(tick);
  }

  async startBackground() {
    this.initializeSettings();
    this.backgroundRequested = true;

    if (this.muted) {
      return;
    }

    await this.unlock();
    await this.prepareSources();

    if (this.backgroundEnabled) {
      return;
    }

    const musicSource = this.availableSources.get("music");

    if (musicSource) {
      const resolvedUrl = new URL(musicSource, window.location.origin).href;

      if (!this.backgroundElement || this.backgroundElement.src !== resolvedUrl) {
        this.backgroundElement = new Audio(musicSource);
        this.backgroundElement.loop = true;
        this.backgroundElement.preload = "auto";
        this.backgroundElement.volume = 0.01;
      }

      try {
        await this.backgroundElement.play();
        this.fadeBackgroundTo(0.16, 900);
        this.backgroundEnabled = true;
        return;
      } catch {
        this.backgroundElement = null;
      }
    }

    this.backgroundEnabled = false;
  }

  stopBackgroundPlayback() {
    if (this.backgroundElement) {
      this.backgroundElement.pause();
      this.backgroundElement.currentTime = 0;
    }

    if (this.fadeFrame && typeof window !== "undefined") {
      window.cancelAnimationFrame(this.fadeFrame);
      this.fadeFrame = null;
    }

    this.backgroundEnabled = false;
  }

  pauseBackground() {
    if (!this.backgroundElement) {
      return;
    }

    if (this.fadeFrame && typeof window !== "undefined") {
      window.cancelAnimationFrame(this.fadeFrame);
      this.fadeFrame = null;
    }

    this.backgroundElement.pause();
    this.backgroundEnabled = false;
  }

  async resumeBackground() {
    this.initializeSettings();

    if (this.muted || !this.backgroundRequested) {
      return;
    }

    await this.unlock();
    await this.prepareSources();

    if (!this.backgroundElement) {
      await this.startBackground();
      return;
    }

    if (this.backgroundEnabled) {
      return;
    }

    try {
      this.backgroundElement.volume = Math.min(this.backgroundElement.volume || 0.01, 0.01);
      await this.backgroundElement.play();
      this.fadeBackgroundTo(0.16, 650);
      this.backgroundEnabled = true;
    } catch {
      this.backgroundEnabled = false;
    }
  }

  stopBackground() {
    this.backgroundRequested = false;
    this.stopBackgroundPlayback();
  }

  async setMuted(nextMuted) {
    this.initializeSettings();
    this.muted = Boolean(nextMuted);
    this.persistMutedSetting();

    if (this.muted) {
      this.stopBackgroundPlayback();
      return this.muted;
    }

    if (this.backgroundRequested) {
      await this.startBackground();
    }

    return this.muted;
  }

  async toggleMuted() {
    return this.setMuted(!this.isMuted());
  }
}

export const audioManager = new AudioManager();
