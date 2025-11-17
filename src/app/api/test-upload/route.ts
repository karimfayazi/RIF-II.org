import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { writeFile, mkdir, stat, access } from "fs/promises";
import { constants } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
	const debugLog: string[] = [];

	try {
		debugLog.push("=== TEST UPLOAD API - DEBUG MODE ===");
		debugLog.push(`Timestamp: ${new Date().toISOString()}`);

		// Parse form data
		debugLog.push("\n--- STEP 1: Parse Form Data ---");
		const formData = await request.formData();

		const areaName = formData.get("areaName") as string;
		const fileName = formData.get("fileName") as string;
		const file = formData.get("file") as File;

		debugLog.push(`AreaName: ${areaName}`);
		debugLog.push(`FileName: ${fileName}`);
		debugLog.push(`File name: ${file?.name}`);
		debugLog.push(`File size: ${file?.size} bytes`);
		debugLog.push(`File type: ${file?.type}`);

		// Validation
		debugLog.push("\n--- STEP 2: Validation ---");
		if (!areaName || !areaName.trim()) {
			debugLog.push("✗ ERROR: Area Name is required");
			return NextResponse.json(
				{ success: false, message: "Area Name is required", debug: debugLog },
				{ status: 400 }
			);
		}

		if (!file) {
			debugLog.push("✗ ERROR: File is required");
			return NextResponse.json(
				{ success: false, message: "File is required", debug: debugLog },
				{ status: 400 }
			);
		}
		debugLog.push("✓ Validation passed");

		// Get upload path - Use hardcoded path to ensure it works
		debugLog.push("\n--- STEP 3: Get Upload Path ---");
		// Check environment first, but default to the correct httpdocs path
		let basePath = process.env.UPLOAD_PATH;
		
		if (!basePath) {
			// Hardcode the correct path: Home directory > httpdocs > test
			basePath = "~/httpdocs";
			debugLog.push(`UPLOAD_PATH not set, using home directory path`);
		}
		
		// Expand ~ to user home directory
		if (basePath.startsWith("~")) {
			const homeDir = process.env.HOME || process.env.USERPROFILE || "C:\\Users\\Administrator";
			basePath = basePath.replace("~", homeDir);
		}
		
		const uploadDir = path.join(basePath, "test");

		debugLog.push(`UPLOAD_PATH env var: ${process.env.UPLOAD_PATH || "NOT SET (using home/httpdocs)"}`);
		debugLog.push(`Home directory: ${process.env.HOME || process.env.USERPROFILE || "C:\\Users\\Administrator"}`);
		debugLog.push(`Base path: ${basePath}`);
		debugLog.push(`Upload directory: ${uploadDir}`);
		debugLog.push(`Process CWD: ${process.cwd()}`);
		debugLog.push(`Process platform: ${process.platform}`);

		// Create directory
		debugLog.push("\n--- STEP 4: Create Directory ---");
		try {
			await mkdir(uploadDir, { recursive: true });
			debugLog.push(`✓ Directory created/verified: ${uploadDir}`);

			// Check if directory is writable
			try {
				await access(uploadDir, constants.W_OK);
				debugLog.push(`✓ Directory is writable`);
			} catch (accessErr) {
				debugLog.push(`✗ Directory is NOT writable: ${accessErr}`);
			}
		} catch (mkdirErr) {
			debugLog.push(`✗ Error creating directory: ${mkdirErr}`);
			return NextResponse.json(
				{
					success: false,
					message: `Failed to create directory: ${mkdirErr}`,
					debug: debugLog,
				},
				{ status: 500 }
			);
		}

		// Generate filename
		debugLog.push("\n--- STEP 5: Generate Filename ---");
		const timestamp = Date.now();
		const fileExtension = path.extname(file.name);
		const sanitizedName = areaName.replace(/[^a-zA-Z0-9]/g, "_");
		const uniqueFileName = `${sanitizedName}_${timestamp}${fileExtension}`;

		debugLog.push(`Timestamp: ${timestamp}`);
		debugLog.push(`File extension: ${fileExtension}`);
		debugLog.push(`Sanitized name: ${sanitizedName}`);
		debugLog.push(`Unique filename: ${uniqueFileName}`);

		// Prepare file path
		debugLog.push("\n--- STEP 6: Prepare File Path ---");
		const filePath = path.join(uploadDir, uniqueFileName);
		debugLog.push(`Full file path: ${filePath}`);

		// Convert file to buffer
		debugLog.push("\n--- STEP 7: Convert File to Buffer ---");
		try {
			const bytes = await file.arrayBuffer();
			const buffer = Buffer.from(bytes);
			debugLog.push(`Buffer created successfully`);
			debugLog.push(`Buffer size: ${buffer.length} bytes`);

			// Write file
			debugLog.push("\n--- STEP 8: Write File to Disk ---");
			try {
				debugLog.push(`Attempting to write to: ${filePath}`);
				await writeFile(filePath, buffer);
				debugLog.push(`✓ File written successfully`);

				// Verify file exists
				debugLog.push("\n--- STEP 9: Verify File ---");
				try {
					const stats = await stat(filePath);
					debugLog.push(`✓ File exists`);
					debugLog.push(`File size: ${stats.size} bytes`);
					debugLog.push(`File mode: ${stats.mode}`);
					debugLog.push(`Created at: ${stats.birthtime}`);
				} catch (statErr) {
					debugLog.push(`✗ Error verifying file: ${statErr}`);
				}
			} catch (writeErr) {
				debugLog.push(`✗ Error writing file: ${writeErr}`);
				debugLog.push(`Error code: ${(writeErr as any).code}`);
				debugLog.push(`Error path: ${(writeErr as any).path}`);
				return NextResponse.json(
					{
						success: false,
						message: `Failed to write file: ${writeErr}`,
						debug: debugLog,
					},
					{ status: 500 }
				);
			}
		} catch (bufferErr) {
			debugLog.push(`✗ Error converting file to buffer: ${bufferErr}`);
			return NextResponse.json(
				{
					success: false,
					message: `Failed to convert file: ${bufferErr}`,
					debug: debugLog,
				},
				{ status: 500 }
			);
		}

		// Database insert
		debugLog.push("\n--- STEP 10: Database Insert ---");
		const dbFilePath = `https://rif-ii.org/test/${uniqueFileName}`;
		const webUrl = `https://rif-ii.org/test/${uniqueFileName}`;

		debugLog.push(`DB FilePath: ${dbFilePath}`);
		debugLog.push(`Web URL: ${webUrl}`);

		try {
			const pool = await getDb();
			debugLog.push(`✓ Database connection established`);

			const result = await pool
				.request()
				.input("AreaName", areaName)
				.input("FileName", uniqueFileName)
				.input("FilePath", dbFilePath)
				.input("UploadedBy", "Admin")
				.query(`
					INSERT INTO [_rifiiorg_db].[dbo].[tblTestUpload] 
					(AreaName, FileName, FilePath, UploadedBy, UploadedDate)
					VALUES (@AreaName, @FileName, @FilePath, @UploadedBy, GETDATE())
				`);

			debugLog.push(`✓ Database query executed`);
			debugLog.push(`Rows affected: ${result.rowsAffected[0]}`);

			if (result.rowsAffected[0] === 0) {
				debugLog.push(`✗ No rows affected`);
				return NextResponse.json(
					{ success: false, message: "Failed to insert into database", debug: debugLog },
					{ status: 500 }
				);
			}

			debugLog.push(`✓ Record inserted successfully`);
		} catch (dbErr) {
			debugLog.push(`✗ Database error: ${dbErr}`);
			return NextResponse.json(
				{ success: false, message: `Database error: ${dbErr}`, debug: debugLog },
				{ status: 500 }
			);
		}

		debugLog.push("\n--- SUCCESS ---");
		debugLog.push("All steps completed successfully!");

		return NextResponse.json({
			success: true,
			message: "File uploaded and record saved successfully",
			debug: debugLog,
			data: {
				areaName,
				fileName: uniqueFileName,
				filePath: dbFilePath,
				webUrl,
				savedToPath: filePath,
			},
		});
	} catch (error) {
		debugLog.push(`\n✗ FATAL ERROR: ${error}`);
		debugLog.push(`Error type: ${error instanceof Error ? error.constructor.name : "Unknown"}`);
		debugLog.push(`Error message: ${error instanceof Error ? error.message : String(error)}`);
		debugLog.push(`Error stack: ${error instanceof Error ? error.stack : "No stack"}`);

		return NextResponse.json(
			{
				success: false,
				message: "Upload failed",
				debug: debugLog,
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 }
		);
	}
}
