# 🌬️ AeroGuardian | GenAI Urban Air Quality Assistant
> **PromptWars Virtual — [Challenge 6] Urban Air Quality Assistant**  
> *Helping families, schools, and urban communities navigate severe winter smog, thermal inversions, and hazardous particulate pollution.*

---

## 📌 Executive Summary

During winter months, northern and inland urban basins (such as Delhi NCR, Lahore, Beijing, Milan, and Los Angeles) suffer from severe **meteorological thermal inversions** where cold, stagnant ground air is trapped by a warmer lid aloft. Conventional air quality apps provide static AQI numbers without explaining:
1. **Why smog spikes at dawn and dusk** (boundary layer contraction) and when safe ventilation windows occur.
2. **How to protect vulnerable family members** (infants breathing 50% more air per kg, asthma patients, pregnant women, and elderly citizens).
3. **Practical, low-cost indoor hacks** (such as DIY **Corsi-Rosenthal boxes** delivering >450 CFM CADR at 80% lower cost than commercial purifiers).
4. **Quantified direct impact** (kilograms of CO₂ prevented and micrograms of PM2.5 lung inhalation eliminated).

**AeroGuardian** is a GenAI-powered web application that delivers proactive, personalized, and scientifically grounded air quality recommendations backed by **live Open-Meteo / Copernicus sensor feeds**.

---

## 🎯 1. Chosen Vertical & Challenge Alignment

* **Vertical**: **Challenge 6 — Urban Air Quality Assistant**
* **Target Audience**: Urban families, apartment dwellers, schools, sensitive individuals (asthma, cardiovascular, infants, elderly), and daily commuters.
* **Core Philosophy**: Transform abstract air pollution metrics into **concrete daily routines**, **affordable indoor protection**, and **quantified personal impact**.

---

## 🧠 2. Approach and Logic

### A. Diurnal Thermal Inversion Intelligence
In winter smog episodes, ground cooling creates a steep nocturnal boundary inversion. Particulate concentrations (PM2.5 and PM10) routinely peak between 06:00–10:00 and 19:00–23:00. AeroGuardian models the **solar mixing window (13:30–15:30)** when convective heating temporarily lifts the lid, identifying the only safe period for rapid 10–15 minute indoor room cross-ventilation.

### B. Biological Persona & Vulnerability Modeling
Different household members face vastly different physiological risks from particulate exposure:
* **Infants & Children**: Underdeveloped alveoli, narrower airways, and higher minute ventilation per kilogram of body weight (WHO 2021).
* **Asthma & Bronchitis**: Bronchial hyper-reactivity triggered by PM2.5 and vehicular nitrogen dioxide ($NO_2$).
* **Elderly**: Systemic vascular inflammation and increased cardiovascular risk.
* **General & Commuters**: Cumulative occupational exposure.

### C. Mathematical Dose & Emission Calculations
AeroGuardian uses empirical formulas based on EPA, WHO guidelines, and transportation emission factors:
* **Inhaled PM2.5 Dose Formula**:
  $$\text{Dose } (\mu\text{g}) = C_{\text{PM2.5}} \times V_{\text{ventilation}} \times t \times (1 - \eta_{\text{mask}})$$
  * $V_{\text{ventilation}}$: $0.6\text{ m}^3/\text{hr}$ (rest/light) to $2.1\text{ m}^3/\text{hr}$ (aerobic exertion) based on EPA Child & Adult Exposure Handbooks.
  * $\eta_{\text{mask}}$: $0.95$ for fitted N95 respirator; $0.0$ for unmasked.
* **Transportation $CO_2$ Prevention Factor**:
  * Private Petrol/Diesel Solo: $0.192\text{ kg } CO_2/\text{km}$ (EPA Passenger Car Factor).
  * Electric Mass Transit (Metro): $0.038\text{ kg } CO_2/\text{km}$.
  * Carpool / Shared: $0.075\text{ kg } CO_2/\text{km}$.

---

## 🛠️ 3. How the Solution Works (System Architecture)

```
┌───────────────────────────────────────────────────────────────┐
│                    User Interface Layer                       │
│  React 18 + TypeScript + Tailwind CSS (WCAG 2.1 AA Compliant) │
│  - Live Open-Meteo & GPS Station Card with Inversion Timeline │
│  - Family Persona Customizer & Commute Distance Slider        │
│  - Low-Emission Daily Routine Planner (Before/After)          │
│  - Interactive IAQ Hacks Guide (Corsi-Rosenthal Box Wizard)   │
│  - High-Impact Ecological & Personal Savings Tracker          │
└───────────────────────────────┬───────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│   Offline Heuristic AI Engine │       │    Google Gemini 2.0 Flash    │
│  (Instant, Rule-Based, Zero   │  OR   │ (Live Contextual Reasoning    │
│    Configuration, No Leak)    │       │  via Secure Header Auth)      │
└───────────────────────────────┘       └───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                    Domain Services & Math                     │
│  - aqiApi.ts (Real-time Open-Meteo & Copernicus CAMS Client)  │
│  - impactCalculator.ts (Dose Response, Inhalation Avoided)    │
│  - security.ts (Header Key Auth, Safe Prompts, Rate Limiter)  │
│  - cityDefaults.ts (Multi-city winter pollution profiles)     │
└───────────────────────────────────────────────────────────────┘
```

### Key Modules:
1. **Live AQI Hero & Diurnal Timeline (`AqiHeroCard.tsx` & `aqiApi.ts`)**:
   Connects to **Open-Meteo & Copernicus Atmosphere Monitoring Service (CAMS)** for real-time live sensor updates, with GPS geolocation detection and automatic offline preset fallback.
2. **Indoor Air Quality (IAQ) Hacks Guide (`IaqHacksGuide.tsx`)**:
   Step-by-step DIY instructions for building the **Corsi-Rosenthal box** (4 MERV-13 filters + 20-inch box fan + cardboard shroud), draft sealing, wet microfiber dusting, and kitchen range hood protocols.
3. **Daily Routine Optimizer (`RoutinePlanner.tsx`)**:
   Compares conventional habits against clean air alternatives with real-time checkboxes.
4. **Impact Tracker (`ImpactTracker.tsx`)**:
   Displays community rank percentile (model estimate), tree-absorption equivalents, clean air hours gained, and total $PM_{2.5}$ saved.
5. **Dual-Mode GenAI Assistant (`AiAssistantChat.tsx` & `geminiService.ts`)**:
   * **Mode 1 (Default)**: Offline Heuristic Reasoning Engine with immediate responses and contextual suggested exploration pills.
   * **Mode 2 (Live Gemini 2.0 Flash)**: Supports Google Gemini 2.0 Flash with multi-turn conversation memory, transmitted securely via HTTP headers (`x-goog-api-key`) with client-side rate limiting.

---

## 📐 4. Assumptions Made & Scientific Citations

1. **Ambient Air Quality Data**: Live readings fetched via Open-Meteo European CAMS API. Presets represent verified winter smog peaks in respective basins.
2. **Adult & Child Breathing Volumes**: Average minute ventilation assumed at $10\text{–}12\text{ L/min}$ ($0.6\text{ m}^3/\text{hr}$) for adults at rest, $35\text{ L/min}$ ($2.1\text{ m}^3/\text{hr}$) under aerobic exercise, with children adjusted per EPA Child-Specific Exposure Factors.
3. **Corsi-Rosenthal Box Performance**: Assumes 4 MERV-13 filters delivering approximately $450\text{–}550\text{ CFM}$ clean air delivery rate (CADR) in a standard $300\text{–}500\text{ sq ft}$ room (UC Davis Department of Civil & Environmental Engineering).
4. **Mask Filtration**: Assumes a properly sealed N95 / KF94 respirator achieving $\ge 95\%$ particle filtration.
5. **Scientific References**:
   - World Health Organization: *WHO Global Air Quality Guidelines* (2021).
   - United States Environmental Protection Agency: *AP-42 Compilation of Air Pollutant Emission Factors*.
   - European Centre for Medium-Range Weather Forecasts (ECMWF): *Copernicus Atmosphere Monitoring Service*.

---

## 🏆 5. Evaluation Criteria Alignment

### 🟢 High Impact: Code Quality & Problem Alignment
* **Strict TypeScript**: 100% type safety, zero `any` shortcuts, fully typed domain models.
* **Component Architecture**: Decoupled, reusable components with clear separation of concerns.
* **Problem Relevance**: Directly targets winter smog, thermal inversions, vulnerable populations, low-cost DIY filters, and low-emission routines.

### 🔵 Medium Impact: Security & Resource Efficiency
* **Zero Secret Leakage**: API keys reside strictly in client-side `localStorage` and are sent via HTTPS `x-goog-api-key` header (never exposed in URL query parameters).
* **Rate Limiting**: Integrated `chatRateLimiter` enforces a 15 req/min window.
* **Ultra-Lean Footprint**:
  * Total Production Bundle Size: **~270 kB** (CSS: 32 kB, JS: 238 kB).
  * Total Git Repository Size: **< 1.0 MB** (strictly satisfying the `< 10 MB` challenge rule).
  * Single branch: **`main`**.

### ⚪ Low Impact: Testing & Accessibility
* **Testing Suite**: **22 automated unit tests** powered by `vitest` covering mathematical dosage calculations, live Open-Meteo API parsing, XSS sanitization, rate limiting, and Gemini header authentication.
* **Accessibility (WCAG 2.1 AA)**:
  * High-Contrast Mode toggle for visually impaired users.
  * Semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`).
  * Full ARIA labeling (`aria-expanded`, `aria-pressed`, `aria-label`, `aria-live="polite"`, `role="dialog"`).
  * Modal focus management with Escape key listeners.

---

## 🚀 6. Getting Started Locally

### Prerequisites
* **Node.js**: v18+ (tested on v22.23.1)
* **npm**: v9+ (tested on v10.9.8)

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/Xsayushn/hack2skillchalange6.git
cd hack2skillchalange6

# 2. Install dependencies
npm install

# 3. Run development server
npm run dev

# 4. Run test suite
npm test

# 5. Build production bundle
npm run build
```

---

## 📜 7. Repository Compliance Checklist

- [x] **Repository is Public**: Accessible on GitHub.
- [x] **Size Limit**: Entire source code is **under 1 MB** (well below the 10 MB limit).
- [x] **Single Branch**: All commits are on the **`main`** branch only.
- [x] **Chosen Vertical**: Clearly identified as Challenge 6 (Urban Air Quality Assistant).
- [x] **Clean `.gitignore`**: Excludes `node_modules`, build outputs (`dist/`), environment variables, and raw screenshots.

---

*Developed for PromptWars Virtual — Hack2Skill 2026.*
