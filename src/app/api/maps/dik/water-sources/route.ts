import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tehsil = (searchParams.get("tehsil") || "").trim();
        
        const pool = await getDb();
        let query = `
            SELECT TOP (1000)
                [Id], [Name], [Tehsil], [District], [NC], [Feature], [Status],
                TRY_CAST([Lat] AS FLOAT) AS Lat,
                TRY_CAST([Long] AS FLOAT) AS [Long],
                [Pre-Intervention-picture] AS PreInterventionPicture,
                [Post-Intervention-picture] AS PostInterventionPicture
            FROM [dbo].[WaterSources]
        `;
        
        const request_obj = pool.request();
        if (tehsil) {
            query += ` WHERE [Tehsil] = @Tehsil`;
            request_obj.input("Tehsil", tehsil);
        }
        
        query += ` ORDER BY [Id]`;
        
        const result = await request_obj.query(query);

        return NextResponse.json(result.recordset || []);
    } catch (err) {
        console.error("/api/maps/dik/water-sources error", err);
        return NextResponse.json([], { status: 200 });
    }
}
