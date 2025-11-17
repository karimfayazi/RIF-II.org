import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// PATCH: update rights/fields for a user
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const body = await request.json();

	const allowed = [
		"USER_FULL_NAME",
		"PASSWORD",
		"RE_PASSWORD",
		"USER_TYPE",
		"DESIGNATION",
		"ACTIVE",
		"CAN_ADD",
		"CAN_UPDATE",
		"CAN_DELETE",
		"CAN_UPLOAD",
		"SEE_REPORTS",
		"PROGRAM",
		"REGION",
		"AREA_CODE",
		"SECTION",
		"FDP",
		"PLAN_INTERVENTION",
		"TRACKING_SYSTEM",
		"RC",
		"LC",
		"REPORT_TO",
		"ROP_EDIT",
		"access_loans",
		"baseline_access",
		"bank_account",
		"Supper_User",
	];

	const updates = Object.keys(body || {}).filter((k) => allowed.includes(k));
	if (updates.length === 0) {
		return NextResponse.json({ success: false, message: "No valid fields to update" }, { status: 400 });
	}

	const setClause = updates.map((k) => `[${k}] = @${k}`).join(", ");
	const pool = await getDb();
	const requestSql = pool.request().input("USER_ID", id);
	for (const key of updates) {
		requestSql.input(key, body[key]);
	}
	await requestSql.query(
		`UPDATE [SJDA_Users].[dbo].[Table_User] SET ${setClause}, UPDATE_DATE = GETDATE() WHERE [USER_ID] = @USER_ID`
	);

	return NextResponse.json({ success: true });
}


