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

		// Function to convert UTM coordinates to WGS84 (approximate conversion for UTM Zone 42N)
		const convertUTMToWGS84 = (easting: number, northing: number): [number, number] => {
			// UTM Zone 42N parameters
			const zone = 42;
			const k0 = 0.9996;
			const a = 6378137; // WGS84 semi-major axis
			const e2 = 0.00669438; // WGS84 first eccentricity squared
			const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
			const n = (a - 6356752.314) / (a + 6356752.314);
			const alpha = ((a + 6356752.314) / 2) * (1 + (n * n) / 4 + (n * n * n * n) / 64);
			const beta = (3 * n) / 2 - (27 * n * n * n) / 32;
			const gamma = (21 * n * n) / 16 - (55 * n * n * n * n) / 32;
			const delta = (151 * n * n * n) / 96;
			const epsilon = (1097 * n * n * n * n) / 512;

			const x = easting - 500000;
			const y = northing;

			const M = y / k0;
			const mu = M / alpha;

			const footlat = mu + beta * Math.sin(2 * mu) + gamma * Math.sin(4 * mu) + delta * Math.sin(6 * mu) + epsilon * Math.sin(8 * mu);

			const e1sq = e2 / (1 - e2);
			const C1 = e1sq * Math.cos(footlat) * Math.cos(footlat);
			const T1 = Math.tan(footlat) * Math.tan(footlat);
			const N1 = a / Math.sqrt(1 - e2 * Math.sin(footlat) * Math.sin(footlat));
			const R1 = a * (1 - e2) / Math.pow(1 - e2 * Math.sin(footlat) * Math.sin(footlat), 1.5);
			const D = x / (N1 * k0);

			const lat = footlat - (N1 * Math.tan(footlat) / R1) * (D * D / 2 - (5 + 3 * T1 + 10 * C1 - 4 * C1 * C1 - 9 * e1sq) * D * D * D * D / 24 + (61 + 90 * T1 + 298 * C1 + 45 * T1 * T1 - 252 * e1sq - 3 * C1 * C1) * D * D * D * D * D * D / 720);
			const lon = ((zone - 1) * 6 - 180 + 3) + (1 / Math.cos(footlat)) * (D - (1 + 2 * T1 + C1) * D * D * D / 6 + (5 - 2 * C1 + 28 * T1 - 3 * C1 * C1 + 8 * e1sq + 24 * T1 * T1) * D * D * D * D * D / 120);

			return [lat * (180 / Math.PI), lon * (180 / Math.PI)];
		};

		// Function to convert GeoJSON coordinates from UTM to WGS84
		const convertGeoJSONCoordinates = (geoJson: any): any => {
			if (!geoJson || !geoJson.features) return geoJson;

			const converted = JSON.parse(JSON.stringify(geoJson));

			converted.features = converted.features.map((feature: any) => {
				if (feature.geometry && feature.geometry.coordinates) {
					const convertCoordinates = (coords: any[]): any[] => {
						if (typeof coords[0] === 'number') {
							// Point coordinates [x, y]
							const [lat, lon] = convertUTMToWGS84(coords[0], coords[1]);
							return [lon, lat]; // Leaflet expects [lat, lon] but GeoJSON is [lon, lat]
						} else if (Array.isArray(coords[0])) {
							// Array of coordinates
							return coords.map(convertCoordinates);
						}
						return coords;
					};

					if (feature.geometry.type === 'Polygon') {
						feature.geometry.coordinates = feature.geometry.coordinates.map((ring: any[]) =>
							ring.map((coord: any[]) => {
								const [lat, lon] = convertUTMToWGS84(coord[0], coord[1]);
								return [lon, lat];
							})
						);
					} else if (feature.geometry.type === 'LineString') {
						feature.geometry.coordinates = feature.geometry.coordinates.map((coord: any[]) => {
							const [lat, lon] = convertUTMToWGS84(coord[0], coord[1]);
							return [lon, lat];
						});
					} else if (feature.geometry.type === 'Point') {
						const [lat, lon] = convertUTMToWGS84(feature.geometry.coordinates[0], feature.geometry.coordinates[1]);
						feature.geometry.coordinates = [lon, lat];
					}
				}
				return feature;
			});

			return converted;
		};

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

					// Initialize map centered on Bannu/Kakki area (approximate coordinates)
					const map = L.map(container, {
						center: [32.99, 70.60],
						zoom: 12,
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
							const boundaryResponse = await fetch('/maps/Bannu/Kakki/Kakki_VC_Boundary.json');
							if (boundaryResponse.ok) {
								const boundaryData = await boundaryResponse.json();
								// Convert coordinates from UTM to WGS84
								const convertedData = convertGeoJSONCoordinates(boundaryData);
								
								const layer = L.geoJSON(convertedData, {
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
												<div style="font-weight: bold; margin-bottom: 5px;">${props.VCs || 'VC Boundary'}</div>
												<div>Tehsil: ${props.Tehsil || 'N/A'}</div>
											`;
											layer.bindPopup(popupContent);
										}
									}
								}).addTo(map);

								// Fit map to show all boundaries
								if (layer.getBounds().isValid()) {
									map.fitBounds(layer.getBounds(), { padding: [20, 20] });
								}
							}

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

export default function BannuMapsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bannu Maps</h1>
				<p className="text-gray-600 mt-2">Interactive GIS maps showing VC boundaries for Kakki Tehsil, Bannu District</p>
      </div>

			{/* Map Legend */}
			<div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
				<h3 className="text-sm font-semibold text-gray-700 mb-3">Map Legend</h3>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div>
						<p className="text-xs font-medium text-gray-600 mb-2">Boundaries</p>
						<div className="flex items-center space-x-2">
							<div className="w-4 h-4 border-2 border-[#0b4d2b] bg-[#0b4d2b]/20 rounded"></div>
							<span className="text-xs text-gray-600">VC Boundaries</span>
						</div>
                </div>
              </div>
            </div>

			{/* Map Container */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
				<div className="p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">Kakki Tehsil - Bannu District</h2>
					<p className="text-sm text-gray-600 mt-1">Click on boundaries to view detailed information</p>
              </div>
				<div className="p-6">
					<GISMapWithBoundaries />
        </div>
      </div>
    </div>
  );
}
