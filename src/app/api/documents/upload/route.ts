import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
	try {
		const formData = await request.formData();
		
		// Extract form fields
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const category = formData.get('category') as string;
		const subCategory = formData.get('subCategory') as string;
		const documentDate = formData.get('documentDate') as string;
		const uploadedBy = formData.get('uploadedBy') as string;
		const fileType = formData.get('fileType') as string;
		const documentType = formData.get('documentType') as string;
		const allowPriorityUsers = formData.get('allowPriorityUsers') === 'true';
		const allowInternalUsers = formData.get('allowInternalUsers') === 'true';
		const allowOthersUsers = formData.get('allowOthersUsers') === 'true';
		
		// Get files
		const files = formData.getAll('files') as File[];
		
		if (!title || !category || !subCategory || !documentDate || !uploadedBy) {
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
			'application/vnd.openxmlformats-officedocument.presentationml.presentation',
			'text/plain',
			'application/zip',
			'application/x-rar-compressed'
		];
		
		const allowedExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'];
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
		const uploadDir = join(process.cwd(), 'public', 'uploads', 'documents', category, subCategory);
		
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
			const relativePath = `uploads/documents/${category}/${subCategory}/${fileName}`;
			
			// Save file to disk
			const bytes = await file.arrayBuffer();
			await writeFile(filePath, Buffer.from(bytes));
			
			// Insert into database
			const insertQuery = `
				INSERT INTO [_rifiiorg_db].[dbo].[tblDocuments] 
				([Title], [Description], [FilePath], [UploadDate], [UploadedBy], [FileType], [Documentstype], 
				 [AllowPriorityUsers], [AllowInternalUsers], [AllowOthersUsers], [Category], [SubCategory], [document_date])
				VALUES (@title, @description, @filePath, @uploadDate, @uploadedBy, @fileType, @documentType, 
				        @allowPriorityUsers, @allowInternalUsers, @allowOthersUsers, @category, @subCategory, @documentDate)
			`;
			
			const request_obj = pool.request();
			request_obj.input('title', title);
			request_obj.input('description', description || '');
			request_obj.input('filePath', `~/Uploads/Documents/${fileName}`);
			request_obj.input('uploadDate', new Date().toISOString());
			request_obj.input('uploadedBy', uploadedBy);
			request_obj.input('fileType', fileType || '');
			request_obj.input('documentType', documentType || '');
			request_obj.input('allowPriorityUsers', allowPriorityUsers);
			request_obj.input('allowInternalUsers', allowInternalUsers);
			request_obj.input('allowOthersUsers', allowOthersUsers);
			request_obj.input('category', category);
			request_obj.input('subCategory', subCategory);
			request_obj.input('documentDate', documentDate);
			
			await request_obj.query(insertQuery);
			
			uploadedFiles.push({
				originalName: file.name,
				fileName: fileName,
				filePath: relativePath
			});
		}

		return NextResponse.json({
			success: true,
			message: `Successfully uploaded ${uploadedFiles.length} document(s)`,
			uploadedFiles: uploadedFiles
		});

	} catch (error) {
		console.error("Error uploading documents:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to upload documents",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
