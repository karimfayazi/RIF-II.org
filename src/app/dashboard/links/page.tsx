"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Search, Globe, FileText, RotateCcw } from "lucide-react";

type LinkData = {
	LinkID: number;
	Title: string;
	Description: string | null;
	Url: string;
};

export default function LinksPage() {
	const [links, setLinks] = useState<LinkData[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchLinks();
	}, []);

	const fetchLinks = async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/links");
			const data = await response.json();
			
			if (data.success) {
				setLinks(data.links || []);
			} else {
				setError(data.message || "Failed to fetch links");
			}
		} catch (err) {
			setError("Error fetching links");
			console.error("Error fetching links:", err);
		} finally {
			setLoading(false);
		}
	};

	const filteredLinks = links.filter(link =>
		link.Title.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const openLink = (url: string) => {
		window.open(url, '_blank', 'noopener,noreferrer');
	};

	if (loading) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Important Links</h1>
					<p className="text-gray-600 mt-2">Access important resources and external links</p>
				</div>
				<div className="flex items-center justify-center py-12">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
					<span className="ml-3 text-gray-600">Loading links...</span>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<div>
					<h1 className="text-2xl font-bold text-gray-900">Important Links</h1>
					<p className="text-gray-600 mt-2">Access important resources and external links</p>
				</div>
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
					<p className="text-red-600">{error}</p>
					<button
						onClick={fetchLinks}
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
			<div>
				<h1 className="text-2xl font-bold text-gray-900">Important Links</h1>
				<p className="text-gray-600 mt-2">Access important resources and external links</p>
			</div>

			{/* Search Filter */}
			<div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg p-6">
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="text-lg font-semibold text-gray-900">Search Links</h3>
						<p className="text-sm text-gray-600">Find specific links by title</p>
					</div>
					<div className="flex items-center space-x-4">
						<div className="flex items-center space-x-2">
							<div className="h-2 w-2 bg-green-500 rounded-full"></div>
							<span className="text-xs text-gray-500 font-medium">Live Search</span>
						</div>
						<button
							onClick={() => setSearchTerm("")}
							disabled={!searchTerm}
							className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
						>
							<RotateCcw className="h-3 w-3 mr-1" />
							Reset
						</button>
					</div>
				</div>
				
				<div className="relative group">
					<input
						type="text"
						placeholder="Type to search links by title..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full px-4 py-4 text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0b4d2b]/20 focus:border-[#0b4d2b] focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
					/>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm("")}
							className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
						>
							<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					)}
				</div>
				
				{searchTerm && (
					<div className="mt-4 flex items-center justify-between">
						<div className="flex items-center space-x-2">
							<div className="h-1.5 w-1.5 bg-[#0b4d2b] rounded-full animate-pulse"></div>
							<span className="text-sm text-gray-600">
								Searching for: <span className="font-medium text-gray-900">&ldquo;{searchTerm}&rdquo;</span>
							</span>
						</div>
						<div className="text-xs text-gray-500">
							{filteredLinks.length} result{filteredLinks.length !== 1 ? 's' : ''} found
						</div>
					</div>
				)}
			</div>

			{/* Links Grid */}
			{filteredLinks.length === 0 ? (
				<div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
					<Globe className="mx-auto h-12 w-12 text-gray-400 mb-4" />
					<h3 className="text-lg font-medium text-gray-900 mb-2">
						{searchTerm ? "No links found" : "No links available"}
					</h3>
					<p className="text-gray-600">
						{searchTerm ? "Try adjusting your search terms" : "Links will appear here once they are added"}
					</p>
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{filteredLinks.map((link) => (
						<div
							key={link.LinkID}
							className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
							onClick={() => openLink(link.Url)}
						>
							<div className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div className="flex-1">
										<h3 className="text-lg font-semibold text-gray-900 group-hover:text-[#0b4d2b] transition-colors line-clamp-2">
											{link.Title}
										</h3>
									</div>
									<ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-[#0b4d2b] transition-colors flex-shrink-0 ml-2" />
								</div>
								
								{link.Description && (
									<p className="text-gray-600 text-sm mb-4 line-clamp-3">
										{link.Description}
									</p>
								)}
								
								<div className="flex items-center justify-between">
									<div className="flex items-center text-xs text-gray-500">
										<Globe className="h-3 w-3 mr-1" />
										<span className="truncate max-w-[200px]">
											{new URL(link.Url).hostname}
										</span>
									</div>
									<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
										Click to open
									</span>
								</div>
							</div>
						</div>
					))}
				</div>
			)}

			{/* Results Count */}
			{filteredLinks.length > 0 && (
				<div className="text-center text-sm text-gray-500">
					Showing {filteredLinks.length} of {links.length} links
					{searchTerm && ` matching "${searchTerm}"`}
				</div>
			)}
		</div>
	);
}

