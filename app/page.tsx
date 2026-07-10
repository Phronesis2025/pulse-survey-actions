'use client';

import NavBar from '@/components/NavBar';
import ActionItemForm from '@/components/ActionItemForm';
import type { ActionItemFormData } from '@/types';

export default function Home() {
  const handleSubmit = async (data: ActionItemFormData) => {
    const response = await fetch('/api/action-items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to submit action item');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <NavBar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 sm:p-6 lg:p-8">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Submit Action Item</h2>
            <p className="text-sm sm:text-base text-gray-600">
              Use this form to submit action items based on facilities maintenance survey feedback.
              Please fill in all required fields (marked with <span className="text-red-500">*</span>).
            </p>
          </div>

          <ActionItemForm onSubmit={handleSubmit} />
        </div>
      </main>
    </div>
  );
}
