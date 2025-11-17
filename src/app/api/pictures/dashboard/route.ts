import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
	try {
		const pool = await getDb();
		const query = `
			SELECT TOP (1000) 
				[GroupName],
				[MainCategory],
				[SubCategory],
				[FileName],
				[FilePath],
				CONVERT(VARCHAR(10), [EventDate], 105) AS [EventDate]
			FROM [_rifiiorg_db].[dbo].[tblPictures]
			WHERE ([IsActive] = 1 OR [IsActive] IS NULL)
			ORDER BY [EventDate] DESC
		`;

		const result = await pool.request().query(query);
		const pictures = result.recordset || [];
		
		return NextResponse.json({
			success: true,
			pictures: pictures
		});
	} catch (error) {
		console.error("Error fetching dashboard pictures:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch dashboard pictures",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
