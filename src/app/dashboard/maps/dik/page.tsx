"use client";

import { useState, useEffect } from "react";
import { MapPin, Download, ExternalLink, Info } from "lucide-react";
import Image from "next/image";

type MapData = {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
  downloadUrl?: string;
  externalUrl?: string;
};

export default function DikMapsPage() {
  const [maps, setMaps] = useState<MapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading maps data
    setTimeout(() => {
      setMaps([
        {
          id: 1,
          name: "DI Khan District Map",
          description: "Complete district map showing administrative boundaries and key locations",
          imageUrl: "/maps/dik/dik-district.jpg",
          downloadUrl: "/maps/dik/dik-district.pdf"
        },
        {
          id: 2,
          name: "DI Khan Tehsil Map",
          description: "Detailed tehsil-level map with administrative divisions",
          imageUrl: "/maps/dik/dik-tehsil.jpg",
          downloadUrl: "/maps/dik/dik-tehsil.pdf"
        },
        {
          id: 3,
          name: "Demographic Map of DI Khan",
          description: "Population distribution and demographic information",
          imageUrl: "/maps/dik/dik-demographic.jpg",
          downloadUrl: "/maps/dik/dik-demographic.pdf"
        },
        {
          id: 4,
          name: "Road Network Map",
          description: "Complete road network and transportation infrastructure",
          imageUrl: "/maps/dik/dik-roads.jpg",
          downloadUrl: "/maps/dik/dik-roads.pdf"
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DI Khan Maps</h1>
          <p className="text-gray-600 mt-2">Interactive maps and geographical data for DI Khan District</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
          <span className="ml-3 text-gray-600">Loading maps...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">DI Khan Maps</h1>
          <p className="text-gray-600 mt-2">Interactive maps and geographical data for DI Khan District</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">DI Khan Maps</h1>
        <p className="text-gray-600 mt-2">Interactive maps and geographical data for DI Khan District</p>
      </div>

      {/* Maps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maps.map((map) => (
          <div key={map.id} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Map Image */}
            <div className="aspect-video bg-gray-100 relative overflow-hidden">
              <Image
                src={map.imageUrl}
                alt={map.name}
                fill
                className="object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-map.jpg';
                }}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 hover:opacity-100 bg-white bg-opacity-90 text-gray-800 px-3 py-1.5 rounded-lg transition-all duration-200">
                  <span className="text-sm font-medium">View Map</span>
                </div>
              </div>
            </div>

            {/* Map Info */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{map.name}</h3>
              <p className="text-sm text-gray-600 mb-4">{map.description}</p>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="flex items-center px-3 py-1.5 text-sm bg-[#0b4d2b] text-white rounded-md hover:bg-[#0a3d24] transition-colors">
                  <MapPin className="h-4 w-4 mr-1" />
                  View
                </button>
                {map.downloadUrl && (
                  <button className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </button>
                )}
                {map.externalUrl && (
                  <button className="flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
                    <ExternalLink className="h-4 w-4 mr-1" />
                    External
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 mb-1">
              Map Information
            </h3>
            <p className="text-sm text-blue-700">
              These maps provide comprehensive geographical and administrative information for DI Khan District. 
              Click on any map to view it in detail, or download the PDF version for offline use.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}