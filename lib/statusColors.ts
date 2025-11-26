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

