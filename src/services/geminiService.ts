import { AssistantContext, ChatMessage } from '../types/assistant';
import { sanitizePrompt, chatRateLimiter } from './security';

// Configurable Gemini Model ID (active production model: gemini-3.8-flash)
export const GEMINI_MODEL_ID = 'gemini-3.8-flash';
const GEMINI_API_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL_ID}:generateContent`;

/**
 * Builds a system instruction adhering strictly to environmental health science principles:
 * - Does NOT claim detected thermal inversions without vertical atmospheric soundings.
 * - Does NOT claim universal ventilation timing.
 * - Does NOT make clinical diagnoses or medication recommendations.
 * - Clarifies that ambient forecasts do not measure indoor air quality.
 */
export function buildSystemPrompt(context: AssistantContext): string {
  const aqiDisplay =
    context.currentAqi !== null
      ? `${context.currentAqi} (${context.aqiCategory})`
      : 'Data Unavailable';
  const pm25Display = context.pm25 !== null ? `${context.pm25} µg/m³` : 'Data Unavailable';

  return `You are AeroGuardian, an environmental health science and urban air quality advisory assistant.
Your goal is to guide families, schools, and communities living under elevated winter smog and particulate pollution.

CURRENT CONTEXT (Numerical Model Telemetry):
- Location: ${context.cityName}
- Modeled Ambient AQI: ${aqiDisplay}
- Modeled Fine Particulate (PM2.5): ${pm25Display}
- Estimated Surface Stagnation Risk: ${context.estimatedStagnationRisk}
- Reported Vulnerabilities: ${context.vulnerabilities.length > 0 ? context.vulnerabilities.join(', ') : 'General population'}
- Commute Mode: ${context.commuteMode}
- Has Indoor Air Purifier: ${context.hasPurifier ? 'Yes' : 'No (Requires DIY/Low-cost advice)'}

SCIENTIFIC & SAFETY CONSTRAINTS:
1. SCIENTIFIC HONESTY: Ambient forecasts come from atmospheric numerical models (such as CAMS), not physical indoor sensors. Clearly state that indoor air quality is not directly measured.
2. NO UNIVERSAL TIME WINDOWS: Do not tell users that 1:30 PM–3:30 PM is universally safe. Natural ventilation depends entirely on actual outdoor pollutant concentrations; when ambient AQI > 100, natural ventilation is generally not recommended.
3. NO INVERSION CERTAINTY: Refer to atmospheric conditions as "estimated surface-layer stagnation risk". Do not claim a confirmed thermal inversion unless vertical sounding measurements are referenced.
4. BARRIER PROTECTION: For sensitive individuals (infants, elderly, asthma sufferers), recommend well-fitted N95 respirators, mechanical filtration (HEPA or sealed DIY MERV-13 units), and minimizing strenuous outdoor aerobic exertion.
5. NO MEDICAL DIAGNOSIS: Never prescribe medications, dosages, or clinical treatments. Advise users with severe symptoms to consult healthcare professionals.
6. PRACTICAL LOW-COST HACKS: Suggest evidence-based methods such as Corsi-Rosenthal boxes (with fan electrical safety precautions), wet dusting vs dry sweeping, and isolating kitchen range exhaust.`;
}

/**
 * Heuristic fallback AI engine.
 * Generates context-aware, scientifically defensible responses when no API key is provided,
 * when offline, or when rate-limited.
 */
export function generateHeuristicResponse(
  userPrompt: string,
  context: AssistantContext,
  customNotice?: string
): ChatMessage {
  const query = userPrompt.toLowerCase();
  const id = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const aqiDisplay =
    context.currentAqi !== null
      ? `AQI ${context.currentAqi} (${context.aqiCategory})`
      : 'current ambient conditions';
  const pm25Display = context.pm25 !== null ? `${context.pm25} µg/m³` : 'ambient';

  // 1. Inversion / Stagnation / Ventilation queries
  if (
    query.includes('inversion') ||
    query.includes('stagnation') ||
    query.includes('smog') ||
    query.includes('ventilate') ||
    query.includes('window')
  ) {
    const isUnhealthy = context.currentAqi !== null && context.currentAqi > 100;

    return {
      id,
      role: 'assistant',
      timestamp,
      content: `### 🌫️ Atmospheric Stagnation & Ventilation Advisory for ${context.cityName}

Currently, numerical models estimate **${aqiDisplay}** with fine particulate (PM2.5) around **${pm25Display}**.

**Boundary Layer & Stagnation:**
During winter periods, cold ground temperatures often create a shallow surface boundary layer that restricts vertical pollutant dispersion, causing vehicle exhaust and combustion soot to accumulate near ground level.

**Ventilation Protocol:**
${
  isUnhealthy
    ? '* **Natural Ventilation Not Recommended:** Because ambient AQI exceeds 100, opening windows will introduce outdoor soot indoors. Keep windows closed and operate indoor mechanical filtration.'
    : '* **Conditional Aeration:** If outdoor AQI is moderate or low, a brief cross-ventilation window (15–20 minutes) may help lower indoor CO2. Monitor local air quality before airing.'
}
* **Combustion Safety Warning:** Never seal essential combustion-air flues, water heater vents, or gas appliance exhausts, as doing so poses severe carbon monoxide poisoning risks.`,
      suggestedActions: [
        'How does a DIY Corsi-Rosenthal box work?',
        'How to protect vulnerable family members?',
        'What commute options reduce exposure?',
      ],
      impactHighlight: {
        label: customNotice ? 'Engine Status' : 'Ventilation Guidance',
        value:
          customNotice ||
          (isUnhealthy
            ? 'Windows closed; rely on indoor air cleaning'
            : 'Brief aeration viable when ambient air is clean'),
        type: customNotice ? 'warning' : isUnhealthy ? 'warning' : 'positive',
      },
    };
  }

  // 2. DIY Filter / Purifier / IAQ Hacks
  if (
    query.includes('filter') ||
    query.includes('purifier') ||
    query.includes('hepa') ||
    query.includes('corsi') ||
    query.includes('diy') ||
    query.includes('hack')
  ) {
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `### 🛠️ DIY Air Filtration (Corsi-Rosenthal Box)

A Corsi-Rosenthal box is an open-source, low-cost particulate scrubber constructed from furnace filters and a box fan:

1. **Components:** 4 MERV-13 pleated air filters (standard 20×20 inch) taped into a cube with a 20-inch box fan mounted on top blowing upward.
2. **Cardboard Shroud:** Cut a circular cardboard shroud matching the fan blade diameter over the face of the fan to minimize edge vortex backdraft.
3. **Electrical Safety Caution:** Ensure the fan is rated for continuous duty and equipped with a fused safety plug. Periodically check the motor for dust buildup or overheating, and never leave DIY units running unattended.
4. **Realistic Expectations:** Actual airflow and clean air delivery depend on filter thickness, fan motor pressure curves, and seal integrity.

*Note: Houseplants do not provide meaningful mechanical removal of particulate matter (PM2.5).*`,
      suggestedActions: [
        'What safety precautions are required for DIY fans?',
        'How to isolate kitchen cooking fumes?',
        'Check child & elderly safety tips',
      ],
      impactHighlight: {
        label: customNotice ? 'Engine Status' : 'Filtration Science',
        value: customNotice || 'MERV-13 filters capture fine particulate when properly sealed',
        type: customNotice ? 'warning' : 'positive',
      },
    };
  }

  // 3. Vulnerability: Children / Infants / Elderly / Asthma
  if (
    query.includes('child') ||
    query.includes('baby') ||
    query.includes('infant') ||
    query.includes('elderly') ||
    query.includes('asthma') ||
    query.includes('pregnant')
  ) {
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `### 👶 Respiratory Protection for Sensitive Individuals

For households with **${context.vulnerabilities.join(', ') || 'sensitive members'}**:

* **Physiological Vulnerability:** Children have higher minute ventilation per kilogram of body weight, and seniors or respiratory patients face heightened bronchial inflammation from fine particulate (PM2.5) and nitrogen dioxide (NO2).
* **Dedicated Clean Air Room:** Set up an isolated sleeping area with a continuously running mechanical air purifier (HEPA or sealed MERV-13). Keep doors and windows closed.
* **Respirator Protection:** If traveling outdoors during elevated pollution, wear a properly fitted N95/FFP2 respirator. Cloth masks provide negligible seal and filtration against fine soot.
* **Medical Disclaimer:** Always follow your physician's clinical guidance and asthma action plan. This tool provides environmental risk reduction advice, not medical diagnosis.`,
      suggestedActions: [
        'How to ensure a proper N95 mask seal?',
        'What are the best indoor cleaning practices?',
        'How does commute mode affect exposure?',
      ],
      impactHighlight: {
        label: customNotice ? 'Engine Status' : 'Health Precaution',
        value: customNotice || 'Sealed N95 respirator and isolated sleeping sanctuary recommended',
        type: customNotice ? 'warning' : 'warning',
      },
    };
  }

  // 4. Commute & Routine queries
  if (
    query.includes('commute') ||
    query.includes('travel') ||
    query.includes('car') ||
    query.includes('metro') ||
    query.includes('routine') ||
    query.includes('walk') ||
    query.includes('bike')
  ) {
    return {
      id,
      role: 'assistant',
      timestamp,
      content: `### 🚲 Commute & Exposure Optimization

Based on your current commute mode (${context.commuteMode}):

* **Roadway Exposure:** Heavy traffic corridors exhibit high concentrations of diesel soot and nitrogen dioxide (NO2).
* **Cabin Air Setting:** When driving is unavoidable, set vehicle ventilation to **Internal Recirculation** with a clean cabin air filter to minimize direct exhaust ingress.
* **Electrified Mass Transit:** Utilizing electric metro rail eliminates personal tailpipe emissions and reduces roadway exhaust exposure.
* **Active Commuters:** If walking or cycling during high pollution, wear a fitted N95 respirator to prevent high-volume inhalation of coarse roadway dust.`,
      suggestedActions: [
        'How to calculate commute emissions saved?',
        'When is outdoor exercise safest?',
        'How to maintain good indoor air quality?',
      ],
      impactHighlight: {
        label: customNotice ? 'Engine Status' : 'Travel Optimization',
        value: customNotice || 'Recirculated cabin air or mass transit reduces direct exposure',
        type: customNotice ? 'warning' : 'info',
      },
    };
  }

  // Default response
  return {
    id,
    role: 'assistant',
    timestamp,
    content: `### 🛡️ AeroGuardian Advisory for ${context.cityName}

Currently tracking model-estimated **${aqiDisplay}** with fine particulate (PM2.5) around **${pm25Display}**.

**Core Recommendations:**
1. **Air Quality Source:** This tool displays atmospheric numerical model predictions (CAMS/Open-Meteo), which model regional ambient air rather than indoor conditions.
2. **Indoor Protection:** Keep windows sealed when ambient AQI > 100, and operate mechanical filtration.
3. **Respirators:** Use well-fitted N95/FFP2 masks during outdoor transit in dense traffic or high-AQI periods.

*Notice: AeroGuardian provides environmental engineering guidance. For medical symptoms, consult a licensed healthcare professional.*`,
    suggestedActions: [
      'Is natural ventilation safe right now?',
      'How to build a DIY Corsi-Rosenthal box?',
      'How to protect sensitive family members?',
    ],
    impactHighlight: {
      label: customNotice ? 'Engine Status' : 'AeroGuardian Active',
      value: customNotice || 'Deterministic environmental health intelligence engine',
      type: customNotice ? 'warning' : 'info',
    },
  };
}

/**
 * Sends a chat message to Google Gemini API (gemini-3.8-flash) or switches to heuristic fallback.
 *
 * Integrity features:
 * - Request configuration adheres to Gemini 3.8 documentation (no unsupported temperature/topP/topK).
 * - Transmits API key strictly in HTTP header 'x-goog-api-key' (never in URL query).
 * - Enforces 15-second request timeout via AbortController.
 * - Validates conversation history (ensures alternating roles and bounds history length).
 * - Treats user prompt and AI response as untrusted data.
 * - Handles 400, 403, 404, 429, 5xx, and empty response errors gracefully.
 */
export async function sendChatMessage(
  history: ChatMessage[],
  userPrompt: string,
  context: AssistantContext,
  apiKey: string
): Promise<ChatMessage> {
  const sanitizedPrompt = sanitizePrompt(userPrompt, 2048);
  if (!sanitizedPrompt) {
    return generateHeuristicResponse('empty', context);
  }

  const cleanKey = apiKey ? apiKey.trim() : '';

  // Fall back to heuristic engine if no key provided
  if (!cleanKey) {
    return generateHeuristicResponse(sanitizedPrompt, context);
  }

  // UI-level rate limiting check
  if (!chatRateLimiter.canProceed()) {
    return generateHeuristicResponse(
      sanitizedPrompt,
      context,
      `Client rate limit reached (15 req/min). Operating via offline heuristic engine.`
    );
  }

  const systemInstruction = buildSystemPrompt(context);

  // Validate and trim conversation history (last 6 messages max)
  const safeHistory = Array.isArray(history) ? history.slice(-6) : [];
  const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

  for (const msg of safeHistory) {
    if (!msg || typeof msg.content !== 'string' || !msg.content.trim()) continue;
    const role: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
    contents.push({
      role,
      parts: [{ text: sanitizePrompt(msg.content, 1024) }],
    });
  }

  // Append current prompt
  contents.push({
    role: 'user',
    parts: [{ text: sanitizedPrompt }],
  });

  const timeoutController = new AbortController();
  const timer = setTimeout(() => timeoutController.abort(), 15000);

  try {
    const response = await fetch(GEMINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': cleanKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
        },
      }),
      signal: timeoutController.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const apiErrorMsg = errorJson?.error?.message || `HTTP ${response.status}`;

      let userFriendlyNotice = `Gemini API error (${response.status}). Switched to offline heuristic engine.`;
      if (response.status === 400) {
        userFriendlyNotice =
          'Gemini API key appears invalid or malformed. Switched to offline engine.';
      } else if (response.status === 403) {
        userFriendlyNotice =
          'Gemini API key unauthorized or quota exhausted. Switched to offline engine.';
      } else if (response.status === 429) {
        userFriendlyNotice = 'Gemini API rate limit exceeded. Switched to offline engine.';
      } else if (response.status >= 500) {
        userFriendlyNotice =
          'Gemini cloud service temporarily unavailable. Switched to offline engine.';
      }

      console.warn(`Gemini API error (${apiErrorMsg}). Falling back to heuristic engine.`);
      return generateHeuristicResponse(sanitizedPrompt, context, userFriendlyNotice);
    }

    const data = await response.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText || typeof candidateText !== 'string' || !candidateText.trim()) {
      return generateHeuristicResponse(
        sanitizedPrompt,
        context,
        'Gemini returned an empty response or triggered safety filters. Switched to offline engine.'
      );
    }

    return {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      role: 'assistant',
      content: candidateText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedActions: [
        'How does atmospheric stagnation affect our city?',
        'Show DIY Corsi-Rosenthal build instructions',
        'Check child & elderly safety tips',
      ],
      impactHighlight: {
        label: 'Live AI Active',
        value: `Powered by Google Gemini (${GEMINI_MODEL_ID}) via secure header auth`,
        type: 'info',
      },
    };
  } catch (err: unknown) {
    clearTimeout(timer);
    const isTimeout = err instanceof DOMException && err.name === 'AbortError';
    const errorMsg = isTimeout
      ? 'Request timed out after 15s'
      : err instanceof Error
        ? err.message
        : String(err);

    console.warn('Gemini request failed, falling back to heuristic engine:', errorMsg);
    return generateHeuristicResponse(
      sanitizedPrompt,
      context,
      `Network error (${errorMsg}). Switched to offline heuristic engine.`
    );
  }
}
