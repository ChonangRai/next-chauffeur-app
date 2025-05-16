import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helper function to extract the id from the URL
const getIdFromUrl = (url: string): string | null => {
  const urlParts = url.split("/");
  const id = urlParts[urlParts.length - 1]; // The last segment should be the id
  return id || null;
};

// Initialize Supabase with runtime checks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Environment variables NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY are missing.");
  throw new Error("Supabase configuration is incomplete. Please set the required environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Fetch a specific location by ID
export async function GET(request: Request) {
  try {
    const id = getIdFromUrl(request.url);
    if (!id) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch location";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Update a location by ID
export async function PUT(request: Request) {
  try {
    const id = getIdFromUrl(request.url);
    const body = await request.json();
    const { name, status } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    const updateData: { name?: string; status?: string } = {};
    if (name !== undefined) updateData.name = name;
    if (status !== undefined) updateData.status = status;

    const { data, error } = await supabase
      .from("locations")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update location";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE - Remove a location by ID
export async function DELETE(request: Request) {
  try {
    const id = getIdFromUrl(request.url);
    if (!id) {
      return NextResponse.json(
        { error: "Location ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("locations")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json(
      { success: true, message: "Location deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete location";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}