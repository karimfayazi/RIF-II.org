'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Building2, Route, Droplet, Layers } from 'lucide-react';

type ShapefileMap = {
	id: string;
	name: string;
	type: 'district' | 'tehsil' | 'roads' | 'waterways';
	icon: React.ComponentType<{ className?: string }>;
	color: string;
	shpFile: string;
	description: string;
	hasGeoJson?: boolean;
};

const shapefileMaps: ShapefileMap[] = [
	{
		id: 'bannu-district',
		name: 'Bannu District Electoral Comm',
		type: 'district',
		icon: MapPin,
		color: 'bg-blue-500',
		shpFile: 'Bannu_District_elect_comm.shp',
		description: 'Bannu District Electoral Commission boundaries'
	},
	{
		id: 'bannu-tehsil',
		name: 'Bannu Tehsil Electoral Comm',
		type: 'tehsil',
		icon: Building2,
		color: 'bg-green-500',
		shpFile: 'Bannu_Tehsil_elect_comm.shp',
		description: 'Bannu Tehsil Electoral Commission boundaries'
	},
	{
		id: 'dik-district',
		name: 'DIK District',
		type: 'district',
		icon: MapPin,
		color: 'bg-blue-500',
		shpFile: 'DIKhanDistrict.shp',
		description: 'DI Khan District boundaries'
	},
	{
		id: 'dik-tehsil',
		name: 'DIK Tehsil',
		type: 'tehsil',
		icon: Building2,
		color: 'bg-green-500',
		shpFile: 'DIKhan_Tehsil.shp',
		description: 'DI Khan Tehsil boundaries'
	},
	{
		id: 'kp-districts',
		name: 'KPK Districts',
		type: 'district',
		icon: Layers,
		color: 'bg-purple-500',
		shpFile: 'KP_Districts.shp',
		description: 'Khyber Pakhtunkhwa Province Districts'
	},
	{
		id: 'pak-roads',
		name: 'Pakistan Roads Network',
		type: 'roads',
		icon: Route,
		color: 'bg-orange-500',
		shpFile: 'hotosm_pak_roads_lines_shp.shp',
		description: 'OpenStreetMap Pakistan roads network'
	},
	{
		id: 'pak-waterways',
		name: 'Pakistan Waterways',
		type: 'waterways',
		icon: Droplet,
		color: 'bg-cyan-500',
		shpFile: 'hotosm_pak_waterways_lines_shp.shp',
		description: 'OpenStreetMap Pakistan waterways'
	},
];

// GIS Map Component using GeoJSON files
function GeoJSONMapViewer({ shpFile, mapType }: { shpFile: string; mapType: string }) {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [mapError, setMapError] = useState<string | null>(null);
	const [loadingProgress, setLoadingProgress] = useState('Loading map...');

	useEffect(() => {
		if (!mapContainerRef.current) return;

		let linkElement: HTMLLinkElement | null = null;
		let scriptElement: HTMLScriptElement | null = null;
		let timeoutId: NodeJS.Timeout | null = null;
		let checkInterval: NodeJS.Timeout | null = null;
		let initDelay: NodeJS.Timeout | null = null;
		let isMounted = true;

		const initializeMap = () => {
			if (!isMounted || !mapContainerRef.current) return;
			
			if (mapInstanceRef.current) {
				return;
			}

			setTimeout(() => {
				if (!isMounted || !mapContainerRef.current) return;
				
				try {
					const L = (window as any).L;
					
					if (!L) {
						if (isMounted) setMapError('Map library failed to load');
						return;
					}

					if (!mapContainerRef.current) {
						if (isMounted) setMapError('Map container not found');
						return;
					}

					const container = mapContainerRef.current;
					if (container.offsetWidth === 0 || container.offsetHeight === 0) {
						setTimeout(initializeMap, 200);
						return;
					}

					delete (L.Icon.Default.prototype as any)._getIconUrl;
					L.Icon.Default.mergeOptions({
						iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
						iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
						shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
					});

					const map = L.map(container, {
						center: [32.0, 70.75],
						zoom: 8,
						zoomControl: true,
						attributionControl: true
					});

					mapInstanceRef.current = map;

					L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						attribution: '© OpenStreetMap contributors',
						maxZoom: 19
					}).addTo(map);

					const loadGeoJSON = async () => {
						try {
							if (isMounted) setLoadingProgress('Loading map data...');
							
							// Get base filename without extension
							const baseName = shpFile.replace('.shp', '');
							
							// Load GeoJSON file directly
							const geoJsonResponse = await fetch(`/maps/Shapefiles/${baseName}.geojson`);
							
							if (!geoJsonResponse.ok) {
								throw new Error(`GeoJSON file not found. Please convert the shapefile to GeoJSON format using the converter above.`);
							}
							
							const geoJson = await geoJsonResponse.json();
							
							if (isMounted) setLoadingProgress('Rendering map...');
							renderGeoJSON(geoJson);
							
						} catch (error) {
							if (isMounted) {
								const errorMsg = error instanceof Error ? error.message : 'Unknown error';
								setMapError(
									`Failed to load map data: ${errorMsg}. ` +
									`Please use the converter above to convert this shapefile to GeoJSON format.`
								);
								setLoadingProgress('');
							}
						}
					};

					const renderGeoJSON = (geoJson: any) => {
						if (!mapInstanceRef.current) return;
							
						// Determine style based on map type
						let style: any = {
							color: '#0b4d2b',
							weight: 2,
							opacity: 0.8,
							fillColor: '#0b4d2b',
							fillOpacity: 0.2
						};

						if (mapType === 'roads') {
							style = {
								color: '#ff6b35',
								weight: 2,
								opacity: 0.9,
								fillOpacity: 0
							};
						} else if (mapType === 'waterways') {
							style = {
								color: '#007bff',
								weight: 2,
								opacity: 0.8,
								fillOpacity: 0
							};
						} else if (mapType === 'district') {
							style = {
								color: '#0b4d2b',
								weight: 3,
								opacity: 0.8,
								fillColor: '#0b4d2b',
								fillOpacity: 0.15
							};
						} else if (mapType === 'tehsil') {
							style = {
								color: '#28a745',
								weight: 2,
								opacity: 0.8,
								fillColor: '#28a745',
								fillOpacity: 0.15
							};
						}

						const layer = L.geoJSON(geoJson, {
							style: style,
							onEachFeature: (feature: any, layer: any) => {
								if (feature.properties) {
									const props = feature.properties;
									let popupContent = '<div style="font-weight: bold; margin-bottom: 5px;">';
									
									// Try to find a name property
									const nameProps = ['NAME', 'Name', 'name', 'DISTRICT', 'TEHSIL', 'NAME_1', 'NAME_2'];
									let name = 'Feature';
									for (const prop of nameProps) {
										if (props[prop]) {
											name = props[prop];
											break;
										}
									}
									popupContent += name + '</div>';
									
									// Add other properties
									Object.keys(props).slice(0, 5).forEach(key => {
										if (key !== 'NAME' && key !== 'Name' && key !== 'name') {
											popupContent += `<div><strong>${key}:</strong> ${props[key]}</div>`;
										}
									});
									
									layer.bindPopup(popupContent);
								}
							}
						}).addTo(mapInstanceRef.current);

						if (layer.getBounds && layer.getBounds().isValid()) {
							mapInstanceRef.current.fitBounds(layer.getBounds(), { padding: [20, 20] });
						}

						if (isMounted) {
							setMapLoaded(true);
							setLoadingProgress('');
						}
					};

					map.whenReady(() => {
						if (!isMounted) return;
						setTimeout(() => {
							if (!isMounted) return;
							try {
								if (mapInstanceRef.current) {
									mapInstanceRef.current.invalidateSize();
								}
								loadGeoJSON();
							} catch (e) {
								if (isMounted) {
									setMapError('Failed to initialize map');
									setLoadingProgress('');
								}
							}
						}, 200);
					});
				} catch (error) {
					if (isMounted) {
						setMapError('Failed to initialize map: ' + (error instanceof Error ? error.message : 'Unknown error'));
						setLoadingProgress('');
					}
				}
			}, 300);
		};

		// Load Leaflet and initialize map (no shapefile.js needed - using GeoJSON directly)
		const initializeMapWithLeaflet = () => {
			// Leaflet is already loaded, just initialize the map
			if (isMounted) {
				setLoadingProgress('Initializing map...');
				setTimeout(() => {
					if (isMounted) initializeMap();
				}, 100);
			}
		};

		// Small delay to ensure component is fully mounted
		initDelay = setTimeout(() => {
			// Check if Leaflet is already loaded
			if ((window as any).L) {
				initializeMapWithLeaflet();
				return;
			}

			// Check if CSS is already loaded
			const existingCSS = document.querySelector('link[href*="leaflet"]');
			if (!existingCSS) {
				linkElement = document.createElement('link');
				linkElement.rel = 'stylesheet';
				linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
				linkElement.crossOrigin = 'anonymous';
				document.head.appendChild(linkElement);
			}

			// Check if script is already loading/loaded
			const existingScript = document.querySelector('script[src*="leaflet"]');
			if (existingScript) {
				checkInterval = setInterval(() => {
					if ((window as any).L) {
						if (checkInterval) clearInterval(checkInterval);
						initializeMapWithLeaflet();
					}
				}, 100);
				
				timeoutId = setTimeout(() => {
					if (checkInterval) clearInterval(checkInterval);
					if (!(window as any).L && isMounted) {
						setMapError('Map library is taking too long to load');
					}
				}, 8000);
			} else {
				scriptElement = document.createElement('script');
				scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
				scriptElement.crossOrigin = 'anonymous';
				scriptElement.async = true;
				scriptElement.onload = () => {
					if (isMounted) {
						initializeMapWithLeaflet();
					}
				};
				scriptElement.onerror = () => {
					if (isMounted) {
						setMapError('Failed to load map library. Please check your internet connection.');
					}
				};
				document.body.appendChild(scriptElement);
			}
		}, 100);

		return () => {
			isMounted = false;
			if (timeoutId) clearTimeout(timeoutId);
			if (checkInterval) clearInterval(checkInterval);
			if (initDelay) clearTimeout(initDelay);
			if (mapInstanceRef.current) {
				try {
					mapInstanceRef.current.remove();
				} catch (e) {
					// Silently handle cleanup errors
				}
				mapInstanceRef.current = null;
			}
			// Clean up dynamically added scripts and links
			if (linkElement && linkElement.parentNode) {
				linkElement.parentNode.removeChild(linkElement);
			}
			if (scriptElement && scriptElement.parentNode) {
				scriptElement.parentNode.removeChild(scriptElement);
			}
		};
	}, [shpFile, mapType]);

	return (
		<div className="relative w-full overflow-hidden rounded-lg border border-gray-200">
			<div 
				ref={mapContainerRef}
				className="w-full bg-gray-100"
				style={{ 
					height: '600px', 
					minHeight: '600px', 
					position: 'relative',
					zIndex: 1
				}}
			>
				{!mapLoaded && !mapError && (
					<div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20 pointer-events-none">
						<div className="text-center">
							<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b] mx-auto mb-2"></div>
							<p className="text-sm text-gray-600">{loadingProgress || 'Loading map...'}</p>
						</div>
					</div>
				)}
				{mapError && (
					<div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
						<div className="text-center p-4">
							<p className="text-sm text-red-600 mb-2">{mapError}</p>
							<button
								onClick={() => {
									setMapError(null);
									setMapLoaded(false);
									window.location.reload();
								}}
								className="px-4 py-2 bg-[#0b4d2b] text-white rounded-lg hover:bg-[#0a3d24] transition-colors text-sm"
							>
								Retry
							</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default function ShapefilesPage() {
	const [selectedMap, setSelectedMap] = useState<ShapefileMap | null>(null);
	const [converting, setConverting] = useState<string | null>(null);
	const [conversionStatus, setConversionStatus] = useState<{ [key: string]: 'success' | 'error' | null }>({});
	const [shapefileList, setShapefileList] = useState<any[]>([]);
	const [showConverter, setShowConverter] = useState(false);

	// Fetch list of shapefiles and their conversion status
	useEffect(() => {
		fetchShapefileList();
	}, []);

	const fetchShapefileList = async () => {
		try {
			const response = await fetch('/api/maps/convert-shapefile');
			const result = await response.json();
			if (result.success) {
				setShapefileList(result.shapefiles || []);
			}
		} catch (error) {
			// Silently handle fetch errors
		}
	};

	const convertShapefile = async (filename: string) => {
		setConverting(filename);
		setConversionStatus(prev => ({ ...prev, [filename]: null }));
		
		try {
			const response = await fetch('/api/maps/convert-shapefile', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ filename }),
			});

			const result = await response.json();

			if (result.success) {
				setConversionStatus(prev => ({ ...prev, [filename]: 'success' }));
				// Refresh the list
				await fetchShapefileList();
				// Clear status after 3 seconds
				setTimeout(() => {
					setConversionStatus(prev => ({ ...prev, [filename]: null }));
				}, 3000);
			} else {
				setConversionStatus(prev => ({ ...prev, [filename]: 'error' }));
			}
		} catch (error) {
			setConversionStatus(prev => ({ ...prev, [filename]: 'error' }));
		} finally {
			setConverting(null);
		}
	};

	const convertAllShapefiles = async () => {
		const filesToConvert = shapefileList.filter(sf => !sf.hasGeoJson);
		
		for (const shapefile of filesToConvert) {
			await convertShapefile(shapefile.filename);
			// Small delay between conversions
			await new Promise(resolve => setTimeout(resolve, 500));
		}
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Shapefile Maps</h1>
				<p className="text-gray-600 mt-2">Interactive maps from shapefile data - Districts, Tehsils, Roads, and Waterways</p>
			</div>

			{/* Info Banner & Converter */}
			<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<div className="flex items-start justify-between">
					<div className="flex items-start flex-1">
						<svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						<div className="flex-1">
							<h3 className="text-sm font-semibold text-blue-900 mb-1">Shapefile to GeoJSON Converter</h3>
							<p className="text-sm text-blue-800 mb-3">
								For best performance, shapefiles should be converted to GeoJSON format. The page will automatically use GeoJSON versions if available.
								You can convert shapefiles directly in this application using the converter below.
							</p>
							<button
								onClick={() => setShowConverter(!showConverter)}
								className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
							>
								{showConverter ? 'Hide' : 'Show'} Converter
								<svg className={`w-4 h-4 ml-2 transition-transform ${showConverter ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
								</svg>
							</button>
						</div>
					</div>
				</div>

				{/* Converter Panel */}
				{showConverter && (
					<div className="mt-4 pt-4 border-t border-blue-200">
						<div className="flex items-center justify-between mb-3">
							<h4 className="text-sm font-semibold text-blue-900">Available Shapefiles</h4>
							{shapefileList.filter(sf => !sf.hasGeoJson).length > 0 && (
								<button
									onClick={convertAllShapefiles}
									disabled={converting !== null}
									className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
								>
									Convert All ({shapefileList.filter(sf => !sf.hasGeoJson).length})
								</button>
							)}
						</div>
						<div className="space-y-2 max-h-60 overflow-y-auto">
							{shapefileList.length === 0 ? (
								<p className="text-sm text-blue-700">Loading shapefiles...</p>
							) : (
								shapefileList.map((sf) => (
									<div key={sf.filename} className="flex items-center justify-between p-2 bg-white rounded border border-blue-200">
										<div className="flex items-center space-x-2 flex-1 min-w-0">
											{sf.hasGeoJson ? (
												<svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
											) : (
												<svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
												</svg>
											)}
											<span className="text-sm text-gray-700 truncate">{sf.filename}</span>
											{sf.hasGeoJson && (
												<span className="text-xs text-green-600 font-medium">✓ GeoJSON Available</span>
											)}
										</div>
										{!sf.hasGeoJson && (
											<button
												onClick={() => convertShapefile(sf.filename)}
												disabled={converting === sf.filename || converting !== null}
												className="ml-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
											>
												{converting === sf.filename ? (
													<>
														<div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
														Converting...
													</>
												) : (
													'Convert'
												)}
											</button>
										)}
										{conversionStatus[sf.filename] === 'success' && (
											<span className="ml-2 text-xs text-green-600 font-medium">✓ Converted!</span>
										)}
										{conversionStatus[sf.filename] === 'error' && (
											<span className="ml-2 text-xs text-red-600 font-medium">✗ Failed</span>
										)}
									</div>
								))
							)}
						</div>
					</div>
				)}
			</div>

			{/* Map Selection */}
			{!selectedMap ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{shapefileMaps.map((map) => {
						const Icon = map.icon;
						const baseName = map.shpFile.replace('.shp', '');
						const hasGeoJson = shapefileList.find(sf => sf.baseName === baseName)?.hasGeoJson || false;
						
						return (
							<div
								key={map.id}
								onClick={() => setSelectedMap({ ...map, hasGeoJson })}
								className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer group relative"
							>
								{hasGeoJson && (
									<div className="absolute top-3 right-3 z-10">
										<span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
											<svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											GeoJSON
										</span>
									</div>
								)}
								<div className="p-6">
									<div className={`inline-flex p-3 ${map.color} rounded-lg text-white mb-4`}>
										<Icon className="h-6 w-6" />
									</div>
									<h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#0b4d2b] transition-colors pr-16">
										{map.name}
									</h3>
									<p className="text-sm text-gray-600 mb-4">{map.description}</p>
									<div className="flex items-center justify-between">
										<div className="flex items-center text-sm text-[#0b4d2b] font-medium">
											View Map
											<svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</div>
										{hasGeoJson && (
											<span className="text-xs text-green-600 font-medium">⚡ Fast Loading</span>
										)}
									</div>
								</div>
							</div>
						);
					})}
				</div>
			) : (
				<div className="space-y-4">
					{/* Back Button */}
					<button
						onClick={() => setSelectedMap(null)}
						className="inline-flex items-center text-sm text-gray-600 hover:text-[#0b4d2b] transition-colors"
					>
						<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						Back to Map Selection
					</button>

					{/* Map Header */}
					<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
						<div className="flex items-center justify-between">
							<div className="flex-1">
								<div className="flex items-center gap-3 mb-2">
									<h2 className="text-2xl font-semibold text-gray-900">{selectedMap.name}</h2>
									{selectedMap.hasGeoJson && (
										<span className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
											<svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
											</svg>
											GeoJSON Available - Fast Loading
										</span>
									)}
								</div>
								<p className="text-gray-600">{selectedMap.description}</p>
							</div>
							<div className={`inline-flex p-3 ${selectedMap.color} rounded-lg text-white ml-4`}>
								<selectedMap.icon className="h-6 w-6" />
							</div>
						</div>
					</div>

					{/* Map Container */}
					<div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
						<div className="p-6">
							<GeoJSONMapViewer shpFile={selectedMap.shpFile} mapType={selectedMap.type} />
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

