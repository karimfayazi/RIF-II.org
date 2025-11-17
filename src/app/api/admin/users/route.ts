import { NextRequest, NextResponse } from "next/server";
import { getDb, type UserRow } from "@/lib/db";

// GET: list users (basic fields)
export async function GET() {
	const pool = await getDb();
	const res = await pool.request().query(
		"SELECT TOP(100) USER_ID, USER_FULL_NAME, USER_TYPE, ACTIVE FROM [SJDA_Users].[dbo].[Table_User] ORDER BY USER_ID"
	);
	return NextResponse.json({ users: res.recordset as Partial<UserRow>[] });
}

// POST: create user (basic fields)
export async function POST(request: NextRequest) {
	const body = await request.json();
	const {
		USER_ID,
		USER_FULL_NAME,
		PASSWORD,
		USER_TYPE = "user",
		ACTIVE = 1,
	} = body || {};

	if (!USER_ID || !PASSWORD) {
		return NextResponse.json({ success: false, message: "USER_ID and PASSWORD required" }, { status: 400 });
	}

	const pool = await getDb();
	await pool
		.request()
		.input("USER_ID", USER_ID)
		.input("USER_FULL_NAME", USER_FULL_NAME || null)
		.input("PASSWORD", PASSWORD)
		.input("USER_TYPE", USER_TYPE)
		.input("ACTIVE", ACTIVE)
		.query(
			`INSERT INTO [SJDA_Users].[dbo].[Table_User] (USER_ID, USER_FULL_NAME, PASSWORD, USER_TYPE, ACTIVE)
			 VALUES (@USER_ID, @USER_FULL_NAME, @PASSWORD, @USER_TYPE, @ACTIVE)`
		);

	return NextResponse.json({ success: true });
}


