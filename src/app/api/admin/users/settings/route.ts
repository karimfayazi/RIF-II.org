import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
	try {
		const pool = await getDb();
		const query = `
			SELECT 
				[username],
				[password],
				[email],
				[department],
				[full_name],
				[region],
				[contact_no],
				[access_level]
			FROM [_rifiiorg_db].[dbo].[tbl_user_access]
			ORDER BY [full_name], [username]
		`;

		const result = await pool.request().query(query);
		const users = result.recordset || [];
		
		return NextResponse.json({
			success: true,
			users: users
		});
	} catch (error) {
		console.error("Error fetching users for settings:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch users",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
