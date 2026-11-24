# 🌬️ AeroGuardian | GenAI Urban Air Quality Assistant
> **PromptWars Virtual — [Challenge 6] Urban Air Quality Assistant**  
> *Translating atmospheric numerical model telemetry into defensible exposure mitigation, low-emission daily routines, and home air safety.*

---

## 📌 Executive Summary

During winter months, inland urban basins (such as Delhi NCR, Lahore, Beijing, the Po Valley, and Los Angeles) frequently experience severe surface-layer air pollution. Cold ground air combined with light winds creates stagnant boundary layer conditions that trap vehicular exhaust, biomass smoke, and industrial particulate matter close to breathing height.

Conventional air quality tools report scalar index numbers (e.g. "AQI 320") without providing:
1. **Atmospheric Context**: Distinguishing numerical meteorological model predictions (e.g., Copernicus Atmosphere Monitoring Service) from physical ground sensors, and explaining surface-layer stagnation dynamics without claiming unverified thermal inversions.
2. **Defensible Exposure Math**: Transparently modeling estimated inhaled PM2.5 mass (based on EPA minute ventilation rates) rather than conflating it with clinical lung-deposited dose.
3. **Safety-Audited Household Protocols**: Practical DIY filtration designs (such as the Corsi-Rosenthal box) with explicit fan electrical cautions, non-flame draft checks, and life-safety rules regarding combustion-air vents.
4. **Transparent Commute Deltas**: Empirical transportation $\text{CO}_2$ deltas (based on EPA AP-42 and DEFRA conversion factors) that only claim savings when transitioning from higher-emitting modes.

AeroGuardian is an open-source, client-side web application pairing **live Open-Meteo & Copernicus CAMS numerical model forecasts** with an **in-memory Google Gemini 3.8 Flash reasoning assistant** and an **offline deterministic heuristic engine**.

---

## 🎯 1. Challenge Alignment

* **Vertical**: **Challenge 6 — Urban Air Quality Assistant**
* **Target Audience**: Urban families, schools, sensitive groups (asthma, cardiovascular, infants, elderly), and daily commuters.
* **Core Philosophy**: Prioritize scientific defensibility over exaggerated claims. Never invent pollutant readings, never promise universal ventilation hours, and never claim unmeasured indoor air quality.

---

## 🧠 2. Scientific Logic & Mathematical Formulations

### A. Atmospheric Stagnation & Ventilation Viability
Winter smog episodes feature shallow planetary boundary layers and nocturnal radiation cooling. AeroGuardian evaluates natural ventilation viability strictly against modeled pollutant thresholds rather than arbitrary clock times:
* **AQI $\le 50$ (Good)**: Natural cross-ventilation is viable.
* **AQI $51 - 100$ (Moderate)**: Natural ventilation conditionally viable for brief periods (15–20 minutes) to manage indoor $\text{CO}_2$; sensitive occupants should monitor symptoms.
* **AQI $> 100$ (Unhealthy for Sensitive Groups & Higher)**: **Natural ventilation is not recommended**. Ambient air carries elevated particulate levels; windows should remain sealed while running indoor mechanical filtration.
* **Data Caveat**: Ambient telemetry originates from regional numerical weather models (Copernicus CAMS at 0.4°/0.75° grid resolution). This app does not currently ingest wind or vertical-profile observations, so **surface stagnation risk is shown as unknown**; pollutant levels alone are not treated as evidence of stagnation or an inversion.

### B. Estimated Inhaled PM2.5 Mass Formula
AeroGuardian models the mass of ambient fine particulate drawn into the respiratory tract:

$$\text{Estimated Inhaled Mass } (\mu\text{g}) = C_{\text{PM2.5}} \times V_{\text{ventilation}} \times t \times (1 - \eta_{\text{mask}})$$

* **$C_{\text{PM2.5}}$**: Modeled ambient PM2.5 concentration in $\mu\text{g/m}^3$.
* **$V_{\text{ventilation}}$**: Minute ventilation volume from the **US EPA Exposure Factors Handbook (2011)**:
  * Resting/light activity: $0.60\text{ m}^3/\text{hr}$ ($\approx 10\text{ L/min}$).
  * Moderate exertion (aerobic exercise/cycling): $2.10\text{ m}^3/\text{hr}$ ($\approx 35\text{ L/min}$).
* **$\eta_{\text{mask}}$**: Particulate filtration efficiency. Assumes $0.95$ for a continuously sealed, leak-free N95 respirator. Poorly fitted respirators or cloth masks exhibit substantial perimeter bypass and achieve markedly lower protection.
* **Scientific Label**: This metric represents **estimated inhaled particulate mass**, not a clinical lung-deposited dose (which depends on particle aerodynamic diameter, hygroscopic growth, and airway deposition mechanics).

### C. Transportation $\text{CO}_2$ Operational Delta
Commute emission comparisons model operational tailpipe and lifecycle factors:

$$\Delta\text{CO}_2\text{ (kg)} = d_{\text{round-trip}} \times \max\left(0,\, E_{\text{baseline}} - E_{\text{alternative}}\right)$$

* **Emission Factors** (US EPA & UK DEFRA Greenhouse Gas Conversion Factors):
  * Private Petrol/Diesel Solo Car: $0.192\text{ kg CO}_2/\text{passenger-km}$
  * Carpool (assumed 2.5 average occupancy): $0.075\text{ kg CO}_2/\text{passenger-km}$
  * Electrified Mass Transit (Metro/City Bus): $0.038\text{ kg CO}_2/\text{passenger-km}$
  * Battery Electric Vehicle (EV): $0.045\text{ kg CO}_2/\text{passenger-km}$
  * Active (Bicycle/Walk): $0.000\text{ kg CO}_2/\text{passenger-km}$
* **Honest Delta Guarantee**: If a user already commutes via Metro or Walking/Biking, the claimed delta is **0.0 kg $\text{CO}_2$**.

### D. WHO Guideline Benchmarking Context
* The **WHO Global Air Quality Guidelines (2021)** define target levels as **24-hour averages** ($15\ \mu\text{g/m}^3$ for PM2.5; $45\ \mu\text{g/m}^3$ for PM10) and **annual averages** ($5\ \mu\text{g/m}^3$ for PM2.5).
* Model-reported hourly values are transient snapshots and are explicitly labeled as hourly predictions rather than full-day integrated averages.

---

## 🛠️ 3. Architecture & Technical Implementation

```
┌─────────────────────────────────────────────────────────────────┐
│                     Client UI (React 18 + TS)                   │
│  - AqiHeroCard (Speciation, Unit-Accurate CAMS Timeline)        │
│  - ProfileSelector (Runtime-Validated Household Demographics)   │
│  - RoutinePlanner (Accessible Single-Control Behavioral Engine) │
│  - ImpactTracker (Transparent Inhaled Mass & CO2 Deltas)        │
│  - IaqHacksGuide (Safety-Audited DIY Protocols & Cautions)       │
└────────────────────────────────┬────────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│   Offline Heuristic AI Engine   │     │    Google Gemini 3.8 Flash      │
│  - Deterministic Rule Engine    │ OR  │  - Context-Aware Reasoning      │
│  - Zero Setup / Zero Network    │     │  - Memory-Only Session API Key  │
│  - Strict Scientific Guardrails │     │  - Header Auth (x-goog-api-key) │
└─────────────────────────────────┘     └─────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Domain Services & Security                  │
│  - aqiApi.ts: Open-Meteo & Copernicus CAMS Client               │
│    • Full ISO timestamp alignment (never truncates 14:15)       │
│    • Coordinate-keyed 15-min in-memory cache & bypass           │
│    • Request sequence tracking & AbortController timeout        │
│    • CO µg/m³ to mg/m³ conversion; null-safe zero preservation  │
│  - impactCalculator.ts: EPA AP-42 & Exposure Factors math       │
│  - security.ts: Ephemeral in-memory key, sanitizePrompt, limit  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Security & Integrity Attributes:
1. **Memory-Only API Key Handling**: The Google Gemini API key resides solely in volatile JavaScript memory for the active tab session and is never written to browser `localStorage`. Memory-only handling avoids persistence; it does not make a browser-held key secret from the user or browser extensions. Use a personal key with restrictions and quotas.
2. **Client-Side Throttling Disclaimer**: The client-side sliding window limiter (15 requests/minute) provides UI throttling against double-submits. Authoritative throttling requires a backend proxy.
3. **Restricted Content Security Policy (CSP)**: Hardened with `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`, and `frame-ancestors 'none'` delivered via HTTP response headers.
4. **No Fabricated Telemetry**: Custom user cities with manual AQI inputs show other chemical species and hourly forecast curves as `Unavailable` (`null`), preventing fabricated readings.

---

## 🧪 4. Automated Testing & Verification Suite

AeroGuardian includes **49 automated unit and accessibility tests** run via `vitest` in a JSDOM environment:

| Test Suite | Tests | Scope & Assertions |
| :--- | :---: | :--- |
| `aqiApi.test.ts` | 12 | Full ISO timestamp matching, zero-preservation across all pollutants, coordinate-caching, timeout cancellation, CO unit conversion, weather fallback. |
| `impactCalculator.test.ts` | 8 | Minute ventilation exertion scaling, N95 penetration math, commute deltas, and no invented indoor exposure or heating savings. |
| `geminiService.test.ts` | 9 | Header authentication, generationConfig compliance, error fallbacks, heuristic safety, cancellation signal handling, and no pollutant-only stagnation claims. |
| `security.test.ts` | 7 | Memory-only key lifecycle, prompt sanitization (no HTML entity mangling in LLM prompts), key masking, rate limiter. |
| `cityData.test.ts` | 5 | Offline preset labeling, unknown stagnation status without meteorological evidence, custom city null-safety, AQI 0 preservation, runtime profile validation. |
| `accessibility.test.tsx` | 8 | axe-core audit, one adoption control per routine, selected navigation state, mobile nav landmarks, modal focus trap and Escape dismissal, Tab wrapping, retained input across parent re-render, aria-live chat region. |

**Total Test Coverage**: 49 tests; run `npm test`, `npm run test:a11y`, and `npm run build` before release.

---

## 🚀 5. Getting Started Locally

### Prerequisites
* **Node.js**: v22.22.2 (required by the current test toolchain; CI and `.node-version` use this version)
* **npm**: v9+ (tested on v10)

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/Xsayushn/hack2skillchalange6.git
cd hack2skillchalange6

# 2. Clean install of locked dependencies
npm ci

# 3. Run ESLint code quality inspection
npm run lint

# 4. Run Prettier format check
npm run format:check

# 5. Run full automated unit & accessibility test suite (42 tests)
npm test

# 6. Verify production TypeScript build
npm run build

# 7. Start preview server
npm run preview
```

---

## ☁️ 6. Render Deployment Configuration

AeroGuardian is configured for deployment on **Render Static Sites** via `render.yaml`:

```yaml
services:
  - type: web
    name: aeroguardian
    runtime: static
    buildCommand: npm ci && npm run build
    staticPublishPath: ./dist
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
      - path: /*
        name: Referrer-Policy
        value: strict-origin-when-cross-origin
      - path: /*
        name: Permissions-Policy
        value: geolocation=(self), camera=(), microphone=()
      - path: /*
        name: Content-Security-Policy
        value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com https://air-quality-api.open-meteo.com https://api.open-meteo.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

---

## 📚 7. Scientific References & Provider Attributions

1. **Atmospheric Forecast Data**: European Centre for Medium-Range Weather Forecasts (ECMWF) via the **Copernicus Atmosphere Monitoring Service (CAMS)** and **Open-Meteo Air Quality API**.
2. **Health Benchmarks**: World Health Organization: *WHO Global Air Quality Guidelines: Particulate matter (PM2.5 and PM10), ozone, nitrogen dioxide, sulfur dioxide and carbon monoxide* (2021).
3. **Physiological Ventilation**: United States Environmental Protection Agency: *Exposure Factors Handbook: 2011 Edition* (EPA/600/R-09/052F).
4. **Mobile Source Emissions**: US EPA: *AP-42 Compilation of Air Pollutant Emission Factors* & UK Department for Environment, Food & Rural Affairs (DEFRA) *Greenhouse Gas Conversion Factors*.
5. **Air Filtration Engineering**: UC Davis Department of Civil & Environmental Engineering & Corsi-Rosenthal Open-Source Air Cleaner Design.

---

*AeroGuardian — Developed for PromptWars Virtual — Hack2Skill 2026.*
