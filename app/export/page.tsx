'use client';

import NavBar from '@/components/NavBar';
import ExportPanel from '@/components/ExportPanel';

export default function ExportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <NavBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Export Data</h1>
          <p className="text-sm sm:text-base text-gray-600">
            View all action items and export them to Excel. Use the search box to filter results.
          </p>
        </div>

        <ExportPanel />
      </main>
    </div>
  );
}

