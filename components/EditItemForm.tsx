'use client';

import { useState, FormEvent } from 'react';
import type { ActionItem, ActionItemFormData } from '@/types';
import ActionItemForm from './ActionItemForm';

interface EditItemFormProps {
  item: ActionItem;
  onUpdate: (id: string, data: Partial<ActionItemFormData>) => Promise<void>;
  onCancel: () => void;
}

export default function EditItemForm({ item, onUpdate, onCancel }: EditItemFormProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdate = async (data: ActionItemFormData) => {
    await onUpdate(item.id, data);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
        <h3 className="text-base sm:text-lg font-semibold mb-4 text-gray-800">Edit Action Item</h3>
        <ActionItemForm
          initialData={{
            user_name: item.user_name,
            site_id: item.site_id,
            category_id: item.category_id,
            sub_category_id: item.sub_category_id,
            action_item: item.action_item,
            estimated_completion_date: item.estimated_completion_date || '',
            status_id: item.status_id,
            notes: item.notes || '',
          }}
          onSubmit={handleUpdate}
          submitButtonText="Update Action Item"
        />
        <button
          onClick={() => setIsEditing(false)}
          className="mt-4 w-full sm:w-auto min-h-[44px] px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors touch-manipulation"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-start gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 break-words">{item.action_item}</h3>
          <div className="text-sm text-gray-600 space-y-1">
            <p><strong>Site:</strong> {item.site?.name || 'N/A'}</p>
            <p><strong>Category:</strong> {item.category?.name || 'N/A'}</p>
            <p><strong>Sub-Category:</strong> {item.sub_category?.name || 'N/A'}</p>
            <p><strong>Status:</strong> {item.status?.name || 'N/A'}</p>
            {item.estimated_completion_date && (
              <p><strong>Estimated Completion:</strong> {new Date(item.estimated_completion_date).toLocaleDateString()}</p>
            )}
            {item.notes && (
              <p><strong>Notes:</strong> <span className="break-words">{item.notes}</span></p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              Created: {new Date(item.created_at).toLocaleString()}
              {item.updated_at !== item.created_at && (
                <> | Updated: {new Date(item.updated_at).toLocaleString()}</>
              )}
            </p>
          </div>
        </div>
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setIsEditing(true)}
            className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors touch-manipulation"
          >
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}

