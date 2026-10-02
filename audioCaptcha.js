////////////////////////////////////////MY CODE///////////////////////////////////////////////

// AudioCaptcha: plays a scrambled word + noise, user types what they hear
class AudioCaptcha {
  constructor() {
    // Captcha audio files + correct text answers
    this.captchaSounds = [
      { path: "./Ex2_files/wonderful.wav", answer: "wonderful" },
      { path: "./Ex2_files/great.wav", answer: "great" }
    ];

    // Basic state
    this.currentIndex = 0;
    this.sound = null;
    this.isPlaying = false;

    // Audio FX chain pieces (scramble the word)
    this.bandPass = new p5.BandPass();
    this.distortion = new p5.Distortion();
    this.delay = new p5.Delay();
    this.reverb = new p5.Reverb();
    this.gain = new p5.Gain();
    this.fft = new p5.FFT(0.8, 512); // for waveform/spectrum visualization

    // White noise (added only while audio plays)
    this.noise = new p5.Noise("white");
    this.noiseGain = new p5.Gain();

    // Storage/helpers
    this.currentParams = {};    
    this.ui = {};              
    this.loadedSounds = [];    
    this._onEndedHandler = null; 
  }

  // Load sounds and set up noise routing
  preload() {
    // Preload all captcha sounds
    this.captchaSounds.forEach((captcha) => {
      const sound = loadSound(captcha.path);
      this.loadedSounds.push(sound);
    });

    // Default to the first sound
    this.sound = this.loadedSounds[0];

    // Start noise, but disconnect it (we control it via noiseGain)
    this.noise.start();
    this.noise.amp(1.0);
    this.noise.disconnect();

    // Keep noise muted at first
    this.noiseGain.amp(0.0);
    this.noiseGain.disconnect();

    // Connect noise -> noiseGain (noiseGain connects to output later)
    this.noise.connect(this.noiseGain);
  }

  // Create UI controls: play, reload, input, submit, status
  buildUI() {
    const box = makePanel("Exercise 2.1 – Audio Captcha");
    box.position(10, 10);
    box.style("width", "480px");

    // Button container
    const buttonContainer = createDiv("");
    buttonContainer.parent(box);
    buttonContainer.style("margin-top", "8px");
    buttonContainer.style("display", "flex");
    buttonContainer.style("gap", "8px");
    buttonContainer.style("align-items", "center");

    // Play button
    this.ui.play = createButton("▶ Play Scrambled Audio");
    this.ui.play.parent(buttonContainer);
    this.ui.play.style("padding", "10px 16px");
    this.ui.play.style("margin", "0");
    this.ui.play.style("background", "#4CAF50");
    this.ui.play.style("color", "white");
    this.ui.play.style("border", "none");
    this.ui.play.style("border-radius", "4px");
    this.ui.play.style("cursor", "pointer");
    this.ui.play.style("font-size", "14px");
    this.ui.play.style("font-weight", "bold");
    this.ui.play.style("flex-shrink", "0");

    // Reload button (switch to next word)
    this.ui.reload = createButton(" Regenerate Captcha");
    this.ui.reload.parent(buttonContainer);
    this.ui.reload.style("padding", "10px 16px");
    this.ui.reload.style("margin", "0");
    this.ui.reload.style("background", "#2196F3");
    this.ui.reload.style("color", "white");
    this.ui.reload.style("border", "none");
    this.ui.reload.style("border-radius", "4px");
    this.ui.reload.style("cursor", "pointer");
    this.ui.reload.style("font-size", "14px");
    this.ui.reload.style("font-weight", "bold");
    this.ui.reload.style("flex-shrink", "0");

    // Visualization container (drawVisualization() uses this area)
    this.ui.vizContainer = createDiv("");
    this.ui.vizContainer.parent(box);
    this.ui.vizContainer.style("margin-top", "12px");
    this.ui.vizContainer.style("margin-bottom", "-5px");
    this.ui.vizContainer.style("padding", "10px");
    this.ui.vizContainer.style("background", "rgba(0,0,0,0.3)");
    this.ui.vizContainer.style("border-radius", "4px");
    this.ui.vizContainer.style("height", "100px");
    this.ui.vizContainer.style("position", "relative");

    this.ui.vizLabel = createDiv("Audio waveform visualization");
    this.ui.vizLabel.parent(this.ui.vizContainer);
    this.ui.vizLabel.style("font-size", "11px");
    this.ui.vizLabel.style("color", "#aaa");
    this.ui.vizLabel.style("text-align", "center");

    // Input field (user types what they hear)
    createDiv("").parent(box);
    this.ui.input = createInput("");
    this.ui.input.parent(box);
    this.ui.input.attribute("placeholder", "Type what you hear...");
    this.ui.input.style("width", "calc(100% - 110px)");
    this.ui.input.style("margin-top", "-12px");
    this.ui.input.style("padding", "10px");
    this.ui.input.style("border", "1px solid #666");
    this.ui.input.style("border-radius", "4px");
    this.ui.input.style("background", "#222");
    this.ui.input.style("color", "#fff");
    this.ui.input.style("font-size", "14px");

    // Submit button (check answer)
    this.ui.check = createButton("✓ Submit");
    this.ui.check.parent(box);
    this.ui.check.style("padding", "10px 16px");
    this.ui.check.style("margin-left", "8px");
    this.ui.check.style("background", "#FF9800");
    this.ui.check.style("color", "white");
    this.ui.check.style("border", "none");
    this.ui.check.style("border-radius", "4px");
    this.ui.check.style("cursor", "pointer");
    this.ui.check.style("font-size", "14px");
    this.ui.check.style("font-weight", "bold");

    // Status text area (feedback to user)
    this.ui.result = createDiv("Status: Click 'Play Scrambled Audio' to begin");
    this.ui.result.parent(box);
    this.ui.result.style("margin-top", "12px");
    this.ui.result.style("padding", "10px");
    this.ui.result.style("background", "rgba(100,100,100,0.3)");
    this.ui.result.style("border-radius", "4px");
    this.ui.result.style("font-size", "13px");
    this.ui.result.style("border-left", "4px solid #2196F3");
    this.ui.result.style("margin-bottom", "10px");

    // Hook up UI events
    this.ui.reload.mousePressed(() => this.reload());
    this.ui.play.mousePressed(() => this.play());
    this.ui.check.mousePressed(() => this.validate());

    // Enter key submits too
    this.ui.input.elt.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.validate();
    });
  }

  // Randomize effect parameters each time user plays
  generateRandomScramble() {
    const freq = random(500, 2400);      // band-pass center frequency
    const res = random(6, 16);           // band-pass resonance
    const drive = random(0.22, 0.38);    // distortion amount
    const dTime = random(0.05, 0.12);    // delay time
    const feedback = random(0.28, 0.48); // delay feedback
    const lowpass = random(900, 3200);   // delay filter cutoff
    const revTime = random(0.8, 1.5);    // reverb time
    const revDecay = random(2.0, 3.0);   // reverb decay
    const noiseLevel = random(0.22, 0.38); // noise volume while playing

    return { freq, res, drive, dTime, feedback, lowpass, revTime, revDecay, noiseLevel };
  }

  // Apply the scramble parameters to the FX nodes
  applyScramble(params) {
    this.bandPass.set(params.freq, params.res);
    this.distortion.set(params.drive, "4x");
    this.delay.delayTime(params.dTime);
    this.delay.feedback(params.feedback);
    this.delay.filter(params.lowpass);
    this.reverb.set(params.revTime, params.revDecay);
    this.gain.amp(0.85); // overall volume control
    this.currentParams = params;
  }

  // Connect audio chain: sound -> bandpass -> distortion -> gain -> output (+ delay/reverb)
  connectChain() {
    if (!this.sound) return;

    // Disconnect everything first (prevents double-routing)
    try { this.sound.disconnect(); } catch (e) {}
    try { this.bandPass.disconnect(); } catch (e) {}
    try { this.distortion.disconnect(); } catch (e) {}
    try { this.delay.disconnect(); } catch (e) {}
    try { this.reverb.disconnect(); } catch (e) {}
    try { this.gain.disconnect(); } catch (e) {}
    try { this.noiseGain.disconnect(); } catch (e) {}

    // Main dry chain
    this.sound.connect(this.bandPass);
    this.bandPass.connect(this.distortion);
    this.distortion.connect(this.gain);
    this.gain.connect();

    // FFT reads from the processed output (for visualization)
    this.fft.setInput(this.gain);

    // Add delay and reverb as extra processing on the gain signal
    this.delay.process(this.gain, this.currentParams.dTime, this.currentParams.feedback, this.currentParams.lowpass);
    this.reverb.process(this.gain, this.currentParams.revTime, this.currentParams.revDecay);

    // Noise output (separate from the word)
    this.noiseGain.connect();
  }

  // Fade in noise while the word is playing
  startNoise() {
    const lvl = this.currentParams.noiseLevel ?? 0.25;
    this.noiseGain.amp(0.0);
    this.noiseGain.amp(lvl, 0.03);
  }

  // Fade out noise (used on stop/end)
  stopNoise() {
    this.noiseGain.amp(0.0, 0.05);
  }

  // Move to the next captcha sound and reset UI/state
  reload() {
    this.currentIndex = (this.currentIndex + 1) % this.captchaSounds.length;
    this.sound = this.loadedSounds[this.currentIndex];

    // Stop any playing sound
    if (this.sound && this.sound.isPlaying()) this.sound.stop();
    this.isPlaying = false;
    this.stopNoise();

    const currentCaptcha = this.captchaSounds[this.currentIndex];

    // Tell user the length as a hint
    this.ui.result.html(
      `Status: New captcha loaded<br>` +
      `<small>Current word has ${currentCaptcha.answer.length} letters. Click 'Play' to hear it.</small>`
    );
    this.ui.result.style("border-left", "4px solid #2196F3");
    this.ui.input.value("");
  }

  // Play the scrambled captcha audio (with noise during playback)
  play() {
    // Guard: sound not ready yet
    if (!this.sound || !this.sound.isLoaded()) {
      this.ui.result.html("Status: Audio file not loaded yet, please wait...");
      this.ui.result.style("border-left", "4px solid #f44336");
      return;
    }

    // Required in many browsers to unlock audio
    userStartAudio();
    ensureAudioContext();

    // Create new scramble settings each play
    const params = this.generateRandomScramble();
    this.applyScramble(params);
    this.connectChain();

    // Remove previous ended handler (prevents stacking)
    if (this._onEndedHandler && this.sound) {
      try { this.sound.onended(null); } catch (e) {}
      this._onEndedHandler = null;
    }

    // Restart if already playing
    if (this.sound.isPlaying()) this.sound.stop();

    // On sound end: reset state and stop noise
    this._onEndedHandler = () => {
      this.isPlaying = false;
      this.stopNoise();
    };

    try { this.sound.onended(this._onEndedHandler); } catch (e) {}

    // Play now
    this.sound.play();
    this.isPlaying = true;
    this.startNoise();

    // Extra safety: stop noise even if onended is missed
    try {
      const dur = this.sound.duration();
      if (dur && dur > 0.05) {
        setTimeout(() => {
          if (!this.sound.isPlaying()) {
            this.isPlaying = false;
            this.stopNoise();
          }
        }, Math.floor(dur * 1000) + 30);
      }
    } catch (e) {}

    // Update status message
    this.ui.result.html(
      ` Status: Playing scrambled audio (with noise)<br>` +
      `<small style="color: #aaa;">Noise is active only while the word is playing</small>`
    );
    this.ui.result.style("border-left", "4px solid #4CAF50");
  }

  // Check user input against the correct answer
  validate() {
    const typed = (this.ui.input.value() || "").trim().toLowerCase();
    const expectedAnswer = this.captchaSounds[this.currentIndex].answer;

    // Empty input
    if (!typed) {
      this.ui.result.html("⚠️ Status: Please enter what you heard");
      this.ui.result.style("border-left", "4px solid #FF9800");
      return;
    }

    // Correct answer
    if (typed === expectedAnswer) {
      this.ui.result.html(
        ` <span style="color: #4CAF50; font-weight: bold;">CORRECT!</span><br>` +
        `<small>You successfully solved the audio captcha.</small>`
      );
      this.ui.result.style("border-left", "4px solid #4CAF50");
      this.ui.input.value("");

      // Stop audio/noise after success
      if (this.sound && this.sound.isPlaying()) this.sound.stop();
      this.isPlaying = false;
      this.stopNoise();
    } else {
      // Incorrect answer
      this.ui.result.html(
        ` <span style="color: #f44336; font-weight: bold;">Incorrect</span><br>` +
        `<small>The word has ${expectedAnswer.length} letters. Try again!</small>`
      );
      this.ui.result.style("border-left", "4px solid #f44336");
    }
  }

  // Draw waveform + spectrum bars inside given rectangle
  drawVisualization(x, y, w, h) {
    // If not playing, show placeholder box
    if (!this.isPlaying || !this.sound || !this.sound.isPlaying()) {
      push();
      fill(40);
      noStroke();
      rect(x, y, w, h, 4);

      fill(100);
      textAlign(CENTER, CENTER);
      textSize(12);
      text("Audio visualization (play audio to see waveform)", x + w / 2, y + h / 2);
      pop();
      return;
    }

    // Get live waveform + spectrum from FFT
    const waveform = this.fft.waveform();
    const spectrum = this.fft.analyze();

    push();

    // Background of viz area
    fill(8);
    noStroke();
    rect(x, y, w, h, 4);

    // Draw waveform (thick glow line)
    stroke(0, 255, 255, 90);
    strokeWeight(5);
    noFill();
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      const xPos = map(i, 0, waveform.length, x, x + w);
      const yPos = map(waveform[i], -1, 1, y + h, y);
      vertex(xPos, yPos);
    }
    endShape();

    // Draw waveform (main sharp line)
    stroke(0, 255, 255);
    strokeWeight(2.5);
    beginShape();
    for (let i = 0; i < waveform.length; i++) {
      const xPos = map(i, 0, waveform.length, x, x + w);
      const yPos = map(waveform[i], -1, 1, y + h, y);
      vertex(xPos, yPos);
    }
    endShape();

    // Middle reference line
    stroke(255, 255, 255, 40);
    strokeWeight(1);
    line(x, y + h / 2, x + w, y + h / 2);

    // Draw spectrum bars (first 64 bins)
    const barCount = 64;
    const barWidth = w / barCount;
    noStroke();

    for (let i = 0; i < barCount; i++) {
      const barHeight = map(spectrum[i], 0, 255, 0, h * 0.35);
      const xPos = x + i * barWidth;
      const alpha = map(spectrum[i], 0, 255, 120, 230);
      fill(255, 0, 200, alpha);
      rect(xPos, y + h - barHeight, barWidth - 1, barHeight);
    }

    pop();
  }

  // Hard stop (used when leaving page or on success)
  stop() {
    if (this.sound && this.sound.isPlaying()) this.sound.stop();
    this.isPlaying = false;
    this.stopNoise();
  }
}


////////////////////////////////////////MY CODE///////////////////////////////////////////////