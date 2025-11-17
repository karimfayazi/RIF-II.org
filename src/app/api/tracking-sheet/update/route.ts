import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      id,
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

    if (!id || !outputID || !mainActivityName || !subActivityName) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required fields: ID, Output ID, Main Activity Name, and Sub Activity Name are required" 
      }, { status: 400 });
    }

    const pool = await getDb();

    const query = `
      UPDATE [SJDA_DB_Intervention].[dbo].[TABLE_TRACKING_SHEET] 
      SET 
        [OutputID] = @OutputID,
        [Output] = @Output,
        [MainActivityName] = @MainActivityName,
        [SubActivityName] = @SubActivityName,
        [Sub_Sub_ActivityName] = @Sub_Sub_ActivityName,
        [UnitName] = @UnitName,
        [PlannedTargets] = @PlannedTargets,
        [AchievedTargets] = @AchievedTargets,
        [ActivityProgress] = @ActivityProgress,
        [ActivityWeightage] = @ActivityWeightage,
        [PlannedStartDate] = @PlannedStartDate,
        [PlannedEndDate] = @PlannedEndDate,
        [Remarks] = @Remarks,
        [Links] = @Links,
        [Sector_Name] = @Sector_Name,
        [District] = @District,
        [Tehsil] = @Tehsil,
        [Beneficiaries_Male] = @Beneficiaries_Male,
        [Beneficiaries_Female] = @Beneficiaries_Female,
        [Total_Beneficiaries] = @Total_Beneficiaries,
        [Beneficiary_Types] = @Beneficiary_Types,
        [SubActivityID] = @SubActivityID,
        [ActivityID] = @ActivityID,
        [Sub_Sub_ActivityID] = @Sub_Sub_ActivityID,
        [ModifiedBy] = @ModifiedBy,
        [ModifiedDate] = @ModifiedDate
      WHERE [ID] = @ID
    `;

    const result = await pool.request()
      .input("ID", parseInt(id))
      .input("OutputID", parseInt(outputID))
      .input("Output", output || "")
      .input("MainActivityName", mainActivityName)
      .input("SubActivityName", subActivityName)
      .input("Sub_Sub_ActivityName", subSubActivityName || "")
      .input("UnitName", unitName || "")
      .input("PlannedTargets", parseFloat(plannedTargets) || 0)
      .input("AchievedTargets", parseFloat(achievedTargets) || 0)
      .input("ActivityProgress", parseFloat(activityProgress) || 0)
      .input("ActivityWeightage", parseFloat(activityWeightage) || 0)
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
      .input("SubActivityID", parseInt(subActivityID) || 0)
      .input("ActivityID", parseInt(activityID) || 0)
      .input("Sub_Sub_ActivityID", parseInt(subSubActivityID) || 0)
      .input("ModifiedBy", userId)
      .input("ModifiedDate", new Date())
      .query(query);

    if (result.rowsAffected[0] === 0) {
      return NextResponse.json({
        success: false,
        message: "No tracking sheet record found to update"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Tracking sheet record updated successfully"
    });

  } catch (error) {
    console.error("Error updating tracking sheet record:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update tracking sheet record"
    }, { status: 500 });
  }
}
