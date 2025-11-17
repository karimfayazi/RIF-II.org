import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { id } = data;

    if (!id) {
      return NextResponse.json({ 
        success: false, 
        message: "Record ID is required" 
      }, { status: 400 });
    }

    const pool = await getDb();

    const query = `
      DELETE FROM [SJDA_DB_Intervention].[dbo].[TABLE_TRACKING_SHEET]
      WHERE [ID] = @ID
    `;

    const result = await pool.request()
      .input("ID", parseInt(id))
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({
        success: false,
        message: "No tracking sheet record found to delete"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Tracking sheet record deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting tracking sheet record:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete tracking sheet record"
    }, { status: 500 });
  }
}
