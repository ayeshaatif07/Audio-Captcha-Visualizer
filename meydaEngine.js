////////////////////////////////////////MY CODE///////////////////////////////////////////////
class MeydaEngine {
  constructor() {
    // Web Audio context (shared with p5)
    this.audioCtx = null;

    // HTMLAudioElement used for reliable playback with Meyda
    this.audioEl = null;

    // WebAudio source node created from the audio element
    this.srcNode = null;

    // Meyda analyzer instance
    this.analyzer = null;

    // Latest extracted feature values
    this.features = null;

    // State flags
    this.isReady = false;
    this.isPlaying = false;
  }

  // Initializes the audio context, audio element, and routing
  init() {
    if (this.isReady) return;

    // Ensure browser audio is unlocked
    userStartAudio();

    // Use p5’s shared AudioContext
    this.audioCtx = getAudioContext();

    // Resume context if it was suspended
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    // Create an HTML audio element for playback
    this.audioEl = new Audio();
    this.audioEl.crossOrigin = "anonymous";
    this.audioEl.loop = true;

    // Create a WebAudio source node from the audio element
    this.srcNode = this.audioCtx.createMediaElementSource(this.audioEl);

    // Connect audio directly to speakers
    this.srcNode.connect(this.audioCtx.destination);

    this.isReady = true;
  }

  // Loads a new audio file and resets state
  loadTrack(path) {
    if (!this.isReady) this.init();

    // Stop any active analyzer
    this.stopAnalyzer();

    // Load the new audio file
    this.audioEl.src = path;
    this.audioEl.load();

    // Reset state
    this.features = null;
    this.isPlaying = false;
  }

  // Starts Meyda analysis with a given list of features
  start(featureList) {
    if (!this.isReady) this.init();

    // Ensure a track has been loaded
    if (!this.audioEl.src) {
      console.error("No audio source loaded");
      return;
    }

    // Stop any existing analyzer before creating a new one
    this.stopAnalyzer();

    // Make sure Meyda is available
    if (typeof Meyda === "undefined") {
      console.error("Meyda library not loaded!");
      return;
    }

    // Create and start the Meyda analyzer
    try {
      this.analyzer = Meyda.createMeydaAnalyzer({
        audioContext: this.audioCtx,
        source: this.srcNode,
        bufferSize: 1024,
        featureExtractors: featureList,
        callback: (features) => {
          // Store the latest feature values
          this.features = features;
        },
      });

      this.analyzer.start();
    } catch (error) {
      console.error("Error creating Meyda analyzer:", error);
    }
  }

  // Plays the loaded audio
  play() {
    if (!this.isReady) this.init();
    if (!this.audioEl) return;

    // Resume context if required
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }

    const playPromise = this.audioEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          this.isPlaying = true;
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
        });
    }
  }

  // Pauses playback
  pause() {
    if (!this.audioEl) return;
    this.audioEl.pause();
    this.isPlaying = false;
  }

  // Toggles between play and pause
  toggle() {
    if (!this.audioEl) return;

    if (this.audioEl.paused) {
      this.play();
    } else {
      this.pause();
    }
  }

  // Stops playback and resets to the beginning
  stop() {
    if (!this.audioEl) return;

    this.audioEl.pause();
    this.audioEl.currentTime = 0;
    this.isPlaying = false;

    // Stop feature extraction
    this.stopAnalyzer();
  }

  // Stops and cleans up the Meyda analyzer
  stopAnalyzer() {
    if (this.analyzer) {
      try {
        this.analyzer.stop();
      } catch (e) {
        console.error("Error stopping analyzer:", e);
      }
      this.analyzer = null;
    }
  }

  // Returns the latest extracted features
  getFeatures() {
    return this.features;
  }

  // Returns true if audio is currently playing
  isAudioPlaying() {
    return this.isPlaying && this.audioEl && !this.audioEl.paused;
  }
}

////////////////////////////////////////MY CODE///////////////////////////////////////////////