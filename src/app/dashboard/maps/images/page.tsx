"use client";

import Image from "next/image";
import { useState } from "react";

type MapImage = {
	title: string;
	filename: string;
	category: string;
	tehsil?: string;
	path: string;
};

const mapImages: MapImage[] = [
	// District and Tehsil Maps
	{
		title: "Bannu and DI Khan District Map",
		filename: "Bannu and DI Khan District Map.jpg",
		category: "District Maps",
		path: "/Bannu And DIKhan/Bannu and DI Khan District Map.jpg"
	},
	{
		title: "Bannu Tehsil Map",
		filename: "Bannu Tehsil Map.jpg",
		category: "Tehsil Maps",
		path: "/Bannu And DIKhan/Bannu Tehsil Map.jpg"
	},
	{
		title: "DI Khan Tehsil Map",
		filename: "DI Khan Tehsil Map.jpg",
		category: "Tehsil Maps",
		path: "/Bannu And DIKhan/DI Khan Tehsil Map.jpg"
	},
	{
		title: "Demographic Map of Bannu",
		filename: "Demographic Map of  Bannu.jpg",
		category: "Demographic Maps",
		path: "/Bannu And DIKhan/Demographic Map of  Bannu.jpg"
	},
	{
		title: "Demographic Map of DI Khan",
		filename: "Demographic Map of DI Khan.jpg",
		category: "Demographic Maps",
		path: "/Bannu And DIKhan/Demographic Map of DI Khan.jpg"
	},
	// Road Networks
	{
		title: "Baka Khel Road Network",
		filename: "Baka Khel road network.jpg",
		category: "Road Networks",
		path: "/Bannu And DIKhan/Baka Khel road network.jpg"
	},
	{
		title: "Daraban Road Network",
		filename: "daraban road network.jpg",
		category: "Road Networks",
		path: "/Bannu And DIKhan/daraban road network.jpg"
	},
	{
		title: "Darazinda Road Network",
		filename: "Darazinda road network.jpg",
		category: "Road Networks",
		path: "/Bannu And DIKhan/Darazinda road network.jpg"
	},
	{
		title: "Domel Road Network",
		filename: "Domel road network.jpg",
		category: "Road Networks",
		path: "/Bannu And DIKhan/Domel road network.jpg"
	},
	{
		title: "Kakki Road Network",
		filename: "Kakki road network.jpg",
		category: "Road Networks",
		path: "/Bannu And DIKhan/Kakki road network.jpg"
	},
	{
		title: "Kulachi Road Network",
		filename: "Kulachi road network.jpg",
		category: "Road Networks",
		path: "/Bannu And DIKhan/Kulachi road network.jpg"
	},
	{
		title: "Paharpur Road Network",
		filename: "Paharpur road network.jpg",
		category: "Road Networks",
		path: "/Bannu And DIKhan/Paharpur road network.jpg"
	},
	{
		title: "Paroa Road Network",
		filename: "Paroa road network.jpg",
		category: "Road Networks",
		path: "/Bannu And DIKhan/Paroa road network.jpg"
	},
	// Domel Tehsil Maps
	{
		title: "Domel Boundary Map",
		filename: "Domel Boundary Map.jpg",
		category: "Tehsil Maps",
		tehsil: "Domel",
		path: "/maps/SelectedTehsils/Domel Boundary Map.jpg"
	},
	{
		title: "Domel Sanitation Map",
		filename: "Domel Sanitation Map.jpg",
		category: "Sanitation Maps",
		tehsil: "Domel",
		path: "/maps/SelectedTehsils/Domel Sanitation Map.jpg"
	},
	{
		title: "Domel SW Map",
		filename: "Domel SW Map.jpg",
		category: "Solid Waste Maps",
		tehsil: "Domel",
		path: "/maps/SelectedTehsils/Domel SW Map.jpg"
	},
	{
		title: "Domel SW Zone Map",
		filename: "Domel SW Zone Map.jpg",
		category: "Solid Waste Maps",
		tehsil: "Domel",
		path: "/maps/SelectedTehsils/Domel SW Zone Map.jpg"
	},
	{
		title: "Domel Water Map",
		filename: "Domel Water Map.jpg",
		category: "Water Maps",
		tehsil: "Domel",
		path: "/maps/SelectedTehsils/Domel Water Map.jpg"
	},
	// Kakki Tehsil Maps
	{
		title: "Kakki Boundary Map",
		filename: "Kakki Boundary Map.jpg",
		category: "Tehsil Maps",
		tehsil: "Kakki",
		path: "/maps/SelectedTehsils/Kakki Boundary Map.jpg"
	},
	{
		title: "Kakki Sanitation Map",
		filename: "Kakki Sanitation Map.jpg",
		category: "Sanitation Maps",
		tehsil: "Kakki",
		path: "/maps/SelectedTehsils/Kakki Sanitation Map.jpg"
	},
	{
		title: "Kakki SW Map",
		filename: "Kakki SW Map.jpg",
		category: "Solid Waste Maps",
		tehsil: "Kakki",
		path: "/maps/SelectedTehsils/Kakki SW Map.jpg"
	},
	{
		title: "Kakki SW Zone Map",
		filename: "Kakki SW Zone Map.jpg",
		category: "Solid Waste Maps",
		tehsil: "Kakki",
		path: "/maps/SelectedTehsils/Kakki SW Zone Map.jpg"
	},
	{
		title: "Kakki Water Map",
		filename: "Kakki Water Map.jpg",
		category: "Water Maps",
		tehsil: "Kakki",
		path: "/maps/SelectedTehsils/Kakki Water Map.jpg"
	},
	// Paharpur Tehsil Maps
	{
		title: "Paharpur Boundary Map",
		filename: "Paharpur Boundary Map.jpg",
		category: "Tehsil Maps",
		tehsil: "Paharpur",
		path: "/maps/SelectedTehsils/Paharpur Boundary Map.jpg"
	},
	{
		title: "Paharpur Sanitation Map",
		filename: "Paharpur Sanitation Map.jpg",
		category: "Sanitation Maps",
		tehsil: "Paharpur",
		path: "/maps/SelectedTehsils/Paharpur Sanitation Map.jpg"
	},
	{
		title: "Paharpur SW Map",
		filename: "Paharpur SW Map.jpg",
		category: "Solid Waste Maps",
		tehsil: "Paharpur",
		path: "/maps/SelectedTehsils/Paharpur SW Map.jpg"
	},
	{
		title: "Paharpur SW Zone Map",
		filename: "Paharpur SW Zone Map.jpg",
		category: "Solid Waste Maps",
		tehsil: "Paharpur",
		path: "/maps/SelectedTehsils/Paharpur SW Zone Map.jpg"
	},
	{
		title: "Paharpur Water Map",
		filename: "Paharpur Water Map.jpg",
		category: "Water Maps",
		tehsil: "Paharpur",
		path: "/maps/SelectedTehsils/Paharpur Water Map.jpg"
	},
	// Paniala Tehsil Maps
	{
		title: "Paniala Boundary Map",
		filename: "Paniala Boundary Map.jpg",
		category: "Tehsil Maps",
		tehsil: "Paniala",
		path: "/maps/SelectedTehsils/Paniala Boundary Map.jpg"
	},
	{
		title: "Paniala Sanitation Map",
		filename: "Paniala Sanitation Map.jpg",
		category: "Sanitation Maps",
		tehsil: "Paniala",
		path: "/maps/SelectedTehsils/Paniala Sanitation Map.jpg"
	},
	{
		title: "Paniala SW Map",
		filename: "Paniala SW Map.jpg",
		category: "Solid Waste Maps",
		tehsil: "Paniala",
		path: "/maps/SelectedTehsils/Paniala SW Map.jpg"
	},
	{
		title: "Paniala SW Zone Map",
		filename: "Paniala SW Zone Map.jpg",
		category: "Solid Waste Maps",
		tehsil: "Paniala",
		path: "/maps/SelectedTehsils/Paniala SW Zone Map.jpg"
	},
	{
		title: "Paniala Water Supply Scheme Map",
		filename: "Paniala Water Supply Scheme Map.jpg",
		category: "Water Maps",
		tehsil: "Paniala",
		path: "/maps/SelectedTehsils/Paniala Water Supply Scheme Map.jpg"
	},
	// Paroa Tehsil Maps
	{
		title: "Paroa Boundary Map",
		filename: "Paroa Boundary Map.jpg",
		category: "Tehsil Maps",
		tehsil: "Paroa",
		path: "/maps/SelectedTehsils/Paroa Boundary Map.jpg"
	},
	{
		title: "Paroa Sanitation Map",
		filename: "Paroa Sanitation Map.jpg",
		category: "Sanitation Maps",
		tehsil: "Paroa",
		path: "/maps/SelectedTehsils/Paroa Sanitation Map.jpg"
	},
	{
		title: "Paroa SW Map",
		filename: "Paroa SW Map2.jpg",
		category: "Solid Waste Maps",
		tehsil: "Paroa",
		path: "/maps/SelectedTehsils/Paroa SW Map2.jpg"
	},
	{
		title: "Paroa SW Zone Map",
		filename: "Paroa SW Zone Map.jpg",
		category: "Solid Waste Maps",
		tehsil: "Paroa",
		path: "/maps/SelectedTehsils/Paroa SW Zone Map.jpg"
	},
	{
		title: "Paroa Water Supply Map",
		filename: "Paroa Water Supply Map.jpg",
		category: "Water Maps",
		tehsil: "Paroa",
		path: "/maps/SelectedTehsils/Paroa Water Supply Map.jpg"
	},
];

const categories = [
	"All",
	"District Maps",
	"Tehsil Maps",
	"Demographic Maps",
	"Road Networks",
	"Sanitation Maps",
	"Solid Waste Maps",
	"Water Maps"
];

const tehsils = ["All", "Domel", "Kakki", "Paharpur", "Paniala", "Paroa"];

export default function MapsImagesPage() {
	const [selectedCategory, setSelectedCategory] = useState("All");
	const [selectedTehsil, setSelectedTehsil] = useState("All");
	const [selectedImage, setSelectedImage] = useState<MapImage | null>(null);

	const filteredImages = mapImages.filter(img => {
		const categoryMatch = selectedCategory === "All" || img.category === selectedCategory;
		const tehsilMatch = selectedTehsil === "All" || img.tehsil === selectedTehsil;
		return categoryMatch && tehsilMatch;
	});

	const handleImageClick = (image: MapImage) => {
		setSelectedImage(image);
	};

	const closeModal = () => {
		setSelectedImage(null);
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Maps Images Gallery</h1>
				<p className="text-gray-600 mt-2">Explore maps of Bannu and DI Khan districts</p>
			</div>

			{/* Filters */}
			<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Category Filter */}
					<div>
						<h3 className="text-sm font-semibold text-gray-700 mb-2">Filter by Category</h3>
						<div className="flex flex-wrap gap-2">
							{categories.map((category) => (
								<button
									key={category}
									onClick={() => setSelectedCategory(category)}
									className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
										selectedCategory === category
											? "bg-[#0b4d2b] text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{category}
								</button>
							))}
						</div>
					</div>

					{/* Tehsil Filter */}
					<div>
						<h3 className="text-sm font-semibold text-gray-700 mb-2">Filter by Tehsil</h3>
						<div className="flex flex-wrap gap-2">
							{tehsils.map((tehsil) => (
								<button
									key={tehsil}
									onClick={() => setSelectedTehsil(tehsil)}
									className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
										selectedTehsil === tehsil
											? "bg-blue-600 text-white"
											: "bg-gray-100 text-gray-700 hover:bg-gray-200"
									}`}
								>
									{tehsil}
								</button>
							))}
						</div>
					</div>
				</div>

				{/* Results Count */}
				<div className="mt-4 pt-4 border-t border-gray-200">
					<p className="text-sm text-gray-600">
						Showing <span className="font-semibold text-gray-900">{filteredImages.length}</span> of {mapImages.length} maps
					</p>
				</div>
			</div>

			{/* Images Grid */}
			{filteredImages.length === 0 ? (
				<div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
					<p className="text-gray-600">No maps found matching the selected filters.</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{filteredImages.map((image, index) => (
						<div
							key={index}
							className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
							onClick={() => handleImageClick(image)}
						>
							<div className="aspect-video relative bg-gray-100">
								<Image
									src={image.path}
									alt={image.title}
									fill
									className="object-cover group-hover:scale-105 transition-transform duration-200"
									unoptimized
									onError={(e) => {
										const target = e.target as HTMLImageElement;
										target.src = '/placeholder-map.jpg';
									}}
								/>
							</div>
							<div className="p-4">
								<h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">{image.title}</h3>
								<div className="flex flex-wrap gap-1">
									<span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
										{image.category}
									</span>
									{image.tehsil && (
										<span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
											{image.tehsil}
										</span>
									)}
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Modal for Full Size Image */}
			{selectedImage && (
				<div 
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
					onClick={closeModal}
				>
					<div className="relative max-w-6xl max-h-[90vh] w-full" onClick={(e) => e.stopPropagation()}>
						<button
							onClick={closeModal}
							className="absolute top-4 right-4 bg-white text-gray-800 rounded-full p-2 hover:bg-gray-100 z-10 shadow-lg"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
						<div className="bg-white rounded-lg overflow-hidden shadow-2xl">
							<div className="relative" style={{ maxHeight: '80vh', overflow: 'auto' }}>
								<Image
									src={selectedImage.path}
									alt={selectedImage.title}
									width={1200}
									height={800}
									className="w-full h-auto"
									unoptimized
								/>
							</div>
							<div className="p-6 border-t border-gray-200">
								<h3 className="text-xl font-semibold text-gray-900 mb-2">
									{selectedImage.title}
								</h3>
								<div className="flex flex-wrap gap-2">
									<span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
										{selectedImage.category}
									</span>
									{selectedImage.tehsil && (
										<span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
											{selectedImage.tehsil} Tehsil
										</span>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
