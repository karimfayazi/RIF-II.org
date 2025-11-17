import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const pool = await getDb();
    
    const query = `
      SELECT [OutputID], [Output Progress] AS Output_Progress
      FROM [_rifiiorg_db].[dbo].[View_Output_Progress]
      ORDER BY [OutputID]
    `;
    
    const result = await pool.request().query(query);
    
    return NextResponse.json({
      success: true,
      outputProgress: result.recordset
    });
    
  } catch (error) {
    console.error("Error fetching output progress:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch output progress",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

