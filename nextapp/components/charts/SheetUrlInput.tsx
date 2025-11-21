import React from 'react';

interface SheetUrlInputProps {
  sheetUrl: string;
  setSheetUrl: (url: string) => void;
  loading: boolean;
}

const SheetUrlInput: React.FC<SheetUrlInputProps> = ({
  sheetUrl,
  setSheetUrl,
  loading,
}) => {
  return (
    <div className="mb-4">
      <label htmlFor="sheetUrl" className="block text-sm font-medium mb-2">
        Google Sheet URL:
      </label>
      <input
        type="text"
        id="sheetUrl"
        value={sheetUrl}
        onChange={(e) => setSheetUrl(e.target.value)}
        placeholder="Enter Google Sheet URL"
        className="w-full border border-gray-300 rounded px-3 py-2"
      />
    </div>
  );
};

export default SheetUrlInput;