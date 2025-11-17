import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const pool = await getDb();
    
    const query = `
      SELECT [District], [OutputID], [Output Progress] AS Output_Progress
      FROM [_rifiiorg_db].[dbo].[View_Output_Progress_By_District]
      ORDER BY [District], [OutputID]
    `;
    
    const result = await pool.request().query(query);
    
    return NextResponse.json({
      success: true,
      districtProgress: result.recordset
    });
    
  } catch (error) {
    console.error("Error fetching district output progress:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch district output progress",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

