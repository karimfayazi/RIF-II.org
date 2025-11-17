import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

// Simple shapefile to GeoJSON converter using shapefile library
// Note: This requires the shapefile npm package
export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const filename = searchParams.get('filename');

		if (!filename) {
			return NextResponse.json(
				{ success: false, message: "Filename parameter is required" },
				{ status: 400 }
			);
		}

		// Get the base name without extension
		const baseName = filename.replace('.shp', '');
		const shapefileDir = path.join(process.cwd(), 'public', 'maps', 'Shapefiles');
		
		// Read the shapefile components
		const shpPath = path.join(shapefileDir, `${baseName}.shp`);
		const shxPath = path.join(shapefileDir, `${baseName}.shx`);
		const dbfPath = path.join(shapefileDir, `${baseName}.dbf`);

		try {
			// Read all shapefile components
			const [shpBuffer, shxBuffer, dbfBuffer] = await Promise.all([
				readFile(shpPath),
				readFile(shxPath),
				readFile(dbfPath)
			]);

			// For now, return a message that we need to convert on client side
			// Or we can use a library like @loaders.gl/shapefile or shapefile
			// Since we don't have shapefile npm package, let's use a different approach
			
			// Return the file paths so client can load them
			return NextResponse.json({
				success: true,
				message: "Shapefile conversion will be done on client side",
				files: {
					shp: `/maps/Shapefiles/${baseName}.shp`,
					shx: `/maps/Shapefiles/${baseName}.shx`,
					dbf: `/maps/Shapefiles/${baseName}.dbf`,
					prj: `/maps/Shapefiles/${baseName}.prj`
				}
			});

		} catch (fileError) {
			console.error('Error reading shapefile:', fileError);
			return NextResponse.json(
				{ success: false, message: "Shapefile not found or cannot be read" },
				{ status: 404 }
			);
		}

	} catch (error) {
		console.error("Error in shapefile conversion:", error);
		return NextResponse.json(
			{ 
				success: false, 
				message: "Failed to process shapefile",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}

