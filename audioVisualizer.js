////////////////////////////////////////MY CODE///////////////////////////////////////////////
class AudioVisualizer {
  constructor(engine) {
    this.engine = engine;

    // Background color (RGB) used with a fade overlay
    this.bg = [8, 10, 18];

    // Shape style used for ring particles (circle/square/triangle/pentagon)
    this.shape = "circle";

    // UI references (select, buttons, info text)
    this.ui = {};
    this.current = 0;

    // Visual state containers
    this.particles = [];
    this.wavePoints = []; // (reserved / optional future use)
    this.hue = 200;       // slowly rotates for animated color changes

    // Track list + which audio features to extract per track
    this.tracks = [
      {
        name: "Ex2 Sound 1",
        path: "./Ex2_files/Ex2_sound1.wav",
        features: ["rms", "spectralCentroid", "zcr"],
        task: "2.2",
      },
      {
        name: "Ex2 Sound 2",
        path: "./Ex2_files/Ex2_sound2.wav",
        features: ["rms", "spectralRolloff", "zcr"],
        task: "2.2",
      },
      {
        name: "Ex2 Sound 3",
        path: "./Ex2_files/Ex2_sound3.wav",
        features: ["rms", "spectralCentroid", "spectralRolloff"],
        task: "2.2",
      },
      {
        name: "Kalte Ohren (Remix) - Voice Control",
        path: "./Ex2_files/Kalte_Ohren_(_Remix_).mp3",
        features: ["rms", "spectralCentroid", "zcr"],
        task: "2.3",
      },
    ];
  }

  // Build UI panel: dropdown + play/stop + info text
  buildUI() {
    const box = makePanel("Exercise 2.2 – Meyda Visualizer");
    box.position(10, 330);

    // Track selector row
    const selectContainer = createDiv("");
    selectContainer.parent(box);
    selectContainer.style("margin-top", "8px");
    selectContainer.style("margin-bottom", "8px");

    this.ui.select = createSelect();
    this.ui.select.parent(selectContainer);

    // Dropdown styling
    this.ui.select.style("padding", "8px 12px");
    this.ui.select.style("background", "#222");
    this.ui.select.style("color", "#fff");
    this.ui.select.style("border", "1px solid #666");
    this.ui.select.style("border-radius", "4px");
    this.ui.select.style("font-size", "14px");
    this.ui.select.style("cursor", "pointer");
    this.ui.select.style("width", "100%");
    this.ui.select.style("max-width", "400px");

    // Add track options
    this.tracks.forEach((t, i) => this.ui.select.option(t.name, String(i)));

    // Buttons row
    const buttonContainer = createDiv("");
    buttonContainer.parent(box);
    buttonContainer.style("display", "flex");
    buttonContainer.style("gap", "8px");
    buttonContainer.style("align-items", "center");

    // Play/Pause button
    this.ui.play = createButton("▶ Play / Pause");
    this.ui.play.parent(buttonContainer);

    // Button styling
    this.ui.play.style("padding", "8px 16px");
    this.ui.play.style("margin", "0");
    this.ui.play.style("background", "#4CAF50");
    this.ui.play.style("color", "white");
    this.ui.play.style("border", "none");
    this.ui.play.style("border-radius", "4px");
    this.ui.play.style("cursor", "pointer");
    this.ui.play.style("font-size", "14px");
    this.ui.play.style("font-weight", "600");
    this.ui.play.style("flex-shrink", "0");

    // Stop button
    this.ui.stop = createButton("⬛ Stop");
    this.ui.stop.parent(buttonContainer);

    // Stop styling
    this.ui.stop.style("padding", "8px 16px");
    this.ui.stop.style("margin", "0");
    this.ui.stop.style("background", "#f44336");
    this.ui.stop.style("color", "white");
    this.ui.stop.style("border", "none");
    this.ui.stop.style("border-radius", "4px");
    this.ui.stop.style("cursor", "pointer");
    this.ui.stop.style("font-size", "14px");
    this.ui.stop.style("font-weight", "600");
    this.ui.stop.style("flex-shrink", "0");

    // Info box (shows track + features)
    this.ui.info = createDiv("Choose a track then click Play");
    this.ui.info.parent(box);
    this.ui.info.style("margin-top", "10px");
    this.ui.info.style("font-size", "13px");
    this.ui.info.style("padding", "8px");
    this.ui.info.style("background", "rgba(255,255,255,0.1)");
    this.ui.info.style("border-radius", "4px");

    // UI events
    this.ui.select.changed(() => this.setTrack(parseInt(this.ui.select.value(), 10)));
    this.ui.play.mousePressed(() => this.toggle());
    this.ui.stop.mousePressed(() => this.stop());

    // Default to first track
    this.setTrack(0);
  }

  // Load selected track and start feature extraction
  setTrack(i) {
    this.current = clamp(i, 0, this.tracks.length - 1);
    const t = this.tracks[this.current];

    // Tell engine to load audio + start Meyda features
    this.engine.loadTrack(t.path);
    this.engine.start(t.features);

    // Display which task mode we are in
    const taskLabel =
      t.task === "2.2"
        ? "<span style='color: #2196F3;'>[Task 2.2]</span>"
        : "<span style='color: #FF9800;'>[Task 2.3 - Voice Control]</span>";

    // Update info box
    this.ui.info.html(
      `${taskLabel} <strong>Track:</strong> ${t.name}<br>` +
      `<strong>Features:</strong> ${t.features.join(", ")}`
    );
  }

  // Toggle play/pause on the audio engine
  toggle() {
    userStartAudio();
    ensureAudioContext();
    this.engine.toggle();
  }

  // Stop playback and reset visuals
  stop() {
    this.engine.stop();
    this.particles = [];
    this.wavePoints = [];
  }

  // Allow external control of background color
  setBackground(rgb) {
    this.bg = rgb;
  }

  // Allow external control of shape mode
  setShape(s) {
    this.shape = s;
  }

  // Main draw loop (called every frame)
  draw(w, h) {
    // Draw a translucent rectangle for trailing/fade effect
    colorMode(RGB, 255);
    fill(this.bg[0], this.bg[1], this.bg[2], 30);
    noStroke();
    rect(0, 0, w, h);

    // Grab current feature values from engine
    const f = this.engine.features;

    // If no audio/features yet, show instruction text
    if (!f) {
      fill(180, 190, 200);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(16);
      text(
        "Click once to enable audio, then press Play to start visualization",
        w / 2,
        h / 2
      );
      return;
    }

    // Features (fallback to 0 when missing)
    const rms = f.rms ?? 0;
    const centroid = f.spectralCentroid ?? 0;
    const zcr = f.zcr ?? 0;
    const rolloff = f.spectralRolloff ?? 0;

    // Animate hue slowly over time
    this.hue = (this.hue + 0.3) % 360;

    // Intensity used to scale visuals (based on loudness)
    const intensity = constrain(rms * 3.5, 0, 1);

    // Layered visuals
    this.drawBackgroundCircles(w, h, rms, centroid);
    this.drawOuterRings(w, h, rms, centroid, zcr, intensity);
    this.updateParticles(w, h, rms, centroid, intensity);
    this.drawCenterpiece(w, h, rms, centroid, intensity);
    this.drawCornerAccents(w, h, intensity);

    // Display numeric feature values at bottom
    colorMode(RGB, 255);
    fill(160, 170, 190, 200);
    noStroke();
    textSize(12);
    textAlign(LEFT, TOP);

    const featureText =
      `RMS: ${rms.toFixed(3)} | ` +
      `Centroid: ${centroid.toFixed(0)} Hz | ` +
      `ZCR: ${zcr.toFixed(3)} | ` +
      `Rolloff: ${rolloff.toFixed(0)} Hz`;

    text(featureText, 12, h - 30);
  }

  // Soft ambient circles in the background
  drawBackgroundCircles(w, h, rms, centroid) {
    colorMode(HSB, 360, 100, 100, 100);
    noStroke();

    // Create a few large "glow" blobs that slowly move
    for (let i = 0; i < 3; i++) {
      const x = w * (0.2 + i * 0.3);
      const y = h * (0.3 + sin(frameCount * 0.01 + i) * 0.2);

      // Size grows with RMS + slight oscillation
      const size = 200 + rms * 400 + cos(frameCount * 0.02 + i) * 50;

      const baseHue = (this.hue + i * 80) % 360;
      fill(baseHue, 35, 25, 8);
      ellipse(x, y, size, size);
    }
  }

  // Rings of small shapes rotating around the center
  drawOuterRings(w, h, rms, centroid, zcr, intensity) {
    colorMode(HSB, 360, 100, 100, 100);

    const maxRadius = min(w, h) * 0.9;
    const rings = 5;

    push();
    translate(w / 2, h / 2);

    for (let ring = 0; ring < rings; ring++) {
      const ringRadius = (maxRadius / rings) * (ring + 1);

      // ZCR controls how many shapes appear around the ring
      const count = int(map(zcr, 0, 0.25, 8, 40, true)) + ring * 3;

      // Centroid affects rotation speed/direction
      const rotation =
        map(centroid, 0, 6000, 0, TWO_PI, true) * (ring % 2 === 0 ? 1 : -1);

      rotate(rotation / (ring + 1));

      for (let i = 0; i < count; i++) {
        const angle = (TWO_PI * i) / count;
        const x = cos(angle) * ringRadius;
        const y = sin(angle) * ringRadius;

        // Slight hue shift per ring and per element
        const localHue = (this.hue + ring * 30 + i * 5) % 360;
        const brightness = 50 + intensity * 30;
        const alpha = 15 + intensity * 25 - ring * 3;

        fill(localHue, 45, brightness, alpha);
        noStroke();

        // Shape grows with volume (rms)
        const shapeSize =
          (8 + rms * 30 - ring * 2) * (1 + sin(frameCount * 0.05 + i) * 0.2);

        this.drawShape(x, y, shapeSize, this.shape);
      }
    }

    pop();
  }

  // Create and animate particles that flow outward
  updateParticles(w, h, rms, centroid, intensity) {
    // Spawn more particles when audio is above a small threshold
    if (rms > 0.015 && frameCount % 2 === 0) {
      const angle = random(TWO_PI);
      const spawnRadius = min(w, h) * 0.15;

      // Each particle stores position, velocity, life, and color
      this.particles.push({
        x: w / 2 + cos(angle) * spawnRadius,
        y: h / 2 + sin(angle) * spawnRadius,
        vx: cos(angle) * map(intensity, 0, 1, 0.5, 3),
        vy: sin(angle) * map(intensity, 0, 1, 0.5, 3),
        life: 1,
        size: random(2, 6) * intensity,
        hue: this.hue + random(-20, 20),
      });
    }

    // Move particles and draw them, remove when dead/offscreen
    colorMode(HSB, 360, 100, 100, 100);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.008;

      const alpha = p.life * 30;
      fill(p.hue, 50, 60, alpha);
      noStroke();
      ellipse(p.x, p.y, p.size, p.size);

      if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
        this.particles.splice(i, 1);
      }
    }
  }

  // Main center glow + rotating small dots
  drawCenterpiece(w, h, rms, centroid, intensity) {
    colorMode(HSB, 360, 100, 100, 100);

    push();
    translate(w / 2, h / 2);

    // Outer glow grows with loudness
    const glowSize = 80 + rms * 300;
    fill(this.hue, 40, 50, 8);
    noStroke();
    ellipse(0, 0, glowSize * 1.5, glowSize * 1.5);

    // Main body
    fill(this.hue, 50, 55, 25);
    ellipse(0, 0, glowSize, glowSize);

    // Inner core
    const coreSize = 40 + rms * 150;
    fill(this.hue, 45, 65, 35);
    ellipse(0, 0, coreSize, coreSize);

    // Small rotating orbs around the core
    const innerCount = 8;
    rotate(frameCount * 0.02);

    for (let i = 0; i < innerCount; i++) {
      const angle = (TWO_PI * i) / innerCount;
      const r = coreSize * 0.4;
      const x = cos(angle) * r;
      const y = sin(angle) * r;

      fill((this.hue + i * 10) % 360, 50, 60, 40);
      ellipse(x, y, 10 + rms * 20, 10 + rms * 20);
    }

    pop();
  }

  // Soft glowing circles in the four corners
  drawCornerAccents(w, h, intensity) {
    colorMode(HSB, 360, 100, 100, 100);

    const corners = [
      [w * 0.1, h * 0.1],
      [w * 0.9, h * 0.1],
      [w * 0.1, h * 0.9],
      [w * 0.9, h * 0.9],
    ];

    corners.forEach((corner, i) => {
      const size = 40 + intensity * 80 + sin(frameCount * 0.05 + i) * 20;
      const localHue = (this.hue + i * 90) % 360;

      fill(localHue, 40, 45, 12);
      noStroke();
      ellipse(corner[0], corner[1], size, size);

      fill(localHue, 45, 55, 8);
      ellipse(corner[0], corner[1], size * 1.5, size * 1.5);
    });
  }

  // Draw a shape at (x,y) with size s based on selected mode
  drawShape(x, y, s, mode) {
    if (mode === "square") {
      rectMode(CENTER);
      rect(x, y, s, s, 2);
    } else if (mode === "triangle") {
      triangle(x, y - s / 2, x - s / 2, y + s / 2, x + s / 2, y + s / 2);
    } else if (mode === "pentagon") {
      this.polygon(x, y, s / 2, 5);
    } else {
      // Default: circle
      ellipse(x, y, s, s);
    }
  }

  // Helper to draw a regular polygon
  polygon(x, y, radius, sides) {
    beginShape();
    for (let i = 0; i < sides; i++) {
      const angle = (TWO_PI * i) / sides - HALF_PI;
      vertex(x + radius * cos(angle), y + radius * sin(angle));
    }
    endShape(CLOSE);
  }
}

////////////////////////////////////////MY CODE///////////////////////////////////////////////