'use server';

// Helper: Extract sheet ID from Google Sheets URL
const extractSheetId = (url: string): string | null => {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

export async function getSheetRangeValues(
  sheetUrl: string,
  range: string
): Promise<any[]> {
  // Use environment variable for API key
  const googleApiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!googleApiKey) {
    throw new Error('API key is required for Google Sheets API access. Please set GOOGLE_SHEETS_API_KEY environment variable.');
  }
  
  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) {
    throw new Error(
      'Invalid Google Sheets URL. Expected format: https://docs.google.com/spreadsheets/d/{ID}/edit'
    );
  }
  
  if (!range) {
    throw new Error('Range is required (e.g., "A1:B3")');
  }

  // Construct API URL (uses first sheet by default; append !SheetName to range for specific tabs)
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${googleApiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API fetch failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
    const responseData = await response.json();

    // Extract 2D values (assumes ROWS majorDimension; API defaults to this for A1 ranges)
    const values2D = responseData.values || [];
    if (!Array.isArray(values2D)) {
      throw new Error('Invalid API response: expected 2D array');
    }

    // Flatten and type-preserve (API returns strings; detect numbers)
    const toValue = (cell: any) => {
      if (cell === null || cell === undefined) return '';
      const str = String(cell).trim();
      const num = Number(str);
      // If it parses to number and stringifies back to original (no leading zeros loss, etc.)
      return !isNaN(num) && String(num) === str ? num : str;
    };

    const values = values2D.flat().map(toValue);

    return values;
  } catch (error) {
    console.error('Error fetching/parsing sheet via API:', error);
    throw error;
  }
}

export async function getSheetRangeValues2D(
  sheetUrl: string,
  range: string
): Promise<any[][]> {
  // Use environment variable for API key
  const googleApiKey = process.env.GOOGLE_SHEETS_API_KEY;
  if (!googleApiKey) {
    throw new Error('API key is required for Google Sheets API access. Please set GOOGLE_SHEETS_API_KEY environment variable.');
  }
  
  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) {
    throw new Error(
      'Invalid Google Sheets URL. Expected format: https://docs.google.com/spreadsheets/d/{ID}/edit'
    );
  }
  
  if (!range) {
    throw new Error('Range is required (e.g., "A1:B3")');
  }

  // Construct API URL (uses first sheet by default; append !SheetName to range for specific tabs)
  const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}?key=${googleApiKey}`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API fetch failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }
    const responseData = await response.json();

    // Extract 2D values (assumes ROWS majorDimension; API defaults to this for A1 ranges)
    const values2D = responseData.values || [];
    if (!Array.isArray(values2D)) {
      throw new Error('Invalid API response: expected 2D array');
    }

    // Transform and type-preserve (API returns strings; detect numbers)
    const toValue = (cell: any) => {
      if (cell === null || cell === undefined) return '';
      const str = String(cell).trim();
      const num = Number(str);
      // If it parses to number and stringifies back to original (no leading zeros loss, etc.)
      return !isNaN(num) && String(num) === str ? num : str;
    };

    // Return values as 2D array preserving row structure
    return values2D.map(row => row.map(toValue));
  } catch (error) {
    console.error('Error fetching/parsing sheet via API:', error);
    throw error;
  }
}