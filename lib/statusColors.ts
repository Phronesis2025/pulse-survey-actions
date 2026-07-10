// Utility function to get color classes for status badges

export function getStatusBadgeClasses(statusName: string | null | undefined): string {
  if (!statusName) {
    return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
  }

  const status = statusName.toLowerCase();

  // Color coding based on status
  if (status === 'pending') {
    return 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800';
  }
  
  if (status === 'in progress') {
    return 'px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800';
  }
  
  if (status === 'completed') {
    return 'px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800';
  }
  
  if (status === 'on hold') {
    return 'px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800';
  }
  
  if (status === 'cancelled') {
    return 'px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800';
  }

  // Default color for unknown statuses
  return 'px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800';
}

// Canonical display order for status summaries. This order also fixes the
// dashboard's stacked-bar segment adjacency: at the 600-step accents below it
// keeps confusable hues (amber/orange, green/red) non-adjacent for
// colorblind viewers (validated: worst adjacent-pair deltaE 16.0).
export const STATUS_ORDER = ['Pending', 'In Progress', 'On Hold', 'Completed', 'Cancelled'];

// Solid accent (dots and bar segments) per status — the saturated
// counterparts of the pale badge colors above.
export function getStatusAccentClasses(statusName: string | null | undefined): string {
  switch (statusName?.toLowerCase()) {
    case 'pending': return 'bg-amber-600';
    case 'in progress': return 'bg-blue-600';
    case 'on hold': return 'bg-orange-600';
    case 'completed': return 'bg-green-600';
    case 'cancelled': return 'bg-red-600';
    default: return 'bg-gray-500';
  }
}

