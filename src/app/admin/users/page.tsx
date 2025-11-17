"use client";

import { useState, useEffect } from "react";
import { RefreshCw, UserCheck, AlertCircle } from "lucide-react";

type User = {
  username: string;
  email: string;
  access_level: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/check-users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || "Failed to fetch users");
      }
    } catch (err) {
      setError("Error fetching users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserAccess = async (username: string, accessLevel: string) => {
    try {
      setUpdating(username);
      const response = await fetch('/api/admin/update-user-access', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, accessLevel }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update the local state
        setUsers(prev => prev.map(user => 
          user.username === username 
            ? { ...user, access_level: accessLevel }
            : user
        ));
        alert(`User ${username} access level updated to ${accessLevel}`);
      } else {
        alert(data.message || "Failed to update user access");
      }
    } catch (err) {
      alert("Error updating user access");
      console.error("Error updating user access:", err);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0b4d2b]"></div>
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Access Management</h1>
          <p className="text-gray-600 mt-2">Manage user access levels</p>
        </div>
        <button
          onClick={fetchUsers}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-[#0b4d2b] bg-[#0b4d2b]/10 rounded-lg hover:bg-[#0b4d2b]/20 transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Access Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.access_level === 'Admin' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {user.access_level || 'No Access'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateUserAccess(user.username, 'Admin')}
                      disabled={updating === user.username || user.access_level === 'Admin'}
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        user.access_level === 'Admin' || updating === user.username
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {updating === user.username ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-green-600 mr-1"></div>
                          Updating...
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3 w-3 mr-1" />
                          Make Admin
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => updateUserAccess(user.username, 'User')}
                      disabled={updating === user.username || user.access_level === 'User'}
                      className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                        user.access_level === 'User' || updating === user.username
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      }`}
                    >
                      {updating === user.username ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600 mr-1"></div>
                          Updating...
                        </>
                      ) : (
                        'Make User'
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12">
          <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-600">No users were found in the database.</p>
        </div>
      )}
    </div>
  );
}
