import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
		console.log("=== Fetching Test Upload Records ===");

		const pool = await getDb();
		console.log("✓ Database connection established");

		const result = await pool.request().query(`
			SELECT 
				ReportID,
				AreaName,
				FileName,
				FilePath,
				UploadedBy,
				UploadedDate
			FROM [_rifiiorg_db].[dbo].[tblTestUpload]
			ORDER BY UploadedDate DESC
		`);

		console.log(`✓ Retrieved ${result.recordset.length} records`);

		return NextResponse.json({
			success: true,
			records: result.recordset,
		});
	} catch (error) {
		console.error("✗ Error fetching records:", error);
		console.error("Error details:", {
			message: error instanceof Error ? error.message : "Unknown error",
			name: error instanceof Error ? error.name : "Unknown",
			stack: error instanceof Error ? error.stack : "No stack",
		});

		return NextResponse.json(
			{
				success: false,
				message: `Failed to fetch records: ${error instanceof Error ? error.message : "Unknown error"}`,
			},
			{ status: 500 }
		);
	}
}
