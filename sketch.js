////////////////////////////////////////MY CODE///////////////////////////////////////////////
// Global references to major components
let captcha;
let meydaEngine;
let visualiser;
let voice;

// p5.js preload
// Loads audio assets before setup runs

function preload() {
  // Create and preload the audio captcha sounds
  captcha = new AudioCaptcha();
  captcha.preload();
}

// p5.js setup
// Creates canvas and initializes all exercises
 
function setup() {
  // Create a fullscreen canvas
  createCanvas(windowWidth, windowHeight);

  // Verify that the Meyda library is available
  if (typeof Meyda === "undefined") {
    alert("Error: Meyda library not loaded. Please check the console.");
  }

  // Verify that the p5.speech library is available
  if (typeof p5.SpeechRec === "undefined") {
    alert("Error: p5.speech library not loaded. Please check the console.");
  }

  // Exercise 2.1: Build Audio Captcha UI
  captcha.buildUI();

  // Exercise 2.2: Initialize Meyda engine and visualizer UI
  meydaEngine = new MeydaEngine();
  visualiser = new AudioVisualizer(meydaEngine);
  visualiser.buildUI();

  // Exercise 2.3: Initialize voice controller and UI
  voice = new VoiceController(visualiser);
  voice.buildUI();
}

// p5.js draw
// Called every frame to render visuals

function draw() {
  // Draw the Meyda-based visualization (Exercises 2.2 & 2.3)
  visualiser.draw(width, height);

  // Draw the captcha visualization on top (Exercise 2.1)
  // Positioned inside the captcha UI area
  captcha.drawVisualization(50, 95, 440, 80);

  // Optional FPS counter (disabled by default)
  // showFPS();
}

/**
 * Mouse press handler
 * Required to unlock the audio context in modern browsers
 */
function mousePressed() {
  userStartAudio();
  ensureAudioContext();
}

/**
 * Handle browser window resizing
 * Keeps canvas size in sync with the window
 */
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

/**
 * Optional helper to display FPS (for debugging/performance testing)
 */
function showFPS() {
  push();
  fill(255);
  noStroke();
  textAlign(RIGHT, TOP);
  textSize(12);
  text("FPS: " + frameRate().toFixed(0), width - 10, 10);
  pop();
}

/**
 * Cleanup before the page unloads
 * Stops audio playback and listeners safely
 */
window.addEventListener("beforeunload", () => {
  if (captcha) captcha.stop();
  if (meydaEngine) meydaEngine.stop();
  if (voice) voice.stop();
});

////////////////////////////////////////MY CODE///////////////////////////////////////////////