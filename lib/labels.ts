import type {
  AgeType,
  AlcoholType,
  BalanceType,
  BloodPressureStatus,
  HeartType,
  InsuranceType,
  MentalFocusType,
  SleepType,
  SmokerType,
  StrengthClass,
} from "@/types/domain";

export const strengthClassLabels: Record<StrengthClass, string> = {
  Striker: "Striker",
  Athletic: "Athletic",
  Massive: "Massive",
  Untrained: "Untrained",
};

export const ageTypeLabels: Record<AgeType, string> = {
  "Rising Star": "Rising Star",
  "Elite Performer": "Elite Performer",
  "Tactical Core": "Tactical Core",
  "Wise Guardian": "Wise Guardian",
  Grandmaster: "Grandmaster",
  Unbekannt: "Unbekannt",
};

export const sleepTypeLabels: Record<SleepType, string> = {
  "Sleep Deprived": "Sleep Deprived",
  "Under-Rested": "Under-Rested",
  "Optimally Rested": "Optimally Rested",
  "Heavy Sleeper": "Heavy Sleeper",
};

export const heartTypeLabels: Record<HeartType, string> = {
  "Calm Pulse": "Calm Pulse",
  Regular: "Regular",
  Rapid: "Rapid",
};

export const bpStatusLabels: Record<BloodPressureStatus, string> = {
  Optimal: "Optimal",
  Normal: "Normal",
  "High-Normal": "High-Normal",
  Hypertension: "Hypertension",
};

export const alcoholTypeLabels: Record<AlcoholType, string> = {
  Sober: "Sober",
  "Social Drinker": "Social Drinker",
  "Tipsy Warrior": "Tipsy Warrior",
  Drunkard: "Drunkard",
};

export const mentalFocusTypeLabels: Record<MentalFocusType, string> = {
  "Full Focus": "Full Focus",
  "Slight Distraction": "Slight Distraction",
  "Brain Fog": "Brain Fog",
  "Mental Exhaustion": "Mental Exhaustion",
};

export const balanceTypeLabels: Record<BalanceType, string> = {
  Balanced: "Balanced",
  Unbalanced: "Unbalanced",
};

export const smokerTypeLabels: Record<SmokerType, string> = {
  Smoker: "Smoker",
  "Non Smoker": "Non Smoker",
};

export const insuranceTypeLabels: Record<InsuranceType, string> = {
  Protection: "Protection",
  "No protection": "No protection",
};
