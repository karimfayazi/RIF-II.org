import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      outputID,
      output,
      mainActivityName,
      subActivityName,
      subSubActivityName,
      unitName,
      plannedTargets,
      achievedTargets,
      activityProgress,
      activityWeightage,
      plannedStartDate,
      plannedEndDate,
      remarks,
      links,
      sectorName,
      district,
      tehsil,
      beneficiariesMale,
      beneficiariesFemale,
      totalBeneficiaries,
      beneficiaryTypes,
      subActivityID,
      activityID,
      subSubActivityID
    } = data;

    // Validate required fields for Tracking_Sheet_Sub_Sub_Activity table
    if (!outputID || outputID === "" || outputID === 0) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: Output ID is required" 
      }, { status: 400 });
    }
    if (!activityID || activityID === "" || activityID === 0 || activityID === "0") {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: Activity ID is required" 
      }, { status: 400 });
    }
    if (!subActivityID || subActivityID === "" || subActivityID === 0 || subActivityID === "0") {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: Sub Activity ID is required" 
      }, { status: 400 });
    }
    if (!subSubActivityID || subSubActivityID === "" || subSubActivityID === 0 || subSubActivityID === "0") {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: Sub-Sub Activity ID is required" 
      }, { status: 400 });
    }
    if (!subSubActivityName || subSubActivityName.trim() === "") {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: Sub-Sub Activity Name is required" 
      }, { status: 400 });
    }

    const pool = await getDb();

    // Calculate Sub_Sub_ActivityID_ID as combination: Sub_Sub_ActivityID-Sector_Name-District-Tehsil
    // Convert all values to strings and join with hyphens
    const subSubActivityIdId = [
      String(subSubActivityID || ''),
      String(sectorName || ''),
      String(district || ''),
      String(tehsil || '')
    ].join('-');

    // Insert into Tracking_Sheet_Sub_Sub_Activity table based on SQL structure
    const query = `
      INSERT INTO [_rifiiorg_db].[dbo].[Tracking_Sheet_Sub_Sub_Activity] 
      ([Sub_Sub_ActivityID_ID], [OutputID], [ActivityID], [SubActivityID], [Sub_Sub_ActivityID], [Sub_Sub_ActivityName], 
       [UnitName], [PlannedTargets], [AchievedTargets], [ActivityProgress], [ActivityWeightage], 
       [ActivityWeightageProgress], [PlannedStartDate], [PlannedEndDate], [Remarks], [Links], 
       [Sector_Name], [District], [Tehsil], [Beneficiaries_Male], [Beneficiaries_Female], 
       [Total_Beneficiaries], [Beneficiary_Types], [UserID], [LastUpdateDate])
      VALUES 
      (@Sub_Sub_ActivityID_ID, @OutputID, @ActivityID, @SubActivityID, @Sub_Sub_ActivityID, @Sub_Sub_ActivityName, 
       @UnitName, @PlannedTargets, @AchievedTargets, @ActivityProgress, @ActivityWeightage, 
       @ActivityWeightageProgress, @PlannedStartDate, @PlannedEndDate, @Remarks, @Links, 
       @Sector_Name, @District, @Tehsil, @Beneficiaries_Male, @Beneficiaries_Female, 
       @Total_Beneficiaries, @Beneficiary_Types, @UserID, GETDATE())
    `;

    // Handle decimal ActivityIDs and SubActivityIDs (e.g., 1.1, 1.1.1)
    const activityIdValue = activityID ? (typeof activityID === 'string' ? activityID : String(activityID)) : null;
    const subActivityIdValue = subActivityID ? (typeof subActivityID === 'string' ? subActivityID : String(subActivityID)) : null;
    const subSubActivityIdValue = subSubActivityID ? (typeof subSubActivityID === 'string' ? subSubActivityID : String(subSubActivityID)) : null;
    
    await pool.request()
      .input("Sub_Sub_ActivityID_ID", subSubActivityIdId)
      .input("OutputID", outputID ? (typeof outputID === 'string' ? outputID : String(outputID)) : null)
      .input("ActivityID", activityIdValue)
      .input("SubActivityID", subActivityIdValue)
      .input("Sub_Sub_ActivityID", subSubActivityIdValue)
      .input("Sub_Sub_ActivityName", subSubActivityName || "")
      .input("UnitName", unitName || "")
      .input("PlannedTargets", parseFloat(plannedTargets) || 0)
      .input("AchievedTargets", parseFloat(achievedTargets) || 0)
      .input("ActivityProgress", parseFloat(activityProgress) || 0)
      .input("ActivityWeightage", parseFloat(activityWeightage) || 0)
      .input("ActivityWeightageProgress", parseFloat(activityWeightage) * parseFloat(activityProgress) / 100 || 0)
      .input("PlannedStartDate", plannedStartDate ? new Date(plannedStartDate) : null)
      .input("PlannedEndDate", plannedEndDate ? new Date(plannedEndDate) : null)
      .input("Remarks", remarks || "")
      .input("Links", links || "")
      .input("Sector_Name", sectorName || "")
      .input("District", district || "")
      .input("Tehsil", tehsil || "")
      .input("Beneficiaries_Male", parseInt(beneficiariesMale) || 0)
      .input("Beneficiaries_Female", parseInt(beneficiariesFemale) || 0)
      .input("Total_Beneficiaries", parseInt(totalBeneficiaries) || 0)
      .input("Beneficiary_Types", beneficiaryTypes || "")
      .input("UserID", userId)
      .query(query);

    return NextResponse.json({
      success: true,
      message: "Tracking sheet record added successfully"
    });

  } catch (error) {
    console.error("Error adding tracking sheet record:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to add tracking sheet record"
    }, { status: 500 });
  }
}
