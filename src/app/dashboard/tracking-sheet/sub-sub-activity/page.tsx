"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { 
	ChevronLeft, 
	Calendar, 
	MapPin, 
	Users, 
	Target,
	Activity,
	BarChart3,
	RefreshCw,
	ExternalLink,
	Edit,
	Save,
	X,
	Download,
	Filter,
	Plus,
	Search
} from "lucide-react";

type SubSubActivityData = {
	Sub_Sub_ActivityID_ID: number;
	OutputID: string;
	ActivityID: number;
	SubActivityID: number;
	Sub_Sub_ActivityID: number;
	Sub_Sub_ActivityName: string;
	UnitName: string;
	PlannedTargets: number;
	AchievedTargets: number;
	ActivityProgress: number;
	ActivityWeightage: number;
	ActivityWeightageProgress: number;
	PlannedStartDate: string;
	PlannedEndDate: string;
	Remarks: string;
	Links: string;
	Sector_Name: string;
	District: string;
	Tehsil: string;
	Beneficiaries_Male: number;
	Beneficiaries_Female: number;
	Total_Beneficiaries: number;
	Beneficiary_Types: string;
	UserID: string;
	LastUpdateDate: string;
};

function SubSubActivityContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [subSubActivityData, setSubSubActivityData] = useState<SubSubActivityData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [editData, setEditData] = useState<Partial<SubSubActivityData>>({});
	const [saving, setSaving] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedSector, setSelectedSector] = useState("");
	const [selectedDistrict, setSelectedDistrict] = useState("");
	const [selectedTehsil, setSelectedTehsil] = useState("");
	const [selectedOutputID, setSelectedOutputID] = useState("");
	const [selectedActivityID, setSelectedActivityID] = useState("");
	const [selectedSubActivityID, setSelectedSubActivityID] = useState("");

	const subSubActivityID = searchParams.get('subSubActivityID');
	const outputID = searchParams.get('outputID');
	const activityID = searchParams.get('activityID');
	const subActivityID = searchParams.get('subActivityID');

	const fetchSubSubActivityData = useCallback(async () => {
		try {
			setLoading(true);
			const params = new URLSearchParams();
			if (subSubActivityID) params.append('subSubActivityID', subSubActivityID);
			if (outputID) params.append('outputID', outputID);
			if (activityID) params.append('activityID', activityID);
			if (subActivityID) params.append('subActivityID', subActivityID);

			const response = await fetch(`/api/tracking-sheet/sub-sub-activity?${params.toString()}`);
			const data = await response.json();

			if (data.success) {
				setSubSubActivityData(data.subSubActivityData || []);
			} else {
				setError(data.message || "Failed to fetch sub-sub activity data");
			}
		} catch (err) {
			setError("Error fetching sub-sub activity data");
			console.error("Error fetching sub-sub activity data:", err);
		} finally {
			setLoading(false);
		}
	}, [subSubActivityID, outputID, activityID, subActivityID]);

	useEffect(() => {
		fetchSubSubActivityData();
	}, [fetchSubSubActivityData]);

	const getProgressColor = (progress: number) => {
		if (progress >= 80) return "bg-green-500";
		if (progress >= 60) return "bg-yellow-500";
		if (progress >= 40) return "bg-orange-500";
		return "bg-red-500";
	};

	const getProgressTextColor = (progress: number) => {
		if (progress >= 80) return "text-green-700";
		if (progress >= 60) return "text-yellow-700";
		if (progress >= 40) return "text-orange-700";
		return "text-red-700";
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		return dateString;
	};

	const formatNumber = (num: number) => {
		if (!num) return "0";
		return num.toLocaleString();
	};

	// Filter data based on search and filters
	const filteredData = subSubActivityData.filter(item => {
		const matchesSearch = !searchTerm || 
			item.Sub_Sub_ActivityName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.OutputID?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.ActivityID?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
			item.SubActivityID?.toString().toLowerCase().includes(searchTerm.toLowerCase());
		
		const matchesSector = !selectedSector || item.Sector_Name === selectedSector;
		const matchesDistrict = !selectedDistrict || item.District === selectedDistrict;
		const matchesTehsil = !selectedTehsil || item.Tehsil === selectedTehsil;
		const matchesOutputID = !selectedOutputID || item.OutputID?.toString() === selectedOutputID;
		const matchesActivityID = !selectedActivityID || item.ActivityID?.toString() === selectedActivityID;
		const matchesSubActivityID = !selectedSubActivityID || item.SubActivityID?.toString() === selectedSubActivityID;
		
		return matchesSearch && matchesSector && matchesDistrict && matchesTehsil && matchesOutputID && matchesActivityID && matchesSubActivityID;
	});

	// Extract unique values for filters
	const sectors = [...new Set(subSubActivityData.map(item => item.Sector_Name).filter(Boolean))] as string[];
	const districts = [...new Set(subSubActivityData.map(item => item.District).filter(Boolean))] as string[];
	const tehsils = [...new Set(subSubActivityData.map(item => item.Tehsil).filter(Boolean))] as string[];
	const outputIDs = [...new Set(subSubActivityData.map(item => item.OutputID).filter(Boolean))] as string[];
	const activityIDs = [...new Set(subSubActivityData.map(item => item.ActivityID).filter(Boolean))].map(String);
	const subActivityIDs = [...new Set(subSubActivityData.map(item => item.SubActivityID).filter(Boolean))].map(String);

	const handleReset = () => {
		setSearchTerm("");
		setSelectedSector("");
		setSelectedDistrict("");
		setSelectedTehsil("");
		setSelectedOutputID("");
		setSelectedActivityID("");
		setSelectedSubActivityID("");
	};

	const handleEdit = (item: SubSubActivityData) => {
		setEditingId(item.Sub_Sub_ActivityID_ID);
		setEditData({
			AchievedTargets: item.AchievedTargets,
			ActivityProgress: item.ActivityProgress,
			ActivityWeightageProgress: item.ActivityWeightageProgress,
			Remarks: item.Remarks,
			Links: item.Links,
			Beneficiaries_Male: item.Beneficiaries_Male,
			Beneficiaries_Female: item.Beneficiaries_Female,
			Total_Beneficiaries: item.Total_Beneficiaries,
			Beneficiary_Types: item.Beneficiary_Types,
			UserID: item.UserID
		});
	};

	const handleSave = async (id: number) => {
		try {
			setSaving(true);
			const response = await fetch('/api/tracking-sheet/sub-sub-activity', {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					Sub_Sub_ActivityID_ID: id,
					...editData
				}),
			});

			const result = await response.json();

			if (result.success) {
				// Update the local data
				setSubSubActivityData(prev => 
					prev.map(item => 
						item.Sub_Sub_ActivityID_ID === id 
							? { ...item, ...editData, LastUpdateDate: new Date().toISOString().split('T')[0] }
							: item
					)
				);
				setEditingId(null);
				setEditData({});
			} else {
				alert('Failed to update: ' + result.message);
			}
		} catch (err) {
			console.error('Error updating:', err);
			alert('Error updating data');
		} finally {
			setSaving(false);
		}
	};

	const handleCancel = () => {
		setEditingId(null);
		setEditData({});
	};

	const handleInputChange = (field: keyof SubSubActivityData, value: string | number) => {
		setEditData(prev => ({
			...prev,
			[field]: value
		}));
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Sub-Sub Activity Details</h1>
					<p className="text-gray-600 mt-2">Loading detailed activity information...</p>
				</div>
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
					<span className="ml-3 text-gray-600">Loading...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Sub-Sub Activity Details</h1>
					<p className="text-gray-600 mt-2">Error loading activity details</p>
				</div>
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
					<p className="text-red-600">{error}</p>
					<button
						onClick={fetchSubSubActivityData}
						className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-4">
					<button
						onClick={() => router.back()}
						className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
					>
						<ChevronLeft className="h-4 w-4 mr-2" />
						Back
					</button>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">Sub-Sub Activity Details</h1>
						<p className="text-gray-600 mt-2">Detailed view of sub-sub activities</p>
					</div>
				</div>
				<div className="flex items-center space-x-3">
					<button
						onClick={fetchSubSubActivityData}
						className="inline-flex items-center px-4 py-2 text-[#0b4d2b] bg-[#0b4d2b]/10 rounded-lg hover:bg-[#0b4d2b]/20 transition-colors"
					>
						<RefreshCw className="h-4 w-4 mr-2" />
						Refresh
					</button>
					<button className="inline-flex items-center px-4 py-2 bg-[#0b4d2b] text-white rounded-lg hover:bg-[#0a3d24] transition-colors">
						<Download className="h-4 w-4 mr-2" />
						Export
					</button>
				</div>
			</div>

			{/* Search and Filters */}
			<div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="text-lg font-semibold text-gray-900">Search & Filter Sub-Sub Activities</h3>
						<p className="text-sm text-gray-600">Find specific activities by name, sector, or location</p>
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<div className="h-2 w-2 bg-green-500 rounded-full"></div>
							<span className="text-xs text-gray-500 font-medium">Live Search</span>
						</div>
						<button
							onClick={handleReset}
							className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
						>
							<Filter className="h-3 w-3 mr-1" />
							Reset
						</button>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-8 gap-4">
					{/* Search Input */}
					<div className="md:col-span-2">
						<label className="block text-sm font-medium text-gray-700 mb-2">Search Activities</label>
						<input
							type="text"
							placeholder="Search by activity name or ID..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full px-4 py-3 text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0b4d2b]/20 focus:border-[#0b4d2b] focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
						/>
					</div>

					{/* Output ID Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Output ID</label>
						<select
							value={selectedOutputID}
							onChange={(e) => setSelectedOutputID(e.target.value)}
							className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
						>
							<option value="">All Output IDs</option>
							{outputIDs.map((outputID) => (
								<option key={outputID} value={outputID}>
									{outputID}
								</option>
							))}
						</select>
					</div>

					{/* Activity ID Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Activity ID</label>
						<select
							value={selectedActivityID}
							onChange={(e) => setSelectedActivityID(e.target.value)}
							className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
						>
							<option value="">All Activity IDs</option>
							{activityIDs.map((activityID) => (
								<option key={activityID} value={activityID}>
									{activityID}
								</option>
							))}
						</select>
					</div>

					{/* Sub Activity ID Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Sub Activity ID</label>
						<select
							value={selectedSubActivityID}
							onChange={(e) => setSelectedSubActivityID(e.target.value)}
							className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
						>
							<option value="">All Sub Activity IDs</option>
							{subActivityIDs.map((subActivityID) => (
								<option key={subActivityID} value={subActivityID}>
									{subActivityID}
								</option>
							))}
						</select>
					</div>

					{/* Sector Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Sector</label>
						<select
							value={selectedSector}
							onChange={(e) => setSelectedSector(e.target.value)}
							className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
						>
							<option value="">All Sectors</option>
							{sectors.map((sector) => (
								<option key={sector} value={sector}>
									{sector}
								</option>
							))}
						</select>
					</div>

					{/* District Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">District</label>
						<select
							value={selectedDistrict}
							onChange={(e) => setSelectedDistrict(e.target.value)}
							className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
						>
							<option value="">All Districts</option>
							{districts.map((district) => (
								<option key={district} value={district}>
									{district}
								</option>
							))}
						</select>
					</div>

					{/* Tehsil Filter */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">Tehsil</label>
						<select
							value={selectedTehsil}
							onChange={(e) => setSelectedTehsil(e.target.value)}
							className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
						>
							<option value="">All Tehsils</option>
							{tehsils.map((tehsil) => (
								<option key={tehsil} value={tehsil}>
									{tehsil}
								</option>
							))}
						</select>
					</div>
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
					<div className="flex items-center">
						<div className="p-2 bg-blue-100 rounded-lg">
							<Activity className="h-6 w-6 text-blue-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Total Activities</p>
							<p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
					<div className="flex items-center">
						<div className="p-2 bg-green-100 rounded-lg">
							<Target className="h-6 w-6 text-green-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Avg Progress</p>
							<p className="text-2xl font-bold text-gray-900">
								{filteredData.length > 0 
									? Math.round(filteredData.reduce((sum, item) => sum + (item.ActivityProgress || 0), 0) / filteredData.length)
									: 0}%
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
					<div className="flex items-center">
						<div className="p-2 bg-purple-100 rounded-lg">
							<Users className="h-6 w-6 text-purple-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Total Beneficiaries</p>
							<p className="text-2xl font-bold text-gray-900">
								{formatNumber(filteredData.reduce((sum, item) => sum + (item.Total_Beneficiaries || 0), 0))}
							</p>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
					<div className="flex items-center">
						<div className="p-2 bg-orange-100 rounded-lg">
							<MapPin className="h-6 w-6 text-orange-600" />
						</div>
						<div className="ml-4">
							<p className="text-sm font-medium text-gray-600">Districts</p>
							<p className="text-2xl font-bold text-gray-900">
								{new Set(filteredData.map(item => item.District).filter(Boolean)).size}
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Sub-Sub Activity Data */}
			{filteredData.length === 0 ? (
				<div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
					<BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">No sub-sub activities found</h3>
					<p className="text-gray-600">No detailed activities available for the selected criteria.</p>
				</div>
			) : (
				<div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activity Details</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Targets</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Beneficiaries</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timeline</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks & Links</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{filteredData.map((item, index) => (
									<tr key={index} className="hover:bg-gray-50">
										<td className="px-6 py-4">
											<div className="space-y-2">
												{/* Sub-Sub Activity */}
												<div className="border-b border-gray-200 pb-2">
													<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
														<span className="font-bold">Sub-Sub Activity</span> | <span className="text-blue-600 font-medium">{item.Sub_Sub_ActivityID}</span>
													</div>
													<div className="text-sm text-gray-900 leading-tight">
														{item.Sub_Sub_ActivityName}
													</div>
												</div>

												{/* IDs */}
												<div className="space-y-1">
													<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Reference IDs</div>
													<div className="grid grid-cols-2 gap-2 text-xs">
														<div>
															<span className="text-gray-500">Output ID:</span>
															<span className="ml-1 text-gray-900 font-medium">{item.OutputID}</span>
														</div>
														<div>
															<span className="text-gray-500">Activity ID:</span>
															<span className="ml-1 text-gray-900 font-medium">{item.ActivityID}</span>
														</div>
														<div>
															<span className="text-gray-500">Sub Activity ID:</span>
															<span className="ml-1 text-gray-900 font-medium">{item.SubActivityID}</span>
														</div>
														<div>
															<span className="text-gray-500">Sub-Sub ID:</span>
															<span className="ml-1 text-gray-900 font-medium">{item.Sub_Sub_ActivityID}</span>
														</div>
													</div>
												</div>

												{/* Sector */}
												<div>
													<div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Sector</div>
													<div className="text-sm text-gray-900">
														{item.Sector_Name}
													</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap">
											{editingId === item.Sub_Sub_ActivityID_ID ? (
												<div className="space-y-2">
													<div className="flex items-center">
														<div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
															<div
																className={`h-2 rounded-full ${getProgressColor(editData.ActivityProgress || 0)}`}
																style={{ width: `${Math.min(editData.ActivityProgress || 0, 100)}%` }}
															></div>
														</div>
														<input
															type="number"
															value={editData.ActivityProgress || 0}
															onChange={(e) => handleInputChange('ActivityProgress', parseInt(e.target.value) || 0)}
															className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
															min="0"
															max="100"
														/>
														<span className="ml-1 text-sm">%</span>
													</div>
													<div className="text-xs text-gray-500">
														Weight: {item.ActivityWeightage || 0}%
													</div>
												</div>
											) : (
												<div className="flex items-center">
													<div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
														<div
															className={`h-2 rounded-full ${getProgressColor(item.ActivityProgress || 0)}`}
															style={{ width: `${Math.min(item.ActivityProgress || 0, 100)}%` }}
														></div>
													</div>
													<span className={`text-sm font-medium ${getProgressTextColor(item.ActivityProgress || 0)}`}>
														{item.ActivityProgress || 0}%
													</span>
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{editingId === item.Sub_Sub_ActivityID_ID ? (
												<div className="space-y-2">
													<div className="flex items-center space-x-2">
														<input
															type="number"
															value={editData.AchievedTargets || 0}
															onChange={(e) => handleInputChange('AchievedTargets', parseInt(e.target.value) || 0)}
															className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
															min="0"
														/>
														<span className="text-gray-500">/</span>
														<span className="text-gray-500">{formatNumber(item.PlannedTargets || 0)}</span>
													</div>
													<div className="text-xs text-gray-500">
														{item.UnitName}
													</div>
												</div>
											) : (
												<div className="font-medium">
													{formatNumber(item.AchievedTargets || 0)} / {formatNumber(item.PlannedTargets || 0)}
												</div>
											)}
											<div className="text-xs text-gray-500">
												{item.UnitName}
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div className="flex items-center">
												<MapPin className="h-4 w-4 text-gray-400 mr-1" />
												<div>
													<div className="font-medium">{item.District}</div>
													<div className="text-xs text-gray-500">{item.Tehsil}</div>
												</div>
											</div>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											{editingId === item.Sub_Sub_ActivityID_ID ? (
												<div className="space-y-2">
													<div className="grid grid-cols-2 gap-2">
														<div>
															<label className="text-xs text-gray-500">Male:</label>
															<input
																type="number"
																value={editData.Beneficiaries_Male || 0}
																onChange={(e) => handleInputChange('Beneficiaries_Male', parseInt(e.target.value) || 0)}
																className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
																min="0"
															/>
														</div>
														<div>
															<label className="text-xs text-gray-500">Female:</label>
															<input
																type="number"
																value={editData.Beneficiaries_Female || 0}
																onChange={(e) => handleInputChange('Beneficiaries_Female', parseInt(e.target.value) || 0)}
																className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
																min="0"
															/>
														</div>
													</div>
													<div>
														<label className="text-xs text-gray-500">Total:</label>
														<input
															type="number"
															value={editData.Total_Beneficiaries || 0}
															onChange={(e) => handleInputChange('Total_Beneficiaries', parseInt(e.target.value) || 0)}
															className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
															min="0"
														/>
													</div>
													<div>
														<label className="text-xs text-gray-500">Types:</label>
														<input
															type="text"
															value={editData.Beneficiary_Types || ''}
															onChange={(e) => handleInputChange('Beneficiary_Types', e.target.value)}
															className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
															placeholder="Beneficiary types"
														/>
													</div>
												</div>
											) : (
												<div>
													<div className="font-medium">
														{formatNumber(item.Total_Beneficiaries || 0)}
													</div>
													<div className="text-xs text-gray-500">
														M: {formatNumber(item.Beneficiaries_Male || 0)} | F: {formatNumber(item.Beneficiaries_Female || 0)}
													</div>
													{item.Beneficiary_Types && (
														<div className="text-xs text-gray-500 mt-1">
															{item.Beneficiary_Types}
														</div>
													)}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
											<div className="flex items-center">
												<Calendar className="h-4 w-4 text-gray-400 mr-1" />
												<div>
													<div className="text-xs">Start: {formatDate(item.PlannedStartDate)}</div>
													<div className="text-xs">End: {formatDate(item.PlannedEndDate)}</div>
													{item.LastUpdateDate && (
														<div className="text-xs text-gray-500 mt-1">
															Updated: {formatDate(item.LastUpdateDate)}
														</div>
													)}
												</div>
											</div>
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">
											{editingId === item.Sub_Sub_ActivityID_ID ? (
												<div className="space-y-2">
													<div>
														<label className="text-xs text-gray-500">Remarks:</label>
														<textarea
															value={editData.Remarks || ''}
															onChange={(e) => handleInputChange('Remarks', e.target.value)}
															className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none resize-none"
															rows={2}
															placeholder="Enter remarks..."
														/>
													</div>
													<div>
														<label className="text-xs text-gray-500">Links:</label>
														<input
															type="url"
															value={editData.Links || ''}
															onChange={(e) => handleInputChange('Links', e.target.value)}
															className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
															placeholder="Enter URL..."
														/>
													</div>
												</div>
											) : (
												<div className="space-y-1">
													{item.Remarks && (
														<div className="text-xs text-gray-600">
															{item.Remarks}
														</div>
													)}
													{item.Links && (
														<a 
															href={item.Links} 
															target="_blank" 
															rel="noopener noreferrer"
															className="text-green-600 hover:text-green-900 text-xs flex items-center"
														>
															<ExternalLink className="h-3 w-3 mr-1" />
															Open Link
														</a>
													)}
												</div>
											)}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
											<div className="flex items-center space-x-2">
												{editingId === item.Sub_Sub_ActivityID_ID ? (
													<>
														<button
															onClick={() => handleSave(item.Sub_Sub_ActivityID_ID)}
															disabled={saving}
															className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors disabled:opacity-50"
															title="Save Changes"
														>
															<Save className="h-4 w-4" />
														</button>
														<button
															onClick={handleCancel}
															className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
															title="Cancel Edit"
														>
															<X className="h-4 w-4" />
														</button>
													</>
												) : (
													<button
														onClick={() => handleEdit(item)}
														className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
														title="Edit Activity"
													>
														<Edit className="h-4 w-4" />
													</button>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Results Count */}
			{filteredData.length > 0 && (
				<div className="text-center text-sm text-gray-500">
					Showing {filteredData.length} sub-sub activit{filteredData.length !== 1 ? 'ies' : 'y'}
					{(searchTerm || selectedSector || selectedDistrict || selectedTehsil || selectedOutputID || selectedActivityID || selectedSubActivityID) && ' matching your criteria'}
				</div>
			)}
		</div>
	);
}

export default function SubSubActivityPage() {
	return (
		<Suspense fallback={
			<div className="space-y-6">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
					<span className="ml-3 text-gray-600">Loading...</span>
				</div>
			</div>
		}>
			<SubSubActivityContent />
		</Suspense>
	);
}
