"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Save, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  Edit, 
  Trash2 
} from "lucide-react";

type OutputData = {
  OutputID: string;
  Output: string;
};

type OutputManagementModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOutputsChange: () => void;
};

export default function OutputManagementModal({ 
  isOpen, 
  onClose, 
  onOutputsChange 
}: OutputManagementModalProps) {
  const [outputs, setOutputs] = useState<OutputData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingOutput, setEditingOutput] = useState<OutputData | null>(null);
  const [formData, setFormData] = useState<OutputData>({
    OutputID: "",
    Output: ""
  });

  useEffect(() => {
    if (isOpen) {
      fetchOutputs();
      setFormData({ OutputID: "", Output: "" });
      setEditingOutput(null);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen]);

  const fetchOutputs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tracking-sheet/outputs/manage');
      const data = await response.json();
      
      if (data.success) {
        setOutputs(data.outputs || []);
      } else {
        setError(data.message || 'Failed to fetch outputs');
      }
    } catch (error) {
      setError('Error fetching outputs');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.OutputID.trim() || !formData.Output.trim()) {
      setError("Both OutputID and Output are required");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const url = editingOutput ? '/api/tracking-sheet/outputs/manage' : '/api/tracking-sheet/outputs/manage';
      const method = editingOutput ? 'PUT' : 'POST';
      
      const body = editingOutput 
        ? { oldOutputID: editingOutput.OutputID, ...formData }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(editingOutput ? 'Output updated successfully' : 'Output added successfully');
        setFormData({ OutputID: "", Output: "" });
        setEditingOutput(null);
        await fetchOutputs();
        onOutputsChange();
      } else {
        setError(result.message || 'Failed to save output');
      }
    } catch (error) {
      setError('Error saving output');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (output: OutputData) => {
    setEditingOutput(output);
    setFormData(output);
    setError(null);
    setSuccess(null);
  };

  const handleDelete = async (output: OutputData) => {
    if (!confirm(`Are you sure you want to delete "${output.OutputID}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tracking-sheet/outputs/manage?OutputID=${encodeURIComponent(output.OutputID)}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        setSuccess('Output deleted successfully');
        await fetchOutputs();
        onOutputsChange();
      } else {
        setError(result.message || 'Failed to delete output');
      }
    } catch (error) {
      setError('Error deleting output');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({ OutputID: "", Output: "" });
    setEditingOutput(null);
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Manage Outputs
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Success/Error Messages */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center mb-6">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-green-700">{success}</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center mb-6">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {/* Add/Edit Form */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingOutput ? 'Edit Output' : 'Add New Output'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output ID *
                </label>
                <input
                  type="text"
                  name="OutputID"
                  value={formData.OutputID}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none"
                  placeholder="Enter Output ID (e.g., Output D)"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Output Description *
                </label>
                <textarea
                  name="Output"
                  value={formData.Output}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0b4d2b] focus:border-[#0b4d2b] outline-none resize-none"
                  placeholder="Enter output description"
                  required
                />
              </div>

              <div className="flex items-center space-x-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 bg-[#0b4d2b] text-white rounded-lg hover:bg-[#0a3d24] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {editingOutput ? 'Update Output' : 'Add Output'}
                </button>

                {editingOutput && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Outputs List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Existing Outputs ({outputs.length})
            </h3>
            
            {loading && outputs.length === 0 ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400" />
                <p className="mt-2 text-gray-500">Loading outputs...</p>
              </div>
            ) : outputs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No outputs found. Add your first output above.
              </div>
            ) : (
              <div className="space-y-3">
                {outputs.map((output) => (
                  <div key={output.OutputID} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 mb-2">
                          {output.OutputID}
                        </h4>
                        <p className="text-gray-600 text-sm">
                          {output.Output}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleEdit(output)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(output)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
