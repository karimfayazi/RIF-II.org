import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin access
    const pool = await getDb();
    const accessQuery = `
      SELECT [access_level]
      FROM [_rifiiorg_db].[dbo].[tbl_user_access]
      WHERE [username] = @userId OR [email] = @userId
    `;
    
    const accessResult = await pool.request()
      .input('userId', userId)
      .query(accessQuery);
    
    if (accessResult.recordset.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    const accessLevel = accessResult.recordset[0].access_level;
    const isAdmin = accessLevel && (accessLevel.toLowerCase() === 'admin');
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: "Access denied. Admin privileges required." 
      }, { status: 403 });
    }

    const { id } = await params;
    const projectId = id;

    if (!projectId) {
      return NextResponse.json({ 
        success: false, 
        message: "Project ID is required" 
      }, { status: 400 });
    }

    const query = `
      DELETE FROM [SJDA_DB_Intervention].[dbo].[TABLE_PROJECTS]
      WHERE [ProjectID] = @ProjectID
    `;

    const result = await pool.request()
      .input("ProjectID", parseInt(projectId))
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({
        success: false,
        message: "Project not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Project deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting project:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete project: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}
