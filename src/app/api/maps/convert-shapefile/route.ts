import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, readdir } from "fs/promises";
import path from "path";
import * as shapefile from "shapefile";

export async function POST(request: NextRequest) {
	try {
		const { filename } = await request.json();

		if (!filename) {
			return NextResponse.json(
				{ success: false, message: "Filename parameter is required" },
				{ status: 400 }
			);
		}

		// Get the base name without extension
		const baseName = filename.replace('.shp', '');
		const shapefileDir = path.join(process.cwd(), 'public', 'maps', 'Shapefiles');
		
		// Paths to shapefile components
		const shpPath = path.join(shapefileDir, `${baseName}.shp`);
		const shxPath = path.join(shapefileDir, `${baseName}.shx`);
		const dbfPath = path.join(shapefileDir, `${baseName}.dbf`);

		try {
			// Convert shapefile to GeoJSON using shapefile library
			// shapefile.open() automatically looks for .shx and .dbf files with the same base name
			const source = await shapefile.open(shpPath);

			const features: any[] = [];
			let result = await source.read();
			
			while (!result.done) {
				if (result.value) {
					features.push(result.value);
				}
				result = await source.read();
			}

			const geoJson = {
				type: "FeatureCollection",
				features: features
			};

			// Save GeoJSON to file
			const geoJsonPath = path.join(shapefileDir, `${baseName}.geojson`);
			await writeFile(
				geoJsonPath,
				JSON.stringify(geoJson, null, 2),
				'utf-8'
			);

			return NextResponse.json({
				success: true,
				message: "Shapefile converted to GeoJSON successfully",
				filename: `${baseName}.geojson`,
				path: `/maps/Shapefiles/${baseName}.geojson`,
				featureCount: features.length
			});

		} catch (fileError) {
			console.error('Error converting shapefile:', fileError);
			return NextResponse.json(
				{ 
					success: false, 
					message: "Failed to convert shapefile",
					error: fileError instanceof Error ? fileError.message : "Unknown error"
				},
				{ status: 500 }
			);
		}

	} catch (error) {
		console.error("Error in shapefile conversion API:", error);
		return NextResponse.json(
			{ 
				success: false, 
				message: "Failed to process request",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}

// GET - List all shapefiles available for conversion
export async function GET(request: NextRequest) {
	try {
		const shapefileDir = path.join(process.cwd(), 'public', 'maps', 'Shapefiles');
		const files = await readdir(shapefileDir);
		const shapefiles = files
			.filter((file: string) => file.endsWith('.shp'))
			.map((file: string) => {
				const baseName = file.replace('.shp', '');
				const hasGeoJson = files.includes(`${baseName}.geojson`);
				return {
					filename: file,
					baseName: baseName,
					hasGeoJson: hasGeoJson,
					geojsonPath: hasGeoJson ? `/maps/Shapefiles/${baseName}.geojson` : null
				};
			});

		return NextResponse.json({
			success: true,
			shapefiles: shapefiles
		});

	} catch (error) {
		console.error("Error listing shapefiles:", error);
		return NextResponse.json(
			{ 
				success: false, 
				message: "Failed to list shapefiles",
				error: error instanceof Error ? error.message : "Unknown error"
			},
			{ status: 500 }
		);
	}
}

