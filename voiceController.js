////////////////////////////////////////MY CODE///////////////////////////////////////////////
class VoiceController {
  constructor(visualiser) {
    // Reference to the AudioVisualizer instance we control
    this.visualiser = visualiser;

    // Tracks whether we are currently listening
    this.isListening = false;

    // p5 speech recognition instance
    
    this.rec = new p5.SpeechRec("en-US", () => this.onResult());
    this.rec.continuous = true;      
    this.rec.interimResults = false; 

    // UI element references
    this.ui = {};

    // Stores the last few successfully executed commands
    this.commandHistory = [];
  }

  // Build the voice controller panel and button handlers
  buildUI() {
    const box = makePanel("Exercise 2.3 — Voice Controller");
    box.position(10, 545); // placed to avoid overlap with other panels

    // Start voice button
    this.ui.start = createButton("🎤 Start Voice");
    this.ui.start.parent(box);
    this.ui.start.style("padding", "8px 12px");
    this.ui.start.style("margin-top", "8px");
    this.ui.start.style("background", "#4CAF50");
    this.ui.start.style("color", "white");
    this.ui.start.style("border", "none");
    this.ui.start.style("border-radius", "4px");
    this.ui.start.style("cursor", "pointer");

    // Stop voice button (starts disabled until voice is active)
    this.ui.stop = createButton("🔇 Stop Voice");
    this.ui.stop.parent(box);
    this.ui.stop.style("padding", "8px 12px");
    this.ui.stop.style("margin-left", "8px");
    this.ui.stop.style("background", "#666");
    this.ui.stop.style("color", "white");
    this.ui.stop.style("border", "none");
    this.ui.stop.style("border-radius", "4px");
    this.ui.stop.style("cursor", "pointer");
    this.ui.stop.attribute("disabled", "true");

    // Status + instructions area
    this.ui.heard = createDiv(
      "<strong>Status:</strong> Not listening<br>" +
        "<small><strong>Color Commands:</strong> Black, White, Red, Blue, Green<br>" +
        "<strong>Shape Commands:</strong> Square, Triangle, Circle, Pentagon</small>"
    );
    this.ui.heard.parent(box);
    this.ui.heard.style("margin-top", "10px");
    this.ui.heard.style("font-size", "13px");
    this.ui.heard.style("padding", "8px");
    this.ui.heard.style("background", "rgba(255,255,255,0.1)");
    this.ui.heard.style("border-radius", "4px");
    this.ui.heard.style("min-height", "50px");
    this.ui.heard.style("line-height", "1.5");

    // Button event handlers
    this.ui.start.mousePressed(() => this.start());
    this.ui.stop.mousePressed(() => this.stop());
  }

  // Start microphone listening (and update UI/button states)
  start() {
    // Prevent starting twice
    if (this.isListening) {
      this.ui.heard.html(
        "<strong>Status:</strong> <span style='color: #4CAF50;'>🔴 Already listening...</span><br>" +
          "<small>Say: Black, White, Red, Blue, Green, Square, Triangle, Circle, or Pentagon</small>"
      );
      return;
    }

    // Ensure audio is unlocked and context is running
    userStartAudio();
    ensureAudioContext();

    try {
      // Start speech recognition
      this.rec.start();
      this.isListening = true;

      // Update status message
      this.ui.heard.html(
        "<strong>Status:</strong> <span style='color: #4CAF50;'>🔴 Listening...</span><br>" +
          "<small>Say: Black, White, Red, Blue, Green, Square, Triangle, Circle, or Pentagon</small>"
      );

      // Update button states (disable start, enable stop)
      this.ui.start.style("background", "#666");
      this.ui.start.attribute("disabled", "true");
      this.ui.stop.style("background", "#f44336");
      this.ui.stop.removeAttribute("disabled");
    } catch (error) {
      // If mic permissions fail or the API errors, show feedback
      this.isListening = false;

      this.ui.heard.html(
        "<strong>Status:</strong> <span style='color: #f44336;'>Error starting microphone</span><br>" +
          "<small>Please check microphone permissions</small>"
      );
    }
  }

  // Stop microphone listening (and update UI/button states)
  stop() {
    // Prevent stopping if not active
    if (!this.isListening) {
      return;
    }

    try {
      this.rec.stop();
      this.isListening = false;

      // Update UI text
      this.ui.heard.html(
        "<strong>Status:</strong> Stopped listening<br>" +
          "<small>Click 'Start Voice' to resume</small>"
      );

      // Update button states (enable start, disable stop)
      this.ui.start.style("background", "#4CAF50");
      this.ui.start.removeAttribute("disabled");
      this.ui.stop.style("background", "#666");
      this.ui.stop.attribute("disabled", "true");
    } catch (error) {
      // Even if stop fails, force the flag off so UI doesn't get stuck
      this.isListening = false;
    }
  }

  // Called whenever speech recognition returns a phrase
  onResult() {
    // Normalize the recognized text
    const raw = (this.rec.resultString || "").trim().toLowerCase();
    if (!raw) return;

    let commandExecuted = false;
    let commandType = "";
    let commandValue = "";

    // Background color commands (first match wins)
    if (raw.includes("black")) {
      this.visualiser.setBackground([0, 0, 0]);
      commandExecuted = true;
      commandType = "Background";
      commandValue = "Black";
    } else if (raw.includes("white")) {
      this.visualiser.setBackground([255, 255, 255]);
      commandExecuted = true;
      commandType = "Background";
      commandValue = "White";
    } else if (raw.includes("red")) {
      this.visualiser.setBackground([160, 0, 0]);
      commandExecuted = true;
      commandType = "Background";
      commandValue = "Red";
    } else if (raw.includes("blue")) {
      this.visualiser.setBackground([0, 80, 190]);
      commandExecuted = true;
      commandType = "Background";
      commandValue = "Blue";
    } else if (raw.includes("green")) {
      this.visualiser.setBackground([0, 130, 80]);
      commandExecuted = true;
      commandType = "Background";
      commandValue = "Green";
    }

    // Shape commands (checked separately so a phrase can include both a color + a shape)
    if (raw.includes("square")) {
      this.visualiser.setShape("square");
      commandExecuted = true;
      commandType = "Shape";
      commandValue = "Square";
    } else if (raw.includes("triangle")) {
      this.visualiser.setShape("triangle");
      commandExecuted = true;
      commandType = "Shape";
      commandValue = "Triangle";
    } else if (raw.includes("circle")) {
      this.visualiser.setShape("circle");
      commandExecuted = true;
      commandType = "Shape";
      commandValue = "Circle";
    } else if (raw.includes("pentagon")) {
      this.visualiser.setShape("pentagon");
      commandExecuted = true;
      commandType = "Shape";
      commandValue = "Pentagon";
    }

    // Update UI with the recognized phrase and whether it matched a command
    if (commandExecuted) {
      // Store up to 3 most recent executed commands
      this.commandHistory.unshift(`${commandType}: ${commandValue}`);
      if (this.commandHistory.length > 3) {
        this.commandHistory.pop();
      }

      const historyText =
        this.commandHistory.length > 0
          ? "<br><small>Recent: " + this.commandHistory.join(" → ") + "</small>"
          : "";

      this.ui.heard.html(
        `<strong>Heard:</strong> "${raw}"<br>` +
          `<strong>Command:</strong> <span style='color: #4CAF50;'>✓ ${commandType} → ${commandValue}</span>` +
          historyText
      );
    } else {
      this.ui.heard.html(
        `<strong>Heard:</strong> "${raw}"<br>` +
          `<strong>Command:</strong> <span style='color: #FF9800;'>⚠ No matching command</span><br>` +
          `<small>Try: Black, White, Red, Blue, Green, Square, Triangle, Circle, Pentagon</small>`
      );
    }
  }

  // Helper to expose whether voice control is currently active
  isActive() {
    return this.isListening;
  }
}
////////////////////////////////////////MY CODE///////////////////////////////////////////////

