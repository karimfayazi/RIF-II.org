import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
	try {
		const userId = getUserIdFromRequest(request);

		if (!userId) {
			return NextResponse.json({ success: false, message: "User ID required" });
		}

		const pool = await getDb();
		const result = await pool
			.request()
			.input("userId", userId)
			.query(`
				SELECT TOP(1) 
					[username],
					[password],
					[email],
					[department],
					[full_name],
					[region],
					[contact_no],
					[access_level],
					[address],
					[access_add],
					[access_edit],
					[access_delete],
					[access_reports]
				FROM [_rifiiorg_db].[dbo].[tbl_user_access] 
				WHERE [email] = @userId OR [username] = @userId
			`);
		
		const user = result.recordset?.[0];
		
		if (!user) {
			return NextResponse.json({ success: false, message: "User not found" });
		}

		return NextResponse.json({ 
			success: true, 
			user: user
		});
	} catch (error) {
		console.error("User Profile API - Error:", error);
		return NextResponse.json({ 
			success: false, 
			message: "Failed to fetch user profile",
			error: error instanceof Error ? error.message : "Unknown error"
		}, { status: 500 });
	}
}
