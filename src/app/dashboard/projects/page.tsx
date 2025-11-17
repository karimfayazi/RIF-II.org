"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Filter, 
  Download, 
  RefreshCw, 
  Plus,
  Eye,
  Edit,
  Trash2,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Building2,
  Search,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAccess } from "@/hooks/useAccess";
import Link from "next/link";

type ProjectData = {
  ProjectID: number;
  ProjectName: string;
  Description: string;
  StartDate: string;
  EndDate: string;
  Status: string;
  Budget: number;
  AllocatedBudget: number;
  Sector: string;
  District: string;
  Tehsil: string;
  Beneficiaries: number;
  Beneficiaries_Male: number;
  Beneficiaries_Female: number;
  ProjectManager: string;
  ContactPerson: string;
  ContactEmail: string;
  ContactPhone: string;
  Remarks: string;
  Links: string;
  CreatedBy: string;
  CreatedDate: string;
};

export default function ProjectsPage() {
  const { user, getUserId } = useAuth();
  const userId = user?.id || getUserId();
  const { isAdmin, loading: accessLoading } = useAccess(userId);
  
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedSector, setSelectedSector] = useState("");
  
  const [statuses, setStatuses] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [sectors, setSectors] = useState<string[]>([]);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedDistrict) params.append('district', selectedDistrict);
      if (selectedSector) params.append('sector', selectedSector);

      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProjects(data.projects || []);
        
        // Extract unique values for filters
        const uniqueStatuses = [...new Set(data.projects.map((item: ProjectData) => item.Status).filter(Boolean))] as string[];
        const uniqueDistricts = [...new Set(data.projects.map((item: ProjectData) => item.District).filter(Boolean))] as string[];
        const uniqueSectors = [...new Set(data.projects.map((item: ProjectData) => item.Sector).filter(Boolean))] as string[];
        
        setStatuses(uniqueStatuses);
        setDistricts(uniqueDistricts);
        setSectors(uniqueSectors);
      } else {
        setError(data.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError("Error fetching projects");
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedStatus, selectedDistrict, selectedSector]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleDeleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        await fetchProjects();
        alert('Project deleted successfully');
      } else {
        alert(data.message || 'Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Error deleting project');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and view all projects</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
          <span className="ml-3 text-gray-600">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (error && projects.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and view all projects</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error}</p>
          <button
            onClick={fetchProjects}
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and view all projects</p>
        </div>
        <div className="flex items-center space-x-3">
          {isAdmin && !accessLoading && (
            <Link
              href="/dashboard/projects/add"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Link>
          )}
          <button
            onClick={fetchProjects}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#0b4d2b] bg-[#0b4d2b]/10 rounded-lg hover:bg-[#0b4d2b]/20 transition-colors"
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
            <h3 className="text-lg font-semibold text-gray-900">Search & Filter Projects</h3>
            <p className="text-sm text-gray-600">Find specific projects by name, status, or location</p>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus("");
              setSelectedDistrict("");
              setSelectedSector("");
            }}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200"
          >
            <Filter className="h-3 w-3 mr-1" />
            Reset
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Projects</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by project name, manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-gray-900 placeholder-gray-500 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-[#0b4d2b]/20 focus:border-[#0b4d2b] focus:outline-none transition-all duration-200 shadow-sm hover:shadow-md"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
            >
              <option value="">All Statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
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
        </div>
      </div>

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-12 text-center">
          <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedStatus || selectedDistrict || selectedSector
              ? "Try adjusting your search criteria"
              : "Get started by creating your first project"}
          </p>
          {isAdmin && !accessLoading && (
            <Link
              href="/dashboard/projects/add"
              className="inline-flex items-center px-4 py-2 bg-[#0b4d2b] text-white rounded-lg hover:bg-[#0a3d24] transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.ProjectID} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.ProjectName}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.Status)}`}>
                      {project.Status || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {project.Description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {project.Description}
                  </p>
                )}

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    <span>{formatDate(project.StartDate)} - {formatDate(project.EndDate)}</span>
                  </div>
                  {project.District && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{project.District}{project.Tehsil && `, ${project.Tehsil}`}</span>
                    </div>
                  )}
                  {project.Budget && (
                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                      <span>Budget: {formatCurrency(project.Budget)}</span>
                    </div>
                  )}
                  {project.Beneficiaries && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="h-4 w-4 mr-2 text-gray-400" />
                      <span>{project.Beneficiaries} beneficiaries</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // TODO: Implement view details
                      alert('View details coming soon');
                    }}
                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {project.Links && (
                    <a
                      href={project.Links}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                      title="Open Link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                  {isAdmin && !accessLoading && (
                    <>
                      <button
                        onClick={() => {
                          // TODO: Implement edit
                          alert('Edit functionality coming soon');
                        }}
                        className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50 transition-colors"
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(project.ProjectID)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Count */}
      {projects.length > 0 && (
        <div className="text-center text-sm text-gray-500">
          Showing {projects.length} project{projects.length !== 1 ? 's' : ''}
          {(searchTerm || selectedStatus || selectedDistrict || selectedSector) && ' matching your criteria'}
        </div>
      )}
    </div>
  );
}
