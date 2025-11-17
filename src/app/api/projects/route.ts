import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const pool = await getDb();
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const district = searchParams.get("district") || "";
    const sector = searchParams.get("sector") || "";

    let query = `
      SELECT 
        [ProjectID], [ProjectName], [Description], [StartDate], [EndDate], 
        [Status], [Budget], [AllocatedBudget], [Sector], [District], [Tehsil],
        [Beneficiaries], [Beneficiaries_Male], [Beneficiaries_Female],
        [ProjectManager], [ContactPerson], [ContactEmail], [ContactPhone],
        [Remarks], [Links], [CreatedBy], [CreatedDate], [UpdatedBy], [UpdatedDate]
      FROM [SJDA_DB_Intervention].[dbo].[TABLE_PROJECTS]
      WHERE 1=1
    `;

    if (search) {
      query += ` AND ([ProjectName] LIKE @Search OR [Description] LIKE @Search OR [ProjectManager] LIKE @Search)`;
    }
    if (status) {
      query += ` AND [Status] = @Status`;
    }
    if (district) {
      query += ` AND [District] = @District`;
    }
    if (sector) {
      query += ` AND [Sector] = @Sector`;
    }

    query += ` ORDER BY [CreatedDate] DESC`;

    const request_query = pool.request();
    
    if (search) {
      request_query.input("Search", `%${search}%`);
    }
    if (status) {
      request_query.input("Status", status);
    }
    if (district) {
      request_query.input("District", district);
    }
    if (sector) {
      request_query.input("Sector", sector);
    }

    const result = await request_query.query(query);

    return NextResponse.json({
      success: true,
      projects: result.recordset || []
    });

  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch projects",
      projects: []
    }, { status: 500 });
  }
}
