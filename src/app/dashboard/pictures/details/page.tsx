"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Calendar, Folder, Image as ImageIcon, Download } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type PictureData = {
	GroupName: string;
	MainCategory: string;
	SubCategory: string;
	FileName: string;
	FilePath: string;
	EventDate: string;
};

function PictureDetailsContent() {
	const searchParams = useSearchParams();
	const groupName = searchParams.get('groupName');
	const mainCategory = searchParams.get('mainCategory');
	const subCategory = searchParams.get('subCategory');

	const [pictures, setPictures] = useState<PictureData[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const getImageUrl = (filePath: string) => {
		if (filePath.startsWith('https://') || filePath.startsWith('http://')) {
			return filePath;
		} else if (filePath.startsWith('~/')) {
			// Remove the ~/ prefix
			return `https://rif-ii.org/${filePath.replace('~/', '')}`;
		} else if (filePath.startsWith('Uploads/Pictures/')) {
			return `https://rif-ii.org/${filePath}`;
		} else {
			return `https://rif-ii.org/${filePath}`;
		}
	};

	const fetchPictureDetails = useCallback(async () => {
		try {
			setLoading(true);
			setError(null);
			const params = new URLSearchParams();
			if (groupName) params.append('groupName', groupName);
			if (mainCategory) params.append('mainCategory', mainCategory);
			if (subCategory) params.append('subCategory', subCategory);

			console.log('Fetching pictures with params:', { groupName, mainCategory, subCategory });
			const response = await fetch(`/api/pictures/details?${params.toString()}`);
			const data = await response.json();
			console.log('API response:', data);

			if (data.success) {
				setPictures(data.pictures || []);
				if (!data.pictures || data.pictures.length === 0) {
					setError("No pictures found for the selected criteria");
				}
			} else {
				setError(data.message || "Failed to fetch picture details");
			}
		} catch (err) {
			setError("Error fetching picture details");
			console.error("Error fetching picture details:", err);
		} finally {
			setLoading(false);
		}
	}, [groupName, mainCategory, subCategory]);

	useEffect(() => {
		if (groupName || mainCategory || subCategory) {
			fetchPictureDetails();
		}
	}, [fetchPictureDetails]);


	const handleDownload = (filePath: string) => {
		try {
			// Use the same URL construction logic
			const fullUrl = getImageUrl(filePath);
			
			// Open in new tab for viewing
			window.open(fullUrl, '_blank');
		} catch (error) {
			console.error('Error opening image:', error);
			alert('Error opening image. Please try again.');
		}
	};

	const formatDate = (dateString: string) => {
		if (!dateString) return "N/A";
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateString;
		}
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div className="flex items-center space-x-4">
					<Link
						href="/dashboard"
						className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Link>
				</div>
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
					<span className="ml-3 text-gray-600">Loading pictures...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div className="flex items-center space-x-4">
					<Link
						href="/dashboard"
						className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Link>
				</div>
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
					<p className="text-red-600">{error}</p>
					<button
						onClick={fetchPictureDetails}
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
					<Link
						href="/dashboard"
						className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft className="h-4 w-4 mr-2" />
						Back to Dashboard
					</Link>
					<div>
						<h1 className="text-2xl font-bold text-gray-900">
							{groupName || mainCategory || subCategory || 'Picture Gallery'}
						</h1>
						<p className="text-gray-600 mt-1">
							{groupName && `Group: ${groupName}`}
							{mainCategory && ` • Category: ${mainCategory}`}
							{subCategory && ` • Sub Category: ${subCategory}`}
						</p>
					</div>
				</div>
			</div>

			{/* Pictures Grid */}
			{pictures.length === 0 ? (
				<div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
					<ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">No pictures found</h3>
					<p className="text-gray-600">No pictures available for the selected criteria</p>
				</div>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{pictures.map((picture, index) => (
							<div
								key={index}
								className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden"
							>
								{/* Image */}
								<div className="aspect-square bg-gray-100 relative overflow-hidden">
									<Image
										src={getImageUrl(picture.FilePath)}
										alt={picture.FileName}
										fill
										sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										className="object-cover group-hover:scale-105 transition-transform duration-200"
										unoptimized
										onError={(e) => {
											console.error('Image failed to load, URL:', getImageUrl(picture.FilePath), 'FilePath:', picture.FilePath);
											const target = e.target as HTMLImageElement;
											target.src = '/placeholder-image.jpg';
										}}
									/>
									<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
										<button
											onClick={() => handleDownload(picture.FilePath)}
											className="opacity-0 group-hover:opacity-100 bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2"
										>
											<Download className="h-4 w-4" />
											<span className="text-sm font-medium">View</span>
										</button>
									</div>
								</div>

								{/* Picture Info */}
								<div className="p-4">
									<h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2">
										{picture.FileName}
									</h3>
									
									<div className="space-y-1 text-xs text-gray-500">
										{picture.MainCategory && (
											<div className="flex items-center">
												<Folder className="h-3 w-3 mr-1" />
												<span className="line-clamp-1">{picture.MainCategory}</span>
											</div>
										)}
										{picture.SubCategory && (
											<div className="flex items-center">
												<Folder className="h-3 w-3 mr-1" />
												<span className="line-clamp-1">{picture.SubCategory}</span>
											</div>
										)}
										{picture.EventDate && (
											<div className="flex items-center">
												<Calendar className="h-3 w-3 mr-1" />
												<span>{formatDate(picture.EventDate)}</span>
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>

					{/* Results Count */}
					<div className="text-center text-sm text-gray-500">
						Showing {pictures.length} picture{pictures.length !== 1 ? 's' : ''}
					</div>
				</>
			)}
		</div>
	);
}

export default function PictureDetailsPage() {
	return (
		<Suspense fallback={
			<div className="space-y-6">
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
					<span className="ml-3 text-gray-600">Loading...</span>
				</div>
			</div>
		}>
			<PictureDetailsContent />
		</Suspense>
	);
}
