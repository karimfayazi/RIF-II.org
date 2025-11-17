import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserIdFromRequest } from "@/lib/auth";
import path from "path";
import { writeFile, mkdir, stat } from "fs/promises";

// GET - Fetch all GIS maps
export async function GET(request: NextRequest) {
	try {
		const pool = await getDb();
		const result = await pool.request().query(`
			SELECT 
				MapID,
				AreaName,
				MapType,
				FileName,
				FilePath,
				UploadedBy,
				UploadedDate
			FROM [_rifiiorg_db].[dbo].[TABLE_GIS_MAPS]
			ORDER BY UploadedDate DESC
		`);

		return NextResponse.json({
			success: true,
			maps: result.recordset
		});
	} catch (error) {
		console.error("Error fetching GIS maps:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to fetch GIS maps",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}

// POST - Upload new GIS map
export async function POST(request: NextRequest) {
	try {
		const userId = getUserIdFromRequest(request);
		if (!userId) {
			const cookie = request.headers.get("cookie") || "";
			console.error("Authentication failed - No userId found in cookie. Cookie header:", cookie ? "Present" : "Missing");
			return NextResponse.json(
				{ success: false, message: "Authentication required. Please ensure you are logged in." },
				{ status: 401 }
			);
		}

		// Check if user is admin
		const pool = await getDb();
		const userResult = await pool.request()
			.input('userId', userId)
			.query(`
				SELECT access_level 
				FROM [_rifiiorg_db].[dbo].[tbl_user_access] 
				WHERE email = @userId OR username = @userId
			`);

		const user = userResult.recordset[0];
		if (!user || user.access_level?.toLowerCase() !== 'admin') {
			return NextResponse.json(
				{ success: false, message: "Admin access required" },
				{ status: 403 }
			);
		}

		// Parse form data
		const formData = await request.formData();
		const areaName = formData.get('areaName') as string;
		const mapType = formData.get('mapType') as string;
		const file = formData.get('file') as File;
		const uploadedBy = formData.get('uploadedBy') as string;

		if (!areaName || !mapType || !file) {
			return NextResponse.json(
				{ success: false, message: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			return NextResponse.json(
				{ success: false, message: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed." },
				{ status: 400 }
			);
		}

		// Validate file size (max 15MB)
		if (file.size > 15 * 1024 * 1024) {
			return NextResponse.json(
				{ success: false, message: "File size must be less than 15MB" },
				{ status: 400 }
			);
		}

		// Generate unique filename
		const timestamp = Date.now();
		const fileExtension = path.extname(file.name);
		const sanitizedAreaName = areaName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
		const sanitizedMapType = mapType.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
		const fileName = `${sanitizedAreaName}_${sanitizedMapType}_${timestamp}${fileExtension}`;

		// Determine upload directory - check for environment variable first, then use public folder
		// For production, set GIS_MAPS_UPLOAD_PATH to your web server document root (e.g., C:/path/to/httpdocs)
		const externalUploadPath = process.env.GIS_MAPS_UPLOAD_PATH || process.env.UPLOAD_PATH;
		console.log('=== GIS Maps Upload Debug ===');
		console.log(`Environment variable GIS_MAPS_UPLOAD_PATH: ${process.env.GIS_MAPS_UPLOAD_PATH || 'NOT SET'}`);
		console.log(`Environment variable UPLOAD_PATH: ${process.env.UPLOAD_PATH || 'NOT SET'}`);
		console.log(`Current working directory: ${process.cwd()}`);
		
		let uploadDir: string;
		
		if (externalUploadPath) {
			// Use external path (web server document root)
			uploadDir = path.join(externalUploadPath, 'Content', 'GIS_Maps', 'Images');
			console.log(`✓ Using external upload path: ${uploadDir}`);
			console.log(`  Base path from env: ${externalUploadPath}`);
			console.log(`  Files will be accessible at: https://rif-ii.org/Content/GIS_Maps/Images/`);
		} else {
			// Default to Next.js public folder
			uploadDir = path.join(process.cwd(), 'public', 'Content', 'GIS_Maps', 'Images');
			console.log(`⚠ Using Next.js public folder: ${uploadDir}`);
			console.warn('⚠ WARNING: Files are being saved to Next.js public folder.');
			console.warn('  To save to httpdocs/Content/GIS_Maps/Images/, set GIS_MAPS_UPLOAD_PATH environment variable in .env.local');
			console.warn('  Example: GIS_MAPS_UPLOAD_PATH=C:/path/to/httpdocs');
			console.warn('  After setting, RESTART your Next.js server!');
		}
		
		try {
			await mkdir(uploadDir, { recursive: true });
			console.log(`✓ Upload directory created/verified: ${uploadDir}`);
			
			// Verify directory is accessible
			try {
				await stat(uploadDir);
				console.log(`✓ Directory exists and is accessible`);
			} catch (statError) {
				console.error(`✗ Directory exists but may not be accessible:`, statError);
			}
		} catch (error) {
			console.error(`✗ Error creating directory ${uploadDir}:`, error);
			const errorMsg = error instanceof Error ? error.message : 'Unknown error';
			console.error(`Full error details:`, error);
			return NextResponse.json(
				{ 
					success: false, 
					message: `Failed to create upload directory: ${errorMsg}`,
					debugInfo: {
						attemptedPath: uploadDir,
						basePath: externalUploadPath || 'Using public folder',
						error: errorMsg
					}
				},
				{ status: 500 }
			);
		}

		// Save file
		const filePath = path.join(uploadDir, fileName);
		try {
			const bytes = await file.arrayBuffer();
			const buffer = Buffer.from(bytes);
			await writeFile(filePath, buffer);
			console.log(`File saved successfully to: ${filePath}`);
			
			// Verify file was saved
			const stats = await stat(filePath);
			console.log(`File verification: ${fileName} exists, size: ${stats.size} bytes`);
		} catch (error) {
			console.error(`✗ Error saving file ${fileName}:`, error);
			const errorMsg = error instanceof Error ? error.message : 'Unknown error';
			console.error(`Full error details:`, error);
			console.error(`Attempted to save to: ${filePath}`);
			return NextResponse.json(
				{ 
					success: false, 
					message: `Failed to save file: ${errorMsg}`,
					debugInfo: {
						fileName,
						filePath,
						uploadDir,
						error: errorMsg
					}
				},
				{ status: 500 }
			);
		}

		// Database path - Full URL for external access
		// If external path is used, assume files are accessible at https://rif-ii.org
		const dbFilePath = `https://rif-ii.org/Content/GIS_Maps/Images/${fileName}`;

		// Insert into database
		const insertResult = await pool.request()
			.input('AreaName', areaName)
			.input('MapType', mapType)
			.input('FileName', fileName)
			.input('FilePath', dbFilePath)
			.input('UploadedBy', uploadedBy)
			.query(`
				INSERT INTO [_rifiiorg_db].[dbo].[TABLE_GIS_MAPS] 
				(AreaName, MapType, FileName, FilePath, UploadedBy, UploadedDate)
				VALUES (@AreaName, @MapType, @FileName, @FilePath, @UploadedBy, GETDATE())
			`);

		return NextResponse.json({
			success: true,
			message: "GIS map uploaded successfully",
			map: {
				areaName,
				mapType,
				fileName,
				filePath: dbFilePath,
				uploadedBy,
				savedToPath: filePath, // Include actual file system path for debugging
				accessibleAt: dbFilePath // Show where file should be accessible
			}
		});

	} catch (error) {
		console.error("Error uploading GIS map:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to upload GIS map",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}

// PUT - Update GIS map
export async function PUT(request: NextRequest) {
	try {
		const userId = getUserIdFromRequest(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Authentication required" },
				{ status: 401 }
			);
		}

		// Check if user is admin
		const pool = await getDb();
		const userResult = await pool.request()
			.input('userId', userId)
			.query(`
				SELECT access_level 
				FROM [_rifiiorg_db].[dbo].[tbl_user_access] 
				WHERE email = @userId OR username = @userId
			`);

		const user = userResult.recordset[0];
		if (!user || user.access_level?.toLowerCase() !== 'admin') {
			return NextResponse.json(
				{ success: false, message: "Admin access required" },
				{ status: 403 }
			);
		}

		const { searchParams } = new URL(request.url);
		const mapId = searchParams.get('id');

		if (!mapId) {
			return NextResponse.json(
				{ success: false, message: "Map ID is required" },
				{ status: 400 }
			);
		}

		// Parse form data
		const formData = await request.formData();
		const areaName = formData.get('areaName') as string;
		const mapType = formData.get('mapType') as string;
		const file = formData.get('file') as File | null;
		const uploadedBy = formData.get('uploadedBy') as string;

		if (!areaName || !mapType) {
			return NextResponse.json(
				{ success: false, message: "Area Name and Map Type are required" },
				{ status: 400 }
			);
		}

		let fileName = null;
		let dbFilePath = null;

		// Handle file upload if new file provided
		if (file && file.size > 0) {
			// Validate file type
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			if (!allowedTypes.includes(file.type)) {
				return NextResponse.json(
					{ success: false, message: "Invalid file type. Only JPG, PNG, GIF, and WebP are allowed." },
					{ status: 400 }
				);
			}

			// Validate file size (max 15MB)
			if (file.size > 15 * 1024 * 1024) {
				return NextResponse.json(
					{ success: false, message: "File size must be less than 15MB" },
					{ status: 400 }
				);
			}

			// Generate unique filename
			const timestamp = Date.now();
			const fileExtension = path.extname(file.name);
			const sanitizedAreaName = areaName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
			const sanitizedMapType = mapType.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
			fileName = `${sanitizedAreaName}_${sanitizedMapType}_${timestamp}${fileExtension}`;

			// Determine upload directory - check for environment variable first, then use public folder
			// For production, set GIS_MAPS_UPLOAD_PATH to your web server document root (e.g., C:/path/to/httpdocs)
			const externalUploadPath = process.env.GIS_MAPS_UPLOAD_PATH || process.env.UPLOAD_PATH;
			let uploadDir: string;
			
			if (externalUploadPath) {
				// Use external path (web server document root)
				uploadDir = path.join(externalUploadPath, 'Content', 'GIS_Maps', 'Images');
				console.log(`✓ Using external upload path: ${uploadDir}`);
				console.log(`  Files will be accessible at: https://rif-ii.org/Content/GIS_Maps/Images/`);
			} else {
				// Default to Next.js public folder
				uploadDir = path.join(process.cwd(), 'public', 'Content', 'GIS_Maps', 'Images');
				console.log(`⚠ Using Next.js public folder: ${uploadDir}`);
				console.warn('⚠ WARNING: Files are being saved to Next.js public folder.');
				console.warn('  To save to httpdocs/Content/GIS_Maps/Images/, set GIS_MAPS_UPLOAD_PATH environment variable in .env.local');
				console.warn('  Example: GIS_MAPS_UPLOAD_PATH=C:/path/to/httpdocs');
			}
			
			try {
				await mkdir(uploadDir, { recursive: true });
				console.log(`Upload directory created/verified: ${uploadDir}`);
			} catch (error) {
				console.error(`Error creating directory ${uploadDir}:`, error);
				return NextResponse.json(
					{ success: false, message: `Failed to create upload directory: ${error instanceof Error ? error.message : 'Unknown error'}` },
					{ status: 500 }
				);
			}

			// Save file
			const filePath = path.join(uploadDir, fileName);
			try {
				const bytes = await file.arrayBuffer();
				const buffer = Buffer.from(bytes);
				await writeFile(filePath, buffer);
				console.log(`File saved successfully to: ${filePath}`);
				
				// Verify file was saved
				const stats = await stat(filePath);
				console.log(`File verification: ${fileName} exists, size: ${stats.size} bytes`);
			} catch (error) {
				console.error(`Error saving file ${fileName}:`, error);
				return NextResponse.json(
					{ success: false, message: `Failed to save file: ${error instanceof Error ? error.message : 'Unknown error'}` },
					{ status: 500 }
				);
			}

			// Database path - Full URL for external access
			// If external path is used, assume files are accessible at https://rif-ii.org
			dbFilePath = `https://rif-ii.org/Content/GIS_Maps/Images/${fileName}`;
		}

		// Update database
		let updateQuery = `
			UPDATE [_rifiiorg_db].[dbo].[TABLE_GIS_MAPS] 
			SET AreaName = @AreaName, MapType = @MapType, UploadedBy = @UploadedBy
		`;
		
		if (fileName && dbFilePath) {
			updateQuery += `, FileName = @FileName, FilePath = @FilePath`;
		}
		
		updateQuery += ` WHERE MapID = @MapID`;

		const updateRequest = pool.request()
			.input('AreaName', areaName)
			.input('MapType', mapType)
			.input('UploadedBy', uploadedBy)
			.input('MapID', mapId);

		if (fileName && dbFilePath) {
			updateRequest
				.input('FileName', fileName)
				.input('FilePath', dbFilePath);
		}

		const updateResult = await updateRequest.query(updateQuery);

		if (updateResult.rowsAffected[0] === 0) {
			return NextResponse.json(
				{ success: false, message: "Map not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "GIS map updated successfully",
			map: {
				mapId,
				areaName,
				mapType,
				fileName,
				filePath: dbFilePath,
				uploadedBy
			}
		});

	} catch (error) {
		console.error("Error updating GIS map:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to update GIS map",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}

// DELETE - Remove GIS map
export async function DELETE(request: NextRequest) {
	try {
		const userId = getUserIdFromRequest(request);
		if (!userId) {
			return NextResponse.json(
				{ success: false, message: "Authentication required" },
				{ status: 401 }
			);
		}

		// Check if user is admin
		const pool = await getDb();
		const userResult = await pool.request()
			.input('userId', userId)
			.query(`
				SELECT access_level 
				FROM [_rifiiorg_db].[dbo].[tbl_user_access] 
				WHERE email = @userId OR username = @userId
			`);

		const user = userResult.recordset[0];
		if (!user || user.access_level?.toLowerCase() !== 'admin') {
			return NextResponse.json(
				{ success: false, message: "Admin access required" },
				{ status: 403 }
			);
		}

		const { searchParams } = new URL(request.url);
		const mapId = searchParams.get('id');

		if (!mapId) {
			return NextResponse.json(
				{ success: false, message: "Map ID is required" },
				{ status: 400 }
			);
		}

		// Delete from database
		const deleteResult = await pool.request()
			.input('MapID', mapId)
			.query(`
				DELETE FROM [_rifiiorg_db].[dbo].[TABLE_GIS_MAPS] 
				WHERE MapID = @MapID
			`);

		if (deleteResult.rowsAffected[0] === 0) {
			return NextResponse.json(
				{ success: false, message: "Map not found" },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			success: true,
			message: "GIS map deleted successfully"
		});

	} catch (error) {
		console.error("Error deleting GIS map:", error);
		return NextResponse.json(
			{
				success: false,
				message: "Failed to delete GIS map",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}
