////////////////////////////////////////MY CODE///////////////////////////////////////////////
// Clamp a numeric value between a minimum and maximum
function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

// Create a reusable styled UI panel
function makePanel(title) {
  // Create a div with a title
  const d = createDiv(title);

  // Apply consistent panel styling
  d.style("padding", "10px 12px");
  d.style("margin", "10px");
  d.style("background", "rgba(0,0,0,0.75)");
  d.style("border", "1px solid rgba(255,255,255,0.25)");
  d.style("border-radius", "8px");
  d.style("display", "inline-block");
  d.style("max-width", "520px");
  d.style("font-size", "14px");
  d.style("color", "#fff");
  d.style("box-shadow", "0 4px 6px rgba(0,0,0,0.3)");

  return d;
}

// Format a number to a fixed number of decimal places
function formatNum(num, decimals = 2) {
  return num.toFixed(decimals);
}

// Ensure the Web Audio context is running
function ensureAudioContext() {
  const ctx = getAudioContext();

  if (ctx.state === "suspended") {
    ctx.resume();
  }

  return ctx;
}

////////////////////////////////////////MY CODE///////////////////////////////////////////////