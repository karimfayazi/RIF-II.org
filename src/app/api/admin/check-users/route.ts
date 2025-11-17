import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const pool = await getDb();
    
    // Get all users from tbl_user_access
    const query = `
      SELECT [username], [email], [access_level]
      FROM [_rifiiorg_db].[dbo].[tbl_user_access]
      ORDER BY [username]
    `;
    
    const result = await pool.request().query(query);
    
    return NextResponse.json({
      success: true,
      users: result.recordset
    });
    
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch users",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
