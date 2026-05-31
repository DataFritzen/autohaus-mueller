import type { RawHeroValues } from "@/types/domain";

export type HeroValidationResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function validateRawHeroValues(values: RawHeroValues): HeroValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (values.age < 18 || values.age > 79) {
    errors.push("Alter muss fuer Version 1 zwischen 18 und 79 liegen.");
  }
  if (![1, 2].includes(values.gender)) {
    errors.push("Gender muss 1 oder 2 sein.");
  }
  if (values.height < 130 || values.height > 205) {
    errors.push("Groesse liegt ausserhalb der erlaubten Plausibilitaetsgrenzen.");
  }
  if (values.bodyWeight < 35 || values.bodyWeight > 230) {
    errors.push("Gewicht liegt ausserhalb der erlaubten Plausibilitaetsgrenzen.");
  }
  if (values.waistCircumference < 45 || values.waistCircumference > 180) {
    errors.push("Taillenumfang liegt ausserhalb der erlaubten Plausibilitaetsgrenzen.");
  }
  if (values.systolicBp <= values.diastolicBp) {
    errors.push("Systolischer Blutdruck muss ueber dem diastolischen Wert liegen.");
  }

  if (values.bmi < 18.5 || values.bmi > 40) {
    warnings.push("BMI liegt ausserhalb eines typischen Bereichs.");
  }
  if (values.sleepHours < 5 || values.sleepHours > 10) {
    warnings.push("Schlafstunden liegen ausserhalb des haeufigen Bereichs.");
  }
  if (values.pulse < 50 || values.pulse > 105) {
    warnings.push("Puls liegt ausserhalb des haeufigen Bereichs.");
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
  };
}
