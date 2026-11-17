# Convertly

**A fast, private, offline-first unit converter with 26 conversion categories.** Convertly runs in your browser from a local folder, with no installation, account, or network connection required.

## Start using Convertly

On Windows, double-click `Run Convertly.bat`. You can also open `index.html` directly in a modern browser. The optional Python launcher is `python unitconverter.py`.

## Features

- Convert as you type, with searchable categories, unit swapping, and popular pairs.
- Copy results, save favorite unit pairs, and revisit recent conversions.
- Choose a light or dark theme and use the responsive layout on desktop or mobile.
- Keep history, favorites, and theme preference in the browser's local storage on this device.
- Use the app offline; its interface and conversion data are included in this project.

## Conversion categories

Length, area, volume, mass, time, speed, temperature, pressure, energy, power, data storage, data transfer, fuel economy, angle, frequency, force, torque, density, acceleration, voltage, current, resistance, charge, capacitance, flow rate, and illuminance.

The converter distinguishes decimal storage units (kB, MB, GB) from binary units (KiB, MiB, GiB), and US customary measures from Imperial measures. Fuel economy supports L/100 km, km/L, US mpg, and Imperial mpg.

### Conversion conventions

- A month is treated as 30 days; a year as 365.25 days.
- Fuel economy uses the reciprocal relationship between distance per fuel and fuel per distance.
- Temperature conversions enforce absolute zero.

## Run from source

The browser app has no package installation or build step. Its main files are:

| File | Purpose |
| --- | --- |
| `index.html` | App structure and accessibility labels |
| `styles.css` | Responsive interface and light/dark themes |
| `app.js` | Converter interactions and local preferences |
| `conversion-data.js` | Offline unit names and conversion factors |
| `conversion_engine.py` | Python conversion engine for reuse in scripts |
| `unitconverter.py` | Optional launcher that opens the browser app |
| `Run Convertly.bat` | Windows double-click launcher |
| `ABOUT.md` | Project overview and short description |

## Privacy

Convertly performs conversions in the browser. It has no account, analytics, backend, or external API. Saved activity stays in this browser on this device; clearing browser site data may remove it.

## Keyboard shortcuts

- `Ctrl+K` — focus the category search.
- `Ctrl+Shift+C` — copy the current result.

## Short project description

Offline-first unit converter for 26 categories, with a responsive interface, local history, favorites, and no external dependencies.
