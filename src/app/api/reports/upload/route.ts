import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		
		// Extract form fields
		const reportTitle = formData.get('reportTitle') as string;
		const description = formData.get('description') as string;
		const mainCategory = formData.get('mainCategory') as string;
		const subCategory = formData.get('subCategory') as string;
		const eventDate = formData.get('eventDate') as string;
		const uploadedBy = formData.get('uploadedBy') as string;
		
		// Get files
		const files = formData.getAll('files') as File[];
		
		if (!reportTitle || !mainCategory || !subCategory || !eventDate || !uploadedBy) {
			return NextResponse.json({
				success: false,
				message: "All required form fields must be filled"
			}, { status: 400 });
		}
		
		if (files.length === 0) {
			return NextResponse.json({
				success: false,
				message: "No files provided"
			}, { status: 400 });
		}

		// Validate file types and sizes
		const allowedTypes = [
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'application/vnd.ms-excel',
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-powerpoint',
			'application/vnd.openxmlformats-officedocument.presentationml.presentation'
		];
		
		const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
		const maxSize = 10 * 1024 * 1024; // 10MB
		
		for (const file of files) {
			const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
			
			if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
				return NextResponse.json({
					success: false,
					message: `File ${file.name} is not a supported document type`
				}, { status: 400 });
			}
			
			if (file.size > maxSize) {
				return NextResponse.json({
					success: false,
					message: `File ${file.name} is too large (max 10MB)`
				}, { status: 400 });
			}
		}

		// Create upload directory structure
		const uploadDir = join(process.cwd(), 'public', 'uploads', 'reports', mainCategory, subCategory);
		
		// Ensure directory exists
		if (!existsSync(uploadDir)) {
			await mkdir(uploadDir, { recursive: true });
		}

		const pool = await getDb();
		const uploadedFiles = [];

		// Process each file
		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			const fileExtension = file.name.split('.').pop();
			const fileName = `${Date.now()}_${i + 1}.${fileExtension}`;
			const filePath = join(uploadDir, fileName);
			const relativePath = `uploads/reports/${mainCategory}/${subCategory}/${fileName}`;
			
			// Save file to disk
			const bytes = await file.arrayBuffer();
			await writeFile(filePath, Buffer.from(bytes));
			
			// Insert into database
			const insertQuery = `
				INSERT INTO [_rifiiorg_db].[rifiiorg].[tblReports] 
				([ReportTitle], [Description], [FilePath], [EventDate], [MainCategory], [SubCategory])
				VALUES (@reportTitle, @description, @filePath, @eventDate, @mainCategory, @subCategory)
			`;
			
			const request_obj = pool.request();
			request_obj.input('reportTitle', reportTitle);
			request_obj.input('description', description || '');
			request_obj.input('filePath', `~/Uploads/Reports/${fileName}`);
			request_obj.input('eventDate', eventDate);
			request_obj.input('mainCategory', mainCategory);
			request_obj.input('subCategory', subCategory);
			
			await request_obj.query(insertQuery);
			
			uploadedFiles.push({
				originalName: file.name,
				fileName: fileName,
				filePath: relativePath
			});
		}

		return NextResponse.json({
			success: true,
			message: `Successfully uploaded ${uploadedFiles.length} report(s)`,
			uploadedFiles: uploadedFiles
		});

	} catch (error) {
		console.error("Error uploading reports:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to upload reports",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
