import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Define the type for the dynamic route params
type RouteParams = { params: { id: string } };

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch a specific location by ID
export async function GET(request: Request, context: RouteParams) {
  try {
    const { params } = context;
    const { id } = params;
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
export async function PUT(request: Request, context: RouteParams) {
  try {
    const { params } = context;
    const { id } = params;
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
export async function DELETE(request: Request, context: RouteParams) {
  try {
    const { params } = context;
    const { id } = params;
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