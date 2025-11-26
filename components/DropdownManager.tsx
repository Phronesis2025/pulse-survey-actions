'use client';

import { useState, useEffect, FormEvent } from 'react';
import type { Site, Category, SubCategory, Status } from '@/types';

interface DropdownManagerProps {
  type: 'sites' | 'categories' | 'sub-categories' | 'statuses';
  title: string;
}

export default function DropdownManager({ type, title }: DropdownManagerProps) {
  const [items, setItems] = useState<(Site | Category | SubCategory | Status)[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [newName, setNewName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]); // For sub-categories
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // For sub-categories

  useEffect(() => {
    loadItems();
    if (type === 'sub-categories') {
      fetch('/api/categories')
        .then(res => res.json())
        .then(data => {
          setCategories(data);
          if (data.length > 0 && !selectedCategoryId) {
            setSelectedCategoryId(data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [type]);

  const loadItems = async () => {
    try {
      const response = await fetch(`/api/${type}`);
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const body: any = { name: newName.trim() };
      if (type === 'sub-categories') {
        if (!selectedCategoryId) {
          throw new Error('Please select a category first');
        }
        body.category_id = selectedCategoryId;
      }

      const response = await fetch(`/api/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('Failed to add item');
      
      setNewName('');
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Site | Category | SubCategory | Status) => {
    setEditingId(item.id);
    setEditName(item.name);
  };

  const handleUpdate = async () => {
    if (!editName.trim() || !editingId) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/${type}/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (!response.ok) throw new Error('Failed to update item');
      
      setEditingId(null);
      setEditName('');
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/${type}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete item');
      
      await loadItems();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">{title}</h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Add new item */}
      <form onSubmit={handleAdd} className="mb-6 space-y-2">
        {type === 'sub-categories' && categories.length > 0 && (
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            disabled={submitting}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder={`Add new ${title.toLowerCase().slice(0, -1)}...`}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={submitting || !newName.trim() || (type === 'sub-categories' && !selectedCategoryId)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {/* List of items */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-gray-500 text-sm">No items yet. Add one above.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {editingId === item.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-gray-900"
                    autoFocus
                  />
                  <button
                    onClick={handleUpdate}
                    disabled={submitting || !editName.trim()}
                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditName('');
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-gray-800">{item.name}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="px-3 py-1 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1 text-red-600 hover:text-red-800 text-sm"
                      disabled={submitting}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

