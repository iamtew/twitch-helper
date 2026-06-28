async function main() {
  const params = new URLSearchParams(location.search);

  const user = params.get("user");
  const titleBox = document.getElementById("titleBox");

  if (!user) {
    titleBox.textContent =
      "Error: No user configured. Add ?user=USERNAME to the URL.";
    return;
  }

  const url = `https://decapi.me/twitch/title/${encodeURIComponent(user)}`;
  const res = await fetch(url);
  const text = await res.text();
  titleBox.textContent = text || `No title found for "${user}".`;

  initMenuState();
  applySettings();
}

/* --- MENU STATE HANDLING --- */
function initMenuState() {
  const params = new URLSearchParams(location.search);
  const menuState = (params.get("menu") || "on").toLowerCase();

  const settings = document.getElementById("settings");
  const toggle = document.getElementById("menuToggle");

  if (menuState === "disable") {
    settings.style.display = "none";
    toggle.style.display = "none";
    return;
  }

  toggle.style.display = "block";

  if (menuState === "on") {
    settings.style.display = "block";
    toggle.textContent = "❌";
  } else {
    settings.style.display = "none";
    toggle.textContent = "⭕";
  }

  toggle.onclick = () => {
    const isVisible = settings.style.display !== "none";
    const newState = isVisible ? "off" : "on";
    updateURL("menu", newState);
  };
}

/* --- SETTINGS APPLICATION --- */
function applySettings() {
  const params = new URLSearchParams(location.search);

  const fontSize = params.get("fontSize") || 3.5;
  const fontColor = params.get("fontColor") || "#000000";

  const border = params.get("border") === "on";
  const outlineColor = params.get("outlineColor") || "#333333";
  const borderThickness = params.get("borderThickness") || 4;

  const fontFX = params.get("fontFX") === "on";
  const fontFXOffset = params.get("fontFXOffset") || 1;

  const wrap = params.get("wrap") === "on";
  const scroll = params.get("scroll") === "on";
  const speed = params.get("speed") || 3;
  const direction = params.get("direction") || "rtl";

  document.documentElement.style.setProperty("--font-size", fontSize + "em");
  document.documentElement.style.setProperty("--font-color", fontColor);
  document.documentElement.style.setProperty(
    "--wrap-mode",
    wrap ? "normal" : "nowrap"
  );

  /* --- BUILD OUTLINE SHADOW --- */
  let outlineShadow = "none";
  if (border) {
    const t = borderThickness;
    const c = outlineColor;

    outlineShadow = `
      -${t}px -${t}px ${c},
       ${t}px -${t}px ${c},
      -${t}px  ${t}px ${c},
       ${t}px  ${t}px ${c}
    `;
  }

  /* --- BUILD FONT FX SHADOW (with offset) --- */
  let fxShadow = "none";
  if (fontFX) {
    const o = fontFXOffset;

    fxShadow = `
      ${o}px 0px rgba(255, 0, 0, 0.75),
     -${o}px 0px rgba(0, 128, 255, 0.75)
    `;
  }

  /* --- COMBINE SHADOWS --- */
  let combined = "none";
  if (border && fontFX) {
    combined = outlineShadow + "," + fxShadow;
  } else if (border) {
    combined = outlineShadow;
  } else if (fontFX) {
    combined = fxShadow;
  }

  document.documentElement.style.setProperty("--combined-shadow", combined);

  const titleBox = document.getElementById("titleBox");
  const rawText = titleBox.textContent;

  if (scroll) {
    const marquee = document.createElement("span");
    marquee.className = "marquee";
    marquee.textContent = rawText;

    const duration = 60 / speed;

    if (direction === "rtl") {
      document.documentElement.style.setProperty("--scroll-start", window.innerWidth + "px");
      document.documentElement.style.setProperty("--scroll-end", -titleBox.scrollWidth + "px");
    } else {
      document.documentElement.style.setProperty("--scroll-start", -titleBox.scrollWidth + "px");
      document.documentElement.style.setProperty("--scroll-end", window.innerWidth + "px");
    }

    marquee.style.animationDuration = duration + "s";
    titleBox.innerHTML = "";
    titleBox.appendChild(marquee);
  } else {
    titleBox.textContent = rawText;
  }

  updateUI(fontSize, fontColor, border, outlineColor, borderThickness, fontFX, fontFXOffset, wrap, scroll, speed, direction);
}

function updateURL(key, value) {
  const params = new URLSearchParams(location.search);
  params.set(key, value);
  history.replaceState({}, "", "?" + params.toString());
  if (key === "menu") {
    initMenuState();
  } else {
    applySettings();
  }
}

function updateUI(fontSize, fontColor, border, outlineColor, borderThickness, fontFX, fontFXOffset, wrap, scroll, speed, direction) {
  document.getElementById("fontSize").value = fontSize;
  document.getElementById("fontColor").value = fontColor;
  document.getElementById("border").checked = border;
  document.getElementById("outlineColor").value = outlineColor;
  document.getElementById("borderThickness").value = borderThickness;
  document.getElementById("fontFX").checked = fontFX;
  document.getElementById("fontFXOffset").value = fontFXOffset;
  document.getElementById("wrap").checked = wrap;
  document.getElementById("scroll").checked = scroll;
  document.getElementById("speed").value = speed;
  document.getElementById("direction").value = direction;
}

/* --- RESET BUTTON --- */
function resetSettings() {
  const params = new URLSearchParams(location.search);

  params.set("fontSize", 3.5);
  params.set("fontColor", "#000000");
  params.set("border", "off");
  params.set("outlineColor", "#333333");
  params.set("borderThickness", 4);
  params.set("fontFX", "off");
  params.set("fontFXOffset", 1);
  params.set("wrap", "off");
  params.set("scroll", "off");
  params.set("speed", 3);
  params.set("direction", "rtl");

  history.replaceState({}, "", "?" + params.toString());
  applySettings();
}

document.getElementById("resetBtn").onclick = resetSettings;

/* --- SETTINGS EVENTS --- */
document.getElementById("fontSize").oninput = e =>
  updateURL("fontSize", e.target.value);

document.getElementById("fontColor").oninput = e =>
  updateURL("fontColor", e.target.value);

document.getElementById("border").onchange = e =>
  updateURL("border", e.target.checked ? "on" : "off");

document.getElementById("outlineColor").oninput = e =>
  updateURL("outlineColor", e.target.value);

document.getElementById("borderThickness").oninput = e =>
  updateURL("borderThickness", e.target.value);

document.getElementById("fontFX").onchange = e =>
  updateURL("fontFX", e.target.checked ? "on" : "off");

document.getElementById("fontFXOffset").oninput = e =>
  updateURL("fontFXOffset", e.target.value);

document.getElementById("wrap").onchange = e =>
  updateURL("wrap", e.target.checked ? "on" : "off");

document.getElementById("scroll").onchange = e =>
  updateURL("scroll", e.target.checked ? "on" : "off");

document.getElementById("speed").oninput = e =>
  updateURL("speed", e.target.value);

document.getElementById("direction").onchange = e =>
  updateURL("direction", e.target.value);

main();
