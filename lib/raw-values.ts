import type { RawHeroValues } from "@/types/domain";
import { normalizeRawValues } from "@/lib/hero-engine";

type RandomSource = {
  next(): number;
};

function pick<T>(items: T[], rng: RandomSource): T {
  return items[Math.floor(rng.next() * items.length)];
}

function normalish(mean: number, spread: number, rng: RandomSource) {
  const total = rng.next() + rng.next() + rng.next() + rng.next();
  return mean + (total - 2) * spread;
}

function bmiForProfile(age: number, rng: RandomSource) {
  const ageLift = age > 55 ? 2 : age > 35 ? 1 : 0;
  return normalish(27 + ageLift, 5.5, rng);
}

function waistForProfile(gender: 1 | 2, bmi: number, rng: RandomSource) {
  const base = gender === 1 ? 83 : 74;
  return base + (bmi - 22) * 2.2 + normalish(0, 5, rng);
}

function pressureForProfile(age: number, bmi: number, pulse: number, rng: RandomSource) {
  const systolic = normalish(108 + age * 0.28 + Math.max(0, bmi - 25) * 0.9, 10, rng);
  const diastolic = normalish(66 + age * 0.08 + Math.max(0, bmi - 25) * 0.45, 6, rng);
  return {
    systolicBp: Math.round(systolic),
    diastolicBp: Math.round(Math.min(diastolic, systolic - 10)),
    pulse,
  };
}

export function createSeededRng(seed = Date.now()): RandomSource {
  let state = seed >>> 0;
  return {
    next() {
      state = (state * 1664525 + 1013904223) >>> 0;
      return state / 2 ** 32;
    },
  };
}

export function createRandomRawValues(seed?: number): RawHeroValues {
  const rng = createSeededRng(seed);
  const gender = pick([1, 2] as const, rng);
  const age = Math.round(18 + rng.next() * 61);
  const heightMean = gender === 1 ? 176 : 164;
  const height = normalish(heightMean, 7, rng);
  const bmi = bmiForProfile(age, rng);
  const bodyWeight = bmi * (height / 100) ** 2 + normalish(0, 3, rng);
  const waistCircumference = waistForProfile(gender, bmi, rng);
  const sleepHours = pick([5, 6, 6.5, 7, 7.5, 8, 8.5, 9, 10], rng);
  const sittingMin = pick([120, 180, 240, 300, 360, 420, 480, 540, 600], rng);
  const pulse = Math.round(normalish(70 + Math.max(0, bmi - 28) * 0.4, 9, rng));
  const pressure = pressureForProfile(age, bmi, pulse, rng);

  return normalizeRawValues({
    age,
    gender,
    bmi,
    waistCircumference,
    height,
    bodyWeight,
    sittingMin,
    alcoholAvg: pick([0, 1, 1, 1, 2, 2, 3, 4, 5], rng),
    smokingStatus: pick([1, 2, 2, 2, 2], rng),
    sleepHours,
    insuranceStatus: pick([1, 1, 1, 1, 2], rng),
    ...pressure,
    mentalFocus: pick([0, 0, 0, 1, 1, 2, 3] as const, rng),
    balanceStatus: pick([1, 1, 1, 1, 1, 2] as const, rng),
  });
}

export function rerollRawFields(
  currentValues: RawHeroValues,
  fields: Array<keyof RawHeroValues>,
  seed?: number,
): RawHeroValues {
  const rng = createSeededRng(seed);
  const randomValues = createRandomRawValues(seed);
  const nextValues = { ...currentValues };

  for (const field of fields) {
    if (field === "bodyWeight") {
      nextValues.bodyWeight = randomValues.bodyWeight;
      nextValues.bmi = Number(
        (nextValues.bodyWeight / (nextValues.height / 100) ** 2).toFixed(1),
      );
    } else if (field === "bmi") {
      nextValues.bmi = randomValues.bmi;
      nextValues.bodyWeight = Math.round(
        nextValues.bmi * (nextValues.height / 100) ** 2 + normalish(0, 2, rng),
      );
    } else if (field === "height") {
      nextValues.height = randomValues.height;
      nextValues.bodyWeight = Math.round(
        nextValues.bmi * (nextValues.height / 100) ** 2 + normalish(0, 2, rng),
      );
    } else if (field === "systolicBp" || field === "diastolicBp") {
      nextValues.systolicBp = randomValues.systolicBp;
      nextValues.diastolicBp = randomValues.diastolicBp;
    } else {
      nextValues[field] = randomValues[field] as never;
    }
  }

  return normalizeRawValues(nextValues);
}
