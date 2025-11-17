import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PUT(request: NextRequest) {
  try {
    const { username, accessLevel } = await request.json();
    
    if (!username || !accessLevel) {
      return NextResponse.json({
        success: false,
        message: "Username and access level are required"
      }, { status: 400 });
    }

    const pool = await getDb();
    
    // Update user access level
    const query = `
      UPDATE [_rifiiorg_db].[dbo].[tbl_user_access]
      SET [access_level] = @accessLevel
      WHERE [username] = @username
    `;
    
    const result = await pool.request()
      .input('username', username)
      .input('accessLevel', accessLevel)
      .query(query);
    
    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      message: `User ${username} access level updated to ${accessLevel}`
    });
    
  } catch (error) {
    console.error("Error updating user access:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update user access",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
