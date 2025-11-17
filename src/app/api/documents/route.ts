import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const mainCategory = searchParams.get('mainCategory');
		const subCategory = searchParams.get('subCategory');
		const searchTerm = searchParams.get('search');

		const pool = await getDb();
		let query = `
			SELECT TOP (1000) 
				[Title],
				[Description],
				[FilePath],
				[UploadDate],
				[UploadedBy],
				[FileType],
				[Documentstype],
				[AllowPriorityUsers],
				[AllowInternalUsers],
				[AllowOthersUsers],
				[Category],
				[SubCategory],
				[document_date],
				[DocumentID]
			FROM [_rifiiorg_db].[dbo].[tblDocuments]
			WHERE 1=1
		`;

		const request_obj = pool.request();

		// Add filters if provided
		if (mainCategory) {
			query += ` AND [Category] = @mainCategory`;
			request_obj.input('mainCategory', mainCategory);
		}
		if (subCategory) {
			query += ` AND [SubCategory] = @subCategory`;
			request_obj.input('subCategory', subCategory);
		}
		if (searchTerm) {
			query += ` AND ([Title] LIKE @searchTerm OR [Description] LIKE @searchTerm)`;
			request_obj.input('searchTerm', `%${searchTerm}%`);
		}

		query += ` ORDER BY [document_date] DESC, [Title]`;

		const result = await request_obj.query(query);
		const documents = result.recordset || [];
		
		return NextResponse.json({
			success: true,
			documents: documents
		});
	} catch (error) {
		console.error("Error fetching documents:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch documents",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
