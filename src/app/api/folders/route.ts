import { createClient } from "@/lib/supabase/server";
import { debug } from "@/lib/debug";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  debug.time("API GET /api/folders");

  try {
    debug.debug("api", "GET /api/folders: Starting request");
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      debug.warn("api", "GET /api/folders: Unauthorized request");
      debug.timeEnd("API GET /api/folders");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    debug.info("api", "GET /api/folders: User authenticated", {
      userId: user.id,
    });

    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (error) {
      debug.error("api", "GET /api/folders: Database error", error);
      debug.timeEnd("API GET /api/folders");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    debug.success("api", "GET /api/folders: Success", {
      count: data?.length || 0,
    });
    debug.timeEnd("API GET /api/folders");
    return NextResponse.json(data);
  } catch (error) {
    debug.error("api", "GET /api/folders: Exception", error);
    debug.timeEnd("API GET /api/folders");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  debug.time("API POST /api/folders");

  try {
    debug.debug("api", "POST /api/folders: Starting request");
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      debug.warn("api", "POST /api/folders: Unauthorized request");
      debug.timeEnd("API POST /api/folders");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    debug.info("api", "POST /api/folders: User authenticated", {
      userId: user.id,
    });

    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      debug.warn("api", "POST /api/folders: Invalid name provided", { name });
      debug.timeEnd("API POST /api/folders");
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    debug.debug("api", "POST /api/folders: Creating folder", {
      name: name.trim(),
    });

    const { data, error } = await supabase
      .from("folders")
      .insert({
        name: name.trim(),
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      debug.error("api", "POST /api/folders: Database error", error);
      debug.timeEnd("API POST /api/folders");
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    debug.success("api", "POST /api/folders: Folder created", {
      folderId: data.id,
    });
    debug.timeEnd("API POST /api/folders");
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    debug.error("api", "POST /api/folders: Exception", error);
    debug.timeEnd("API POST /api/folders");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
