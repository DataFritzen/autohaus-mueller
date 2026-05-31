import { NextResponse } from "next/server";
import { generateHeroStats, normalizeRawValues } from "@/lib/hero-engine";
import { validateRawHeroValues } from "@/lib/hero-validation";
import type { RawHeroValues } from "@/types/domain";

const requiredFields: Array<keyof RawHeroValues> = [
  "age",
  "gender",
  "bmi",
  "waistCircumference",
  "height",
  "bodyWeight",
  "sittingMin",
  "alcoholAvg",
  "smokingStatus",
  "sleepHours",
  "insuranceStatus",
  "systolicBp",
  "diastolicBp",
  "pulse",
  "mentalFocus",
  "balanceStatus",
];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawValues = body?.rawValues;

  if (!rawValues || typeof rawValues !== "object") {
    return NextResponse.json(
      { error: "rawValues is required." },
      { status: 400 },
    );
  }

  const missing = requiredFields.filter((field) => rawValues[field] === undefined);
  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Missing raw values.", missing },
      { status: 400 },
    );
  }

  const numericValues = Object.fromEntries(
    requiredFields.map((field) => [field, Number(rawValues[field])]),
  ) as unknown as RawHeroValues;

  const invalid = requiredFields.filter((field) => !Number.isFinite(numericValues[field]));
  if (invalid.length > 0) {
    return NextResponse.json(
      { error: "Invalid numeric raw values.", invalid },
      { status: 400 },
    );
  }

  const normalizedRawValues = normalizeRawValues(numericValues);
  const validation = validateRawHeroValues(normalizedRawValues);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Raw values failed validation.", validation },
      { status: 400 },
    );
  }

  const derivedStats = generateHeroStats(normalizedRawValues);

  return NextResponse.json({
    rawValues: normalizedRawValues,
    derivedStats,
    validation,
  });
}
