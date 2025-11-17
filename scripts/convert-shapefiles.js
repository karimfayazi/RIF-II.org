const { readFile, writeFile, readdir } = require('fs/promises');
const path = require('path');
const shapefile = require('shapefile');

async function convertShapefile(baseName, shapefileDir) {
	try {
		const shpPath = path.join(shapefileDir, `${baseName}.shp`);
		
		console.log(`Converting ${baseName}...`);
		
		// Convert shapefile to GeoJSON
		// shapefile.open() automatically looks for .shx and .dbf files with the same base name
		const source = await shapefile.open(shpPath);

		const features = [];
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

		console.log(`✓ Successfully converted ${baseName} (${features.length} features)`);
		return { success: true, filename: baseName, featureCount: features.length };
	} catch (error) {
		console.error(`✗ Failed to convert ${baseName}:`, error.message);
		return { success: false, filename: baseName, error: error.message };
	}
}

async function convertAllShapefiles() {
	const shapefileDir = path.join(process.cwd(), 'public', 'maps', 'Shapefiles');
	
	try {
		const files = await readdir(shapefileDir);
		const shapefiles = files
			.filter(file => file.endsWith('.shp'))
			.map(file => file.replace('.shp', ''))
			.filter(baseName => !files.includes(`${baseName}.geojson`)); // Only convert if GeoJSON doesn't exist

		if (shapefiles.length === 0) {
			console.log('No shapefiles found that need conversion.');
			return;
		}

		console.log(`Found ${shapefiles.length} shapefile(s) to convert:\n`);
		
		const results = [];
		for (const baseName of shapefiles) {
			const result = await convertShapefile(baseName, shapefileDir);
			results.push(result);
			// Small delay between conversions
			await new Promise(resolve => setTimeout(resolve, 100));
		}

		console.log('\n=== Conversion Summary ===');
		const successful = results.filter(r => r.success);
		const failed = results.filter(r => !r.success);
		
		console.log(`✓ Successfully converted: ${successful.length}`);
		successful.forEach(r => {
			console.log(`  - ${r.filename} (${r.featureCount} features)`);
		});
		
		if (failed.length > 0) {
			console.log(`\n✗ Failed: ${failed.length}`);
			failed.forEach(r => {
				console.log(`  - ${r.filename}: ${r.error}`);
			});
		}
		
	} catch (error) {
		console.error('Error:', error);
	}
}

convertAllShapefiles();

