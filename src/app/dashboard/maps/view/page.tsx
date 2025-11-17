'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Droplet, Trash2, Layers } from 'lucide-react';
import Link from 'next/link';

// GIS Map Component
function GISMapViewer({ filePath, mapType }: { filePath: string; mapType: string }) {
	const mapContainerRef = useRef<HTMLDivElement>(null);
	const mapInstanceRef = useRef<any>(null);
	const [mapLoaded, setMapLoaded] = useState(false);
	const [mapError, setMapError] = useState<string | null>(null);

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

					// Initialize map - center will be adjusted based on data
					const map = L.map(container, {
						center: [32.0, 70.75],
						zoom: 10,
						zoomControl: true,
						attributionControl: true
					});

					mapInstanceRef.current = map;

					L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						attribution: '© OpenStreetMap contributors',
						maxZoom: 19
					}).addTo(map);

					const loadGeoJSONLayer = async () => {
						try {
							const response = await fetch(filePath);
							if (!response.ok) {
								throw new Error('Failed to load map data');
							}
							
							const geoJsonData = await response.json();
							
							// Determine style based on map type
							let style: any = {
								color: '#0b4d2b',
								weight: 3,
								opacity: 0.8,
								fillColor: '#0b4d2b',
								fillOpacity: 0.2
							};

							if (mapType === 'water') {
								style = {
									color: '#007bff',
									weight: 2,
									opacity: 0.8,
									fillColor: '#007bff',
									fillOpacity: 0.15
								};
							} else if (mapType === 'sw') {
								style = {
									color: '#dc3545',
									weight: 2,
									opacity: 0.8,
									fillColor: '#dc3545',
									fillOpacity: 0.15
								};
							} else if (mapType === 'projectarea') {
								style = {
									color: '#28a745',
									weight: 2,
									opacity: 0.8,
									fillColor: '#28a745',
									fillOpacity: 0.15
								};
							}

							const layer = L.geoJSON(geoJsonData, {
								style: style,
										pointToLayer: (feature: any, latlng: any) => {
									let color = '#0b4d2b';
									if (mapType === 'water') color = '#007bff';
									else if (mapType === 'sw') color = '#dc3545';
									else if (mapType === 'projectarea') color = '#28a745';

									return L.circleMarker(latlng, {
										radius: 6,
										fillColor: color,
										color: '#fff',
										weight: 2,
										opacity: 1,
										fillOpacity: 0.8
									});
								},
								onEachFeature: (feature: any, layer: any) => {
									if (feature.properties) {
										const props = feature.properties;
										let popupContent = '<div style="font-weight: bold; margin-bottom: 5px;">';
										
										if (props.NC) popupContent += props.NC;
										else if (props.VCs) popupContent += props.VCs;
										else if (props.Name) popupContent += props.Name;
										else popupContent += 'Feature';
										
										popupContent += '</div>';
										
										if (props.Tehsil) popupContent += `<div>Tehsil: ${props.Tehsil}</div>`;
										if (props.District) popupContent += `<div>District: ${props.District}</div>`;
										if (props.Feature) popupContent += `<div>Feature: ${props.Feature}</div>`;
										if (props.Status) popupContent += `<div>Status: ${props.Status}</div>`;
										
										layer.bindPopup(popupContent);
									}
								}
							}).addTo(map);

							if (layer.getBounds && layer.getBounds().isValid()) {
								map.fitBounds(layer.getBounds(), { padding: [20, 20] });
							}

						} catch (error) {
							console.error('Error loading GeoJSON:', error);
							if (isMounted) setMapError('Failed to load map data: ' + (error instanceof Error ? error.message : 'Unknown error'));
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
								loadGeoJSONLayer();
								if (isMounted) setMapLoaded(true);
							} catch (e) {
								console.error('Error:', e);
								if (isMounted) setMapLoaded(true);
							}
						}, 200);
					});
				} catch (error) {
					console.error('Error initializing map:', error);
					if (isMounted) {
						setMapError('Failed to initialize map: ' + (error instanceof Error ? error.message : 'Unknown error'));
					}
				}
			}, 300);
		};

		initDelay = setTimeout(() => {
			if ((window as any).L) {
				initializeMap();
				return;
			}

			const existingCSS = document.querySelector('link[href*="leaflet"]');
			if (!existingCSS) {
				linkElement = document.createElement('link');
				linkElement.rel = 'stylesheet';
				linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
				linkElement.crossOrigin = 'anonymous';
				document.head.appendChild(linkElement);
			}

			const existingScript = document.querySelector('script[src*="leaflet"]');
			if (existingScript) {
				checkInterval = setInterval(() => {
					if ((window as any).L) {
						if (checkInterval) clearInterval(checkInterval);
						initializeMap();
					}
				}, 100);
				
				timeoutId = setTimeout(() => {
					if (checkInterval) clearInterval(checkInterval);
					if (!(window as any).L && isMounted) {
						setMapError('Map library is taking too long to load');
					}
				}, 10000);
			} else {
				scriptElement = document.createElement('script');
				scriptElement.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
				scriptElement.crossOrigin = 'anonymous';
				scriptElement.async = true;
				scriptElement.onload = () => {
					if (isMounted) {
						setTimeout(initializeMap, 200);
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
					console.error('Error removing map:', e);
				}
				mapInstanceRef.current = null;
			}
		};
	}, [filePath, mapType]);

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
							<p className="text-sm text-gray-600">Loading map...</p>
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

export default function MapViewPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const district = searchParams.get('district');
	const tehsil = searchParams.get('tehsil');
	const file = searchParams.get('file');

	const getMapType = (fileName: string): string => {
		if (fileName.toLowerCase().includes('water')) return 'water';
		if (fileName.toLowerCase().includes('sw') || fileName.toLowerCase().includes('solid')) return 'sw';
		if (fileName.toLowerCase().includes('project')) return 'projectarea';
		return 'boundary';
	};

	const getFilePath = (): string => {
		if (!district || !file) return '';
		
		// Determine the correct path based on district and file location
		if (district === 'Bannu') {
			// Check if file is in Bannu subfolder
			if (file.includes('Kakki')) {
				return `/maps/Bannu/Kakki/${file}`;
			}
			// Most Bannu files are in the Bannu folder
			return `/maps/Bannu/${file}`;
		} else if (district === 'DIK') {
			// Check if file is in DIK subfolder
			if (file.includes('Paharpur')) {
				return `/maps/DIK/Paharpur/${file}`;
			}
			// DIK files might be in root or DIK folder - try root first
			return `/maps/${file}`;
		}
		return `/maps/${file}`;
	};

	const getMapIcon = (mapType: string) => {
		switch (mapType) {
			case 'water':
				return Droplet;
			case 'sw':
				return Trash2;
			case 'projectarea':
				return Layers;
			default:
				return MapPin;
		}
	};

	if (!district || !tehsil || !file) {
		return (
			<div className="space-y-6">
				<div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
					<p className="text-red-600">Invalid map parameters. Please select a map from the master page.</p>
					<Link href="/dashboard/maps" className="mt-4 inline-block px-4 py-2 bg-[#0b4d2b] text-white rounded-lg hover:bg-[#0a3d24] transition-colors">
						Go to Maps Master
					</Link>
				</div>
			</div>
		);
	}

	const mapType = getMapType(file);
	const filePath = getFilePath();
	const MapIcon = getMapIcon(mapType);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<Link 
						href="/dashboard/maps"
						className="inline-flex items-center text-sm text-gray-600 hover:text-[#0b4d2b] mb-2"
					>
						<ArrowLeft className="h-4 w-4 mr-1" />
						Back to Maps Master
					</Link>
					<h1 className="text-3xl font-bold text-gray-900">{tehsil} - {district}</h1>
					<p className="text-gray-600 mt-2">Interactive GIS Map</p>
				</div>
				<div className="flex items-center space-x-2 px-4 py-2 bg-gray-100 rounded-lg">
					<MapIcon className="h-5 w-5 text-gray-600" />
					<span className="text-sm font-medium text-gray-700 capitalize">
						{mapType === 'sw' ? 'Solid Waste' : mapType === 'projectarea' ? 'Project Area' : mapType}
					</span>
				</div>
			</div>

			{/* Map Container */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">{file.replace('.json', '').replace(/_/g, ' ')}</h2>
					<p className="text-sm text-gray-600 mt-1">Click on features to view detailed information</p>
				</div>
				<div className="p-6">
					<GISMapViewer filePath={filePath} mapType={mapType} />
				</div>
			</div>
		</div>
	);
}

