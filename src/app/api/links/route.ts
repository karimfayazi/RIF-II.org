import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
	try {
		const pool = await getDb();
		const result = await pool
			.request()
			.query(
				"SELECT TOP(1000) [LinkID], [Title], [Description], [Url] FROM [_rifiiorg_db].[dbo].[ImportantLinks] ORDER BY [Title]"
			);
		
		const links = result.recordset || [];
		
		return NextResponse.json({
			success: true,
			links: links
		});
	} catch (error) {
		console.error("Error fetching links:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch links",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
