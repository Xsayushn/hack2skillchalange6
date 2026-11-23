# 🌬️ AeroGuardian | GenAI Urban Air Quality Assistant
> **PromptWars Virtual — [Challenge 6] Urban Air Quality Assistant**  
> *Helping families, schools, and urban communities navigate severe winter smog, thermal inversions, and hazardous particulate pollution.*

---

## 📌 Executive Summary

During winter months, northern and inland urban basins (such as Delhi NCR, Lahore, Beijing, Milan, and Central Valley) suffer from severe **meteorological thermal inversions** where cold, stagnant ground air is trapped by a warmer lid aloft. Conventional air quality apps provide static AQI numbers without explaining:
1. **Why smog spikes at dawn and dusk** (boundary layer contraction) and when safe ventilation windows occur.
2. **How to protect vulnerable family members** (infants breathing 50% more air per kg, asthma patients, pregnant women, and elderly citizens).
3. **Practical, low-cost indoor hacks** (such as DIY **Corsi-Rosenthal boxes** delivering >450 CFM CADR at 80% lower cost than commercial purifiers).
4. **Quantified direct impact** (kilograms of CO₂ prevented and micrograms of PM2.5 lung inhalation eliminated).

**AeroGuardian** is a GenAI-powered web application that delivers proactive, personalized, and scientifically grounded air quality recommendations.

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
* **Infants & Children**: Underdeveloped alveoli, narrower airways, and higher minute ventilation per kilogram of body weight.
* **Asthma & Bronchitis**: Bronchial hyper-reactivity triggered by PM2.5 and vehicular nitrogen dioxide ($NO_2$).
* **Elderly**: Systemic vascular inflammation and increased cardiovascular risk.
* **General & Commuters**: Cumulative occupational exposure.

### C. Mathematical Dose & Emission Calculations
AeroGuardian uses empirical formulas based on EPA, WHO guidelines, and transportation emission factors:
* **Inhaled PM2.5 Dose Formula**:
  $$\text{Dose } (\mu\text{g}) = C_{\text{PM2.5}} \times V_{\text{ventilation}} \times t \times (1 - \eta_{\text{mask}})$$
  * $V_{\text{ventilation}}$: $0.6\text{ m}^3/\text{hr}$ (rest/light) to $2.1\text{ m}^3/\text{hr}$ (aerobic exertion).
  * $\eta_{\text{mask}}$: $0.95$ for fitted N95 respirator; $0.0$ for unmasked.
* **Transportation $CO_2$ Prevention Factor**:
  * Private Petrol/Diesel Solo: $0.192\text{ kg } CO_2/\text{km}$.
  * Electric Mass Transit (Metro): $0.038\text{ kg } CO_2/\text{km}$.
  * Carpool / Shared: $0.075\text{ kg } CO_2/\text{km}$.

---

## 🛠️ 3. How the Solution Works (System Architecture)

```
┌───────────────────────────────────────────────────────────────┐
│                    User Interface Layer                       │
│  React 18 + TypeScript + Tailwind CSS (WCAG 2.1 AA Compliant) │
│  - Live AQI Station Card with Diurnal Inversion Bar           │
│  - Family Persona Customizer & Commute Distance Slider        │
│  - Low-Emission Daily Routine Planner (Before/After)          │
│  - Interactive IAQ Hacks Guide (Corsi-Rosenthal Box Wizard)   │
│  - High-Impact Ecological & Personal Savings Tracker          │
└───────────────────────────────┬───────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐       ┌───────────────────────────────┐
│   Offline Heuristic AI Engine │       │    Google Gemini 1.5 Flash    │
│  (Instant, Rule-Based, Zero   │  OR   │ (Live Contextual Conversational│
│    Configuration, No Leak)    │       │  Reasoning via User API Key)  │
└───────────────────────────────┘       └───────────────────────────────┘
                                │
                                ▼
┌───────────────────────────────────────────────────────────────┐
│                    Domain Services & Math                     │
│  - impactCalculator.ts (Dose Response, Inhalation Avoided)    │
│  - security.ts (XSS HTML Sanitization, Key Masking, Limiter)  │
│  - cityDefaults.ts (Multi-city winter pollution profiles)     │
└───────────────────────────────────────────────────────────────┘
```

### Key Modules:
1. **Live AQI Hero & Diurnal Timeline (`AqiHeroCard.tsx`)**:
   Provides real-time multi-pollutant breakdown ($PM_{2.5}, PM_{10}, NO_2, O_3, CO, SO_2$) and highlights the active thermal inversion layer.
2. **Indoor Air Quality (IAQ) Hacks Guide (`IaqHacksGuide.tsx`)**:
   Step-by-step DIY instructions for building the **Corsi-Rosenthal box** (4 MERV-13 filters + 20-inch box fan + cardboard shroud), draft sealing, wet microfiber dusting, and kitchen range hood protocols.
3. **Daily Routine Optimizer (`RoutinePlanner.tsx`)**:
   Compares conventional habits against clean air alternatives with real-time checkboxes.
4. **Impact Tracker (`ImpactTracker.tsx`)**:
   Displays community rank percentile, tree-absorption equivalents, clean air hours gained, and total $PM_{2.5}$ saved.
5. **Dual-Mode GenAI Assistant (`AiAssistantChat.tsx`)**:
   * **Mode 1 (Default)**: Offline Heuristic Reasoning Engine with immediate responses and contextual suggested pills.
   * **Mode 2 (Optional)**: Direct Google Gemini 1.5 Flash integration with custom system prompts injecting family context, location, and inversion layer metrics.

---

## 📐 4. Assumptions Made

1. **Ambient Air Quality Data**: Default presets model verified high-smog urban basins (Delhi NCR, Lahore, Beijing, Milan, Los Angeles) under representative winter smog peaks.
2. **Adult & Child Breathing Volumes**: Average minute ventilation assumed at $10\text{–}12\text{ L/min}$ ($0.6\text{ m}^3/\text{hr}$) for adults at rest, $35\text{ L/min}$ ($2.1\text{ m}^3/\text{hr}$) under aerobic exercise, with children adjusted according to EPA Child-Specific Exposure Factors.
3. **Corsi-Rosenthal Box Performance**: Assumes 4 MERV-13 filters delivering approximately $450\text{–}550\text{ CFM}$ clean air delivery rate (CADR) in a standard $300\text{–}500\text{ sq ft}$ room.
4. **Mask Filtration**: Assumes a properly sealed N95 / KF94 respirator achieving $\ge 95\%$ particle filtration.

---

## 🏆 5. Evaluation Criteria Alignment

### 🟢 High Impact: Code Quality & Problem Alignment
* **Strict TypeScript**: 100% type safety, zero `any` shortcuts, modular domain models.
* **Component Architecture**: Atomic, decoupled components with single responsibilities.
* **Problem Relevance**: Directly targets winter smog, thermal inversions, vulnerable populations, low-cost DIY filters, and low-emission routines.

### 🔵 Medium Impact: Security & Resource Efficiency
* **Zero Secret Leakage**: API keys are stored strictly in client-side `localStorage`. No keys are tracked or hardcoded in git.
* **Input Sanitization**: All user chat inputs pass through `sanitizeInput()` against XSS injections.
* **Rate Limiting**: Includes a sliding-window `SimpleRateLimiter`.
* **Ultra-Lean Footprint**:
  * Total Production Bundle Size: **~258 kB** (CSS: 31 kB, JS: 225 kB).
  * Total Git Repository Size: **< 1.0 MB** (strictly satisfying the `< 10 MB` challenge rule).
  * Single branch: **`main`**.

### ⚪ Low Impact: Testing & Accessibility
* **Testing Suite**: 14 automated unit tests powered by `vitest` covering mathematical dosage calculations, XSS sanitization, API key validation, and heuristic AI outputs.
* **Accessibility (WCAG 2.1 AA)**:
  * Includes a dedicated **High-Contrast Mode** toggle for visually impaired users.
  * Semantic HTML5 elements (`<header>`, `<main>`, `<section>`, `<nav>`, `<footer>`).
  * Full ARIA labeling (`aria-expanded`, `aria-pressed`, `aria-label`, `role="dialog"`).
  * High-contrast color tags with both text badges and color coding for colorblind accessibility.

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
