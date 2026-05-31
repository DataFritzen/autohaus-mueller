import { NextResponse } from "next/server";
import { generateHeroStats } from "@/lib/hero-engine";
import { createRandomRawValues, rerollRawFields } from "@/lib/raw-values";
import type { RawHeroValues } from "@/types/domain";

export async function POST(request: Request) {
  let seed: number | undefined;
  let currentRawValues: RawHeroValues | undefined;
  let rerollFields: Array<keyof RawHeroValues> = [];

  try {
    const body = await request.json();
    if (typeof body?.seed === "number") {
      seed = body.seed;
    }
    if (body?.rawValues && typeof body.rawValues === "object") {
      currentRawValues = body.rawValues;
    }
    if (Array.isArray(body?.rerollFields)) {
      rerollFields = body.rerollFields;
    }
  } catch {
    seed = undefined;
  }

  const rawValues =
    currentRawValues && rerollFields.length > 0
      ? rerollRawFields(currentRawValues, rerollFields, seed)
      : createRandomRawValues(seed);
  const derivedStats = generateHeroStats(rawValues);

  return NextResponse.json({
    rawValues,
    derivedStats,
  });
}
