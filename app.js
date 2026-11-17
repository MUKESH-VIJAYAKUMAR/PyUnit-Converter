(() => {
  "use strict";

  const categories = window.CONVERTLY_CATEGORIES || {};
  const categoryNames = Object.keys(categories);
  const stateKey = "convertly-state-v1";
  const icons = {
    Length: "↔", Area: "▧", Volume: "◉", Mass: "◌", Time: "◷", Speed: "⌁",
    Temperature: "°", Pressure: "▤", Energy: "ϟ", Power: "ϟ", "Data storage": "▣",
    "Data transfer": "⇄", "Fuel economy": "⌖", Angle: "∠", Frequency: "∿",
    Force: "↗", Torque: "⟳", Density: "▦", Acceleration: "↑", Voltage: "ϟ",
    Current: "⌁", Resistance: "Ω", Charge: "✦", Capacitance: "▱", "Flow rate": "≋",
    Illuminance: "☼",
  };
  const popularPairs = {
    Length: [["Kilometer", "Mile"], ["Foot", "Meter"], ["Inch", "Centimeter"], ["Centimeter", "Inch"]],
    Area: [["Square meter", "Square foot"], ["Acre", "Hectare"], ["Square kilometer", "Acre"], ["Square foot", "Square meter"]],
    Volume: [["Liter", "US gallon"], ["Milliliter", "US fluid ounce"], ["US gallon", "Liter"], ["Cubic foot", "Liter"]],
    Mass: [["Kilogram", "Pound"], ["Pound", "Kilogram"], ["Gram", "Ounce"], ["Metric ton", "US short ton"]],
    Time: [["Hour", "Minute"], ["Day", "Hour"], ["Week", "Day"], ["Year (365.25 days)", "Day"]],
    Speed: [["Kilometer per hour", "Mile per hour"], ["Meter per second", "Kilometer per hour"], ["Knot", "Mile per hour"]],
    Temperature: [["Celsius", "Fahrenheit"], ["Fahrenheit", "Celsius"], ["Celsius", "Kelvin"], ["Kelvin", "Celsius"]],
    Pressure: [["Bar", "Pound per square inch"], ["Atmosphere", "Kilopascal"], ["Kilopascal", "Pound per square inch"]],
    Energy: [["Kilowatt-hour", "Joule"], ["Calorie", "Joule"], ["BTU", "Kilojoule"]],
    Power: [["Kilowatt", "Mechanical horsepower"], ["Watt", "BTU per hour"], ["Metric horsepower", "Watt"]],
    "Data storage": [["Gigabyte", "Gibibyte"], ["Megabyte", "Byte"], ["Terabyte", "Gigabyte"], ["Bit", "Byte"]],
    "Data transfer": [["Megabit per second", "Megabyte per second"], ["Kilobit per second", "Kilobyte per second"], ["Gigabit per second", "Megabit per second"]],
    "Fuel economy": [["Liter per 100 kilometers", "Miles per US gallon"], ["Miles per US gallon", "Kilometer per liter"], ["Miles per imperial gallon", "Miles per US gallon"]],
    Angle: [["Degree", "Radian"], ["Turn", "Degree"], ["Gradian", "Degree"], ["Arcminute", "Degree"]],
    Frequency: [["Gigahertz", "Megahertz"], ["Revolutions per minute", "Hertz"], ["Kilohertz", "Hertz"]],
    Force: [["Newton", "Pound-force"], ["Kilogram-force", "Newton"], ["Kilonewton", "Pound-force"]],
    Torque: [["Newton meter", "Pound-foot"], ["Pound-inch", "Newton meter"], ["Kilonewton meter", "Newton meter"]],
    Density: [["Kilogram per cubic meter", "Gram per cubic centimeter"], ["Pound per cubic foot", "Kilogram per cubic meter"]],
    Acceleration: [["Standard gravity", "Meter per second squared"], ["Foot per second squared", "Meter per second squared"]],
    Voltage: [["Volt", "Millivolt"], ["Kilovolt", "Volt"], ["Microvolt", "Volt"]],
    Current: [["Ampere", "Milliampere"], ["Kiloampere", "Ampere"], ["Microampere", "Milliampere"]],
    Resistance: [["Kiloohm", "Ohm"], ["Megaohm", "Kiloohm"], ["Milliohm", "Ohm"]],
    Charge: [["Ampere-hour", "Coulomb"], ["Milliampere-hour", "Ampere-hour"], ["Coulomb", "Microcoulomb"]],
    Capacitance: [["Microfarad", "Nanofarad"], ["Farad", "Microfarad"], ["Picofarad", "Nanofarad"]],
    "Flow rate": [["Liter per minute", "Cubic meter per second"], ["US gallon per minute", "Liter per minute"], ["Liter per second", "Liter per minute"]],
    Illuminance: [["Lux", "Foot-candle"], ["Phot", "Lux"], ["Foot-candle", "Lux"]],
  };

  const $ = (selector) => document.querySelector(selector);
  const categoryList = $("#category-list");
  const searchInput = $("#category-search");
  const amountInput = $("#amount-input");
  const fromSelect = $("#from-unit");
  const toSelect = $("#to-unit");
  const statusEl = $("#conversion-status");
  const numberFormatter = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 12 });

  function readSavedState() {
    try {
      return JSON.parse(localStorage.getItem(stateKey) || "{}");
    } catch {
      return {};
    }
  }

  const saved = readSavedState();
  let theme = saved.theme === "dark" ? "dark" : "light";
  let currentCategory = categoryNames.includes(saved.category) ? saved.category : "Length";
  let currentFrom = saved.from || "Meter";
  let currentTo = saved.to || "Kilometer";
  let recent = Array.isArray(saved.recent) ? saved.recent.slice(0, 12) : [];
  let favorites = Array.isArray(saved.favorites) ? saved.favorites.slice(0, 20) : [];
  let lastResult = null;
  let historyTimer = 0;

  function saveState() {
    try {
      localStorage.setItem(stateKey, JSON.stringify({
        theme, category: currentCategory, from: currentFrom, to: currentTo,
        recent: recent.slice(0, 12), favorites: favorites.slice(0, 20),
      }));
    } catch {
      // The converter still works when local storage is unavailable.
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[char]);
  }

  function unit(name) {
    return categories[currentCategory].units.find((item) => item.name === name);
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) return "—";
    if (Math.abs(value) < 5e-15) value = 0;
    return numberFormatter.format(value);
  }

  function convertValue(value, categoryName, fromName, toName) {
    const definition = categories[categoryName];
    const source = definition.units.find((item) => item.name === fromName);
    const target = definition.units.find((item) => item.name === toName);
    if (!source || !target || !Number.isFinite(value)) throw new Error("Choose valid units and enter a finite number.");

    if (definition.mode === "fuel") {
      if (value <= 0) throw new Error("Fuel economy must be greater than zero.");
      const base = fromName === "Liter per 100 kilometers" ? 100 / value : value * source.factor;
      if (base <= 0) throw new Error("Fuel economy must be greater than zero.");
      return toName === "Liter per 100 kilometers" ? 100 / base : base / target.factor;
    }

    const base = value * source.factor + source.offset;
    if (categoryName === "Temperature" && base < 0) throw new Error("Temperature cannot be below absolute zero.");
    return (base - target.offset) / target.factor;
  }

  function renderCategoryList(query = "") {
    const needle = query.trim().toLocaleLowerCase();
    const matches = categoryNames.filter((name) => `${name} ${categories[name].description}`.toLocaleLowerCase().includes(needle));
    categoryList.innerHTML = matches.length ? matches.map((name) => `
      <button class="category-button" type="button" data-category="${escapeHtml(name)}" aria-current="${name === currentCategory ? "page" : "false"}">
        <span class="category-symbol" aria-hidden="true">${icons[name] || categories[name].icon || "·"}</span>
        <span class="category-name">${escapeHtml(name)}</span>
      </button>`).join("") : '<div class="empty-search">No converters match that search.</div>';
    categoryList.querySelectorAll("[data-category]").forEach((button) => {
      button.addEventListener("click", () => setCategory(button.dataset.category));
    });
  }

  function renderUnits() {
    const definition = categories[currentCategory];
    const names = definition.units.map((item) => item.name);
    if (!names.includes(currentFrom)) currentFrom = names[0];
    if (!names.includes(currentTo)) currentTo = names[Math.min(1, names.length - 1)];
    const options = definition.units.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)} · ${escapeHtml(item.symbol)}</option>`).join("");
    fromSelect.innerHTML = options;
    toSelect.innerHTML = options;
    fromSelect.value = currentFrom;
    toSelect.value = currentTo;
    $("#source-hint").textContent = unit(currentFrom).symbol;
    $("#category-title").textContent = currentCategory;
    $("#category-description").textContent = definition.description;
    $("#category-icon").textContent = icons[currentCategory] || definition.icon || "·";
    renderPopularPairs();
    updateFavoriteButton();
    renderCategoryList(searchInput.value);
  }

  function setCategory(name) {
    if (!categories[name]) return;
    currentCategory = name;
    const names = categories[name].units.map((item) => item.name);
    currentFrom = names[0];
    currentTo = names[Math.min(1, names.length - 1)];
    renderUnits();
    calculate();
  }

  function setPair(fromName, toName) {
    currentFrom = fromName;
    currentTo = toName;
    fromSelect.value = fromName;
    toSelect.value = toName;
    $("#source-hint").textContent = unit(currentFrom).symbol;
    updateFavoriteButton();
    calculate();
  }

  function renderPopularPairs() {
    const pairs = (popularPairs[currentCategory] || []).filter(([fromName, toName]) => unit(fromName) && unit(toName)).slice(0, 4);
    $("#quick-pairs").innerHTML = pairs.map(([fromName, toName]) => {
      const fromItem = unit(fromName);
      const toItem = unit(toName);
      return `<button class="quick-pair" type="button" data-from="${escapeHtml(fromName)}" data-to="${escapeHtml(toName)}" title="${escapeHtml(fromName)} to ${escapeHtml(toName)}"><span>${escapeHtml(fromItem.symbol)}</span><span class="pair-arrow" aria-hidden="true">→</span><span>${escapeHtml(toItem.symbol)}</span></button>`;
    }).join("");
    $("#quick-pairs").querySelectorAll("[data-from]").forEach((button) => {
      button.addEventListener("click", () => setPair(button.dataset.from, button.dataset.to));
    });
  }

  function showError(message) {
    lastResult = null;
    $("#result-value").textContent = "—";
    $("#result-symbol").textContent = unit(currentTo)?.symbol || "";
    $("#equation").textContent = message;
    statusEl.classList.add("is-error");
    statusEl.innerHTML = `<span class="status-check">!</span> ${escapeHtml(message)}`;
  }

  function calculate() {
    const raw = amountInput.value.trim();
    const source = unit(currentFrom);
    const target = unit(currentTo);
    $("#source-hint").textContent = source?.symbol || "";
    if (!raw) {
      showError("Enter a value to convert.");
      return;
    }
    const value = Number(raw.replaceAll(",", ""));
    if (!Number.isFinite(value)) {
      showError("Enter a valid number.");
      return;
    }
    let result;
    try {
      result = convertValue(value, currentCategory, currentFrom, currentTo);
    } catch (error) {
      showError(error.message || "Check the value and selected units.");
      return;
    }
    if (!Number.isFinite(result)) {
      showError("The result is outside the supported numeric range.");
      return;
    }
    const resultText = formatNumber(result);
    lastResult = { value, result, resultText };
    $("#result-value").textContent = resultText;
    $("#result-symbol").textContent = target.symbol;
    $("#equation").textContent = `${formatNumber(value)} ${source.symbol}  =  ${resultText} ${target.symbol}`;
    statusEl.classList.remove("is-error");
    statusEl.innerHTML = '<span class="status-check">✓</span> Conversion ready';
    updateFavoriteButton();
    window.clearTimeout(historyTimer);
    historyTimer = window.setTimeout(recordRecent, 850);
  }

  function recordRecent() {
    if (!lastResult) return;
    const record = {
      category: currentCategory, from: currentFrom, to: currentTo,
      amount: formatNumber(lastResult.value), result: lastResult.resultText,
    };
    const same = (item) => item.category === record.category && item.from === record.from && item.to === record.to && item.amount === record.amount;
    recent = [record, ...recent.filter((item) => !same(item))].slice(0, 12);
    saveState();
    renderActivity();
  }

  function isFavorite(item) {
    return favorites.some((savedItem) => savedItem.category === item.category && savedItem.from === item.from && savedItem.to === item.to);
  }

  function updateFavoriteButton() {
    const button = $("#favorite-button");
    if (!button || !categories[currentCategory]) return;
    const savedPair = isFavorite({ category: currentCategory, from: currentFrom, to: currentTo });
    button.classList.toggle("is-saved", savedPair);
    button.setAttribute("aria-pressed", String(savedPair));
    button.innerHTML = `<span aria-hidden="true">${savedPair ? "★" : "☆"}</span> ${savedPair ? "Saved pair" : "Save pair"}`;
  }

  function toggleFavorite() {
    const selected = { category: currentCategory, from: currentFrom, to: currentTo };
    if (isFavorite(selected)) {
      favorites = favorites.filter((item) => !(item.category === selected.category && item.from === selected.from && item.to === selected.to));
    } else {
      favorites = [selected, ...favorites].slice(0, 20);
    }
    saveState();
    updateFavoriteButton();
    renderActivity();
  }

  function recordSymbols(record) {
    const definition = categories[record.category];
    if (!definition) return null;
    return {
      source: definition.units.find((item) => item.name === record.from),
      target: definition.units.find((item) => item.name === record.to),
    };
  }

  function renderActivity() {
    const historyList = $("#history-list");
    const favoritesList = $("#favorites-list");
    const historyItems = recent.slice(0, 6).filter((item) => recordSymbols(item)?.source && recordSymbols(item)?.target);
    const favoriteItems = favorites.slice(0, 6).filter((item) => recordSymbols(item)?.source && recordSymbols(item)?.target);
    historyList.innerHTML = historyItems.length ? historyItems.map((item) => {
      const units = recordSymbols(item);
      return `<button class="activity-row" type="button" data-history="${escapeHtml(JSON.stringify(item))}" aria-label="Repeat ${escapeHtml(item.amount)} ${escapeHtml(units.source.symbol)} to ${escapeHtml(item.result)} ${escapeHtml(units.target.symbol)}">
        <span class="activity-row-mark" aria-hidden="true">${icons[item.category] || "↔"}</span>
        <span class="activity-row-copy"><span class="activity-main">${escapeHtml(item.amount)} ${escapeHtml(units.source.symbol)} <span aria-hidden="true">→</span> ${escapeHtml(item.result)} ${escapeHtml(units.target.symbol)}</span><span class="activity-sub">${escapeHtml(item.category)}</span></span>
      </button>`;
    }).join("") : '<div class="empty-activity"><span>◷</span><span>Your recent conversions<br>will appear here.</span></div>';

    favoritesList.innerHTML = favoriteItems.length ? favoriteItems.map((item) => {
      const units = recordSymbols(item);
      return `<button class="activity-row" type="button" data-favorite="${escapeHtml(JSON.stringify(item))}" aria-label="Use saved ${escapeHtml(item.category)} pair ${escapeHtml(units.source.symbol)} to ${escapeHtml(units.target.symbol)}">
        <span class="activity-row-mark" aria-hidden="true">★</span>
        <span class="activity-row-copy"><span class="activity-main">${escapeHtml(units.source.symbol)} <span aria-hidden="true">→</span> ${escapeHtml(units.target.symbol)}</span><span class="activity-sub">${escapeHtml(item.category)}</span></span>
      </button>`;
    }).join("") : '<div class="empty-activity"><span>☆</span><span>Save a pair to keep<br>your favorites close.</span></div>';
    $("#favorite-count").textContent = String(favorites.length);

    historyList.querySelectorAll("[data-history]").forEach((button) => button.addEventListener("click", () => applyRecord(JSON.parse(button.dataset.history), true)));
    favoritesList.querySelectorAll("[data-favorite]").forEach((button) => button.addEventListener("click", () => applyRecord(JSON.parse(button.dataset.favorite), false)));
  }

  function applyRecord(record, includeAmount) {
    currentCategory = record.category;
    currentFrom = record.from;
    currentTo = record.to;
    if (includeAmount) amountInput.value = record.amount;
    renderUnits();
    calculate();
    amountInput.focus({ preventScroll: true });
  }

  function swapUnits() {
    [currentFrom, currentTo] = [currentTo, currentFrom];
    fromSelect.value = currentFrom;
    toSelect.value = currentTo;
    calculate();
  }

  async function copyResult() {
    if (!lastResult) return;
    const text = `${lastResult.resultText} ${unit(currentTo).symbol}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
    }
    const button = $("#copy-button");
    button.innerHTML = '<span aria-hidden="true">✓</span> Copied';
    window.setTimeout(() => { button.innerHTML = '<span class="copy-icon" aria-hidden="true">▢</span> Copy result'; }, 1200);
  }

  function setTheme(nextTheme) {
    theme = nextTheme;
    document.documentElement.dataset.theme = theme;
    const dark = theme === "dark";
    $("#theme-toggle").innerHTML = dark
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.3 15.3A8.7 8.7 0 0 1 8.7 3.7 8.8 8.8 0 1 0 20.3 15.3Z"></path></svg>';
    $("#theme-toggle").title = dark ? "Switch to light theme" : "Switch to dark theme";
    $("#theme-toggle").setAttribute("aria-label", $("#theme-toggle").title);
    saveState();
  }

  searchInput.addEventListener("input", () => renderCategoryList(searchInput.value));
  amountInput.addEventListener("input", calculate);
  fromSelect.addEventListener("change", () => { currentFrom = fromSelect.value; calculate(); });
  toSelect.addEventListener("change", () => { currentTo = toSelect.value; calculate(); });
  $("#swap-button").addEventListener("click", swapUnits);
  $("#favorite-button").addEventListener("click", toggleFavorite);
  $("#copy-button").addEventListener("click", copyResult);
  $("#theme-toggle").addEventListener("click", () => setTheme(theme === "dark" ? "light" : "dark"));
  $("#clear-history").addEventListener("click", () => { recent = []; saveState(); renderActivity(); });
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === "c") {
      event.preventDefault();
      copyResult();
    }
  });

  document.documentElement.dataset.theme = theme;
  setTheme(theme);
  renderUnits();
  renderActivity();
  amountInput.value = saved.amount || "1";
  calculate();
})();
