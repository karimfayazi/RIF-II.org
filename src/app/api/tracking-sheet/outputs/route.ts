import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const pool = await getDb();
    
    const query = `
      SELECT [OutputID], [Output]
      FROM [_rifiiorg_db].[dbo].[Tracking_Sheet_Outputs]
      ORDER BY [OutputID]
    `;
    
    const result = await pool.request().query(query);
    
    return NextResponse.json({
      success: true,
      outputs: result.recordset
    });
    
  } catch (error) {
    console.error("Error fetching outputs:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch outputs",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
