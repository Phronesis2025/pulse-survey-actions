'use client';

import Link from 'next/link';
import Image from 'next/image';
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
      {/* Navigation */}
      <nav className="bg-black shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between h-auto sm:h-16 py-3 sm:py-0 gap-3 sm:gap-0">
            <div className="flex items-center order-1">
              <Link href="/">
                <Image
                  src="/Pulse_Logo-RGB-White-Full_Color_H.svg"
                  alt="Pulse Logo"
                  width={200}
                  height={62}
                  className="h-8 sm:h-10 w-auto cursor-pointer"
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center justify-center flex-1 order-2">
              <h1 className="text-lg sm:text-xl font-bold text-white">Pulse Survey Actions</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 order-3">
              <Link
                href="/edit"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Edit Items
              </Link>
              <Link
                href="/export"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Export
              </Link>
            </div>
          </div>
        </div>
      </nav>

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
