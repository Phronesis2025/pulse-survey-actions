// Test fixtures and utilities for E2E tests

export const testData = {
  user: {
    name: 'Test User',
    name2: 'Another User',
  },
  site: {
    name: 'Test Site',
    updatedName: 'Updated Test Site',
  },
  category: {
    name: 'Test Category',
    updatedName: 'Updated Test Category',
  },
  subCategory: {
    name: 'Test Sub-Category',
    updatedName: 'Updated Test Sub-Category',
  },
  status: {
    name: 'Test Status',
    updatedName: 'Updated Test Status',
  },
  actionItem: {
    actionItem: 'Fix the broken door handle',
    notes: 'This is a test action item',
    updatedActionItem: 'Fix the broken door handle - UPDATED',
    estimatedDate: '2024-12-31',
  },
};

// Helper function to wait for API calls
export async function waitForApiCall(page: any) {
  await page.waitForTimeout(500); // Small delay for API calls
}

