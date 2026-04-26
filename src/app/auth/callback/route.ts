import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  const errorDescription = searchParams.get("error_description");

  if (errorDescription) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(errorDescription)}`,
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Ensure a row exists in `profiles` for this user. Works for both flows:
  //  - Email signup: full_name + phone come from user_metadata (set in signUp options.data)
  //  - Google OAuth: full_name comes from Google's identity (full_name | name); no phone
  // Upsert is safe whether or not a database trigger already created the row.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const meta = user.user_metadata ?? {};
    const fullName: string =
      meta.full_name ??
      meta.name ??
      user.email?.split("@")[0] ??
      "Usuario";
    const phone: string | null = meta.phone ?? null;

    const { error: upsertError } = await supabase
      .from("profiles")
      .upsert(
        {
          id: user.id,
          full_name: fullName,
          phone,
        },
        { onConflict: "id" },
      );

    if (upsertError) {
      console.error("[auth/callback] profile upsert failed:", upsertError.message);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
