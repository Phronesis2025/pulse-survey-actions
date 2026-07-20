'use client';

import { useState, useEffect, type FormEvent } from 'react';
import NavBar from '@/components/NavBar';
import EditItemForm from '@/components/EditItemForm';
import { getStatusBadgeClasses } from '@/lib/statusColors';
import type { ActionItem, ActionItemFormData } from '@/types';

// sessionStorage key for the admin secret; e2e tests exercise the unlock form
// which writes the same key.
const ADMIN_SECRET_STORAGE_KEY = 'pulse_admin_secret';

export default function EditPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Admin unlock state. The list is always visible (read-only); the editing
  // controls only appear once the admin secret has been verified.
  const [unlocked, setUnlocked] = useState(false);
  const [secretInput, setSecretInput] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  // Load items on mount; restore an existing unlock from this tab's session.
  useEffect(() => {
    loadActionItems();
    if (sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY)) {
      setUnlocked(true);
    }
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

  // Verify the admin secret up front via POST /api/admin/verify, which runs the
  // same server-side requireAdmin gate and touches no data. Only on success do
  // we store the secret and reveal the editing controls. The mutating routes
  // still enforce the gate themselves — this just stops the page from *looking*
  // publicly editable and avoids a wrong secret surfacing only at save time.
  const handleUnlock = async (e: FormEvent) => {
    e.preventDefault();
    const candidate = secretInput.trim();
    if (!candidate) {
      setUnlockError('Enter the admin secret.');
      return;
    }

    setVerifying(true);
    setUnlockError(null);
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'x-admin-secret': candidate },
      });

      if (response.status === 401) {
        setUnlockError('Invalid admin secret.');
        return;
      }
      if (!response.ok) {
        setUnlockError('Could not verify the admin secret. Please try again.');
        return;
      }

      sessionStorage.setItem(ADMIN_SECRET_STORAGE_KEY, candidate);
      setUnlocked(true);
      setSecretInput('');
    } catch {
      setUnlockError('Could not reach the server. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleLock = () => {
    sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
    setUnlocked(false);
    setEditingId(null);
  };

  const handleUpdate = async (id: string, data: Partial<ActionItemFormData>) => {
    const secret = sessionStorage.getItem(ADMIN_SECRET_STORAGE_KEY);
    if (!secret) {
      // Unlock was cleared mid-session; drop back to the locked state.
      setUnlocked(false);
      setEditingId(null);
      throw new Error('Admin session ended — unlock again to edit.');
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
      // Secret was rejected (e.g. rotated): forget it and re-lock.
      sessionStorage.removeItem(ADMIN_SECRET_STORAGE_KEY);
      setUnlocked(false);
      setEditingId(null);
      throw new Error('Admin secret was rejected (401). Unlock again to continue.');
    }

    if (!response.ok) {
      const errBody = await response.json();
      throw new Error(errBody.message || 'Failed to update action item');
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
              View all action items below. Editing requires admin access.
            </p>
          </div>

          {/* Admin access: locked shows a read-only banner + unlock form; unlocked shows status + lock */}
          {unlocked ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-6">
              <p className="text-sm font-medium text-green-800">
                🔓 Admin access unlocked — you can edit items below.
              </p>
              <button
                type="button"
                onClick={handleLock}
                className="self-start sm:self-auto min-h-[40px] px-3 py-1.5 text-sm font-medium text-green-800 border border-green-300 rounded-lg hover:bg-green-100 transition-colors"
              >
                Lock
              </button>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-4 mb-6">
              <h3 className="text-sm font-semibold text-amber-900 mb-1">🔒 Admin access required</h3>
              <p className="text-sm text-amber-800 mb-3">
                The list below is read-only. Enter the admin secret to unlock editing.
              </p>
              <form onSubmit={handleUnlock} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                <label htmlFor="admin_secret" className="sr-only">Admin secret</label>
                <input
                  id="admin_secret"
                  type="password"
                  value={secretInput}
                  onChange={(e) => setSecretInput(e.target.value)}
                  placeholder="Enter admin secret"
                  autoComplete="off"
                  className="flex-1 sm:max-w-xs min-h-[44px] px-3 py-2 border border-amber-300 rounded-lg bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="min-h-[44px] px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-60 transition-colors text-sm font-medium"
                >
                  {verifying ? 'Verifying…' : 'Unlock'}
                </button>
              </form>
              {unlockError && (
                <p className="mt-2 text-sm text-red-700">{unlockError}</p>
              )}
            </div>
          )}

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
                        {unlocked && editingId === item.id ? (
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
                              {unlocked && (
                                <div className="w-full sm:w-auto">
                                  <button
                                    onClick={() => handleEditClick(item.id)}
                                    className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium touch-manipulation"
                                  >
                                    Edit
                                  </button>
                                </div>
                              )}
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
