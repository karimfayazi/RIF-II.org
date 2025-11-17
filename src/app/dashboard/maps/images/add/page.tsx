"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useAccess } from "@/hooks/useAccess";
import { ArrowLeft, Upload, X, AlertCircle, CheckCircle, Edit, Trash2, Eye } from "lucide-react";
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

type GISMapFormData = {
	areaName: string;
	mapType: string;
	file: File | null;
};

const mapTypeOptions = [
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

export default function GISMapsAddPage() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const editId = searchParams.get('edit');
	const isEditing = !!editId;

	const { user, getUserId } = useAuth();
	const userId = user?.id || getUserId();
	const { isAdmin, canUpload, loading: accessLoading } = useAccess(userId);

	const [formData, setFormData] = useState<GISMapFormData>({
		areaName: "",
		mapType: "",
		file: null
	});

	const [existingMaps, setExistingMaps] = useState<GISMap[]>([]);
	const [editingMap, setEditingMap] = useState<GISMap | null>(null);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
	const [uploadProgress, setUploadProgress] = useState(0);

	// Redirect non-admin users
	useEffect(() => {
		if (!accessLoading && (!isAdmin || !canUpload)) {
			router.push("/dashboard/maps/images");
		}
	}, [isAdmin, canUpload, accessLoading, router]);

	// Load existing maps
	useEffect(() => {
		fetchMaps();
	}, []);

	// Load map for editing
	useEffect(() => {
		if (isEditing && existingMaps.length > 0) {
			const mapToEdit = existingMaps.find(map => map.MapID === parseInt(editId));
			if (mapToEdit) {
				setEditingMap(mapToEdit);
				setFormData({
					areaName: mapToEdit.AreaName,
					mapType: mapToEdit.MapType,
					file: null
				});
			}
		}
	}, [isEditing, editId, existingMaps]);

	const fetchMaps = async () => {
		setLoading(true);
		try {
			const response = await fetch('/api/gis-maps');
			const result = await response.json();
			if (result.success) {
				setExistingMaps(result.maps || []);
			} else {
				console.error("Failed to fetch maps:", result.message);
			}
		} catch (error) {
			console.error("Error fetching maps:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
		setError(null);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
			if (!allowedTypes.includes(file.type)) {
				setError("Please select a valid image file (JPG, PNG, GIF, or WebP)");
				return;
			}
			
			if (file.size > 15 * 1024 * 1024) {
				setError("File size must be less than 15MB");
				return;
			}
			
			setFormData(prev => ({
				...prev,
				file
			}));
			setError(null);
		}
	};

	const validateForm = (): boolean => {
		if (!formData.areaName.trim()) {
			setError("Area Name is required");
			return false;
		}
		if (formData.areaName.trim().length > 100) {
			setError("Area Name must be less than 100 characters");
			return false;
		}
		if (!formData.mapType) {
			setError("Please select a Map Type");
			return false;
		}
		if (!isEditing && !formData.file) {
			setError("Please select an image file to upload");
			return false;
		}
		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!validateForm()) {
			return;
		}

		setUploading(true);
		setError(null);
		setSuccess(null);
		setUploadProgress(0);

		try {
			const formDataToSend = new FormData();
			formDataToSend.append('areaName', formData.areaName.trim());
			formDataToSend.append('mapType', formData.mapType);
			formDataToSend.append('uploadedBy', userId || '');
			
			if (formData.file) {
				formDataToSend.append('file', formData.file);
			}

			let url = '/api/gis-maps';
			let method = 'POST';

			if (isEditing) {
				url = `/api/gis-maps?id=${editId}`;
				method = 'PUT';
			}

			// Simulate progress for better UX
			const progressInterval = setInterval(() => {
				setUploadProgress(prev => {
					if (prev >= 90) {
						clearInterval(progressInterval);
						return 90;
					}
					return prev + 10;
				});
			}, 200);

			const response = await fetch(url, {
				method,
				body: formDataToSend
			});

			clearInterval(progressInterval);
			setUploadProgress(100);

			const result = await response.json();

			if (result.success) {
				setSuccess(isEditing ? "Map updated successfully!" : "Map uploaded successfully!");
				
				// Reset form if creating new
				if (!isEditing) {
					setFormData({
						areaName: "",
						mapType: "",
						file: null
					});
					const fileInput = document.getElementById('file-upload') as HTMLInputElement;
					if (fileInput) fileInput.value = '';
				}

				// Refresh maps list
				await fetchMaps();

				// Clear success message after 3 seconds
				setTimeout(() => {
					setSuccess(null);
				}, 3000);
			} else {
				setError(result.message || `Failed to ${isEditing ? 'update' : 'upload'} GIS map`);
				setUploadProgress(0);
			}
		} catch (error) {
			setError(`An error occurred while ${isEditing ? 'updating' : 'uploading'} the map. Please try again.`);
			setUploadProgress(0);
			console.error("Submit error:", error);
		} finally {
			setUploading(false);
		}
	};

	const handleDelete = async (mapId: number) => {
		try {
			const response = await fetch(`/api/gis-maps?id=${mapId}`, {
				method: 'DELETE'
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

	const removeFile = () => {
		setFormData(prev => ({
			...prev,
			file: null
		}));
		const fileInput = document.getElementById('file-upload') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
		setError(null);
	};

	const clearForm = () => {
		setFormData({
			areaName: "",
			mapType: "",
			file: null
		});
		const fileInput = document.getElementById('file-upload') as HTMLInputElement;
		if (fileInput) fileInput.value = '';
		setError(null);
		setSuccess(null);
		setEditingMap(null);
		router.push("/dashboard/maps/images/add");
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
					<p className="text-gray-600">You need admin privileges to access this page.</p>
					<Link 
						href="/dashboard/maps/images" 
						className="mt-4 inline-block px-4 py-2 bg-[#0b4d2b] text-white rounded-lg hover:bg-[#0a3d24]"
					>
						Back to Maps Gallery
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-7xl mx-auto space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Link
						href="/dashboard/maps/images"
						className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Maps Gallery
					</Link>
				</div>
				{isEditing && (
					<button
						onClick={clearForm}
						className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
					>
						Add New Map
					</button>
				)}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Form Section */}
				<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200">
						<h1 className="text-2xl font-bold text-gray-900">
							{isEditing ? `Edit GIS Map #${editId}` : 'Add New GIS Map'}
						</h1>
						<p className="text-gray-600 mt-1">
							{isEditing ? 'Update the map information below' : 'Complete the form to add a new map to TABLE_GIS_MAPS'}
						</p>
						{isEditing && editingMap && (
							<div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
								<strong>Current Record:</strong> {editingMap.FileName} • 
								Uploaded: {new Date(editingMap.UploadedDate).toLocaleDateString()} • 
								By: {editingMap.UploadedBy}
							</div>
						)}
					</div>

					{/* Success Message */}
					{success && (
						<div className="mx-6 mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
							<div className="flex items-center">
								<CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
								<div className="ml-3">
									<p className="text-sm font-medium text-green-800">{success}</p>
								</div>
							</div>
						</div>
					)}

					{/* Error Message */}
					{error && (
						<div className="mx-6 mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
							<div className="flex items-center">
								<AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
								<div className="ml-3">
									<p className="text-sm font-medium text-red-800">{error}</p>
								</div>
							</div>
						</div>
					)}

					{/* Form Based on TABLE_GIS_MAPS Structure */}
					<form onSubmit={handleSubmit} className="p-6 space-y-6">
						{/* SQL Field: AreaName NVARCHAR(100) */}
						<div>
							<label htmlFor="areaName" className="block text-sm font-medium text-gray-700 mb-2">
								Area Name <span className="text-red-500">*</span>
								<span className="text-xs text-gray-500 ml-2">[AreaName NVARCHAR(100)]</span>
							</label>
							<select
								id="areaName"
								name="areaName"
								value={formData.areaName}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b4d2b] focus:border-transparent"
								required
							>
								<option value="">Select area...</option>
								<option value="DIK">DIK</option>
								<option value="Bannu">Bannu</option>
							</select>
							<div className="mt-1 text-xs text-gray-500">
								This will be stored in the AreaName column
							</div>
						</div>

						{/* SQL Field: MapType NVARCHAR(100) */}
						<div>
							<label htmlFor="mapType" className="block text-sm font-medium text-gray-700 mb-2">
								Map Type <span className="text-red-500">*</span>
								<span className="text-xs text-gray-500 ml-2">[MapType NVARCHAR(100)]</span>
							</label>
							<select
								id="mapType"
								name="mapType"
								value={formData.mapType}
								onChange={handleInputChange}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0b4d2b] focus:border-transparent"
								required
							>
								<option value="">Select map type...</option>
								{mapTypeOptions.map((type) => (
									<option key={type} value={type}>
										{type}
									</option>
								))}
							</select>
							<div className="mt-1 text-xs text-gray-500">
								This will be stored in the MapType column
							</div>
						</div>

						{/* SQL Fields: FileName NVARCHAR(200) & FilePath NVARCHAR(300) */}
						<div>
							<label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
								Map Image File {!isEditing && <span className="text-red-500">*</span>}
								{isEditing && <span className="text-gray-500">(Leave empty to keep current file)</span>}
								<span className="text-xs text-gray-500 ml-2">[FileName NVARCHAR(200), FilePath NVARCHAR(300)]</span>
							</label>
							
							{!formData.file ? (
								<div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
									<div className="space-y-1 text-center">
										<Upload className="mx-auto h-12 w-12 text-gray-400" />
										<div className="flex text-sm text-gray-600">
											<label
												htmlFor="file-upload"
												className="relative cursor-pointer bg-white rounded-md font-medium text-[#0b4d2b] hover:text-[#0a3d24] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0b4d2b]"
											>
												<span>Upload a file</span>
												<input
													id="file-upload"
													name="file-upload"
													type="file"
													className="sr-only"
													accept="image/*"
													onChange={handleFileChange}
												/>
											</label>
											<p className="pl-1">or drag and drop</p>
										</div>
										<p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 15MB</p>
									</div>
								</div>
							) : (
								<div className="mt-3 flex items-center justify-between bg-gray-50 px-4 py-3 rounded-md border">
									<div className="flex items-center">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 bg-[#0b4d2b] rounded flex items-center justify-center">
												<Upload className="h-5 w-5 text-white" />
											</div>
										</div>
										<div className="ml-3">
											<p className="text-sm font-medium text-gray-900">{formData.file.name}</p>
											<p className="text-xs text-gray-500">
												{(formData.file.size / 1024 / 1024).toFixed(2)} MB • 
												Will generate unique FileName & FilePath
											</p>
										</div>
									</div>
									<button
										type="button"
										onClick={removeFile}
										className="flex-shrink-0 text-gray-400 hover:text-red-500 transition-colors"
										title="Remove file"
									>
										<X className="h-5 w-5" />
									</button>
								</div>
							)}
							<div className="mt-1 text-xs text-gray-500">
								System will auto-generate FileName (unique name) & FilePath (storage location)
							</div>
						</div>

						{/* Upload Progress */}
						{uploading && (
							<div>
								<div className="flex justify-between text-sm text-gray-700 mb-2">
									<span>{isEditing ? 'Updating database record...' : 'Saving to TABLE_GIS_MAPS...'}</span>
									<span>{uploadProgress}%</span>
								</div>
								<div className="w-full bg-gray-200 rounded-full h-2">
									<div 
										className="bg-[#0b4d2b] h-2 rounded-full transition-all duration-300"
										style={{ width: `${uploadProgress}%` }}
									></div>
								</div>
							</div>
						)}

						{/* Auto-managed SQL Fields Info */}
						<div className="bg-blue-50 p-4 rounded-md border border-blue-200">
							<h4 className="text-sm font-medium text-blue-800 mb-3">Auto-Managed Database Fields</h4>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
								<div>
									<strong>MapID:</strong> INT IDENTITY(1,1) PRIMARY KEY
									<br />
									<span className="text-blue-600">Auto-increment, system generated</span>
								</div>
								<div>
									<strong>UploadedBy:</strong> NVARCHAR(100)
									<br />
									<span className="text-blue-600">Current user: {user?.name || userId || 'System'}</span>
								</div>
								<div>
									<strong>UploadedDate:</strong> DATETIME DEFAULT GETDATE()
									<br />
									<span className="text-blue-600">Auto timestamp on insert/update</span>
								</div>
								<div>
									<strong>File Storage:</strong> /Content/GIS_Maps/Uploaded/
									<br />
									<span className="text-blue-600">Secure server file storage</span>
								</div>
							</div>
						</div>

						{/* Submit Buttons */}
						<div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
							<Link
								href="/dashboard/maps/images"
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b4d2b] transition-colors"
							>
								Cancel
							</Link>
							<button
								type="submit"
								disabled={uploading}
								className="px-6 py-2 text-sm font-medium text-white bg-[#0b4d2b] border border-transparent rounded-md hover:bg-[#0a3d24] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0b4d2b] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
							>
								{uploading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										{isEditing ? 'Updating Record...' : 'Saving to Database...'}
									</>
								) : (
									<>
										<Upload className="h-4 w-4" />
										{isEditing ? 'Update Record' : 'Save to TABLE_GIS_MAPS'}
									</>
								)}
							</button>
						</div>
					</form>
				</div>

				{/* Existing Maps/Database Records Section */}
				<div className="bg-white rounded-lg border border-gray-200 shadow-sm">
					<div className="px-6 py-4 border-b border-gray-200">
						<h2 className="text-xl font-bold text-gray-900">Database Records</h2>
						<p className="text-gray-600 mt-1">
							TABLE_GIS_MAPS ({existingMaps.length} {existingMaps.length === 1 ? 'record' : 'records'})
						</p>
					</div>

					<div className="p-6">
						{loading ? (
							<div className="flex items-center justify-center py-8">
								<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#0b4d2b]"></div>
								<span className="ml-3 text-gray-600">Loading database records...</span>
							</div>
						) : existingMaps.length === 0 ? (
							<div className="text-center py-8 text-gray-500">
								<Upload className="mx-auto h-12 w-12 text-gray-300 mb-4" />
								<p className="font-medium">No records in TABLE_GIS_MAPS</p>
								<p className="text-sm">Add your first GIS map using the form</p>
							</div>
						) : (
							<div className="space-y-3 max-h-96 overflow-y-auto">
								{existingMaps.map((map) => (
									<div key={map.MapID} className={`p-3 rounded-lg border transition-colors ${
										isEditing && editId === map.MapID.toString() 
											? 'bg-blue-50 border-blue-200 ring-1 ring-blue-300' 
											: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
									}`}>
										<div className="flex items-start justify-between">
											<div className="flex-1 min-w-0">
												<div className="flex items-center gap-2 mb-1">
													<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
														ID: {map.MapID}
													</span>
													{isEditing && editId === map.MapID.toString() && (
														<span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-200 text-blue-800">
															Editing
														</span>
													)}
												</div>
												<h4 className="text-sm font-medium text-gray-900 truncate mb-1">
													{map.AreaName}
												</h4>
												<p className="text-xs text-gray-500 mb-1">
													<strong>Type:</strong> {map.MapType}
												</p>
												<p className="text-xs text-gray-400">
													<strong>File:</strong> {map.FileName}
												</p>
												<p className="text-xs text-gray-400">
													<strong>Uploaded:</strong> {new Date(map.UploadedDate).toLocaleDateString()} by {map.UploadedBy}
												</p>
											</div>
											<div className="flex items-center space-x-1 ml-4">
												<button
													onClick={() => window.open(map.FilePath, '_blank')}
													className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded transition-colors"
													title="View Map"
												>
													<Eye className="h-4 w-4" />
												</button>
												<button
													onClick={() => router.push(`/dashboard/maps/images/add?edit=${map.MapID}`)}
													className="p-2 text-green-600 hover:text-green-800 hover:bg-green-100 rounded transition-colors"
													title="Edit Record"
												>
													<Edit className="h-4 w-4" />
												</button>
												<button
													onClick={() => setDeleteConfirm(map.MapID)}
													className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
													title="Delete Record"
												>
													<Trash2 className="h-4 w-4" />
												</button>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* SQL Table Information Panel */}
			<div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
				<h3 className="text-lg font-medium text-gray-900 mb-4">TABLE_GIS_MAPS Structure</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<h4 className="text-sm font-medium text-gray-700 mb-3">SQL Column Definitions:</h4>
						<div className="space-y-2 text-sm font-mono text-gray-600">
							<div className="flex justify-between">
								<span>MapID</span>
								<span className="text-blue-600">INT IDENTITY(1,1) PRIMARY KEY</span>
							</div>
							<div className="flex justify-between">
								<span>AreaName</span>
								<span className="text-green-600">NVARCHAR(100)</span>
							</div>
							<div className="flex justify-between">
								<span>MapType</span>
								<span className="text-green-600">NVARCHAR(100)</span>
							</div>
							<div className="flex justify-between">
								<span>FileName</span>
								<span className="text-purple-600">NVARCHAR(200)</span>
							</div>
							<div className="flex justify-between">
								<span>FilePath</span>
								<span className="text-purple-600">NVARCHAR(300)</span>
							</div>
							<div className="flex justify-between">
								<span>UploadedBy</span>
								<span className="text-orange-600">NVARCHAR(100)</span>
							</div>
							<div className="flex justify-between">
								<span>UploadedDate</span>
								<span className="text-orange-600">DATETIME DEFAULT GETDATE()</span>
							</div>
						</div>
					</div>
					<div>
						<h4 className="text-sm font-medium text-gray-700 mb-3">Data Entry Mapping:</h4>
						<div className="space-y-2 text-sm text-gray-600">
							<div><span className="text-blue-600">●</span> <strong>Auto-Generated:</strong> MapID (Primary Key)</div>
							<div><span className="text-green-600">●</span> <strong>User Input:</strong> AreaName, MapType</div>
							<div><span className="text-purple-600">●</span> <strong>File Upload:</strong> FileName, FilePath</div>
							<div><span className="text-orange-600">●</span> <strong>System Fields:</strong> UploadedBy, UploadedDate</div>
						</div>
						<div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-700">
							<strong>Storage Location:</strong> /Content/GIS_Maps/Uploaded/<br/>
							<strong>File Types:</strong> JPG, PNG, GIF, WebP (max 15MB)<br/>
							<strong>Access Level:</strong> Admin users only
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{deleteConfirm && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-lg p-6 max-w-md w-full">
						<h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Delete</h3>
						<p className="text-gray-600 mb-6">
							Are you sure you want to delete this record from TABLE_GIS_MAPS? This action cannot be undone.
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