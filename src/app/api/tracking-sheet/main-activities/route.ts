import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const pool = await getDb();
    const { searchParams } = new URL(request.url);
    const outputID = searchParams.get('outputID');
    
    let query = `
      SELECT [ActivityID], [MainActivityName], [OutputID]
      FROM [_rifiiorg_db].[dbo].[Tracking_Sheet_Main_Activities]
    `;
    
    if (outputID) {
      query += ` WHERE CAST([OutputID] AS NVARCHAR(50)) = @outputID`;
    }
    
    query += ` ORDER BY [MainActivityName]`;
    
    const request_query = pool.request();
    if (outputID) {
      request_query.input('outputID', outputID);
    }
    
    const result = await request_query.query(query);
    
    return NextResponse.json({
      success: true,
      activities: result.recordset
    });
    
  } catch (error) {
    console.error("Error fetching main activities:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch main activities",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const pool = await getDb();
    const body = await request.json();
    const { ActivityID, MainActivityName, OutputID } = body;

    await pool.request()
      .input('ActivityID', ActivityID)
      .input('MainActivityName', MainActivityName)
      .input('OutputID', OutputID)
      .query(`
        INSERT INTO [_rifiiorg_db].[dbo].[Tracking_Sheet_Main_Activities] ([ActivityID],[MainActivityName],[OutputID])
        VALUES (@ActivityID, @MainActivityName, @OutputID)
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating main activity:", error);
    return NextResponse.json({ success: false, message: 'Failed to create' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const pool = await getDb();
    const body = await request.json();
    const { ActivityID, MainActivityName, OutputID } = body;

    await pool.request()
      .input('ActivityID', ActivityID)
      .input('MainActivityName', MainActivityName)
      .input('OutputID', OutputID)
      .query(`
        UPDATE [_rifiiorg_db].[dbo].[Tracking_Sheet_Main_Activities]
        SET [MainActivityName] = @MainActivityName, [OutputID] = @OutputID
        WHERE [ActivityID] = @ActivityID
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating main activity:", error);
    return NextResponse.json({ success: false, message: 'Failed to update' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const pool = await getDb();
    const { searchParams } = new URL(request.url);
    const activityID = searchParams.get('ActivityID');

    if (!activityID) {
      return NextResponse.json({ success: false, message: 'ActivityID is required' }, { status: 400 });
    }

    await pool.request()
      .input('ActivityID', activityID)
      .query(`
        DELETE FROM [_rifiiorg_db].[dbo].[Tracking_Sheet_Main_Activities]
        WHERE [ActivityID] = @ActivityID
      `);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting main activity:", error);
    return NextResponse.json({ success: false, message: 'Failed to delete' }, { status: 500 });
  }
}
