import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function GET() {
  let supabase: ReturnType<typeof createServiceSupabaseClient>;

  try {
    supabase = createServiceSupabaseClient();
  } catch {
    return NextResponse.json({ heroes: [] });
  }

  const { data, error } = await supabase
    .from("heroes")
    .select("id, hero_name, source, derived_stats, created_at")
    .eq("is_public", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    heroes: data.map((hero) => ({
      id: hero.id,
      heroName: hero.hero_name,
      source: hero.source,
      derivedStats: hero.derived_stats,
      createdAt: hero.created_at,
    })),
  });
}
