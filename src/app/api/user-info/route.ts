import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
      return NextResponse.json({ success: false, user: null });
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
          [access_level]
        FROM [_rifiiorg_db].[dbo].[tbl_user_access] 
        WHERE [email] = @userId OR [username] = @userId
      `);
    
    const user = result.recordset?.[0];
    
    if (!user) {
      return NextResponse.json({ success: false, user: null });
    }

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.email, 
        name: user.full_name, 
        username: user.username,
        department: user.department,
        region: user.region
      },
      fullName: user.full_name 
    });
  } catch (error) {
    console.error("Error reading user info:", error);
    return NextResponse.json({ success: false, user: null, fullName: "" });
  }
}
