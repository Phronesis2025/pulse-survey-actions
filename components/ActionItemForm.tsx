'use client';

import { useState, useEffect, FormEvent } from 'react';
import type { Site, Category, SubCategory, Status, ActionItemFormData } from '@/types';

interface ActionItemFormProps {
  onSubmit: (data: ActionItemFormData) => Promise<void>;
  initialData?: Partial<ActionItemFormData>;
  submitButtonText?: string;
}

export default function ActionItemForm({ 
  onSubmit, 
  initialData,
  submitButtonText = 'Submit Action Item' 
}: ActionItemFormProps) {
  const [formData, setFormData] = useState<ActionItemFormData>({
    user_name: initialData?.user_name || '',
    site_id: initialData?.site_id || '',
    category_id: initialData?.category_id || '',
    sub_category_id: initialData?.sub_category_id || '',
    action_item: initialData?.action_item || '',
    estimated_completion_date: initialData?.estimated_completion_date || '',
    status_id: initialData?.status_id || '',
    notes: initialData?.notes || '',
  });

  const [sites, setSites] = useState<Site[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Load dropdown data
  useEffect(() => {
    async function loadData() {
      try {
        const [sitesRes, categoriesRes, statusesRes] = await Promise.all([
          fetch('/api/sites'),
          fetch('/api/categories'),
          fetch('/api/statuses'),
        ]);

        const [sitesData, categoriesData, statusesData] = await Promise.all([
          sitesRes.json(),
          categoriesRes.json(),
          statusesRes.json(),
        ]);

        setSites(sitesData);
        setCategories(categoriesData);
        setStatuses(statusesData);
      } catch (err) {
        setError('Failed to load form data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Load sub-categories when category changes
  useEffect(() => {
    if (formData.category_id) {
      fetch(`/api/sub-categories?category_id=${formData.category_id}`)
        .then(res => res.json())
        .then(data => setSubCategories(data))
        .catch(() => setSubCategories([]));
    } else {
      setSubCategories([]);
      setFormData(prev => ({ ...prev, sub_category_id: '' }));
    }
  }, [formData.category_id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      // Validation
      if (!formData.user_name.trim()) {
        throw new Error('Name is required');
      }
      if (!formData.site_id) {
        throw new Error('Site is required');
      }
      if (!formData.category_id) {
        throw new Error('Category is required');
      }
      if (!formData.sub_category_id) {
        throw new Error('Sub-category is required');
      }
      if (!formData.action_item.trim()) {
        throw new Error('Action item is required');
      }
      if (!formData.status_id) {
        throw new Error('Status is required');
      }

      await onSubmit(formData);
      setSuccess(true);
      
      // Reset form if not editing
      if (!initialData) {
        setFormData({
          user_name: '',
          site_id: '',
          category_id: '',
          sub_category_id: '',
          action_item: '',
          estimated_completion_date: '',
          status_id: '',
          notes: '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          Action item {initialData ? 'updated' : 'submitted'} successfully!
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Name */}
        <div>
          <label htmlFor="user_name" className="block text-sm font-medium text-gray-700 mb-2">
            Your Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="user_name"
            value={formData.user_name}
            onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            required
          />
        </div>

        {/* Site */}
        <div>
          <label htmlFor="site_id" className="block text-sm font-medium text-gray-700 mb-2">
            Site <span className="text-red-500">*</span>
          </label>
          <select
            id="site_id"
            value={formData.site_id}
            onChange={(e) => setFormData({ ...formData, site_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            required
          >
            <option value="">Select a site</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
            Main Category <span className="text-red-500">*</span>
          </label>
          <select
            id="category_id"
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value, sub_category_id: '' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>

        {/* Sub-Category */}
        <div>
          <label htmlFor="sub_category_id" className="block text-sm font-medium text-gray-700 mb-2">
            Sub-Category <span className="text-red-500">*</span>
          </label>
          <select
            id="sub_category_id"
            value={formData.sub_category_id}
            onChange={(e) => setFormData({ ...formData, sub_category_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 disabled:text-gray-500"
            required
            disabled={!formData.category_id}
          >
            <option value="">{formData.category_id ? 'Select a sub-category' : 'Select a category first'}</option>
            {subCategories.map(subCat => (
              <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
            ))}
          </select>
        </div>

        {/* Estimated Completion Date */}
        <div>
          <label htmlFor="estimated_completion_date" className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Completion Date
          </label>
          <input
            type="date"
            id="estimated_completion_date"
            value={formData.estimated_completion_date}
            onChange={(e) => setFormData({ ...formData, estimated_completion_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status_id" className="block text-sm font-medium text-gray-700 mb-2">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            id="status_id"
            value={formData.status_id}
            onChange={(e) => setFormData({ ...formData, status_id: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            required
          >
            <option value="">Select a status</option>
            {statuses.map(status => (
              <option key={status.id} value={status.id}>{status.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Action Item */}
      <div>
        <label htmlFor="action_item" className="block text-sm font-medium text-gray-700 mb-2">
          Action Item <span className="text-red-500">*</span>
        </label>
        <textarea
          id="action_item"
          value={formData.action_item}
          onChange={(e) => setFormData({ ...formData, action_item: e.target.value })}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          required
          placeholder="Describe the action item..."
        />
      </div>

      {/* Notes/Comments */}
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
          Notes/Comments
        </label>
        <textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          rows={3}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Additional notes or comments..."
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        >
          {submitting ? 'Submitting...' : submitButtonText}
        </button>
      </div>
    </form>
  );
}

