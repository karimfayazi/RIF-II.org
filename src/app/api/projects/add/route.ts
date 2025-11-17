import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Check if user has admin access
    const pool = await getDb();
    const accessQuery = `
      SELECT [access_level]
      FROM [_rifiiorg_db].[dbo].[tbl_user_access]
      WHERE [username] = @userId OR [email] = @userId
    `;
    
    const accessResult = await pool.request()
      .input('userId', userId)
      .query(accessQuery);
    
    if (accessResult.recordset.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }

    const accessLevel = accessResult.recordset[0].access_level;
    const isAdmin = accessLevel && (accessLevel.toLowerCase() === 'admin');
    
    if (!isAdmin) {
      return NextResponse.json({ 
        success: false, 
        message: "Access denied. Admin privileges required." 
      }, { status: 403 });
    }

    const data = await request.json();
    const {
      projectName,
      description,
      startDate,
      endDate,
      status,
      budget,
      allocatedBudget,
      sector,
      district,
      tehsil,
      beneficiaries,
      beneficiariesMale,
      beneficiariesFemale,
      projectManager,
      contactPerson,
      contactEmail,
      contactPhone,
      remarks,
      links
    } = data;

    if (!projectName || !startDate || !endDate) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: Project Name, Start Date, and End Date are required" 
      }, { status: 400 });
    }

    // Insert project into database
    const query = `
      INSERT INTO [SJDA_DB_Intervention].[dbo].[TABLE_PROJECTS] 
      ([ProjectName], [Description], [StartDate], [EndDate], [Status], [Budget], [AllocatedBudget],
       [Sector], [District], [Tehsil], [Beneficiaries], [Beneficiaries_Male], [Beneficiaries_Female],
       [ProjectManager], [ContactPerson], [ContactEmail], [ContactPhone], [Remarks], [Links], 
       [CreatedBy], [CreatedDate])
      VALUES 
      (@ProjectName, @Description, @StartDate, @EndDate, @Status, @Budget, @AllocatedBudget,
       @Sector, @District, @Tehsil, @Beneficiaries, @Beneficiaries_Male, @Beneficiaries_Female,
       @ProjectManager, @ContactPerson, @ContactEmail, @ContactPhone, @Remarks, @Links,
       @CreatedBy, @CreatedDate)
    `;

    await pool.request()
      .input("ProjectName", projectName)
      .input("Description", description || "")
      .input("StartDate", startDate ? new Date(startDate) : null)
      .input("EndDate", endDate ? new Date(endDate) : null)
      .input("Status", status || "Planning")
      .input("Budget", budget ? parseFloat(budget) : null)
      .input("AllocatedBudget", allocatedBudget ? parseFloat(allocatedBudget) : null)
      .input("Sector", sector || "")
      .input("District", district || "")
      .input("Tehsil", tehsil || "")
      .input("Beneficiaries", beneficiaries ? parseInt(beneficiaries) : null)
      .input("Beneficiaries_Male", beneficiariesMale ? parseInt(beneficiariesMale) : null)
      .input("Beneficiaries_Female", beneficiariesFemale ? parseInt(beneficiariesFemale) : null)
      .input("ProjectManager", projectManager || "")
      .input("ContactPerson", contactPerson || "")
      .input("ContactEmail", contactEmail || "")
      .input("ContactPhone", contactPhone || "")
      .input("Remarks", remarks || "")
      .input("Links", links || "")
      .input("CreatedBy", userId)
      .input("CreatedDate", new Date())
      .query(query);

    return NextResponse.json({
      success: true,
      message: "Project added successfully"
    });

  } catch (error) {
    console.error("Error adding project:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to add project: " + (error instanceof Error ? error.message : "Unknown error")
    }, { status: 500 });
  }
}
