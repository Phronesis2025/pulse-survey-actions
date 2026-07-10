'use client';

import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import EditItemForm from '@/components/EditItemForm';
import { getStatusBadgeClasses } from '@/lib/statusColors';
import type { ActionItem, ActionItemFormData } from '@/types';

// sessionStorage key for the admin secret; e2e tests inject it here too
const ADMIN_SECRET_STORAGE_KEY = 'pulse_admin_secret';

export default function EditPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Load all action items on page load
  useEffect(() => {
    loadActionItems();
  }, []);

  const loadActionItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/action-items');
      if (!response.ok) throw new Error('Failed to load action items');
      
      const data = await response.json();
      setActionItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load action items');
    } finally {
      setLoading(false);
    }
  };

  // Minimal admin unlock: PUT /api/action-items/[id] is gated by an
  // x-admin-secret header, so prompt for the secret and keep it in
  // sessionStorage (not localStorage — it should die with the tab).
  // Tradeoff: window.prompt + sessionStorage is deliberately crude. It is a
  // convenience gate for a demo app, not real auth — the server-side
  // requireAdmin() check and the RLS policies are what actually protect the
  // data; anything stored in the browser is readable by the user anyway.
  const getAdminSecret = (): string | null => {
    let secret = sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY);
    if (!secret) {
      secret = window.prompt('Enter the admin secret to edit action items:');
      if (secret) sessionStorage.setItem(ADMIN_SECRET_STORAGE_KEY, secret);
    }
    return secret;
  };

  const handleUpdate = async (id: string, data: Partial<ActionItemFormData>) => {
    const secret = getAdminSecret();
    if (!secret) {
      throw new Error('Editing requires the admin secret.');
    }

    const response = await fetch(`/api/action-items/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-secret': secret,
      },
      body: JSON.stringify(data),
    });

    if (response.status === 401) {
      // Wrong secret: forget it so the next attempt prompts again
      sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
      throw new Error('Invalid admin secret — the update was rejected (401). Click Update again to re-enter it.');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update action item');
    }

    // Reload all items
    await loadActionItems();
    setEditingId(null);
  };

  const handleEditClick = (id: string) => {
    setEditingId(editingId === id ? null : id);
  };

  // Helper function to get first 3 words of action item
  const getFirstThreeWords = (text: string): string => {
    const words = text.trim().split(/\s+/);
    return words.slice(0, 3).join(' ') + (words.length > 3 ? '...' : '');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <NavBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Edit Action Items</h2>
            <p className="text-sm sm:text-base text-gray-600">
              View and edit all action items. Click the Edit button on any row to modify that item.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {actionItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No action items found.</p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-600 mb-4">
                    Showing {actionItems.length} action item{actionItems.length !== 1 ? 's' : ''}
                  </p>
                  
                  {/* Action Items List */}
                  <div className="space-y-4">
                    {actionItems.map((item) => (
                      <div key={item.id}>
                        {editingId === item.id ? (
                          <div className="mb-4">
                            <EditItemForm
                              item={item}
                              onUpdate={handleUpdate}
                              onCancel={() => setEditingId(null)}
                            />
                          </div>
                        ) : (
                          <div className="bg-gray-50 rounded-lg border border-gray-200 p-3 sm:p-4 hover:bg-gray-100 transition-colors">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                              <div className="flex-1 w-full sm:w-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-start sm:items-center">
                                <div>
                                  <p className="text-xs text-gray-500 sm:hidden mb-1">Name</p>
                                  <p className="text-sm font-medium text-gray-900 break-words">{item.user_name}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 sm:hidden mb-1">Site</p>
                                  <p className="text-sm text-gray-900 break-words">{item.site?.name || 'N/A'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 sm:hidden mb-1">Action Item</p>
                                  <p className="text-sm text-gray-900 break-words">{getFirstThreeWords(item.action_item)}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500 sm:hidden mb-1">Status</p>
                                  <span className={`inline-block ${getStatusBadgeClasses(item.status?.name)}`}>
                                    {item.status?.name || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div className="w-full sm:w-auto">
                                <button
                                  onClick={() => handleEditClick(item.id)}
                                  className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium touch-manipulation"
                                >
                                  Edit
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
