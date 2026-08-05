import { NextResponse } from "next/server";
import { z } from "zod";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const localeSchema = z.object({ locale: z.enum(["en-GB", "pt-PT"]) });

export async function POST(request: Request) {
  const parsed = localeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  if (!isSupabaseConfigured()) return new NextResponse(null, { status: 204 });

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return new NextResponse(null, { status: 204 });
  const { error } = await supabase
    .from("profiles")
    .upsert({ id: user.id, locale: parsed.data.locale });
  if (error)
    return NextResponse.json(
      { error: "Unable to save preference" },
      { status: 500 },
    );
  return new NextResponse(null, { status: 204 });
}
