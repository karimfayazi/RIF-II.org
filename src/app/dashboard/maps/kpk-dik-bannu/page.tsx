'use client';

import { useEffect, useRef, useState } from 'react';

// GIS Map Component with Boundaries using Leaflet (OpenStreetMap)
function GISMapWithBoundaries() {
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
			
			// Prevent double initialization
			if (mapInstanceRef.current) {
				return;
			}

			// Wait a bit to ensure DOM is ready
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

					// Clear any existing map
					if (mapInstanceRef.current) {
						try {
							mapInstanceRef.current.remove();
						} catch (e) {
							console.warn('Error removing existing map:', e);
						}
						mapInstanceRef.current = null;
					}

					// Ensure container has proper dimensions
					const container = mapContainerRef.current;
					if (container.offsetWidth === 0 || container.offsetHeight === 0) {
						setTimeout(initializeMap, 200);
						return;
					}

					// Fix default marker icon issue
					delete (L.Icon.Default.prototype as any)._getIconUrl;
					L.Icon.Default.mergeOptions({
						iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
						iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
						shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
					});

					// Initialize map centered on Paharpur
					const map = L.map(container, {
						center: [32.105, 70.97],
						zoom: 13,
						zoomControl: true,
						attributionControl: true
					});

					mapInstanceRef.current = map;

					// Add OpenStreetMap tile layer
					L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						attribution: '© OpenStreetMap contributors',
						maxZoom: 19
					}).addTo(map);

					// Load and display GeoJSON layers
					const loadGeoJSONLayers = async () => {
						try {
							// Load Boundary layer
							const boundaryResponse = await fetch('/maps/DIK/Paharpur/Paharpur_NC_Boundary_WGS84.json');
							if (boundaryResponse.ok) {
								const boundaryData = await boundaryResponse.json();
								L.geoJSON(boundaryData, {
									style: {
										color: '#0b4d2b',
										weight: 3,
										opacity: 0.8,
										fillColor: '#0b4d2b',
										fillOpacity: 0.2
									},
									onEachFeature: (feature: any, layer: any) => {
										if (feature.properties) {
											const props = feature.properties;
											const popupContent = `
												<div style="font-weight: bold; margin-bottom: 5px;">${props.NC || 'Boundary'}</div>
												<div>Tehsil: ${props.Tehsil || 'N/A'}</div>
												<div>District: ${props.District || 'N/A'}</div>
											`;
											layer.bindPopup(popupContent);
										}
									}
								}).addTo(map);
							}

							// Load Solid Waste points layer
							const swResponse = await fetch('/maps/DIK/Paharpur/Paharpur_NC_Sw_WGS84.json');
							if (swResponse.ok) {
								const swData = await swResponse.json();
								L.geoJSON(swData, {
									pointToLayer: (feature: any, latlng: any) => {
										const status = feature.properties?.Status || '';
										const isOfficial = status.toLowerCase().includes('official');
										return L.circleMarker(latlng, {
											radius: 6,
											fillColor: isOfficial ? '#28a745' : '#dc3545',
											color: '#fff',
											weight: 2,
											opacity: 1,
											fillOpacity: 0.8
										});
									},
									onEachFeature: (feature: any, layer: any) => {
										if (feature.properties) {
											const props = feature.properties;
											const popupContent = `
												<div style="font-weight: bold; margin-bottom: 5px;">${props.Name || 'Dumping Site'}</div>
												<div>Status: ${props.Status || 'N/A'}</div>
											`;
											layer.bindPopup(popupContent);
										}
									}
								}).addTo(map);
							}

							// Load Water points layer
							const waterResponse = await fetch('/maps/DIK/Paharpur/Paharpur_NC_Water_WGS84.json');
							if (waterResponse.ok) {
								const waterData = await waterResponse.json();
								L.geoJSON(waterData, {
									pointToLayer: (feature: any, latlng: any) => {
										const featureType = feature.properties?.Feature || '';
										const isFunctional = featureType.toLowerCase().includes('functional');
										return L.circleMarker(latlng, {
											radius: 6,
											fillColor: isFunctional ? '#007bff' : '#6c757d',
											color: '#fff',
											weight: 2,
											opacity: 1,
											fillOpacity: 0.8
										});
									},
									onEachFeature: (feature: any, layer: any) => {
										if (feature.properties) {
											const props = feature.properties;
											const popupContent = `
												<div style="font-weight: bold; margin-bottom: 5px;">${props.Name || 'Water Point'}</div>
												<div>Feature: ${props.Feature || 'N/A'}</div>
												<div>NC: ${props.NC || 'N/A'}</div>
											`;
											layer.bindPopup(popupContent);
										}
									}
								}).addTo(map);
							}

							// Load Points layer (combined points)
							const pointsResponse = await fetch('/maps/DIK/Paharpur/Paharpur_Points_WGS84.json');
							if (pointsResponse.ok) {
								const pointsData = await pointsResponse.json();
								L.geoJSON(pointsData, {
									pointToLayer: (feature: any, latlng: any) => {
										const featureType = feature.properties?.Feature || '';
										let color = '#ffc107';
										if (featureType.toLowerCase().includes('dumping')) {
											color = feature.properties?.Status?.toLowerCase().includes('official') ? '#28a745' : '#dc3545';
										} else if (featureType.toLowerCase().includes('water') || featureType.toLowerCase().includes('reservoir') || featureType.toLowerCase().includes('tube well')) {
											color = feature.properties?.Status?.toLowerCase().includes('functional') ? '#007bff' : '#6c757d';
										}
										return L.circleMarker(latlng, {
											radius: 5,
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
											const popupContent = `
												<div style="font-weight: bold; margin-bottom: 5px;">${props.Name || 'Point'}</div>
												<div>Feature: ${props.Feature || 'N/A'}</div>
												${props.Status ? `<div>Status: ${props.Status}</div>` : ''}
											`;
											layer.bindPopup(popupContent);
										}
									}
								}).addTo(map);
							}

							// Fit map to show all layers
							map.fitBounds([
								[32.093, 70.945],
								[32.125, 70.998]
							], { padding: [20, 20] });

						} catch (error) {
							console.error('Error loading GeoJSON layers:', error);
						}
					};

					// Wait for map to be ready
					map.whenReady(() => {
						if (!isMounted) return;
						try {
							// Invalidate size to ensure proper rendering
							setTimeout(() => {
								if (!isMounted) return;
								try {
									if (mapInstanceRef.current) {
										mapInstanceRef.current.invalidateSize();
									}
									// Load GeoJSON layers
									loadGeoJSONLayers();
									// Mark as loaded immediately
									if (isMounted) setMapLoaded(true);
								} catch (e) {
									console.error('Error invalidating map size:', e);
									if (isMounted) setMapLoaded(true);
								}
							}, 200);
						} catch (error) {
							console.error('Error initializing map:', error);
							if (isMounted) setMapError('Failed to initialize map');
						}
					});
				} catch (error) {
					console.error('Error initializing map:', error);
					if (isMounted) {
						setMapError('Failed to initialize map: ' + (error instanceof Error ? error.message : 'Unknown error'));
					}
				}
			}, 300);
		};

		// Small delay to ensure component is fully mounted
		initDelay = setTimeout(() => {
			// Check if Leaflet is already loaded
			if ((window as any).L) {
				initializeMap();
				return;
			}

			// Check if CSS is already loaded
			const existingCSS = document.querySelector('link[href*="leaflet"]');
			if (!existingCSS) {
				// Load Leaflet CSS
				linkElement = document.createElement('link');
				linkElement.rel = 'stylesheet';
				linkElement.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
				linkElement.crossOrigin = 'anonymous';
				document.head.appendChild(linkElement);
			}

			// Check if script is already loading/loaded
			const existingScript = document.querySelector('script[src*="leaflet"]');
			if (existingScript) {
				// Script exists, wait for it to load
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
				// Load Leaflet JS
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
	}, []);

	return (
		<div className="relative w-full overflow-hidden rounded-lg border border-gray-200">
			<div 
				ref={mapContainerRef}
				id="gis-map-container"
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

export default function KpkDikBannuMapsPage() {
	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold text-gray-900">KPK-DIK & Bannu Maps</h1>
				<p className="text-gray-600 mt-2">Interactive GIS maps showing boundaries, solid waste points, and water infrastructure for Paharpur Tehsil, DIK District</p>
			</div>

			{/* Map Legend */}
			<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
				<h3 className="text-sm font-semibold text-gray-700 mb-3">Map Legend</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<p className="text-xs font-medium text-gray-600 mb-2">Boundaries</p>
						<div className="flex items-center space-x-2">
							<div className="w-4 h-4 border-2 border-[#0b4d2b] bg-[#0b4d2b]/20 rounded"></div>
							<span className="text-xs text-gray-600">NC Boundaries</span>
						</div>
					</div>
					<div>
						<p className="text-xs font-medium text-gray-600 mb-2">Solid Waste</p>
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 rounded-full bg-green-500 border border-white"></div>
								<span className="text-xs text-gray-600">Official Dumping Site</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
								<span className="text-xs text-gray-600">Unofficial Dumping Site</span>
							</div>
						</div>
					</div>
					<div>
						<p className="text-xs font-medium text-gray-600 mb-2">Water Infrastructure</p>
						<div className="space-y-1">
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 rounded-full bg-blue-500 border border-white"></div>
								<span className="text-xs text-gray-600">Functional</span>
							</div>
							<div className="flex items-center space-x-2">
								<div className="w-3 h-3 rounded-full bg-gray-500 border border-white"></div>
								<span className="text-xs text-gray-600">Non-Functional</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Map Container */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">Paharpur Tehsil - DIK District</h2>
					<p className="text-sm text-gray-600 mt-1">Click on boundaries or points to view detailed information</p>
				</div>
				<div className="p-6">
					<GISMapWithBoundaries />
				</div>
			</div>
		</div>
	);
}
