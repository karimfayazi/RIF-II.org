"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAccess } from "@/hooks/useAccess";
import { 
    Edit, 
    Trash2, 
    Eye, 
    Search,
    Filter,
    Upload,
    Database,
    MapPin,
    Calendar,
    User,
    FileImage
} from "lucide-react";
import Link from "next/link";

type GISMap = {
	MapID: number;
	AreaName: string;
	MapType: string;
	FileName: string;
	FilePath: string;
	UploadedBy: string;
	UploadedDate: string;
};

const mapTypeOptions = [
	"All Types",
	"District Maps",
	"Tehsil Maps", 
	"Demographic Maps",
	"Road Networks",
	"Boundary Maps",
	"Sanitation Maps",
	"Solid Waste Maps",
	"SW Zone Maps",
	"Water Maps",
	"Administrative Maps",
	"Infrastructure Maps",
	"Topographic Maps",
	"Land Use Maps",
	"Population Maps",
	"Economic Maps"
];

export default function ManageGISMapsPage() {
	const router = useRouter();
	const { user, getUserId } = useAuth();
	const userId = user?.id || getUserId();
	const { isAdmin, canUpload, loading: accessLoading } = useAccess(userId);

	const [maps, setMaps] = useState<GISMap[]>([]);
	const [filteredMaps, setFilteredMaps] = useState<GISMap[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    // Inline entry form state
    const [areaName, setAreaName] = useState("");
    const [mapType, setMapType] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);

	// Filter states
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedMapType, setSelectedMapType] = useState("All Types");
	const [sortBy, setSortBy] = useState<"date" | "name" | "type">("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	// Note: Do not redirect non-admin users; show Access Denied UI instead

	// Load maps
	useEffect(() => {
		fetchMaps();
	}, []);

	// Apply filters
	useEffect(() => {
		let filtered = [...maps];

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(map => 
				map.AreaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				map.MapType.toLowerCase().includes(searchTerm.toLowerCase()) ||
				map.FileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
				map.UploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Type filter
		if (selectedMapType !== "All Types") {
			filtered = filtered.filter(map => map.MapType === selectedMapType);
		}

		// Sort
		filtered.sort((a, b) => {
			let comparison = 0;
			switch (sortBy) {
				case "name":
					comparison = a.AreaName.localeCompare(b.AreaName);
					break;
				case "type":
					comparison = a.MapType.localeCompare(b.MapType);
					break;
				case "date":
				default:
					comparison = new Date(a.UploadedDate).getTime() - new Date(b.UploadedDate).getTime();
					break;
			}
			return sortOrder === "asc" ? comparison : -comparison;
		});

		setFilteredMaps(filtered);
	}, [maps, searchTerm, selectedMapType, sortBy, sortOrder]);

	const fetchMaps = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch('/api/gis-maps', {
				credentials: 'include' // Ensure cookies are sent
			});
			const result = await response.json();
			if (result.success) {
				setMaps(result.maps || []);
			} else {
				setError("Failed to fetch GIS maps");
			}
		} catch (error) {
			setError("Error loading GIS maps");
			console.error("Error fetching maps:", error);
		} finally {
			setLoading(false);
		}
	};

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0] || null;
        if (!selected) {
            setFile(null);
            return;
        }
        const allowed = ["image/jpeg","image/jpg","image/png","image/gif","image/webp"];
        if (!allowed.includes(selected.type)) {
            setError("Please upload a JPG, PNG, GIF or WebP image");
            return;
        }
        if (selected.size > 15 * 1024 * 1024) {
            setError("File size must be less than 15MB");
            return;
        }
        setError(null);
        setFile(selected);
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!areaName.trim()) {
            setError("Area Name is required");
            return;
        }
        if (!mapType) {
            setError("Map Type is required");
            return;
        }
        if (!file) {
            setError("Please choose an image file");
            return;
        }

        setUploading(true);
        setError(null);
        try {
            // Ensure we have a userId
            if (!userId) {
                setError("User authentication required. Please refresh the page and try again.");
                setUploading(false);
                return;
            }

            const fd = new FormData();
            fd.append("areaName", areaName.trim());
            fd.append("mapType", mapType);
            fd.append("file", file);
            fd.append("uploadedBy", userId);
            
            const res = await fetch("/api/gis-maps", { 
                method: "POST", 
                body: fd,
                credentials: 'include' // Ensure cookies are sent
            });
            
            const data = await res.json();
            if (!data.success) {
                let errorMsg = data.message || "Failed to add map";
                if (data.debugInfo) {
                    errorMsg += ` (Path: ${data.debugInfo.attemptedPath || data.debugInfo.filePath || 'N/A'})`;
                    console.error("Upload error details:", data.debugInfo);
                }
                setError(errorMsg);
                setUploading(false);
                return;
            }
            setSuccess("Map added successfully");
            setAreaName("");
            setMapType("");
            setFile(null);
            await fetchMaps();
            setTimeout(() => setSuccess(null), 2500);
        } catch (err) {
            setError("Error while adding map");
        } finally {
            setUploading(false);
        }
    };

	const handleDelete = async (mapId: number) => {
		try {
			const response = await fetch(`/api/gis-maps?id=${mapId}`, {
				method: 'DELETE',
				credentials: 'include' // Ensure cookies are sent
			});

			const result = await response.json();

			if (result.success) {
				setSuccess("Map deleted successfully!");
				setDeleteConfirm(null);
				await fetchMaps();
				setTimeout(() => setSuccess(null), 3000);
			} else {
				setError(result.message || "Failed to delete map");
			}
		} catch (error) {
			setError("An error occurred while deleting the map");
			console.error("Delete error:", error);
		}
	};

	const getMapTypeColor = (mapType: string) => {
		const colors: { [key: string]: string } = {
			"District Maps": "bg-blue-100 text-blue-800",
			"Tehsil Maps": "bg-green-100 text-green-800",
			"Demographic Maps": "bg-purple-100 text-purple-800",
			"Road Networks": "bg-yellow-100 text-yellow-800",
			"Boundary Maps": "bg-red-100 text-red-800",
			"Sanitation Maps": "bg-teal-100 text-teal-800",
			"Solid Waste Maps": "bg-orange-100 text-orange-800",
			"SW Zone Maps": "bg-pink-100 text-pink-800",
			"Water Maps": "bg-cyan-100 text-cyan-800",
			"Administrative Maps": "bg-indigo-100 text-indigo-800",
			"Infrastructure Maps": "bg-gray-100 text-gray-800",
		};
		return colors[mapType] || "bg-gray-100 text-gray-800";
	};

	// Show loading while checking permissions
	if (accessLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
				<span className="ml-3 text-gray-600">Loading...</span>
			</div>
		);
	}

	// Don't render if not admin
	if (!isAdmin || !canUpload) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="text-center">
					<h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
					<p className="text-gray-600">You need admin privileges to manage GIS maps.</p>
					<Link 
						href="/dashboard/maps/images" 
						className="mt-4 inline-block px-4 py-2 bg-[#0b4d2b] text-white rounded-lg hover:bg-[#0a3d24]"
					>
						View Maps Gallery
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Manage GIS Maps</h1>
				<p className="text-gray-600 mt-1">
					Complete management of TABLE_GIS_MAPS database records ({maps.length} total maps)
				</p>
			</div>

			{/* Success/Error Messages */}
			{success && (
				<div className="bg-green-50 border border-green-200 rounded-lg p-4">
					<p className="text-green-800">{success}</p>
				</div>
			)}

			{error && (
				<div className="bg-red-50 border border-red-200 rounded-lg p-4">
					<p className="text-red-800">{error}</p>
				</div>
			)}

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
					<div className="flex items-center">
						<Database className="h-8 w-8 text-blue-600" />
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-500">Total Records</p>
							<p className="text-2xl font-bold text-gray-900">{maps.length}</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
					<div className="flex items-center">
						<MapPin className="h-8 w-8 text-green-600" />
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-500">Map Types</p>
							<p className="text-2xl font-bold text-gray-900">
								{new Set(maps.map(m => m.MapType)).size}
							</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
					<div className="flex items-center">
						<FileImage className="h-8 w-8 text-purple-600" />
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-500">Files Stored</p>
							<p className="text-2xl font-bold text-gray-900">{maps.length}</p>
						</div>
					</div>
				</div>
				<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
					<div className="flex items-center">
						<User className="h-8 w-8 text-orange-600" />
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-500">Contributors</p>
							<p className="text-2xl font-bold text-gray-900">
								{new Set(maps.map(m => m.UploadedBy)).size}
							</p>
						</div>
					</div>
				</div>
			</div>

            {/* Entry Form (inline) */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New GIS Map</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area Name</label>
                        <select
                            value={areaName}
                            onChange={(e) => setAreaName(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b4d2b] focus:border-transparent"
                        >
                            <option value="">Select area...</option>
                            <option value="DIK">DIK</option>
                            <option value="Bannu">Bannu</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Map Type</label>
                        <select
                            value={mapType}
                            onChange={(e) => setMapType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b4d2b] focus:border-transparent"
                        >
                            <option value="">Select type...</option>
                            {mapTypeOptions.filter(t => t !== "All Types").map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Map Image File</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-700 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:text-gray-700 hover:file:bg-gray-50"
                        />
                        <p className="mt-1 text-xs text-gray-500">JPG/PNG/GIF/WebP up to 15MB</p>
                    </div>
                    <div className="md:col-span-3 flex items-center justify-end gap-2">
                        <button
                            type="submit"
                            disabled={uploading}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0b4d2b] text-white rounded-md hover:bg-[#0a3d24] disabled:opacity-50"
                        >
                            <Upload className="h-4 w-4" />
                            {uploading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Search</h3>
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search maps..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b4d2b] focus:border-transparent"
						/>
					</div>

					{/* Map Type Filter */}
					<div className="relative">
						<Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<select
							value={selectedMapType}
							onChange={(e) => setSelectedMapType(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b4d2b] focus:border-transparent appearance-none"
						>
							{mapTypeOptions.map(type => (
								<option key={type} value={type}>{type}</option>
							))}
						</select>
					</div>

					{/* Sort By */}
					<select
						value={sortBy}
						onChange={(e) => setSortBy(e.target.value as "date" | "name" | "type")}
						className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b4d2b] focus:border-transparent"
					>
						<option value="date">Sort by Date</option>
						<option value="name">Sort by Name</option>
						<option value="type">Sort by Type</option>
					</select>

					{/* Sort Order */}
					<select
						value={sortOrder}
						onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
						className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b4d2b] focus:border-transparent"
					>
						<option value="desc">Newest First</option>
						<option value="asc">Oldest First</option>
					</select>
				</div>

				{/* Active Filters Display */}
				{(searchTerm || selectedMapType !== "All Types") && (
					<div className="mt-4 flex items-center gap-2">
						<span className="text-sm text-gray-600">Active filters:</span>
						{searchTerm && (
							<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
								Search: "{searchTerm}"
								<button
									onClick={() => setSearchTerm("")}
									className="ml-1 text-blue-600 hover:text-blue-800"
								>
									×
								</button>
							</span>
						)}
						{selectedMapType !== "All Types" && (
							<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
								Type: {selectedMapType}
								<button
									onClick={() => setSelectedMapType("All Types")}
									className="ml-1 text-green-600 hover:text-green-800"
								>
									×
								</button>
							</span>
						)}
					</div>
				)}

				<div className="mt-4 text-sm text-gray-600">
					Showing {filteredMaps.length} of {maps.length} maps
				</div>
			</div>

			{/* GIS Maps Records Table - Based on SQL SELECT query */}
			<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
				<div className="px-6 py-4 border-b border-gray-200">
					<h3 className="text-lg font-semibold text-gray-900">GIS Maps Records</h3>
				</div>

				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0b4d2b]"></div>
						<span className="ml-3 text-gray-600">Loading records...</span>
					</div>
				) : filteredMaps.length === 0 ? (
					<div className="text-center py-12">
						<Database className="mx-auto h-12 w-12 text-gray-300 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
						<p className="text-gray-600">
							{maps.length === 0 
								? "No maps have been uploaded yet. Use the form above to add your first map." 
								: "No records match your current filters."
							}
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										AreaName
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										MapType
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										FileName
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										FilePath
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										UploadedBy
									</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
										UploadedDate
									</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredMaps.map((map) => (
									<tr key={map.MapID} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{map.AreaName}
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMapTypeColor(map.MapType)}`}>
												{map.MapType}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono">
											{map.FileName}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm">
											<button
												onClick={() => window.open(map.FilePath, '_blank')}
												className="text-blue-600 hover:text-blue-800 underline"
												title="Open file"
											>
												{map.FilePath}
											</button>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{map.UploadedBy}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{new Date(map.UploadedDate).toLocaleString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex items-center justify-end space-x-2">
												<button
													onClick={() => window.open(map.FilePath, '_blank')}
													className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded transition-colors"
													title="View Map"
												>
													<Eye className="h-4 w-4" />
												</button>
												<button
													onClick={() => router.push(`/dashboard/maps/manage/add?edit=${map.MapID}`)}
													className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded transition-colors"
													title="Edit Map"
												>
													<Edit className="h-4 w-4" />
												</button>
												<button
													onClick={() => setDeleteConfirm(map.MapID)}
													className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded transition-colors"
													title="Delete Map"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Removed informational panel as requested */}

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
						<p className="text-gray-600 mb-6">
							Are you sure you want to delete this map record from TABLE_GIS_MAPS? This action cannot be undone.
						</p>
						<div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
							<p className="text-sm text-yellow-800">
								<strong>Record ID:</strong> {deleteConfirm}
							</p>
						</div>
						<div className="flex justify-end space-x-3">
							<button
								onClick={() => setDeleteConfirm(null)}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
							>
								Cancel
							</button>
							<button
								onClick={() => handleDelete(deleteConfirm)}
								className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
							>
								Delete Record
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
