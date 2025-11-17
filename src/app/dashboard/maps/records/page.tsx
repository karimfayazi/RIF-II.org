"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAccess } from "@/hooks/useAccess";
import {
	Download,
	Trash2,
	Eye,
	Edit,
	Search,
	Filter,
	Calendar,
	User,
	FileImage,
	AlertCircle,
	CheckCircle,
	X,
	ChevronUp,
	ChevronDown,
} from "lucide-react";

type GISMapRecord = {
	MapID: number;
	AreaName: string;
	MapType: string;
	FileName: string;
	FilePath: string;
	UploadedBy: string;
	UploadedDate: string;
};

const mapTypeColors: { [key: string]: string } = {
	"Boundary Maps": "bg-blue-100 text-blue-800",
	"Sanitation Maps": "bg-green-100 text-green-800",
	"Water Supply Maps": "bg-cyan-100 text-cyan-800",
	"District Maps": "bg-purple-100 text-purple-800",
	"Demographic Maps": "bg-orange-100 text-orange-800",
	"Road Networks": "bg-red-100 text-red-800",
};

export default function GISMapsRecordsPage() {
	const router = useRouter();
	const { user, loading: authLoading } = useAuth();
	const { isAdmin } = useAccess();

	const [records, setRecords] = useState<GISMapRecord[]>([]);
	const [filteredRecords, setFilteredRecords] = useState<GISMapRecord[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const [searchTerm, setSearchTerm] = useState("");
	const [selectedAreaName, setSelectedAreaName] = useState("All");
	const [selectedMapType, setSelectedMapType] = useState("All");
	const [sortBy, setSortBy] = useState<"date" | "name" | "type">("date");
	const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
	const [previewMap, setPreviewMap] = useState<GISMapRecord | null>(null);

	// Fetch all records
	const fetchRecords = async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch("/api/gis-maps", {
				credentials: "include",
			});
			const result = await response.json();

			if (result.success) {
				setRecords(result.maps || []);
			} else {
				setError("Failed to fetch records");
			}
		} catch (err) {
			setError("Error fetching records: " + (err instanceof Error ? err.message : "Unknown error"));
		} finally {
			setLoading(false);
		}
	};

	// Filter and sort records
	useEffect(() => {
		let filtered = [...records];

		// Search filter
		if (searchTerm) {
			filtered = filtered.filter(
				(record) =>
					record.AreaName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					record.FileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
					record.MapType.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Area Name filter
		if (selectedAreaName !== "All") {
			filtered = filtered.filter((record) => record.AreaName === selectedAreaName);
		}

		// Map Type filter
		if (selectedMapType !== "All") {
			filtered = filtered.filter((record) => record.MapType === selectedMapType);
		}

		// Sorting
		filtered.sort((a, b) => {
			let aVal, bVal;

			if (sortBy === "date") {
				aVal = new Date(a.UploadedDate).getTime();
				bVal = new Date(b.UploadedDate).getTime();
			} else if (sortBy === "name") {
				aVal = a.AreaName.toLowerCase();
				bVal = b.AreaName.toLowerCase();
			} else {
				aVal = a.MapType.toLowerCase();
				bVal = b.MapType.toLowerCase();
			}

			return sortOrder === "asc" ? (aVal > bVal ? 1 : -1) : aVal < bVal ? 1 : -1;
		});

		setFilteredRecords(filtered);
	}, [records, searchTerm, selectedAreaName, selectedMapType, sortBy, sortOrder]);

	// Download file
	const handleDownload = (record: GISMapRecord) => {
		if (record.FilePath) {
			window.open(record.FilePath, "_blank");
		}
	};

	// Delete record
	const handleDelete = async (mapId: number) => {
		try {
			const response = await fetch(`/api/gis-maps?id=${mapId}`, {
				method: "DELETE",
				credentials: "include",
			});

			const result = await response.json();

			if (result.success) {
				setSuccess("Map deleted successfully");
				setDeleteConfirm(null);
				await fetchRecords();
				setTimeout(() => setSuccess(null), 3000);
			} else {
				setError(result.message || "Failed to delete map");
			}
		} catch (err) {
			setError("Error deleting map: " + (err instanceof Error ? err.message : "Unknown error"));
		}
	};

	// Get unique values for filters
	const uniqueAreaNames = ["All", ...new Set(records.map((r) => r.AreaName))];
	const uniqueMapTypes = ["All", ...new Set(records.map((r) => r.MapType))];

	useEffect(() => {
		fetchRecords();
	}, []);

	if (authLoading) {
		return (
			<div className="flex items-center justify-center py-12">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
				<span className="ml-3 text-gray-600">Loading...</span>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">GIS Maps Records</h1>
				<p className="text-gray-600 mt-1">View and manage all uploaded GIS maps</p>
			</div>

			{/* Success/Error Messages */}
			{success && (
				<div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
					<CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
					<p className="text-green-800">{success}</p>
				</div>
			)}

			{error && (
				<div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
					<AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
					<p className="text-red-800">{error}</p>
				</div>
			)}

			{/* Statistics Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="flex items-center">
						<FileImage className="h-8 w-8 text-blue-600" />
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-500">Total Maps</p>
							<p className="text-2xl font-bold text-gray-900">{records.length}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="flex items-center">
						<Filter className="h-8 w-8 text-green-600" />
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-500">Unique Areas</p>
							<p className="text-2xl font-bold text-gray-900">{uniqueAreaNames.length - 1}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="flex items-center">
						<Filter className="h-8 w-8 text-purple-600" />
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-500">Map Types</p>
							<p className="text-2xl font-bold text-gray-900">{uniqueMapTypes.length - 1}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border border-gray-200 p-4">
					<div className="flex items-center">
						<User className="h-8 w-8 text-orange-600" />
						<div className="ml-3">
							<p className="text-sm font-medium text-gray-500">Contributors</p>
							<p className="text-2xl font-bold text-gray-900">{new Set(records.map((r) => r.UploadedBy)).size}</p>
						</div>
					</div>
				</div>
			</div>

			{/* Filters and Search */}
			<div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
				<h3 className="text-lg font-semibold text-gray-900">Search and Filter</h3>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
					{/* Search */}
					<div className="relative">
						<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
						<input
							type="text"
							placeholder="Search by name, area, or type..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b4d2b]"
						/>
					</div>

					{/* Area Name Filter */}
					<select
						value={selectedAreaName}
						onChange={(e) => setSelectedAreaName(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b4d2b]"
					>
						{uniqueAreaNames.map((area) => (
							<option key={area} value={area}>
								{area === "All" ? "All Areas" : area}
							</option>
						))}
					</select>

					{/* Map Type Filter */}
					<select
						value={selectedMapType}
						onChange={(e) => setSelectedMapType(e.target.value)}
						className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b4d2b]"
					>
						{uniqueMapTypes.map((type) => (
							<option key={type} value={type}>
								{type === "All" ? "All Types" : type}
							</option>
						))}
					</select>

					{/* Sort By */}
					<div className="flex gap-2">
						<select
							value={sortBy}
							onChange={(e) => setSortBy(e.target.value as "date" | "name" | "type")}
							className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b4d2b]"
						>
							<option value="date">Sort by Date</option>
							<option value="name">Sort by Name</option>
							<option value="type">Sort by Type</option>
						</select>

						<button
							onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
							className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
						>
							{sortOrder === "asc" ? (
								<ChevronUp className="h-4 w-4" />
							) : (
								<ChevronDown className="h-4 w-4" />
							)}
						</button>
					</div>
				</div>

				<div className="text-sm text-gray-600">
					Showing {filteredRecords.length} of {records.length} maps
				</div>
			</div>

			{/* Records Table */}
			<div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
				{loading ? (
					<div className="flex items-center justify-center py-12">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0b4d2b]"></div>
						<span className="ml-3 text-gray-600">Loading records...</span>
					</div>
				) : filteredRecords.length === 0 ? (
					<div className="text-center py-12">
						<FileImage className="mx-auto h-12 w-12 text-gray-300 mb-4" />
						<h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
						<p className="text-gray-600">
							{records.length === 0 ? "No maps uploaded yet" : "No maps match your filters"}
						</p>
					</div>
				) : (
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">MapID</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Area Name</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Map Type</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uploaded By</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Upload Date</th>
									<th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gray-200">
								{filteredRecords.map((record) => (
									<tr key={record.MapID} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
											#{record.MapID}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.AreaName}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span
												className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													mapTypeColors[record.MapType] || "bg-gray-100 text-gray-800"
												}`}
											>
												{record.MapType}
											</span>
										</td>
										<td className="px-6 py-4 text-sm text-gray-700 font-mono">{record.FileName}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.UploadedBy}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
											{new Date(record.UploadedDate).toLocaleDateString()} {new Date(record.UploadedDate).toLocaleTimeString()}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
											<div className="flex items-center justify-end space-x-2">
												<button
													onClick={() => setPreviewMap(record)}
													className="text-blue-600 hover:text-blue-900 p-1 hover:bg-blue-100 rounded transition-colors"
													title="View Map"
												>
													<Eye className="h-4 w-4" />
												</button>

												<button
													onClick={() => handleDownload(record)}
													className="text-green-600 hover:text-green-900 p-1 hover:bg-green-100 rounded transition-colors"
													title="Download Map"
												>
													<Download className="h-4 w-4" />
												</button>

												{isAdmin && (
													<button
														onClick={() => router.push(`/dashboard/maps/manage/add?edit=${record.MapID}`)}
														className="text-orange-600 hover:text-orange-900 p-1 hover:bg-orange-100 rounded transition-colors"
														title="Edit Map"
													>
														<Edit className="h-4 w-4" />
													</button>
												)}

												{isAdmin && (
													<button
														onClick={() => setDeleteConfirm(record.MapID)}
														className="text-red-600 hover:text-red-900 p-1 hover:bg-red-100 rounded transition-colors"
														title="Delete Map"
													>
														<Trash2 className="h-4 w-4" />
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Preview Modal */}
			{previewMap && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
						<div className="p-6">
							<div className="flex justify-between items-start mb-4">
								<h2 className="text-2xl font-bold text-gray-900">{previewMap.AreaName}</h2>
								<button
									onClick={() => setPreviewMap(null)}
									className="text-gray-400 hover:text-gray-600"
								>
									<X className="h-6 w-6" />
								</button>
							</div>

							<div className="space-y-4">
								<div>
									<p className="text-sm font-medium text-gray-500">Map Type</p>
									<p className="text-lg text-gray-900">{previewMap.MapType}</p>
								</div>

								<div>
									<p className="text-sm font-medium text-gray-500">File Name</p>
									<p className="text-lg text-gray-900 font-mono">{previewMap.FileName}</p>
								</div>

								<div>
									<p className="text-sm font-medium text-gray-500">Uploaded By</p>
									<p className="text-lg text-gray-900">{previewMap.UploadedBy}</p>
								</div>

								<div>
									<p className="text-sm font-medium text-gray-500">Upload Date</p>
									<p className="text-lg text-gray-900">
										{new Date(previewMap.UploadedDate).toLocaleString()}
									</p>
								</div>

								<div>
									<p className="text-sm font-medium text-gray-500">File Path</p>
									<a
										href={previewMap.FilePath}
										target="_blank"
										rel="noopener noreferrer"
										className="text-blue-600 hover:text-blue-800 break-all"
									>
										{previewMap.FilePath}
									</a>
								</div>

								<div className="flex gap-3 pt-6">
									<button
										onClick={() => handleDownload(previewMap)}
										className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
									>
										<Download className="h-4 w-4" />
										Download
									</button>

									<button
										onClick={() => setPreviewMap(null)}
										className="flex-1 bg-gray-300 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
									>
										Close
									</button>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-sm w-full">
						<h2 className="text-xl font-bold text-gray-900 mb-4">Delete Map?</h2>
						<p className="text-gray-600 mb-6">
							Are you sure you want to delete this map? This action cannot be undone.
						</p>

						<div className="flex gap-3">
							<button
								onClick={() => handleDelete(deleteConfirm)}
								className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
							>
								Delete
							</button>

							<button
								onClick={() => setDeleteConfirm(null)}
								className="flex-1 bg-gray-300 text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
