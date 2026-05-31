export type HeroSource = "manual" | "random" | "mixed" | "nhanes_seed";

export type StrengthClass = "Striker" | "Athletic" | "Massive" | "Untrained";
export type AgeType =
  | "Rising Star"
  | "Elite Performer"
  | "Tactical Core"
  | "Wise Guardian"
  | "Grandmaster"
  | "Unbekannt";
export type SleepType =
  | "Sleep Deprived"
  | "Under-Rested"
  | "Optimally Rested"
  | "Heavy Sleeper";
export type HeartType = "Calm Pulse" | "Regular" | "Rapid";
export type BloodPressureStatus =
  | "Optimal"
  | "Normal"
  | "High-Normal"
  | "Hypertension";
export type AlcoholType = "Sober" | "Social Drinker" | "Tipsy Warrior" | "Drunkard";
export type MentalFocusType =
  | "Full Focus"
  | "Slight Distraction"
  | "Brain Fog"
  | "Mental Exhaustion";
export type BalanceType = "Balanced" | "Unbalanced";
export type SmokerType = "Smoker" | "Non Smoker";
export type InsuranceType = "Protection" | "No protection";

export type RawHeroValues = {
  age: number;
  gender: 1 | 2;
  bmi: number;
  waistCircumference: number;
  height: number;
  bodyWeight: number;
  sittingMin: number;
  alcoholAvg: number;
  smokingStatus: 1 | 2;
  sleepHours: number;
  insuranceStatus: 1 | 2;
  systolicBp: number;
  diastolicBp: number;
  pulse: number;
  mentalFocus: 0 | 1 | 2 | 3;
  balanceStatus: 1 | 2;
};

export type DerivedHeroStats = {
  hpTotal: number;
  atkTotal: number;
  rangeTotal: number;
  stamina: number;
  evasionScore: number;
  precisionScore: number;
  strengthClass: StrengthClass;
  ageType: AgeType;
  sleepType: SleepType;
  heartType: HeartType;
  bpStatus: BloodPressureStatus;
  alcoholType: AlcoholType;
  mentalFocusType: MentalFocusType;
  balanceType: BalanceType;
  smokerType: SmokerType;
  insuranceType: InsuranceType;
};

export type HeroSummary = {
  id: string;
  heroName: string;
  source: HeroSource;
  derivedStats: DerivedHeroStats;
  createdAt: string;
};

export type FightSummary = {
  id: string;
  hero1Id: string;
  hero2Id: string;
  winnerHeroId: string | null;
  restHpHero1: number;
  restHpHero2: number;
  roundsStarted: number;
  wasKo: boolean;
  createdAt: string;
};
