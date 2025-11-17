import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET - Fetch all outputs
export async function GET(request: NextRequest) {
  try {
    const pool = await getDb();
    
    const query = `
      SELECT [OutputID], [Output]
      FROM [_rifiiorg_db].[dbo].[Tracking_Sheet_Outputs]
      ORDER BY [OutputID]
    `;
    
    const result = await pool.request().query(query);
    
    return NextResponse.json({
      success: true,
      outputs: result.recordset
    });
    
  } catch (error) {
    console.error("Error fetching outputs:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch outputs",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// POST - Add new output
export async function POST(request: NextRequest) {
  try {
    const pool = await getDb();
    const { OutputID, Output } = await request.json();
    
    if (!OutputID || !Output) {
      return NextResponse.json({
        success: false,
        message: "OutputID and Output are required"
      }, { status: 400 });
    }
    
    const query = `
      INSERT INTO [_rifiiorg_db].[dbo].[Tracking_Sheet_Outputs] ([OutputID], [Output])
      VALUES (@OutputID, @Output)
    `;
    
    const result = await pool.request()
      .input('OutputID', OutputID)
      .input('Output', Output)
      .query(query);
    
    return NextResponse.json({
      success: true,
      message: "Output added successfully"
    });
    
  } catch (error) {
    console.error("Error adding output:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to add output",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// PUT - Update existing output
export async function PUT(request: NextRequest) {
  try {
    const pool = await getDb();
    const { oldOutputID, OutputID, Output } = await request.json();
    
    if (!oldOutputID || !OutputID || !Output) {
      return NextResponse.json({
        success: false,
        message: "oldOutputID, OutputID and Output are required"
      }, { status: 400 });
    }
    
    const query = `
      UPDATE [_rifiiorg_db].[dbo].[Tracking_Sheet_Outputs]
      SET [OutputID] = @OutputID, [Output] = @Output
      WHERE [OutputID] = @oldOutputID
    `;
    
    const result = await pool.request()
      .input('oldOutputID', oldOutputID)
      .input('OutputID', OutputID)
      .input('Output', Output)
      .query(query);
    
    return NextResponse.json({
      success: true,
      message: "Output updated successfully"
    });
    
  } catch (error) {
    console.error("Error updating output:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to update output",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

// DELETE - Delete output
export async function DELETE(request: NextRequest) {
  try {
    const pool = await getDb();
    const { searchParams } = new URL(request.url);
    const OutputID = searchParams.get('OutputID');
    
    if (!OutputID) {
      return NextResponse.json({
        success: false,
        message: "OutputID is required"
      }, { status: 400 });
    }
    
    const query = `
      DELETE FROM [_rifiiorg_db].[dbo].[Tracking_Sheet_Outputs]
      WHERE [OutputID] = @OutputID
    `;
    
    const result = await pool.request()
      .input('OutputID', OutputID)
      .query(query);
    
    return NextResponse.json({
      success: true,
      message: "Output deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting output:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete output",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
