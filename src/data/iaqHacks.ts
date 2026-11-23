export interface IaqHack {
  id: string;
  title: string;
  category: 'DIY Filtration' | 'Ventilation Timing' | 'Indoor Source Control' | 'Botanical & Natural';
  difficulty: 'Easy' | 'Intermediate' | 'Advanced';
  costLevel: 'Free ($0)' | 'Low Cost (<$25)' | 'Moderate ($25-$60)';
  efficacyScore: number; // 1-100%
  summary: string;
  materialsNeeded?: string[];
  steps: string[];
  scientificMechanism: string;
  cautionNotice?: string;
}

export const IAQ_HACKS: IaqHack[] = [
  {
    id: 'corsi-rosenthal-box',
    title: 'DIY Corsi-Rosenthal Box Air Cleaner',
    category: 'DIY Filtration',
    difficulty: 'Intermediate',
    costLevel: 'Moderate ($25-$60)',
    efficacyScore: 92,
    summary: 'A proven, scientifically tested DIY air purifier built with 4 MERV-13 filters and a 20-inch box fan that rivals commercial $400 HEPA units.',
    materialsNeeded: [
      '1x 20-inch box fan (standard household box fan)',
      '4x MERV 13 furnace filters (20" x 20" x 2" or 1")',
      '1x Cardboard bottom piece (20" x 20")',
      'Duct tape or packing tape',
      'Cardboard fan shroud (cut a 15-inch circular opening)'
    ],
    steps: [
      'Tape the 4 MERV 13 filters together in a cube shape with the air flow arrows pointing inward toward the center.',
      'Tape the bottom cardboard square securely to seal the base of the cube.',
      'Place the 20" box fan on top of the cube with the fan blowing UPWARD out of the box, and tape the perimeter completely.',
      'Tape a cardboard circular shroud on the fan face to eliminate corner backdraft and boost airflow efficiency by ~30%.',
      'Run the fan on low-to-medium in a central family room for continuous high-CADR filtration (approx. 500 CFM).'
    ],
    scientificMechanism: 'MERV-13 filters capture 85%+ of fine particles between 0.3 - 1.0 µm (PM2.5). The large 4-sided surface area reduces pressure drop across the fan, achieving higher clean air delivery rates (CADR) than small HEPA units.',
    cautionNotice: 'Ensure arrows on all filters point inward toward the fan intake. Never leave box fans running unattended if motor exhibits heat.'
  },
  {
    id: 'thermal-inversion-timing',
    title: 'Diurnal Inversion Window Timing Protocol',
    category: 'Ventilation Timing',
    difficulty: 'Easy',
    costLevel: 'Free ($0)',
    efficacyScore: 78,
    summary: 'Time natural window ventilation strictly during the warmest afternoon hours (1:30 PM - 3:30 PM) when thermal inversion lifts.',
    steps: [
      'Keep all doors and windows tightly closed from 6:00 PM to 11:00 AM (the peak atmospheric trapping window).',
      'Check local solar irradiance: between 1:30 PM and 3:30 PM, ground warmth breaks the cold nocturnal boundary layer.',
      'Open windows for a maximum 10-15 minute rapid cross-ventilation burst only during this afternoon window if indoor CO2 is high.',
      'Immediately reseal windows before 4:30 PM sunset as cold ground air triggers rapid smog re-concentration.'
    ],
    scientificMechanism: 'Winter smog is trapped by a temperature inversion where cold dense ground air is capped by warmer air above. Afternoon solar heating temporarily erodes the inversion cap, creating convective mixing and dropping ambient PM2.5 by 30-50% compared to dawn.',
    cautionNotice: 'On severe smog red-alert days (AQI > 350), do not open windows even during midday; rely strictly on indoor air scrubbing.'
  },
  {
    id: 'wet-microfiber-dusting',
    title: 'Electrostatic Wet-Wiping & Damp Mopping',
    category: 'Indoor Source Control',
    difficulty: 'Easy',
    costLevel: 'Free ($0)',
    efficacyScore: 70,
    summary: 'Replace dry brooms and vacuum cleaners with damp microfiber cloths to avoid resuspending toxic settled particulate.',
    steps: [
      'Stop using traditional dry straw brooms or standard non-HEPA vacuum cleaners, which kick up settled PM2.5/PM10 back into the breathing zone.',
      'Use a microfiber mop moistened with warm water (or mild vinegar solution) once daily.',
      'Wipe down tabletops, window sills, and electronic screens with damp microfiber cloths in an S-pattern.',
      'Wash cloths separately in hot water to trap micro-soot particles.'
    ],
    scientificMechanism: 'Dry sweeping mechanically atomizes settled dust into respirable aerosols under 10 µm. Wet microfiber traps particulate through van der Waals forces and surface tension, preventing indoor resuspension.',
  },
  {
    id: 'door-sweep-weatherstripping',
    title: 'DIY Foam & Silicone Door Draft Sealing',
    category: 'Indoor Source Control',
    difficulty: 'Easy',
    costLevel: 'Low Cost (<$25)',
    efficacyScore: 82,
    summary: 'Seal exterior perimeter gaps and thresholds to eliminate toxic outdoor draft infiltration (air leakage reduction).',
    materialsNeeded: [
      'Self-adhesive silicone weatherstripping D-profile tape',
      'Twin draft door sweep or rolled towel / foam snake',
      'Painter\'s tape or caulk for window joint gaps'
    ],
    steps: [
      'Perform the candle/flame draft test: move a lit tealight or incense along window frame seams to identify air leaks.',
      'Clean frame surfaces with rubbing alcohol and apply peel-and-stick foam/silicone stripping.',
      'Slide a double-sided draft guard under all exterior doors and balcony thresholds.',
      'Seal unused exhaust fan louvers with removable plastic covers during winter night smog peaks.'
    ],
    scientificMechanism: 'Typical urban apartments experience 1.0 to 1.5 Air Changes per Hour (ACH) of uncontrolled infiltration. Sealing perimeter gaps drops infiltration to <0.3 ACH, doubling the longevity and efficacy of indoor purifiers.',
  },
  {
    id: 'kitchen-source-isolation',
    title: 'Range Hood Venting & Clean Fuel Habits',
    category: 'Indoor Source Control',
    difficulty: 'Easy',
    costLevel: 'Free ($0)',
    efficacyScore: 85,
    summary: 'Prevent internal PM2.5 and NO2 spikes during cooking by isolating kitchen zones and avoiding high-smoke roasting.',
    steps: [
      'Always close the kitchen door isolating it from living areas and bedrooms before turning on the stove.',
      'Turn kitchen exhaust fans on high 2 minutes BEFORE lighting burners to establish negative pressure.',
      'Use back burners instead of front burners; range hoods extract up to 70% more emissions from back burners.',
      'Cover pans with lids during frying to trap volatile organic aerosols; avoid open flame biomass or charcoal indoor heating completely.'
    ],
    scientificMechanism: 'Stir-frying, roasting, and gas combustion generate indoor PM2.5 spikes exceeding 600 µg/m³ within 10 minutes. Compartmentalization prevents toxic aerosol diffusion into vulnerable resting spaces.',
  },
  {
    id: 'botanical-areca-snake-plant',
    title: 'Targeted Botanical Air Scrubbing (NASA Clean Air)',
    category: 'Botanical & Natural',
    difficulty: 'Easy',
    costLevel: 'Low Cost (<$25)',
    efficacyScore: 45,
    summary: 'Strategic placement of Snake Plants (Sansevieria), Areca Palms, and Money Plants to metabolize VOCs and supply nocturnal oxygen.',
    materialsNeeded: [
      'Snake Plant (Sansevieria trifasciata)',
      'Areca Palm (Dypsis lutescens)',
      'Peace Lily (Spathiphyllum)'
    ],
    steps: [
      'Place 2-3 Snake Plants in bedrooms: they perform Crassulacean Acid Metabolism (CAM), releasing oxygen and absorbing CO2 at night.',
      'Place Areca Palms in the living room for natural daytime transpiration and formaldehyde adsorption.',
      'Wipe plant leaves weekly with a damp sponge so dust doesn\'t clog leaf stomata.'
    ],
    scientificMechanism: 'While plants do not replace mechanical PM2.5 filters, phytoremediation through leaf stomata and rhizospheric bacteria reduces volatile indoor pollutants (benzene, formaldehyde, toluene) and helps stabilize indoor humidity.',
    cautionNotice: 'Plants are complementary; they do not filter fine particulate smog (PM2.5). Never rely on plants alone during severe winter smog episodes.'
  }
];
