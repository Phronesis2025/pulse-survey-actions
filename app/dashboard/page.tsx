'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import NavBar from '@/components/NavBar';
import { getStatusBadgeClasses, getStatusAccentClasses, STATUS_ORDER } from '@/lib/statusColors';
import type { ActionItem, Site } from '@/types';

// ---------- date helpers ----------

function timeAgo(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [60 * 60 * 24 * 365, 'year'],
    [60 * 60 * 24 * 30, 'month'],
    [60 * 60 * 24 * 7, 'week'],
    [60 * 60 * 24, 'day'],
    [60 * 60, 'hour'],
    [60, 'minute'],
  ];
  for (const [size, name] of units) {
    if (seconds >= size) {
      const n = Math.floor(seconds / size);
      return `${n} ${name}${n > 1 ? 's' : ''} ago`;
    }
  }
  return 'just now';
}

// DATE columns arrive as YYYY-MM-DD; parse as a local date so the displayed
// day never shifts across timezones.
function parseDateOnly(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDueDate(iso: string): string {
  return parseDateOnly(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

const CLOSED_STATUSES = new Set(['completed', 'cancelled']);

function isOverdue(item: ActionItem): boolean {
  if (!item.estimated_completion_date) return false;
  if (CLOSED_STATUSES.has(item.status?.name?.toLowerCase() ?? '')) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return parseDateOnly(item.estimated_completion_date) < today;
}

// ---------- small inline icons (stroke follows text color) ----------

function Icon({ path, className = 'h-3.5 w-3.5' }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} shrink-0`}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

const ICON_PATHS = {
  pin: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  tag: 'M12 2H2v10l9.3 9.3a1.7 1.7 0 0 0 2.4 0l7.6-7.6a1.7 1.7 0 0 0 0-2.4L12 2Z M7 7h.01',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  warn: 'M12 9v4 M12 17h.01 M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z',
  search: 'M21 21l-4.3-4.3 M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
  table: 'M3 5h18 M3 10h18 M3 15h18 M3 20h18',
  cards: 'M3 3h8v8H3z M13 3h8v8h-8z M3 13h8v8H3z M13 13h8v8h-8z',
  chevron: 'M6 9l6 6 6-6',
};

// ---------- sorting ----------

type SortKey = 'status' | 'due' | 'created';
type SortState = { key: SortKey; dir: 1 | -1 } | null;

function statusRank(item: ActionItem): number {
  const idx = STATUS_ORDER.indexOf(item.status?.name ?? '');
  return idx === -1 ? STATUS_ORDER.length : idx;
}

const VIEW_STORAGE_KEY = 'pulse_dashboard_view';

// ---------- page ----------

export default function DashboardPage() {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [siteFilter, setSiteFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Table is the default; the choice persists for the tab session.
  // Read sessionStorage in an effect (not the initializer) so the first
  // client render matches the prerendered HTML.
  const [view, setView] = useState<'table' | 'cards'>('table');
  useEffect(() => {
    const stored = sessionStorage.getItem(VIEW_STORAGE_KEY);
    if (stored === 'cards' || stored === 'table') setView(stored);
  }, []);

  const changeView = (v: 'table' | 'cards') => {
    setView(v);
    sessionStorage.setItem(VIEW_STORAGE_KEY, v);
  };

  useEffect(() => {
    (async () => {
      try {
        const [itemsRes, sitesRes] = await Promise.all([
          fetch('/api/action-items'),
          fetch('/api/sites'),
        ]);
        if (!itemsRes.ok || !sitesRes.ok) throw new Error('Failed to load dashboard data');
        setItems(await itemsRes.json());
        setSites(await sitesRes.json());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Statuses present in the data, in canonical order, unknown ones last
  const statusNames = useMemo(() => {
    const present = new Set(
      items.map((i) => i.status?.name).filter((n): n is string => Boolean(n))
    );
    return [
      ...STATUS_ORDER.filter((s) => present.has(s)),
      ...[...present].filter((s) => !STATUS_ORDER.includes(s)).sort(),
    ];
  }, [items]);

  const statusCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      const name = item.status?.name ?? 'Unknown';
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    return counts;
  }, [items]);

  const overdueCount = useMemo(() => items.filter(isOverdue).length, [items]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const result = items.filter((item) => {
      if (statusFilter && item.status?.name !== statusFilter) return false;
      if (siteFilter && item.site_id !== siteFilter) return false;
      if (q) {
        const haystack = [
          item.action_item,
          item.notes,
          item.user_name,
          item.site?.name,
          item.category?.name,
          item.sub_category?.name,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });

    if (sort) {
      const { key, dir } = sort;
      result.sort((a, b) => {
        if (key === 'status') return (statusRank(a) - statusRank(b)) * dir;
        if (key === 'created') {
          return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
        }
        // due: items without a date always sort last, regardless of direction
        const aDue = a.estimated_completion_date;
        const bDue = b.estimated_completion_date;
        if (!aDue && !bDue) return 0;
        if (!aDue) return 1;
        if (!bDue) return -1;
        return aDue.localeCompare(bDue) * dir;
      });
    } else {
      // Default: overdue first (most overdue leading), then newest first
      result.sort((a, b) => {
        const aOver = isOverdue(a);
        const bOver = isOverdue(b);
        if (aOver !== bOver) return aOver ? -1 : 1;
        if (aOver && bOver) {
          return (a.estimated_completion_date ?? '').localeCompare(
            b.estimated_completion_date ?? ''
          );
        }
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
    }
    return result;
  }, [items, statusFilter, siteFilter, search, sort]);

  const hasActiveFilters = Boolean(statusFilter || siteFilter || search.trim());

  const clearFilters = () => {
    setStatusFilter(null);
    setSiteFilter('');
    setSearch('');
  };

  // Cycle: default → asc → desc → default
  const cycleSort = (key: SortKey) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: 1 };
      if (prev.dir === 1) return { key, dir: -1 };
      return null;
    });
  };

  const sortIndicator = (key: SortKey) =>
    sort?.key === key ? (sort.dir === 1 ? ' ▲' : ' ▼') : '';

  const ariaSort = (key: SortKey): 'ascending' | 'descending' | 'none' =>
    sort?.key === key ? (sort.dir === 1 ? 'ascending' : 'descending') : 'none';

  const toggleExpanded = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
      <NavBar />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
        {/* Header */}
        <div className="mb-3 sm:mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-0.5">Dashboard</h2>
          <p className="text-sm text-gray-600">Live overview of every action item across all sites.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Summary strip */}
            <section
              aria-label="Summary"
              className="bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 mb-3 sm:mb-4"
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <p className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span className="text-xl sm:text-2xl font-bold text-gray-900 leading-none">
                    {items.length}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Total
                  </span>
                </p>
                <p className="flex items-baseline gap-1.5 whitespace-nowrap">
                  <span
                    className={`text-xl sm:text-2xl font-bold leading-none ${
                      overdueCount > 0 ? 'text-red-600' : 'text-gray-900'
                    }`}
                  >
                    {overdueCount}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Overdue
                  </span>
                </p>

                {/* Status pills double as the status filter */}
                <div className="flex flex-wrap items-center gap-1.5 sm:ml-auto">
                  {statusNames.map((name) => {
                    const active = statusFilter === name;
                    return (
                      <button
                        key={name}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setStatusFilter(active ? null : name)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                          active
                            ? 'border-gray-900 bg-gray-900 text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${getStatusAccentClasses(name)}`}
                          aria-hidden="true"
                        />
                        {name}
                        <span className="font-bold">{statusCounts.get(name) ?? 0}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compact status distribution bar */}
              {items.length > 0 && (
                <div
                  className="mt-2.5 flex h-2 gap-[2px] overflow-hidden rounded-full"
                  role="img"
                  aria-label={`Status distribution: ${statusNames
                    .map((n) => `${n} ${statusCounts.get(n) ?? 0}`)
                    .join(', ')}`}
                >
                  {statusNames.map((name) => {
                    const count = statusCounts.get(name) ?? 0;
                    if (count === 0) return null;
                    return (
                      <div
                        key={name}
                        className={getStatusAccentClasses(name)}
                        style={{ width: `${(count / items.length) * 100}%` }}
                        title={`${name}: ${count}`}
                      />
                    );
                  })}
                </div>
              )}
            </section>

            {/* Filters */}
            <section
              aria-label="Filters"
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-3 mb-3 sm:mb-4"
            >
              <div className="flex flex-col sm:flex-row gap-2.5">
                <label className="relative flex-1">
                  <span className="sr-only">Search action items</span>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Icon path={ICON_PATHS.search} className="h-4 w-4" />
                  </span>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search descriptions, people, categories…"
                    className="w-full rounded-lg border border-gray-300 py-1.5 pl-9 pr-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  />
                </label>
                <label className="sm:w-48">
                  <span className="sr-only">Filter by site</span>
                  <select
                    value={siteFilter}
                    onChange={(e) => setSiteFilter(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 py-1.5 px-3 text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  >
                    <option value="">All sites</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name}
                      </option>
                    ))}
                  </select>
                </label>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    Clear filters
                  </button>
                )}
                {/* View toggle */}
                <div
                  role="group"
                  aria-label="View mode"
                  className="inline-flex self-start sm:self-auto sm:ml-auto rounded-lg border border-gray-300 bg-gray-50 p-0.5"
                >
                  {(
                    [
                      { v: 'table', label: 'Table', icon: ICON_PATHS.table },
                      { v: 'cards', label: 'Cards', icon: ICON_PATHS.cards },
                    ] as const
                  ).map(({ v, label, icon }) => (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={view === v}
                      onClick={() => changeView(v)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                        view === v
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Icon path={icon} className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Results */}
            <p className="text-sm text-gray-600 mb-2">
              Showing {filtered.length} of {items.length} action item{items.length !== 1 ? 's' : ''}
            </p>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 py-12 text-center text-gray-500">
                <p className="mb-3">No action items match the current filters.</p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-medium text-blue-600 hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : view === 'table' ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Desktop table */}
                <table className="hidden sm:table w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                      <th scope="col" aria-sort={ariaSort('status')} className="px-3 py-2 font-medium whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => cycleSort('status')}
                          className="hover:text-gray-800 transition-colors"
                          title="Sort by status"
                        >
                          Status{sortIndicator('status')}
                        </button>
                      </th>
                      <th scope="col" className="px-3 py-2 font-medium w-full">Description</th>
                      <th scope="col" className="px-3 py-2 font-medium whitespace-nowrap">Site</th>
                      <th scope="col" className="px-3 py-2 font-medium whitespace-nowrap hidden lg:table-cell">Category</th>
                      <th scope="col" className="px-3 py-2 font-medium whitespace-nowrap hidden md:table-cell">Submitted by</th>
                      <th scope="col" aria-sort={ariaSort('due')} className="px-3 py-2 font-medium whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => cycleSort('due')}
                          className="hover:text-gray-800 transition-colors"
                          title="Sort by due date"
                        >
                          Due{sortIndicator('due')}
                        </button>
                      </th>
                      <th scope="col" aria-sort={ariaSort('created')} className="px-3 py-2 font-medium whitespace-nowrap hidden md:table-cell">
                        <button
                          type="button"
                          onClick={() => cycleSort('created')}
                          className="hover:text-gray-800 transition-colors"
                          title="Sort by created date"
                        >
                          Created{sortIndicator('created')}
                        </button>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((item, idx) => {
                      const overdue = isOverdue(item);
                      const expanded = expandedId === item.id;
                      return (
                        <Fragment key={item.id}>
                          <tr
                            onClick={() => toggleExpanded(item.id)}
                            aria-expanded={expanded}
                            className={`cursor-pointer border-b border-gray-100 transition-colors ${
                              overdue
                                ? 'bg-red-50/70 hover:bg-red-50'
                                : `${idx % 2 === 1 ? 'bg-gray-50/60' : 'bg-white'} hover:bg-blue-50/50`
                            }`}
                          >
                            <td className="px-3 py-1.5 whitespace-nowrap">
                              <span className={getStatusBadgeClasses(item.status?.name)}>
                                {item.status?.name ?? 'Unknown'}
                              </span>
                            </td>
                            <td className="px-3 py-1.5 max-w-0 w-full">
                              <p className="truncate font-medium text-gray-900" title={item.action_item}>
                                {item.action_item}
                              </p>
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap text-gray-600">
                              {item.site?.name ?? 'N/A'}
                            </td>
                            <td className="px-3 py-1.5 text-gray-600 hidden lg:table-cell">
                              <p className="truncate max-w-[13rem]" title={item.category?.name ?? undefined}>
                                {item.category?.name ?? 'N/A'}
                              </p>
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap text-gray-600 hidden md:table-cell">
                              {item.user_name}
                            </td>
                            <td
                              className={`px-3 py-1.5 whitespace-nowrap ${
                                overdue ? 'font-semibold text-red-600' : 'text-gray-600'
                              }`}
                            >
                              {overdue && (
                                <Icon path={ICON_PATHS.warn} className="h-3 w-3 inline-block mr-1 -mt-0.5" />
                              )}
                              {item.estimated_completion_date
                                ? formatDueDate(item.estimated_completion_date)
                                : '—'}
                            </td>
                            <td className="px-3 py-1.5 whitespace-nowrap text-gray-400 hidden md:table-cell">
                              {timeAgo(item.created_at)}
                            </td>
                          </tr>
                          {expanded && (
                            <tr className={overdue ? 'bg-red-50/40' : 'bg-blue-50/30'}>
                              <td colSpan={7} className="px-4 py-3 border-b border-gray-100">
                                <div className="space-y-1.5 text-sm text-gray-700">
                                  <p className="font-medium text-gray-900">{item.action_item}</p>
                                  <p className="text-xs text-gray-500">
                                    {item.category?.name ?? 'N/A'}
                                    <span className="text-gray-400"> › </span>
                                    {item.sub_category?.name ?? 'N/A'}
                                  </p>
                                  {item.notes && <p className="text-sm">{item.notes}</p>}
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>

                {/* Mobile stacked list */}
                <ul className="sm:hidden divide-y divide-gray-100">
                  {filtered.map((item) => {
                    const overdue = isOverdue(item);
                    const expanded = expandedId === item.id;
                    return (
                      <li key={item.id} className={overdue ? 'bg-red-50/70' : ''}>
                        <button
                          type="button"
                          onClick={() => toggleExpanded(item.id)}
                          aria-expanded={expanded}
                          className="w-full px-3 py-2 text-left"
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className={getStatusBadgeClasses(item.status?.name)}>
                              {item.status?.name ?? 'Unknown'}
                            </span>
                            <span
                              className={`text-xs whitespace-nowrap ${
                                overdue ? 'font-semibold text-red-600' : 'text-gray-500'
                              }`}
                            >
                              {overdue && (
                                <Icon path={ICON_PATHS.warn} className="h-3 w-3 inline-block mr-0.5 -mt-0.5" />
                              )}
                              {item.estimated_completion_date
                                ? formatDueDate(item.estimated_completion_date)
                                : 'No date'}
                            </span>
                          </div>
                          <p className={`text-sm font-medium text-gray-900 ${expanded ? '' : 'truncate'}`}>
                            {item.action_item}
                          </p>
                        </button>
                        {expanded && (
                          <div className="px-3 pb-2.5 space-y-1 text-xs text-gray-600">
                            <p>
                              {item.site?.name ?? 'N/A'} · {item.category?.name ?? 'N/A'}
                              <span className="text-gray-400"> › </span>
                              {item.sub_category?.name ?? 'N/A'}
                            </p>
                            <p>Submitted by {item.user_name} · {timeAgo(item.created_at)}</p>
                            {item.notes && <p className="text-gray-700">{item.notes}</p>}
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => {
                  const overdue = isOverdue(item);
                  return (
                    <article
                      key={item.id}
                      className={`flex h-full flex-col rounded-xl border bg-white p-4 shadow-sm transition-shadow hover:shadow-md ${
                        overdue ? 'border-red-300' : 'border-gray-200'
                      }`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className={getStatusBadgeClasses(item.status?.name)}>
                          {item.status?.name ?? 'Unknown'}
                        </span>
                        {overdue && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700">
                            <Icon path={ICON_PATHS.warn} className="h-3 w-3" />
                            Overdue
                          </span>
                        )}
                      </div>

                      <h3 className="mb-3 text-sm font-semibold leading-snug text-gray-900">
                        {item.action_item}
                      </h3>

                      <dl className="mt-auto space-y-1.5 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <dt className="text-gray-400">
                            <Icon path={ICON_PATHS.pin} />
                            <span className="sr-only">Site</span>
                          </dt>
                          <dd>{item.site?.name ?? 'N/A'}</dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="text-gray-400">
                            <Icon path={ICON_PATHS.tag} />
                            <span className="sr-only">Category</span>
                          </dt>
                          <dd className="truncate" title={`${item.category?.name ?? 'N/A'} › ${item.sub_category?.name ?? 'N/A'}`}>
                            {item.category?.name ?? 'N/A'}
                            <span className="text-gray-400"> › </span>
                            {item.sub_category?.name ?? 'N/A'}
                          </dd>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <dt className="text-gray-400">
                            <Icon path={ICON_PATHS.user} />
                            <span className="sr-only">Submitted by</span>
                          </dt>
                          <dd>{item.user_name}</dd>
                        </div>
                      </dl>

                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2.5 text-xs">
                        <span className={overdue ? 'font-semibold text-red-600' : 'text-gray-500'}>
                          {item.estimated_completion_date
                            ? `Due ${formatDueDate(item.estimated_completion_date)}`
                            : 'No target date'}
                        </span>
                        <span className="text-gray-400">{timeAgo(item.created_at)}</span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
