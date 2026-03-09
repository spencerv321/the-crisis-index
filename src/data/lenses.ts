export interface SpectrumDef {
  min: number;
  max: number;
  val: number;
  leftLabel: string;
  rightLabel: string;
}

export interface Metric {
  label: string;
  value: string;
  num: number;
  context: string;
  big?: boolean;
  spectrum?: SpectrumDef;
  invert?: boolean;
}

export interface Lens {
  id: string;
  tier: 1 | 2;
  name: string;
  shortName: string;
  framework: string;
  icon: string;
  score: number;
  weight: number;
  tagline: string;
  metrics: Metric[];
  sparkData: number[];
  sparkLabel: string;
  editorial: string;
  historicalScores: Record<number, number>;
}

export const LENSES: Lens[] = [
  {
    id: "generational",
    tier: 1,
    name: "Generational Cycle",
    shortName: "Generational",
    framework: "Strauss-Howe",
    icon: "◎",
    score: 78,
    weight: 0.2,
    tagline: "History moves in ~80-year cycles. We're deep in the Crisis.",
    metrics: [
      {
        label: "Boomer wealth share",
        value: "51.8%",
        num: 51.8,
        context: "of all US household wealth",
        spectrum: {
          min: 30,
          max: 60,
          val: 51.8,
          leftLabel: "Equal",
          rightLabel: "Concentrated",
        },
      },
      {
        label: "Millennial wealth share",
        value: "9.2%",
        num: 9.2,
        context: "despite being largest generation",
        spectrum: {
          min: 0,
          max: 30,
          val: 9.2,
          leftLabel: "High",
          rightLabel: "Low",
        },
      },
      {
        label: "Trust in govt (18-29)",
        value: "19%",
        num: 19,
        context: "Gallup 2025 — lowest cohort",
        spectrum: {
          min: 0,
          max: 80,
          val: 19,
          leftLabel: "High trust",
          rightLabel: "No trust",
        },
        invert: true,
      },
      {
        label: "Millennials in Congress",
        value: "18%",
        num: 18,
        context: "up from 2% in 2018 — accelerating",
        spectrum: {
          min: 0,
          max: 50,
          val: 18,
          leftLabel: "None",
          rightLabel: "Majority",
        },
      },
      {
        label: "Gen Z labor participation",
        value: "71.2%",
        num: 71.2,
        context: "highest entry rate since Boomers",
        spectrum: {
          min: 50,
          max: 80,
          val: 71.2,
          leftLabel: "Low",
          rightLabel: "High",
        },
      },
    ],
    sparkData: [32, 35, 38, 40, 42, 44, 45, 47, 49, 50, 51, 51.8],
    sparkLabel: "Boomer wealth share (%, 2015–2025)",
    editorial:
      "The generational alignment is textbook Fourth Turning. A moralistic elder generation providing competing visions. A pragmatic midlife generation managing the crisis. A civic-minded rising generation ready to build — but economically burdened. This is the same configuration as the 1930s–1940s.",
    historicalScores: { 1938: 82, 1942: 85, 1974: 55, 2008: 60 },
  },
  {
    id: "debt",
    tier: 1,
    name: "Debt Supercycle",
    shortName: "Debt",
    framework: "Ray Dalio",
    icon: "◆",
    score: 82,
    weight: 0.2,
    tagline: "The long-term debt cycle is in its end stage.",
    metrics: [
      {
        label: "US National Debt",
        value: "$36.2T",
        num: 36.2,
        context: "up $11T in 4 years",
        big: true,
      },
      {
        label: "Debt-to-GDP",
        value: "124.8%",
        num: 124.8,
        context: "last seen in 1945",
        spectrum: {
          min: 30,
          max: 140,
          val: 124.8,
          leftLabel: "Sustainable",
          rightLabel: "Crisis",
        },
      },
      {
        label: "Interest cost / revenue",
        value: "23.1%",
        num: 23.1,
        context: "CBO — $1.1T/yr in interest alone",
        spectrum: {
          min: 5,
          max: 35,
          val: 23.1,
          leftLabel: "Manageable",
          rightLabel: "Dominance",
        },
      },
      {
        label: "Treasury basis trade",
        value: "$1.85T",
        num: 1.85,
        context: "leveraged hedge fund positions — up $1T since 2022",
        spectrum: {
          min: 0,
          max: 3,
          val: 1.85,
          leftLabel: "Low risk",
          rightLabel: "Systemic",
        },
      },
      {
        label: "Foreign official Treasury buying",
        value: "4%",
        num: 4,
        context: "of new issuance — was 53% in 2002–2014",
        spectrum: {
          min: 0,
          max: 60,
          val: 4,
          leftLabel: "Abandoned",
          rightLabel: "Strong",
        },
      },
      {
        label: "Dollar reserve share",
        value: "57.8%",
        num: 57.8,
        context: "IMF COFER — was 72% in 2000",
        spectrum: {
          min: 40,
          max: 80,
          val: 57.8,
          leftLabel: "Displaced",
          rightLabel: "Dominant",
        },
      },
      {
        label: "Gini coefficient",
        value: "0.49",
        num: 0.49,
        context: "Census — highest since tracking began",
        spectrum: {
          min: 0.3,
          max: 0.55,
          val: 0.49,
          leftLabel: "Equal",
          rightLabel: "Unequal",
        },
      },
      {
        label: "Home price / income",
        value: "7.5×",
        num: 7.5,
        context: "historical average: 3.5×",
        spectrum: {
          min: 2,
          max: 10,
          val: 7.5,
          leftLabel: "Affordable",
          rightLabel: "Unaffordable",
        },
      },
    ],
    sparkData: [62, 64, 68, 76, 100, 108, 120, 123, 125, 127, 129, 124.8],
    sparkLabel: "Debt-to-GDP (%, 2012–2026)",
    editorial:
      "The math is becoming unavoidable. Federal interest costs now consume nearly a quarter of tax revenue — and that's before the next recession. But the structural story is worse than the headline numbers: foreign central banks have stopped financing the deficit. In their place, Cayman-domiciled hedge funds running leveraged basis trades now absorb 37% of new Treasury issuance — the same fragile structure that nearly broke in March 2020. Dalio's framework says this is textbook late-cycle: too much debt, too much inequality, too much political polarization, all at once. The question isn't if the system adjusts — it's how.",
    historicalScores: { 1938: 75, 1942: 92, 1974: 65, 2008: 72 },
  },
  {
    id: "repression",
    tier: 1,
    name: "Financial Repression",
    shortName: "Repression",
    framework: "Russell Napier",
    icon: "◈",
    score: 68,
    weight: 0.15,
    tagline: "Governments are seizing control of money creation.",
    metrics: [
      {
        label: "Gold price",
        value: "$3,118",
        num: 3118,
        context: "was $1,959 in Sept 2020 — up 59%",
        big: true,
      },
      {
        label: "Real interest rate",
        value: "−0.8%",
        num: -0.8,
        context: "Fed funds minus CPI — savers losing",
        spectrum: {
          min: -4,
          max: 4,
          val: -0.8,
          leftLabel: "Repressed",
          rightLabel: "Positive",
        },
      },
      {
        label: "10Y yield vs. CPI",
        value: "4.28% vs 3.1%",
        num: 1.18,
        context: "barely positive — repression active",
        spectrum: {
          min: -3,
          max: 5,
          val: 1.18,
          leftLabel: "Repressed",
          rightLabel: "Compensated",
        },
      },
      {
        label: "Bank credit growth",
        value: "+4.8% YoY",
        num: 4.8,
        context: "while Fed balance sheet shrinks — Napier's signal",
        spectrum: {
          min: -2,
          max: 10,
          val: 4.8,
          leftLabel: "Contracting",
          rightLabel: "Expanding",
        },
      },
      {
        label: "5Y inflation breakeven",
        value: "2.45%",
        num: 2.45,
        context: "FRED — Napier says wildly mispriced",
        spectrum: {
          min: 1,
          max: 6,
          val: 2.45,
          leftLabel: "Low expect.",
          rightLabel: "High expect.",
        },
      },
    ],
    sparkData: [
      1959, 1870, 1800, 1950, 2050, 2300, 2650, 2800, 2950, 3020, 3080, 3118,
    ],
    sparkLabel: "Gold price ($, 2020–2026)",
    editorial:
      "Napier's thesis: governments have taken money creation back from central banks. When bank credit grows while the central bank balance sheet shrinks, that's the signature — the state directing lending to manage its own debt. Gold at $3,118 isn't an inflation trade. It's political insurance against a monetary regime that's becoming more arbitrary.",
    historicalScores: { 1938: 50, 1942: 88, 1974: 60, 2008: 25 },
  },
  {
    id: "ai",
    tier: 2,
    name: "AI Disruption",
    shortName: "AI",
    framework: "Institutional Accelerant",
    icon: "◇",
    score: 74,
    weight: 0.15,
    tagline: "AI is destroying the old order and building the next one.",
    metrics: [
      {
        label: "SaaS market cap destroyed",
        value: "$487B+",
        num: 487,
        context: "since AI disruption wave began",
        big: true,
      },
      {
        label: "Entry-level job postings",
        value: "−31% YoY",
        num: -31,
        context: "Indeed — knowledge work canary",
        spectrum: {
          min: -50,
          max: 20,
          val: -31,
          leftLabel: "Collapse",
          rightLabel: "Growth",
        },
      },
      {
        label: "Enterprise AI adoption",
        value: "72%",
        num: 72,
        context: "McKinsey 2025 — was 55% in 2023",
        spectrum: {
          min: 0,
          max: 100,
          val: 72,
          leftLabel: "Early",
          rightLabel: "Ubiquitous",
        },
      },
      {
        label: "AI productivity vs. wage gap",
        value: "12× faster",
        num: 12,
        context: "productivity gains vs. median wage growth",
        spectrum: {
          min: 1,
          max: 20,
          val: 12,
          leftLabel: "Shared",
          rightLabel: "Captured",
        },
      },
      {
        label: "Frontier model capability",
        value: "PhD-level",
        num: 90,
        context: "GPQA Diamond — 80%+ accuracy",
        spectrum: {
          min: 0,
          max: 100,
          val: 90,
          leftLabel: "Narrow",
          rightLabel: "General",
        },
      },
    ],
    sparkData: [5, 8, 12, 18, 28, 40, 55, 65, 72, 78, 85, 90],
    sparkLabel: "Frontier AI benchmark scores (indexed, 2020–2026)",
    editorial:
      "AI is the Fourth Turning's wildcard — and the unique angle no other macro framework tracks. It's simultaneously destroying institutional structures (SaaS, consulting, knowledge work) and potentially building tools for whatever comes next. The gap between AI productivity gains and broad wage growth is the crisis question: who captures the value?",
    historicalScores: { 1938: 5, 1942: 10, 1974: 5, 2008: 5 },
  },
  {
    id: "social",
    tier: 2,
    name: "Social Fragmentation",
    shortName: "Social",
    framework: "The Anti-Social Century",
    icon: "◌",
    score: 75,
    weight: 0.15,
    tagline: "The structures that hold society together are fraying.",
    metrics: [
      {
        label: "Deaths of despair (annual)",
        value: "~205,000",
        num: 205,
        context: "CDC — tripled since late 1990s",
        big: true,
      },
      {
        label: "Teen socializing (face-to-face)",
        value: "−50%",
        num: -50,
        context: "ATUS 2003–2024 — steepest age-group decline",
        spectrum: {
          min: -60,
          max: 0,
          val: -50,
          leftLabel: "Isolated",
          rightLabel: "Connected",
        },
      },
      {
        label: "Adults with zero close friends",
        value: "12%",
        num: 12,
        context: "quadrupled since 1990 — American Perspectives Survey",
        spectrum: {
          min: 0,
          max: 20,
          val: 12,
          leftLabel: "Few",
          rightLabel: "Epidemic",
        },
      },
      {
        label: "Trust in government",
        value: "22%",
        num: 22,
        context: "Gallup — near all-time low",
        spectrum: {
          min: 0,
          max: 80,
          val: 22,
          leftLabel: "None",
          rightLabel: "High",
        },
      },
      {
        label: "Trust in media",
        value: "31%",
        num: 31,
        context: "Gallup — lowest in polling history",
        spectrum: {
          min: 0,
          max: 80,
          val: 31,
          leftLabel: "None",
          rightLabel: "High",
        },
      },
      {
        label: "Partisan threat perception",
        value: "62%",
        num: 62,
        context:
          "Pew — majority see other party as existential threat",
        spectrum: {
          min: 20,
          max: 80,
          val: 62,
          leftLabel: "Tolerant",
          rightLabel: "Hostile",
        },
      },
      {
        label: "Churchgoing adults",
        value: "30%",
        num: 30,
        context: "Gallup — was 70% in 1999",
        spectrum: {
          min: 10,
          max: 80,
          val: 30,
          leftLabel: "Secular",
          rightLabel: "Religious",
        },
      },
    ],
    sparkData: [70, 62, 55, 50, 44, 40, 37, 35, 33, 31, 30, 30],
    sparkLabel: "Churchgoing adults (%, 1999–2025)",
    editorial:
      "Derek Thompson calls it the Anti-Social Century: Americans aren't just lonely — they've stopped wanting to connect. Face-to-face socializing has dropped 30% for adults and nearly 50% for teenagers. The number of Americans with zero close friends has quadrupled. This isn't a pandemic artifact — the decline began in 2012, when smartphone penetration hit critical mass. Three waves of privatization — cars, television, smartphones — have systematically dismantled the 'middle ring' of neighbors, colleagues, and acquaintances. These were the relationships that taught tolerance and built community. The meaning-making structures that held society together — church, civic organizations, local community — are failing. Nothing has replaced them yet.",
    historicalScores: { 1938: 80, 1942: 65, 1974: 70, 2008: 50 },
  },
  {
    id: "geopolitical",
    tier: 2,
    name: "Geopolitical Realignment",
    shortName: "Geopolitics",
    framework: "Multipolar Transition",
    icon: "◉",
    score: 65,
    weight: 0.15,
    tagline: "The post-WWII order is restructuring in real time.",
    metrics: [
      {
        label: "Central bank gold buying",
        value: "1,136 tons",
        num: 1136,
        context: "World Gold Council 2025 — 3rd record year",
        big: true,
      },
      {
        label: "Global defense spending",
        value: "$2.44T",
        num: 2.44,
        context: "SIPRI — all-time high, +7% YoY",
        spectrum: {
          min: 1.5,
          max: 3,
          val: 2.44,
          leftLabel: "Peacetime",
          rightLabel: "Mobilization",
        },
      },
      {
        label: "US-China trade volume",
        value: "−22% from peak",
        num: -22,
        context: "decoupling accelerating since 2022",
        spectrum: {
          min: -50,
          max: 10,
          val: -22,
          leftLabel: "Decoupled",
          rightLabel: "Integrated",
        },
      },
      {
        label: "BRICS GDP share (PPP)",
        value: "37.3%",
        num: 37.3,
        context: "vs. G7 at 29.3% — crossed over in 2023",
        spectrum: {
          min: 20,
          max: 50,
          val: 37.3,
          leftLabel: "Minority",
          rightLabel: "Majority",
        },
      },
      {
        label: "P(Taiwan conflict by 2028)",
        value: "12%",
        num: 12,
        context: "Metaculus / Polymarket consensus",
        spectrum: {
          min: 0,
          max: 30,
          val: 12,
          leftLabel: "Unlikely",
          rightLabel: "Elevated",
        },
      },
    ],
    sparkData: [400, 450, 500, 650, 750, 850, 1000, 1080, 1100, 1050, 1100, 1136],
    sparkLabel: "Central bank gold purchases (tons/yr, 2015–2025)",
    editorial:
      "Fourth Turnings historically climax with major geopolitical confrontation. The American Revolution, the Civil War, WWII — each featured existential conflict. Central banks buying gold at record pace is the strongest non-verbal signal: sovereigns are hedging against the existing order. The question is whether this resolves through managed transition or collision.",
    historicalScores: { 1938: 95, 1942: 98, 1974: 55, 2008: 25 },
  },
];

export interface Regime {
  max: number;
  label: string;
  color: string;
}

export const REGIMES: Regime[] = [
  { max: 20, label: "Stable Order", color: "#6a8a72" },
  { max: 40, label: "Structural Stress", color: "#a0a060" },
  { max: 60, label: "Late-Cycle Instability", color: "#c9a84a" },
  { max: 80, label: "Crisis Era", color: "#c97f4a" },
  { max: 100, label: "Systemic Break", color: "#c44a2e" },
];

export function getRegime(score: number): Regime {
  return REGIMES.find((r) => score <= r.max) || REGIMES[REGIMES.length - 1];
}

export interface ShockEvent {
  date: string;
  lens: string;
  lensName: string;
  delta: string;
  event: string;
  detail: string;
}

export const SHOCK_EVENTS: ShockEvent[] = [
  {
    date: "Mar 3",
    lens: "ai",
    lensName: "AI Disruption",
    delta: "+3",
    event: "New frontier model surpasses PhD-level reasoning",
    detail: "Capability trajectory continues exponential.",
  },
  {
    date: "Feb 28",
    lens: "geopolitical",
    lensName: "Geopolitics",
    delta: "+2",
    event: "Taiwan Strait naval escalation",
    detail: "US-China decoupling moves from economic to military posturing.",
  },
  {
    date: "Feb 25",
    lens: "debt",
    lensName: "Debt",
    delta: "+1",
    event: "Treasury auction sees weakest demand in 18 months",
    detail: "Foreign buyers pulling back.",
  },
  {
    date: "Feb 22",
    lens: "social",
    lensName: "Social",
    delta: "+1",
    event: "Surgeon General declares loneliness 'national crisis'",
    detail: "Social isolation now rivals smoking as health risk.",
  },
  {
    date: "Feb 19",
    lens: "repression",
    lensName: "Repression",
    delta: "+2",
    event: "ECB announces directed 'green lending' mandate",
    detail: "Financial repression toolkit expanding beyond Japan.",
  },
];

export interface HistoricalEra {
  year: string;
  label: string;
}

export const HISTORICAL_ERAS: HistoricalEra[] = [
  { year: "1938", label: "Pre-WWII" },
  { year: "1942", label: "WWII Peak" },
  { year: "1974", label: "Stagflation" },
  { year: "2008", label: "Financial Crisis" },
  { year: "2026", label: "Today" },
];

export interface Perspective {
  name: string;
  role: string;
  view: string;
}

export const PERSPECTIVES: Perspective[] = [
  {
    name: "Neil Howe",
    role: "The Fourth Turning",
    view: "We are in the latter half of the Fourth Turning. The climax has not yet arrived. Expect institutional rebuilding by the early 2030s, led by Millennials stepping into power.",
  },
  {
    name: "Ray Dalio",
    role: "Changing World Order",
    view: "The long-term debt cycle is in its final stages. Internal disorder is rising. The gap between the current reserve currency power and the rising challenger is narrowing. Classic late-empire dynamics.",
  },
  {
    name: "Russell Napier",
    role: "Financial Repression",
    view: "Governments have seized control of money creation. Financial repression — negative real rates, directed lending — will persist for decades. This is 1945 all over again.",
  },
  {
    name: "Grant Williams & Demetri Kofinas",
    role: "The 100 Year Pivot",
    view: "Every crisis on this dashboard is connected. The debt cycle, the generational turn, the monetary regime shift, the geopolitical realignment — they are not separate problems. They are one structural transition happening simultaneously, for the first time since the 1940s. The 40-year tailwind of declining rates, expanding globalization, and ever-increasing leverage has reversed. What comes next won't look like what came before.",
  },
  {
    name: "Derek Thompson",
    role: "The Anti-Social Century",
    view: "Americans aren't just lonely — they've stopped wanting to connect. Face-to-face socializing has dropped 50% for teenagers. The number of adults with zero close friends has quadrupled. Three waves of privatization — cars, television, smartphones — have dismantled the 'middle ring' of relationships that taught tolerance and held communities together.",
  },
  {
    name: "Tyler Cowen",
    role: "The Great Stagnation",
    view: "America ate the low-hanging fruit — cheap land, mass education, transformative technologies — and nothing comparably productive has replaced them. The physical world stagnated while the digital world accelerated. AI is the first technology since electricity that might break the stagnation, but the gains will cleave society into those who complement machines and everyone else. Small differences in growth rates compound: 1% vs. 2% over a century is the difference between the US and Mexico.",
  },
  {
    name: "Luke Gromen",
    role: "Fiscal Dominance",
    view: "The math on US debt service doesn't work at positive real rates. The Treasury market is the release valve. Either the Fed accommodates fiscal dominance or something breaks.",
  },
  {
    name: "Ben Hunt",
    role: "Narrative Control",
    view: "The real crisis is the collapse of institutional narratives. When the gap between the story and reality grows too wide, legitimacy evaporates. 'AI will save us' is this era's 'transitory inflation.'",
  },
];
