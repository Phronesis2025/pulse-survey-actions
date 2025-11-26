'use client';

import Link from 'next/link';
import Image from 'next/image';
import ExportPanel from '@/components/ExportPanel';

export default function ExportPage() {
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
                href="/"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Submit Item
              </Link>
              <Link
                href="/edit"
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Edit Items
              </Link>
            </div>
          </div>
        </div>
      </nav>

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

