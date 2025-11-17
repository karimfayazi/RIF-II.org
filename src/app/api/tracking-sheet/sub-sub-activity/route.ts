import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const subSubActivityID = searchParams.get('subSubActivityID');
		const outputID = searchParams.get('outputID');
		const activityID = searchParams.get('activityID');
		const subActivityID = searchParams.get('subActivityID');

		const pool = await getDb();
		let query = `
			SELECT TOP (1000) 
				[Sub_Sub_ActivityID_ID],
				[OutputID],
				[ActivityID],
				[SubActivityID],
				[Sub_Sub_ActivityID],
				[Sub_Sub_ActivityName],
				[UnitName],
				[PlannedTargets],
				[AchievedTargets],
				[ActivityProgress],
				[ActivityWeightage],
				[ActivityWeightageProgress],
				CONVERT(VARCHAR(10), [PlannedStartDate], 105) AS [PlannedStartDate],
				CONVERT(VARCHAR(10), [PlannedEndDate], 105) AS [PlannedEndDate],
				[Remarks],
				[Links],
				[Sector_Name],
				[District],
				[Tehsil],
				[Beneficiaries_Male],
				[Beneficiaries_Female],
				[Total_Beneficiaries],
				[Beneficiary_Types],
				[UserID],
				CONVERT(VARCHAR(10), [LastUpdateDate], 105) AS [LastUpdateDate]
			FROM [_rifiiorg_db].[dbo].[Tracking_Sheet_Sub_Sub_Activity]
			WHERE 1=1
		`;

		const request_obj = pool.request();

		// Add filters if provided
		if (subSubActivityID) {
			query += ` AND [Sub_Sub_ActivityID] = @subSubActivityID`;
			request_obj.input('subSubActivityID', subSubActivityID);
		}
		if (outputID) {
			query += ` AND [OutputID] = @outputID`;
			request_obj.input('outputID', outputID);
		}
		if (activityID) {
			query += ` AND [ActivityID] = @activityID`;
			request_obj.input('activityID', activityID);
		}
		if (subActivityID) {
			query += ` AND [SubActivityID] = @subActivityID`;
			request_obj.input('subActivityID', subActivityID);
		}

		query += ` ORDER BY [Sub_Sub_ActivityID], [Sub_Sub_ActivityName]`;

		const result = await request_obj.query(query);
		const subSubActivityData = result.recordset || [];
		
		return NextResponse.json({
			success: true,
			subSubActivityData: subSubActivityData
		});
	} catch (error) {
		console.error("Error fetching sub-sub activity data:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch sub-sub activity data",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}

export async function PUT(request: NextRequest) {
	try {
		const body = await request.json();
		const {
			Sub_Sub_ActivityID_ID,
			AchievedTargets,
			ActivityProgress,
			ActivityWeightageProgress,
			Remarks,
			Links,
			Beneficiaries_Male,
			Beneficiaries_Female,
			Total_Beneficiaries,
			Beneficiary_Types,
			UserID
		} = body;

		if (!Sub_Sub_ActivityID_ID) {
			return NextResponse.json(
				{ success: false, message: "Sub-Sub Activity ID is required" },
				{ status: 400 }
			);
		}

		const pool = await getDb();
		const query = `
			UPDATE [_rifiiorg_db].[dbo].[Tracking_Sheet_Sub_Sub_Activity]
			SET 
				[AchievedTargets] = @AchievedTargets,
				[ActivityProgress] = @ActivityProgress,
				[ActivityWeightageProgress] = @ActivityWeightageProgress,
				[Remarks] = @Remarks,
				[Links] = @Links,
				[Beneficiaries_Male] = @Beneficiaries_Male,
				[Beneficiaries_Female] = @Beneficiaries_Female,
				[Total_Beneficiaries] = @Total_Beneficiaries,
				[Beneficiary_Types] = @Beneficiary_Types,
				[UserID] = @UserID,
				[LastUpdateDate] = GETDATE()
			WHERE [Sub_Sub_ActivityID_ID] = @Sub_Sub_ActivityID_ID
		`;

		const result = await pool
			.request()
			.input('Sub_Sub_ActivityID_ID', Sub_Sub_ActivityID_ID)
			.input('AchievedTargets', AchievedTargets || 0)
			.input('ActivityProgress', ActivityProgress || 0)
			.input('ActivityWeightageProgress', ActivityWeightageProgress || 0)
			.input('Remarks', Remarks || '')
			.input('Links', Links || '')
			.input('Beneficiaries_Male', Beneficiaries_Male || 0)
			.input('Beneficiaries_Female', Beneficiaries_Female || 0)
			.input('Total_Beneficiaries', Total_Beneficiaries || 0)
			.input('Beneficiary_Types', Beneficiary_Types || '')
			.input('UserID', UserID || '')
			.query(query);

		return NextResponse.json({
			success: true,
			message: "Sub-sub activity updated successfully"
		});
	} catch (error) {
		console.error("Error updating sub-sub activity:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to update sub-sub activity",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}