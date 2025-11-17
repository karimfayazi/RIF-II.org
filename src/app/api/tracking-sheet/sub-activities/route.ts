import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const pool = await getDb();
    const { searchParams } = new URL(request.url);
    const activityID = searchParams.get('ActivityID');

    let query = `
      SELECT [SubActivityID], [ActivityID], [SubActivityName]
      FROM [_rifiiorg_db].[dbo].[Tracking_Sheet_Sub_Activities]
    `;

    if (activityID) {
      // Handle both numeric and string ActivityIDs (e.g., 1, 1.1)
      const activityIdValue = isNaN(Number(activityID)) ? activityID : Number(activityID);
      query += ` WHERE CAST([ActivityID] AS NVARCHAR(50)) = CAST(@activityID AS NVARCHAR(50))`;
      const req = pool.request();
      req.input('activityID', activityIdValue);
      const result = await req.query(query);
      return NextResponse.json({ success: true, subActivities: result.recordset });
    }

    query += ` ORDER BY [SubActivityName]`;

    const req = pool.request();
    const result = await req.query(query);

    return NextResponse.json({ success: true, subActivities: result.recordset });
  } catch (error) {
    console.error('Error fetching sub activities:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch sub activities' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const pool = await getDb();
    const body = await request.json();
    const { SubActivityID, ActivityID, SubActivityName } = body;

    // Handle decimal SubActivityIDs (e.g., 3.2.1) - convert to string if needed
    const subActivityIdValue = typeof SubActivityID === 'string' ? SubActivityID : String(SubActivityID);
    const activityIdValue = typeof ActivityID === 'string' ? ActivityID : ActivityID;

    await pool.request()
      .input('SubActivityID', subActivityIdValue)
      .input('ActivityID', activityIdValue)
      .input('SubActivityName', SubActivityName)
      .query(`
        INSERT INTO [_rifiiorg_db].[dbo].[Tracking_Sheet_Sub_Activities] ([SubActivityID],[ActivityID],[SubActivityName])
        VALUES (@SubActivityID, @ActivityID, @SubActivityName)
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error creating sub activity:', error);
    return NextResponse.json({ success: false, message: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const pool = await getDb();
    const body = await request.json();
    const { SubActivityID, ActivityID, SubActivityName } = body;

    // Handle decimal SubActivityIDs (e.g., 3.2.1) - convert to string if needed
    const subActivityIdValue = typeof SubActivityID === 'string' ? SubActivityID : String(SubActivityID);
    const activityIdValue = typeof ActivityID === 'string' ? ActivityID : ActivityID;

    await pool.request()
      .input('SubActivityID', subActivityIdValue)
      .input('ActivityID', activityIdValue)
      .input('SubActivityName', SubActivityName)
      .query(`
        UPDATE [_rifiiorg_db].[dbo].[Tracking_Sheet_Sub_Activities]
        SET [ActivityID] = @ActivityID, [SubActivityName] = @SubActivityName
        WHERE CAST([SubActivityID] AS NVARCHAR(50)) = CAST(@SubActivityID AS NVARCHAR(50))
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating sub activity:', error);
    return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const pool = await getDb();
    const { searchParams } = new URL(request.url);
    const subActivityID = searchParams.get('SubActivityID');

    if (!subActivityID) {
      return NextResponse.json({ success: false, message: 'SubActivityID is required' }, { status: 400 });
    }

    // Handle decimal SubActivityIDs (e.g., 3.2.1) - keep as string
    const subActivityIdValue = subActivityID;

    await pool.request()
      .input('SubActivityID', subActivityIdValue)
      .query(`
        DELETE FROM [_rifiiorg_db].[dbo].[Tracking_Sheet_Sub_Activities]
        WHERE CAST([SubActivityID] AS NVARCHAR(50)) = CAST(@SubActivityID AS NVARCHAR(50))
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting sub activity:', error);
    return NextResponse.json({ success: false, message: 'Failed to delete' }, { status: 500 });
  }
}


