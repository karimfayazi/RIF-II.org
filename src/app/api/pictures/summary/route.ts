import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
	try {
		const pool = await getDb();
		const result = await pool
			.request()
			.query(
				`SELECT 
					[GroupName],
					[MainCategory],
					[SubCategory],
					COUNT(*) as TotalPictures,
					[EventDate]
				FROM [_rifiiorg_db].[dbo].[tblPictures] 
				WHERE ([IsActive] = 1 OR [IsActive] IS NULL)
				GROUP BY [GroupName], [MainCategory], [SubCategory], [EventDate]
				ORDER BY [EventDate] DESC, [GroupName]`
			);
		
		const summary = result.recordset || [];
		
		return NextResponse.json({
			success: true,
			summary: summary
		});
	} catch (error) {
		console.error("Error fetching picture summary:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch picture summary",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
