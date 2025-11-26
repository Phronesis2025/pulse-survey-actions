'use client';

import { useState, useEffect } from 'react';
import { exportToExcel } from '@/lib/excel';
import { getStatusBadgeClasses } from '@/lib/statusColors';
import type { ActionItem } from '@/types';

export default function ExportPanel() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadActionItems();
  }, []);

  const loadActionItems = async () => {
    try {
      const response = await fetch('/api/action-items');
      const data = await response.json();
      setActionItems(data);
    } catch (err) {
      console.error('Failed to load action items:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const filtered = filteredItems;
    exportToExcel(filtered, `action-items-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const filteredItems = actionItems.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.user_name.toLowerCase().includes(term) ||
      item.action_item.toLowerCase().includes(term) ||
      item.site?.name.toLowerCase().includes(term) ||
      item.category?.name.toLowerCase().includes(term) ||
      item.status?.name.toLowerCase().includes(term)
    );
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Export Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search action items..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-base"
          />
          <button
            onClick={handleExport}
            className="w-full sm:w-auto min-h-[44px] px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors touch-manipulation"
          >
            Export to Excel
          </button>
        </div>
        <p className="text-sm text-gray-600">
          Showing {filteredItems.length} of {actionItems.length} action items
        </p>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 text-center text-gray-500">
            No action items found
          </div>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 space-y-2">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">User Name</p>
                <p className="text-sm font-medium text-gray-900">{item.user_name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Site</p>
                <p className="text-sm text-gray-900">{item.site?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Category</p>
                <p className="text-sm text-gray-900">{item.category?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Action Item</p>
                <p className="text-sm text-gray-900 break-words">{item.action_item}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</p>
                <span className={`inline-block ${getStatusBadgeClasses(item.status?.name)}`}>
                  {item.status?.name || 'N/A'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Completion Date</p>
                <p className="text-sm text-gray-600">
                  {item.estimated_completion_date
                    ? new Date(item.estimated_completion_date).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Created</p>
                <p className="text-sm text-gray-500">
                  {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User Name
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Site
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action Item
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Date
                </th>
                <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No action items found
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.user_name}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.site?.name || 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.category?.name || 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.action_item}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block ${getStatusBadgeClasses(item.status?.name)}`}>
                        {item.status?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.estimated_completion_date
                        ? new Date(item.estimated_completion_date).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

