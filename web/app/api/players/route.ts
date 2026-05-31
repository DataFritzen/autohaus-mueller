import { NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const alias = String(body?.alias ?? "").trim() || "Anonymer Spieler";

  if (alias.length < 2 || alias.length > 32) {
    return NextResponse.json(
      { error: "Alias must be between 2 and 32 characters." },
      { status: 400 },
    );
  }

  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("players")
    .insert({
      alias,
      auth_user_id: null,
    })
    .select("id, alias")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    playerId: data.id,
    alias: data.alias,
  });
}
