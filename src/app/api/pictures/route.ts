import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const mainCategory = searchParams.get('mainCategory');
		const subCategory = searchParams.get('subCategory');

		const pool = await getDb();
		let query = `
			SELECT 
				P.[MainCategory],
				P.[SubCategory],
				MAX(CONVERT(VARCHAR(10), P.[EventDate], 105)) AS [EventDate],
				COUNT(*) AS [TotalPictures],
				(
					SELECT TOP 1 [FilePath]
					FROM [_rifiiorg_db].[dbo].[tblPictures] P2
					WHERE P2.[MainCategory] = P.[MainCategory]
						AND P2.[SubCategory] = P.[SubCategory]
						AND (P2.[IsActive] = 1 OR P2.[IsActive] IS NULL)
					ORDER BY P2.[UploadDate] DESC
				) AS [PreviewImage]
			FROM [_rifiiorg_db].[dbo].[tblPictures] P
			WHERE (P.[IsActive] = 1 OR P.[IsActive] IS NULL)
		`;

		const request_obj = pool.request();

		// Add filters if provided
		if (mainCategory) {
			query += ` AND P.[MainCategory] = @mainCategory`;
			request_obj.input('mainCategory', mainCategory);
		}
		if (subCategory) {
			query += ` AND P.[SubCategory] = @subCategory`;
			request_obj.input('subCategory', subCategory);
		}

		query += `
			GROUP BY 
				P.[MainCategory],
				P.[SubCategory]
			ORDER BY 
				P.[MainCategory], 
				P.[SubCategory]
		`;

		const result = await request_obj.query(query);
		const pictures = result.recordset || [];
		
		return NextResponse.json({
			success: true,
			pictures: pictures
		});
	} catch (error) {
		console.error("Error fetching pictures:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch pictures",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
