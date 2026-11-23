export interface IaqHack {
  id: string;
  title: string;
  category:
    'DIY Filtration' | 'Ventilation Timing' | 'Indoor Source Control' | 'Botanical Limitations';
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  costLevel: 'Zero Cost' | 'Low Cost' | 'Moderate Cost';
  summary: string;
  materialsNeeded?: string[];
  steps: string[];
  scientificMechanism: string;
  cautionNotice: string;
}

export const IAQ_HACKS: IaqHack[] = [
  {
    id: 'corsi-rosenthal-box',
    title: 'DIY Corsi-Rosenthal Box Air Cleaner',
    category: 'DIY Filtration',
    difficulty: 'Intermediate',
    costLevel: 'Moderate Cost',
    summary:
      'A low-cost, open-source particulate scrubber constructed from standard MERV-13 furnace filters and a household box fan.',
    materialsNeeded: [
      '1x 20-inch box fan with thermal overload protection / fused plug',
      '4x MERV 13 pleated air filters (20" x 20" x 1" or 2")',
      '1x Cardboard square base (20" x 20")',
      'Duct tape or heavy sealing tape',
      'Cardboard fan shroud (cut with a 15-inch circular opening)',
    ],
    steps: [
      'Orient the 4 MERV-13 filters into a cube with all airflow arrows pointing INWARD toward the center plenum.',
      'Tape the bottom cardboard square securely to close off the base of the filter cube.',
      'Mount the box fan on top of the filter cube blowing UPWARD (exhausting cleaned air toward the ceiling), sealing all perimeter seams with duct tape.',
      'Affix a cardboard shroud with a circular opening matching fan blade diameter over the front face of the fan to prevent edge vortex backdraft.',
      'Place the unit in an open central room away from walls and curtains. Operate on low or medium speed.',
    ],
    scientificMechanism:
      'MERV-13 rated media provides mechanical filtration capturing fine particulates (PM2.5) via impaction, interception, and diffusion. The 4-filter cube geometry expands the filter surface area, lowering air velocity and static pressure drop across the fan.',
    cautionNotice:
      'ELECTRICAL & FAN SAFETY: Ensure the fan motor is certified for continuous duty and features a fused safety plug. Regularly inspect the motor for dust accumulation or heat buildup. Never leave DIY electrical appliances running unattended or in damp locations. Actual clean air delivery rate depends on filter media resistance, fan motor characteristics, seal tightness, and room volume.',
  },
  {
    id: 'air-quality-guided-ventilation',
    title: 'Model-Guided Natural Ventilation Protocol',
    category: 'Ventilation Timing',
    difficulty: 'Easy',
    costLevel: 'Zero Cost',
    summary:
      'Evaluate local air quality model forecasts to determine whether a temporary window aeration burst is viable without introducing outdoor soot.',
    steps: [
      'Check current local air quality before opening windows. When ambient AQI is elevated (>100) or during dense surface smog, keep windows and balcony doors sealed.',
      'If forecast models indicate moderate air (AQI < 100) and elevated indoor CO2 is present, open opposite windows for a brief 10–15 minute cross-ventilation burst.',
      'Do not rely on a fixed time of day; local meteorological dispersion varies daily depending on wind speed, solar radiation, and terrain.',
      'Close and reseal windows as evening cooling sets in to prevent infiltration of evening surface emissions.',
    ],
    scientificMechanism:
      'Surface-layer particulate concentration fluctuates based on atmospheric boundary layer dynamics. Aeration is only biologically beneficial when outdoor particulate concentrations are lower than indoor levels.',
    cautionNotice:
      'VENTILATION CAUTION: Never open windows during severe pollution episodes (AQI > 150). CRITICAL SAFETY: Never seal essential combustion-air supply vents, gas water heater flues, furnace air supplies, or bathroom exhausts. Doing so creates an immediate risk of fatal Carbon Monoxide (CO) poisoning and hazardous moisture accumulation.',
  },
  {
    id: 'wet-microfiber-dusting',
    title: 'Damp Microfiber Wiping & Wet Mopping',
    category: 'Indoor Source Control',
    difficulty: 'Easy',
    costLevel: 'Zero Cost',
    summary:
      'Replace dry brooms and non-HEPA vacuums with moist microfiber cloths to avoid resuspending settled coarse and fine particulates.',
    steps: [
      'Avoid dry sweeping with conventional straw or nylon brooms, which mechanically resuspend settled particles back into the breathing zone.',
      'Wipe hard floor surfaces with a moistened microfiber mop once daily.',
      'Clean table surfaces, window sills, and shelves using damp microfiber cloths in an S-stroke pattern.',
      'Rinse cloths thoroughly in warm water outside of living quarters.',
    ],
    scientificMechanism:
      'Mechanical dry sweeping agitates settled dust into respirable aerosols. Water surface tension and electrostatic van der Waals forces in microfiber capture particulate without airborne redispersal.',
    cautionNotice:
      'Avoid excessive moisture on unsealed wood or laminate floors to prevent moisture damage or mold growth.',
  },
  {
    id: 'perimeter-draft-proofing',
    title: 'Non-Hazardous Door & Window Draft Sealing',
    category: 'Indoor Source Control',
    difficulty: 'Easy',
    costLevel: 'Low Cost',
    summary:
      'Reduce uncontrolled outdoor particulate infiltration by sealing perimeter gaps at exterior entry doors and window frames.',
    materialsNeeded: [
      'Self-adhesive silicone or foam D-profile weatherstripping tape',
      'Under-door twin draft stopper or weighted cloth sweep',
      'Thin strip of lightweight tissue paper (for non-flame draft detection)',
    ],
    steps: [
      'Detect draft locations safely: hold a lightweight strip of tissue paper near closed window edges and exterior door thresholds on windy days; movement of the paper indicates air infiltration.',
      'Clean contact surfaces on the frame with mild cleaner and dry completely.',
      'Apply peel-and-stick weatherstripping along window jambs where gaps exist.',
      'Install an under-door sweep or position a weighted fabric draft guard at exterior threshold gaps.',
    ],
    scientificMechanism:
      'Uncontrolled outdoor air infiltration through door and window perimeter gaps introduces outdoor fine particulate. Sealing structural envelope bypasses lowers particulate infiltration into sleeping areas.',
    cautionNotice:
      'LIFE SAFETY WARNING: NEVER use candles, lighters, tealights, or incense sticks for flame/smoke leak testing in residential homes due to fire hazards and indoor soot generation. NEVER seal fresh combustion-air inlets or dedicated exhaust ducts for gas water heaters, boilers, or fuel-burning stoves.',
  },
  {
    id: 'kitchen-source-isolation',
    title: 'Kitchen Cooking Isolation & Ducted Range Exhaust',
    category: 'Indoor Source Control',
    difficulty: 'Easy',
    costLevel: 'Zero Cost',
    summary:
      'Minimize indoor particulate, acrolein, and nitrogen dioxide (NO2) exposure generated during high-heat cooking.',
    steps: [
      'Close kitchen doors to isolate cooking aerosols from living areas and bedrooms during food preparation.',
      'Operate the range hood exhaust fan on high before turning on burners to establish an exhaust draft.',
      'Use back burners when possible, as their physical alignment under range hood intake hoods typically improves fume capture.',
      'Keep lids on cookware during boiling or shallow frying to contain oil mist droplets.',
      'After cooking, continue running the exhaust fan for 5–10 minutes with kitchen doors closed.',
    ],
    scientificMechanism:
      'High-temperature oil cooking and gas combustion generate substantial ultrafine particle and NO2 spikes. Physical zone isolation prevents dispersion of combustion byproducts into rest zones.',
    cautionNotice:
      'HOOD LIMITATION: External-vented range hoods duct fumes to the outdoor atmosphere. In contrast, recirculating range hoods pass air through metal mesh and charcoal pads; they trap coarse grease droplets but DO NOT remove carbon monoxide (CO) or gaseous nitrogen dioxide (NO2).',
  },
  {
    id: 'botanical-limits-clarification',
    title: 'Houseplants: Realistic Capabilities & Limits',
    category: 'Botanical Limitations',
    difficulty: 'Easy',
    costLevel: 'Low Cost',
    summary:
      'Understanding what indoor plants can and cannot do: plants provide aesthetic value but do NOT replace mechanical PM2.5 filters.',
    materialsNeeded: ['Common indoor houseplants (e.g., Snake Plant, Spider Plant, Pothos)'],
    steps: [
      'Houseplants may be kept for indoor biophilic and aesthetic benefits.',
      'Wipe plant leaves periodically with a moist sponge to keep leaf surfaces free of ambient dust.',
      'Do not expect indoor potted plants to clean smog or reduce particulate matter (PM2.5/PM10) concentrations.',
      'Rely strictly on mechanical filtration (HEPA or MERV-13) for particulate air cleaning.',
    ],
    scientificMechanism:
      'Controlled chamber studies (such as NASA 1989) evaluated trace gaseous VOC reduction in closed chambers with high root-zone air flow. However, peer-reviewed environmental engineering research confirms that passive potted plants have negligible effect on fine particulate matter (PM2.5) in realistic residential air exchange volumes.',
    cautionNotice:
      'DO NOT RELY ON PLANTS FOR PARTICULATE PROTECTION: Potted plants do not mechanically filter soot, smoke, or fine particulates. Over-watering indoor plant soil can foster mold spores and dust mites, which aggravate respiratory conditions.',
  },
];
