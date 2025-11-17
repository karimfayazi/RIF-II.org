import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        // Use Kakki by default per requested SQL; allow override via ?tehsil=...
        const tehsil = (searchParams.get("tehsil") || "Kakki").trim();
        const pool = await getDb();
        const result = await pool.request()
            .input("Tehsil", tehsil)
            .query(`
                SELECT TOP (1000)
                    [Name], [Tehsil], [District], [NC], [Feature], [Status],
                    TRY_CAST([Lat] AS FLOAT) AS Lat,
                    TRY_CAST([Long] AS FLOAT) AS [Long],
                    [Pre-Intervention-picture] AS PreInterventionPicture,
                    [Post-Intervention-picture] AS PostInterventionPicture
                FROM [dbo].[WaterSources]
                WHERE [Tehsil] = @Tehsil
            `);

        return NextResponse.json(result.recordset || []);
    } catch (err) {
        console.error("/api/maps/bannu/water-sources error", err);
        return NextResponse.json([], { status: 200 });
    }
}


