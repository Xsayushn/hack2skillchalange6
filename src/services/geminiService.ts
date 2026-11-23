import { AssistantContext, ChatMessage } from '../types/assistant';
import { sanitizePrompt, chatRateLimiter } from './security';

// Current active models (Google Cloud Generative Language API)
const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Builds a prompt with environmental science context, family vulnerability profile, and winter smog conditions.
 */
export function buildSystemPrompt(context: AssistantContext): string {
  return `You are AeroGuardian, an empathetic environmental health scientist and urban air quality AI assistant.
Your goal is to guide families, schools, and communities living under severe winter smog, thermal inversions, and high particulate pollution.

CURRENT USER CONTEXT:
- Location: ${context.cityName}
- Air Quality Index (AQI): ${context.currentAqi} (${context.aqiCategory})
- Fine Particulate (PM2.5): ${context.pm25} µg/m³
- Thermal Inversion Layer: ${context.inversionLayerActive ? 'ACTIVE (Pollutants trapped near ground level)' : 'Inactive / Normal Dispersion'}
- Family Vulnerabilities: ${context.vulnerabilities.length > 0 ? context.vulnerabilities.join(', ') : 'General population'}
- Commute Mode: ${context.commuteMode}
- Has Indoor Air Purifier: ${context.hasPurifier ? 'Yes' : 'No (Needs DIY/Low-cost advice)'}

GUIDELINES:
1. Provide actionable, practical, empathetic advice focused on low-emission daily routines and indoor air quality hacks.
2. Emphasize diurnal inversion patterns: explain why morning (6-10 AM) and evening (7-11 PM) are highest risk, and why the afternoon (1-3:30 PM) is the best window for any necessary ventilation.
3. If family has infants, pregnant women, elderly, or asthma patients, prioritize lung barrier protection (N95 mask fit, avoiding deep breathing, bedroom isolation).
4. Suggest low-cost hacks like DIY Corsi-Rosenthal boxes, wet wiping vs dry sweeping, draft sealing, and range hood venting.
5. Quantify the impact: explicitly mention how much exposure is avoided or emissions saved based on WHO and EPA benchmarks.
6. Keep answers structured, encouraging, concise, and easy to read with bullet points.`;
}

/**
 * Heuristic fallback AI engine.
 * Generates dynamic, context-aware responses when no external API key is provided, when rate-limited, or when offline.
 */
export function generateHeuristicResponse(userPrompt: string, context: AssistantContext, customNotice?: string): ChatMessage {
  const query = userPrompt.toLowerCase();
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Inversion layer / Smog forecast query
  if (query.includes('inversion') || query.includes('smog') || query.includes('weather') || query.includes('fog') || query.includes('window') || query.includes('ventilate')) {
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `### 🌫️ Winter Inversion & Smog Dynamics in ${context.cityName}

Currently, your location has an **AQI of ${context.currentAqi} (${context.aqiCategory})** with PM2.5 levels at **${context.pm25} µg/m³**.

**Thermal Inversion Impact:**
Cold winter air is currently denser than the warmer atmospheric layer above, effectively acting like a lid that traps vehicular exhaust, road dust, and smoke right at breathing height.

**Recommended Action Protocol:**
* **Strict Lockdown Window:** Keep all windows sealed between **6:00 PM and 11:00 AM**, when the inversion layer is lowest and thickest.
* **Optimal Diurnal Ventilation Window:** If indoor CO2 is high, the best window for a brief 10-15 minute cross-ventilation burst is **1:30 PM to 3:30 PM**, when solar radiation lifts the boundary layer by 30-40%.
* **Draft Proofing:** Apply foam weatherstripping or rolled towels at the base of exterior doors to prevent smoke infiltration.`,
      suggestedActions: [
        'How to build a DIY Corsi-Rosenthal box?',
        'What commute alternatives save the most emissions?',
        'How to protect asthma & elderly family members?'
      ],
      impactHighlight: {
        label: customNotice ? 'Engine Status' : 'Exposure Reduction',
        value: customNotice || 'Reduces indoor PM2.5 infiltration by up to 60%',
        type: customNotice ? 'warning' : 'positive'
      }
    };
  }

  // 2. DIY Filter / Purifier / IAQ hacks
  if (query.includes('filter') || query.includes('purifier') || query.includes('hepa') || query.includes('hack') || query.includes('corsi') || query.includes('diy') || query.includes('cost')) {
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `### 🛠️ Low-Cost Indoor Air Quality Hacks

You don't need a $400 commercial HEPA unit to achieve clean indoor air. Here is the scientifically validated **Corsi-Rosenthal Box** technique:

1. **The 4-Filter Cube:** Tape 4 standard MERV 13 furnace filters into a square cube (arrows pointing inward).
2. **The Power Unit:** Mount an ordinary 20-inch box fan blowing upward on top of the cube, sealing edges with duct tape.
3. **Cardboard Shroud:** Cut a 15-inch circular cardboard cutout over the fan face. This eliminates corner vortex backdraft and increases CADR by 30%!
4. **Mopping Protocol:** Never dry-sweep during smog days. Use damp microfiber cloths to capture settled particulates through van der Waals attraction.

*Estimated Clean Air Delivery Rate (CADR):* **450–550 CFM**, matching commercial hospital-grade purifiers at 80% lower cost (UC Davis / EPA test data).`,
      suggestedActions: [
        'Show complete Corsi-Rosenthal build steps',
        'Tips for kitchen range hood and cooking',
        'Check child & infant smog safety'
      ],
      impactHighlight: {
        label: customNotice ? 'Engine Status' : 'Cost & Airflow Efficiency',
        value: customNotice || '450+ CFM CADR at under $50 total cost',
        type: customNotice ? 'warning' : 'positive'
      }
    };
  }

  // 3. Vulnerability: Children / Infants / Elderly / Asthma
  if (query.includes('child') || query.includes('baby') || query.includes('infant') || query.includes('elderly') || query.includes('asthma') || query.includes('pregnant')) {
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `### 👶 Senior & Child Respiratory Defense Strategy

Given your profile alerts for **${context.vulnerabilities.join(', ') || 'Sensitive family members'}**:

* **Why children are at triple the risk:** Children breathe 50% more air per pound of body weight and their narrower airways are easily irritated by PM2.5 and nitrogen dioxide (NO2) (WHO 2021).
* **Create a "Clean Air Sanctuary" Bedroom:** Place your highest-capacity purifier or DIY filter in the sleeping room. Run it continuously with doors and windows locked.
* **School & Transit Rule:** Shift outdoor sports activities to afternoons or indoor gymnasiums. Fit a genuine child-size N95/KF94 mask (cloth masks offer less than 15% PM2.5 filtration).
* **Nebulizer & Medication Readiness:** Keep rescue inhalers at hand, and rinse eyes and face with saline water after arriving home from school or outdoors.`,
      suggestedActions: [
        'How can our family travel without breathing smog?',
        'Best plants for bedroom oxygenation?',
        'Calculate my family’s daily pollution avoided'
      ],
      impactHighlight: {
        label: customNotice ? 'Engine Status' : 'Vulnerable Group Protection',
        value: customNotice || 'Prevents 80%+ of deep alveolar soot penetration',
        type: customNotice ? 'warning' : 'warning'
      }
    };
  }

  // 4. Commute & Routine optimization
  if (query.includes('commute') || query.includes('travel') || query.includes('car') || query.includes('metro') || query.includes('routine') || query.includes('walk') || query.includes('exercise')) {
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `### 🚲 Low-Emission Daily Routine & Travel Guide

With your current commute (${context.commuteMode}) in **${context.cityName}**:

* **Morning Travel:** Solo driving during bumper-to-bumper morning rush hour generates high localized exhaust and traps you inside a smog cabin.
* **Mass Transit / Metro Alternative:** Switching to electric metro rail or shared carpooling saves approximately **2.4 kg of CO2** (EPA passenger vehicle factor) and **150 µg of PM2.5 inhalation** per trip.
* **Cabin Air Setting:** When driving is unavoidable, set vehicle ventilation to **Internal Recirculation (Max A/C)** with an activated carbon cabin filter.
* **Morning Exercise Shift:** Cease 6:00 AM outdoor jogging. Transition to indoor yoga, pilates, or stationary cycling where purified indoor air protects lung capacity.`,
      suggestedActions: [
        'Adopt this commute routine in my tracker',
        'What about evening outdoor dining or walks?',
        'How does temperature inversion trap car exhaust?'
      ],
      impactHighlight: {
        label: customNotice ? 'Engine Status' : 'Daily Footprint Saving',
        value: customNotice || 'Saves 2.4 kg CO2 & 150 µg PM2.5 per commute',
        type: customNotice ? 'warning' : 'positive'
      }
    };
  }

  // Default contextual assistant response
  return {
    id,
    role: 'assistant',
    timestamp,
    content: `### 🛡️ AeroGuardian Smog Advisory for ${context.cityName}

Hello! I have analyzed the current air quality in **${context.cityName}** (AQI: **${context.currentAqi} - ${context.aqiCategory}**, PM2.5: **${context.pm25} µg/m³**).

**Key Priorities for Your Family Today:**
1. **Smog Peak Alert:** Atmospheric thermal inversion is currently ${context.inversionLayerActive ? 'active' : 'moderate'}. Avoid outdoor exertion during early morning and late evening.
2. **Indoor Air Management:** Seal drafts around windows, run indoor filtration continuously, and defer room airing until the warm afternoon sun (1:30 PM - 3:30 PM).
3. **Routine Optimization:** Adopt public transit or carpooling to reduce tailpipe emissions, and wear a well-fitted N95 respirator if stepping outdoors.
4. **Cooking Precautions:** Use kitchen exhaust hoods and keep interior doors closed to prevent cooking aerosols from migrating to bedrooms.

What specific area would you like help tailoring for your household?`,
    suggestedActions: [
      'How to build a low-cost DIY air purifier?',
      'Optimize my commute to reduce emissions',
      'What are the safe ventilation hours today?',
      'Protecting children and seniors from smog'
    ],
    impactHighlight: {
      label: customNotice ? 'Engine Status' : 'Immediate Benefit',
      value: customNotice || 'Applying these tips can lower indoor PM2.5 by 50-70%',
      type: customNotice ? 'warning' : 'info'
    }
  };
}

/**
 * Main service to send queries to Gemini API with conversational history,
 * secure header key transmission, rate limiting, and robust heuristic fallback.
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  userPrompt: string,
  context: AssistantContext,
  apiKey?: string
): Promise<ChatMessage> {
  const sanitizedPrompt = sanitizePrompt(userPrompt);
  const cleanKey = apiKey ? apiKey.trim() : '';

  // 1. Check client-side rate limiter
  if (!chatRateLimiter.canProceed()) {
    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      role: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `⏳ **Rate Limit Notice**: You have sent several requests in quick succession. To ensure stability and avoid API quota exhaustion, please wait a few seconds before asking your next question.`,
      impactHighlight: {
        label: 'Rate Limiter',
        value: 'Request throttled for safety (15 req/min limit)',
        type: 'warning'
      }
    };
  }

  // 2. If no Gemini key is provided, use offline heuristic engine
  if (!cleanKey) {
    return generateHeuristicResponse(sanitizedPrompt, context);
  }

  try {
    const systemInstruction = buildSystemPrompt(context);

    // Build multi-turn conversational history
    const historyContents = (messages || [])
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-6) // Keep last 6 messages to preserve context window
      .map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      }));

    // Add current user prompt
    const contents = [
      ...historyContents,
      {
        role: 'user',
        parts: [{ text: sanitizedPrompt }]
      }
    ];

    // Transmit API key safely via the 'x-goog-api-key' HTTP header (NOT in the query URL!)
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': cleanKey
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMsg = errorData?.error?.message || `HTTP ${response.status}`;
      console.warn(`Gemini API call failed (${errorMsg}). Switching to verified heuristic engine.`);
      
      return generateHeuristicResponse(
        sanitizedPrompt,
        context,
        `Live Gemini API call failed (${errorMsg}). Operating via offline heuristic engine.`
      );
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      return generateHeuristicResponse(sanitizedPrompt, context);
    }

    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      role: 'assistant',
      content: candidateText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'How does thermal inversion affect my city?',
        'Show DIY Corsi-Rosenthal guide',
        'Recalculate my family’s health exposure'
      ],
      impactHighlight: {
        label: 'Live AI Active',
        value: 'Powered by Google Gemini 2.0 Flash via secure header auth',
        type: 'info'
      }
    };
  } catch (err: any) {
    console.error('Failed to communicate with Gemini API, falling back to heuristic engine:', err);
    return generateHeuristicResponse(
      sanitizedPrompt,
      context,
      `Network/API error (${err?.message || 'Offline'}). Operating via offline heuristic engine.`
    );
  }
}
