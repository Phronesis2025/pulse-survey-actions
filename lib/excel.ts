// Excel export utilities
import * as XLSX from 'xlsx';
import type { ActionItem } from '@/types';

/**
 * Export action items to Excel file
 * @param actionItems Array of action items to export
 * @param filename Name of the file to download (default: 'action-items.xlsx')
 */
export function exportToExcel(actionItems: ActionItem[], filename: string = 'action-items.xlsx'): void {
  // Prepare data for Excel
  const excelData = actionItems.map(item => ({
    'ID': item.id,
    'User Name': item.user_name,
    'Site': item.site?.name || '',
    'Category': item.category?.name || '',
    'Sub-Category': item.sub_category?.name || '',
    'Action Item': item.action_item,
    'Estimated Completion Date': item.estimated_completion_date || '',
    'Status': item.status?.name || '',
    'Notes': item.notes || '',
    'Created At': new Date(item.created_at).toLocaleString(),
    'Updated At': new Date(item.updated_at).toLocaleString(),
  }));

  // Create a new workbook
  const workbook = XLSX.utils.book_new();
  
  // Convert data to worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths for better readability
  const columnWidths = [
    { wch: 36 }, // ID
    { wch: 20 }, // User Name
    { wch: 20 }, // Site
    { wch: 20 }, // Category
    { wch: 20 }, // Sub-Category
    { wch: 50 }, // Action Item
    { wch: 25 }, // Estimated Completion Date
    { wch: 15 }, // Status
    { wch: 50 }, // Notes
    { wch: 20 }, // Created At
    { wch: 20 }, // Updated At
  ];
  worksheet['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Action Items');
  
  // Generate Excel file and trigger download
  XLSX.writeFile(workbook, filename);
}

