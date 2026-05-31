import { NextResponse } from "next/server";
import { generateHeroStats, normalizeRawValues } from "@/lib/hero-engine";
import { validateRawHeroValues } from "@/lib/hero-validation";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { HeroSource, RawHeroValues } from "@/types/domain";

const sourceValues: HeroSource[] = ["manual", "random", "mixed", "nhanes_seed"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Request body is required." }, { status: 400 });
  }

  const heroName = String(body.heroName ?? "").trim();
  const playerId = String(body.playerId ?? "").trim();
  const source = String(body.source ?? "manual") as HeroSource;

  if (heroName.length < 2 || heroName.length > 64) {
    return NextResponse.json(
      { error: "heroName must be between 2 and 64 characters." },
      { status: 400 },
    );
  }

  if (!playerId) {
    return NextResponse.json(
      { error: "playerId is required until auth flow is implemented." },
      { status: 400 },
    );
  }

  if (!sourceValues.includes(source)) {
    return NextResponse.json({ error: "Invalid hero source." }, { status: 400 });
  }

  const rawValues = coerceRawValues(body.rawValues);
  if (!rawValues) {
    return NextResponse.json({ error: "rawValues is invalid or incomplete." }, { status: 400 });
  }

  const normalizedRawValues = normalizeRawValues(rawValues);
  const validation = validateRawHeroValues(normalizedRawValues);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Raw values failed validation.", validation },
      { status: 400 },
    );
  }

  const derivedStats = generateHeroStats(normalizedRawValues);
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("heroes")
    .insert({
      player_id: playerId,
      hero_name: heroName,
      source,
      raw_values: normalizedRawValues,
      derived_stats: derivedStats,
      is_public: body.isPublic !== false,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    heroId: data.id,
    rawValues: normalizedRawValues,
    derivedStats,
    validation,
  });
}

function coerceRawValues(input: unknown): RawHeroValues | null {
  if (!input || typeof input !== "object") return null;

  const values = input as Record<string, unknown>;
  const rawValues = {
    age: Number(values.age),
    gender: Number(values.gender),
    bmi: Number(values.bmi),
    waistCircumference: Number(values.waistCircumference),
    height: Number(values.height),
    bodyWeight: Number(values.bodyWeight),
    sittingMin: Number(values.sittingMin),
    alcoholAvg: Number(values.alcoholAvg),
    smokingStatus: Number(values.smokingStatus),
    sleepHours: Number(values.sleepHours),
    insuranceStatus: Number(values.insuranceStatus),
    systolicBp: Number(values.systolicBp),
    diastolicBp: Number(values.diastolicBp),
    pulse: Number(values.pulse),
    mentalFocus: Number(values.mentalFocus),
    balanceStatus: Number(values.balanceStatus),
  };

  if (Object.values(rawValues).some((value) => !Number.isFinite(value))) {
    return null;
  }

  return rawValues as RawHeroValues;
}
