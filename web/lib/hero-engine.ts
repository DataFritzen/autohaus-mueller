import type {
  AlcoholType,
  BalanceType,
  BloodPressureStatus,
  DerivedHeroStats,
  HeartType,
  InsuranceType,
  MentalFocusType,
  RawHeroValues,
  SleepType,
  StrengthClass,
} from "@/types/domain";

type RawHeroFormulaValues = RawHeroValues & {
  agingProcessMod?: number;
  gamingBonus?: number;
};

function round1(value: number) {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function normalizeRawValues(values: RawHeroFormulaValues): RawHeroFormulaValues {
  const systolicBp = Math.round(clamp(values.systolicBp, 80, 240));
  const diastolicBp = Math.min(
    Math.round(clamp(values.diastolicBp, 40, 150)),
    systolicBp - 10,
  );

  return {
    age: Math.round(clamp(values.age, 18, 79)),
    gender: values.gender === 1 ? 1 : 2,
    bmi: round1(clamp(values.bmi, 10, 70)),
    waistCircumference: Math.round(clamp(values.waistCircumference, 45, 180)),
    height: Math.round(clamp(values.height, 130, 205)),
    bodyWeight: Math.round(clamp(values.bodyWeight, 35, 230)),
    sittingMin: Math.round(clamp(values.sittingMin, 60, 900)),
    alcoholAvg: Math.round(clamp(values.alcoholAvg, 0, 15)),
    smokingStatus: values.smokingStatus === 1 ? 1 : 2,
    sleepHours: round1(clamp(values.sleepHours, 2, 14)),
    insuranceStatus: values.insuranceStatus === 1 ? 1 : 2,
    systolicBp,
    diastolicBp: Math.max(40, diastolicBp),
    pulse: Math.round(clamp(values.pulse, 35, 140)),
    mentalFocus: Math.round(clamp(values.mentalFocus, 0, 3)) as 0 | 1 | 2 | 3,
    balanceStatus: values.balanceStatus === 2 ? 2 : 1,
    agingProcessMod: values.agingProcessMod ?? 0,
    gamingBonus: values.gamingBonus ?? 0,
  };
}

function classifyAge(age: number) {
  if (age >= 18 && age <= 35) return { ageType: "Rising Star" as const, ageHpMod: 1.2 };
  if (age > 35 && age <= 48) return { ageType: "Elite Performer" as const, ageHpMod: 1.1 };
  if (age >= 49 && age <= 52) return { ageType: "Tactical Core" as const, ageHpMod: 1 };
  if (age >= 53 && age <= 69) return { ageType: "Wise Guardian" as const, ageHpMod: 0.9 };
  if (age >= 70 && age <= 79) return { ageType: "Grandmaster" as const, ageHpMod: 0.8 };
  return { ageType: "Unbekannt" as const, ageHpMod: 1 };
}

function classifySleep(hours: number) {
  if (hours < 6) {
    return { sleepType: "Sleep Deprived" as SleepType, sleepHpMod: -15, sleepEvMod: -4 };
  }
  if (hours < 7) {
    return { sleepType: "Under-Rested" as SleepType, sleepHpMod: -5, sleepEvMod: -2 };
  }
  if (hours <= 9) {
    return { sleepType: "Optimally Rested" as SleepType, sleepHpMod: 10, sleepEvMod: 2 };
  }
  return { sleepType: "Heavy Sleeper" as SleepType, sleepHpMod: 5, sleepEvMod: 1 };
}

function classifyWaist(waistCircumference: number, gender: 1 | 2) {
  const limit = gender === 1 ? 102 : 88;
  return {
    waistType: waistCircumference >= limit ? "Broad" : "Lean",
    waistAtkMod: Math.max(0, waistCircumference - limit) * 0.2,
  };
}

function classifyBodyWeight(bodyWeight: number, gender: 1 | 2) {
  const limit = gender === 1 ? 85 : 70;
  return {
    bodyWeightType: bodyWeight >= limit ? "Heavyweight" : "Lightweight",
    bodyAtkMod: bodyWeight * 0.05 * -1,
  };
}

function classifyHeight(height: number, gender: 1 | 2) {
  const limit = gender === 1 ? 175 : 162;
  return {
    heightType: height >= limit ? "Tall" : "Small",
    highRtMod: Math.floor((height - limit) / 5) * 2,
  };
}

function classifySitting(sittingMin: number) {
  if (sittingMin < 200) return "Dynamic";
  if (sittingMin <= 450) return "Active Daily";
  return "Sedentary";
}

function classifyHeart(pulse: number) {
  if (pulse < 65) return { heartType: "Calm Pulse" as HeartType, heartMod: 1 };
  if (pulse <= 80) return { heartType: "Regular" as HeartType, heartMod: 0 };
  return { heartType: "Rapid" as HeartType, heartMod: -1 };
}

function classifyBloodPressure(values: RawHeroFormulaValues) {
  const sys = values.systolicBp;
  const dia = values.diastolicBp;

  if (sys >= 140 || dia >= 90) {
    return { bpStatus: "Hypertension" as BloodPressureStatus, bpMod: -2 };
  }
  if (sys >= 130 || dia >= 85) {
    return { bpStatus: "High-Normal" as BloodPressureStatus, bpMod: -1 };
  }
  if (sys >= 120 || dia >= 80) {
    return { bpStatus: "Normal" as BloodPressureStatus, bpMod: 0 };
  }
  return { bpStatus: "Optimal" as BloodPressureStatus, bpMod: 0 };
}

function classifyAlcohol(alcoholAvg: number) {
  if (alcoholAvg === 0) return { alcoholType: "Sober" as AlcoholType, alcEvMod: 0 };
  if (alcoholAvg < 3) {
    return { alcoholType: "Social Drinker" as AlcoholType, alcEvMod: -1 };
  }
  if (alcoholAvg < 5) {
    return { alcoholType: "Tipsy Warrior" as AlcoholType, alcEvMod: -3 };
  }
  return { alcoholType: "Drunkard" as AlcoholType, alcEvMod: -6 };
}

function classifyMentalFocus(mentalFocus: number) {
  const focus = Math.round(mentalFocus);
  if (focus === 0) {
    return {
      mentalFocusType: "Full Focus" as MentalFocusType,
      mentalRageMod: 0,
      mentalEvMod: 0,
    };
  }
  if (focus === 1) {
    return {
      mentalFocusType: "Slight Distraction" as MentalFocusType,
      mentalRageMod: 0,
      mentalEvMod: -1,
    };
  }
  if (focus === 2) {
    return {
      mentalFocusType: "Brain Fog" as MentalFocusType,
      mentalRageMod: 0,
      mentalEvMod: -3,
    };
  }
  return {
    mentalFocusType: "Mental Exhaustion" as MentalFocusType,
    mentalRageMod: 1,
    mentalEvMod: -6,
  };
}

function classifyBalance(balanceStatus: 1 | 2): BalanceType {
  return balanceStatus === 2 ? "Unbalanced" : "Balanced";
}

function classifySmoker(smokingStatus: 1 | 2) {
  return smokingStatus === 1 ? "Smoker" : "Non Smoker";
}

function classifyInsurance(insuranceStatus: 1 | 2): InsuranceType {
  return insuranceStatus === 1 ? "Protection" : "No protection";
}

function calculateAttack(bodyWeightType: string, waistType: string, bodyAtkMod: number, waistAtkMod: number) {
  let strengthClass: StrengthClass;
  let baseAtk: number;

  if (bodyWeightType === "Heavyweight" && waistType === "Lean") {
    strengthClass = "Striker";
    baseAtk = 35;
  } else if (bodyWeightType !== "Heavyweight" && waistType === "Lean") {
    strengthClass = "Athletic";
    baseAtk = 28;
  } else if (bodyWeightType === "Heavyweight" && waistType === "Broad") {
    strengthClass = "Massive";
    baseAtk = 25;
  } else {
    strengthClass = "Untrained";
    baseAtk = 18;
  }

  return {
    strengthClass,
    atkTotal: round1(Math.max(15, baseAtk + bodyAtkMod - waistAtkMod)),
  };
}

export function generateHeroStats(rawValues: RawHeroFormulaValues): DerivedHeroStats {
  const values = normalizeRawValues(rawValues);
  const age = classifyAge(values.age);
  const sleep = classifySleep(values.sleepHours);
  const waist = classifyWaist(values.waistCircumference, values.gender);
  const body = classifyBodyWeight(values.bodyWeight, values.gender);
  const height = classifyHeight(values.height, values.gender);
  const sittingType = classifySitting(values.sittingMin);
  const heart = classifyHeart(values.pulse);
  const bp = classifyBloodPressure(values);
  const alcohol = classifyAlcohol(values.alcoholAvg);
  const mental = classifyMentalFocus(values.mentalFocus);
  const attack = calculateAttack(
    body.bodyWeightType,
    waist.waistType,
    body.bodyAtkMod,
    waist.waistAtkMod,
  );

  const hpTotal = Math.max(
    10,
    round1(100 * age.ageHpMod + sleep.sleepHpMod - (values.agingProcessMod ?? 0)),
  );

  const baseRange: Record<StrengthClass, number> = {
    Striker: 20,
    Athletic: 18,
    Massive: 15,
    Untrained: 12,
  };
  const rangeTotal = Math.max(5, baseRange[attack.strengthClass] + height.highRtMod);

  const baseRounds = sittingType === "Dynamic" ? 5 : sittingType === "Active Daily" ? 4 : 3;
  const stamina = clamp(baseRounds + heart.heartMod + bp.bpMod, 3, 5);

  const baseEv: Record<StrengthClass, number> = {
    Athletic: 14,
    Striker: 12,
    Untrained: 10,
    Massive: 8,
  };
  const evasionScore = clamp(
    baseEv[attack.strengthClass] + mental.mentalEvMod + alcohol.alcEvMod,
    0,
    15,
  );

  const basePrec: Record<string, number> = {
    "Rising Star": 0,
    "Elite Performer": 1,
    "Tactical Core": 1.5,
    "Wise Guardian": 1.8,
    Grandmaster: 2,
  };
  const precisionScore = Math.min(5, (basePrec[age.ageType] ?? 0) + (values.gamingBonus ?? 0));

  return {
    hpTotal,
    atkTotal: attack.atkTotal,
    rangeTotal,
    stamina,
    evasionScore,
    precisionScore,
    strengthClass: attack.strengthClass,
    ageType: age.ageType,
    sleepType: sleep.sleepType,
    heartType: heart.heartType,
    bpStatus: bp.bpStatus,
    alcoholType: alcohol.alcoholType,
    mentalFocusType: mental.mentalFocusType,
    balanceType: classifyBalance(values.balanceStatus),
    smokerType: classifySmoker(values.smokingStatus),
    insuranceType: classifyInsurance(values.insuranceStatus),
  };
}
