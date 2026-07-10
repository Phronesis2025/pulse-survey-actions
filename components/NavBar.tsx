'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PulseLogo from './PulseLogo';

const links = [
  { href: '/', label: 'Submit Item' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/edit', label: 'Edit Items' },
  { href: '/export', label: 'Export' },
];

// Shared top navigation — a slim toolbar: logo left, links right.
export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="bg-black shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex h-11 sm:h-12 items-center justify-between gap-2">
          <Link href="/" aria-label="Go to home page" className="flex items-center text-white shrink-0">
            <PulseLogo className="h-6 sm:h-7 w-auto cursor-pointer" />
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-1.5 sm:px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                  pathname === href
                    ? 'text-white bg-white/15'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
