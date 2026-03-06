import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    // Supabase integration — uncomment and add env vars when ready:
    //
    // const supabaseUrl = process.env.SUPABASE_URL!;
    // const supabaseKey = process.env.SUPABASE_ANON_KEY!;
    // const { createClient } = await import("@supabase/supabase-js");
    // const supabase = createClient(supabaseUrl, supabaseKey);
    //
    // const { error } = await supabase
    //   .from("subscribers")
    //   .insert({ email, subscribed_at: new Date().toISOString() });
    //
    // if (error) {
    //   if (error.code === "23505") {
    //     return NextResponse.json({ message: "Already subscribed" });
    //   }
    //   throw error;
    // }

    // For now, just log and return success
    console.log(`[Subscribe] ${email}`);

    return NextResponse.json({ message: "Subscribed" });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
