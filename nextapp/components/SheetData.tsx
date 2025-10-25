'use client';

import React, { useState, useEffect } from 'react';

interface SheetRow {
  [key: string]: string;
}

const SheetData = () => {
  const [data, setData] = useState<SheetRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Sample Google Sheet URL - replace with your actual sheet
  // For this to work, the sheet must be published to web
  // To publish: File > Publish to Web > Select "Comma-separated values (.csv)" > Publish
  const sheetUrl =
    'https://docs.google.com/spreadsheets/d/1ltA9siijVSDkTE3fzB3UaWHO7dotBIrGH4R9wI_Qyqw/edit?gid=0#gid=0';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // For Google Sheets, we can fetch as CSV or JSON
        // Using CSV format here and converting to JSON
        const response = await fetch(sheetUrl);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch data: ${response.status} ${response.statusText}`
          );
        }

        const csvText = await response.text();
        const parsedData = parseCSV(csvText);
        setData(parsedData);
      } catch (err) {
        console.error('Error fetching sheet data:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Simple CSV parser
  const parseCSV = (csvText: string): SheetRow[] => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];

    const headers = lines[0]
      .split(',')
      .map(header => header.trim().replace(/^"|"$/g, ''));
    const result: SheetRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(',');
      const obj: SheetRow = {};

      for (let j = 0; j < headers.length; j++) {
        // Remove quotes from beginning and end if they exist
        const value = currentLine[j]?.trim().replace(/^"|"$/g, '') || '';
        obj[headers[j]] = value;
      }

      result.push(obj);
    }

    return result;
  };

  if (loading) {
    return <div>Loading sheet data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Sheet Data</h2>
      {data.length > 0 ? (
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              {Object.keys(data[0]).map((header, index) => (
                <th
                  key={index}
                  className="border border-gray-300 px-4 py-2 text-left"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          {/* <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
              >
                {Object.values(row).map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border border-gray-300 px-4 py-2"
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody> */}
        </table>
      ) : (
        <p>No data available</p>
      )}
    </div>
  );
};

export default SheetData;
