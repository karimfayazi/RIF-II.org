import path from "path";

/**
 * Maps virtual folder paths to physical server paths
 * Equivalent to ASP.NET's Server.MapPath()
 * 
 * Example:
 *   getUploadPath("~/Content/GIS_Maps/Images/")
 *   Returns: D:/Inetpub/rif-ii.org/Content/GIS_Maps/Images/
 */
export function getUploadPath(uploadType: string): string {
	// Environment variable mapping
	const envVarName = `${uploadType.toUpperCase()}_UPLOAD_PATH`;
	const basePath = process.env[envVarName] || process.env.UPLOAD_PATH;

	if (!basePath) {
		// Fallback: use Next.js public folder
		console.warn(`⚠ ${envVarName} not set. Using Next.js public folder.`);
		return path.join(process.cwd(), "public", "uploads", uploadType.toLowerCase());
	}

	return basePath;
}

/**
 * Get the complete upload directory with subdirectories
 * Similar to Server.MapPath() with folder structure
 */
export function getUploadDir(uploadType: string, ...subDirs: string[]): string {
	const basePath = getUploadPath(uploadType);
	return path.join(basePath, ...subDirs);
}

/**
 * Virtual path to physical path mapping
 * Example: mapVirtualPath("~/Content/GIS_Maps/Images/")
 * Returns: D:/Inetpub/rif-ii.org/Content/GIS_Maps/Images/
 */
export function mapVirtualPath(virtualPath: string): string {
	// Remove ~/ prefix if present
	const cleanPath = virtualPath.replace(/^~\//, "");

	// Get base upload path from environment or use public folder
	const basePath = process.env.UPLOAD_PATH || process.env.GIS_MAPS_UPLOAD_PATH || path.join(process.cwd(), "public");

	return path.join(basePath, cleanPath);
}

/**
 * Get both virtual and physical paths
 */
export function getPaths(virtualFolderPath: string) {
	const virtualFolder = virtualFolderPath.replace(/\\/g, "/"); // Normalize path separators
	const physicalFolder = mapVirtualPath(virtualFolderPath);

	return {
		virtualFolder,
		physicalFolder,
		webUrl: `https://rif-ii.org/${virtualFolder.replace(/\\/g, "/")}`,
	};
}

/**
 * Log upload configuration for debugging
 */
export function logUploadConfig(): void {
	console.log("=== Upload Path Configuration ===");
	console.log(`UPLOAD_PATH: ${process.env.UPLOAD_PATH || "NOT SET"}`);
	console.log(`GIS_MAPS_UPLOAD_PATH: ${process.env.GIS_MAPS_UPLOAD_PATH || "NOT SET"}`);
	console.log(`TEST_UPLOAD_PATH: ${process.env.TEST_UPLOAD_PATH || "NOT SET"}`);
	console.log(`Current Working Directory: ${process.cwd()}`);
	console.log("==================================");
}
