import { NextResponse, type NextRequest } from "next/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Cross-device-safe email confirmation handler.
 *
 * Supabase's default ConfirmationURL embeds a PKCE `code` that requires the
 * verifier cookie set during signup — meaning the user MUST open the email
 * link in the same browser they signed up from. That breaks the most common
 * flow (signup on laptop, open email on phone) with "PKCE code verifier not
 * found in storage".
 *
 * Templates now point here with `token_hash` + `type`. verifyOtp does not
 * need the PKCE verifier, so any browser can complete the confirmation.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  if (!tokenHash || !type) {
    return NextResponse.redirect(`${origin}/login?error=missing_token`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Mirror /auth/callback: ensure a profiles row exists for fresh signups.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    const meta = user.user_metadata ?? {};
    const fullName: string =
      meta.full_name ?? meta.name ?? user.email?.split("@")[0] ?? "Usuario";
    const phone: string | null = meta.phone ?? null;
    await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone }, { onConflict: "id" });
  }

  return NextResponse.redirect(`${origin}${next}`);
}
