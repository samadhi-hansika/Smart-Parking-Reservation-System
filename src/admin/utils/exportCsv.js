/**
 * ParkLink Admin Module - CSV Export Utility
 */

/**
 * Escapes a cell value for CSV format
 * @param {any} val
 * @returns {string}
 */
function escapeCsvValue(val) {
  if (val === null || val === undefined) return '""';
  let str = String(val);
  // If contains double quote, comma, or newline, escape double quotes and wrap in quotes
  if (str.includes('"') || str.includes(',') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  } else {
    str = `"${str}"`;
  }
  return str;
}

/**
 * Exports data to a CSV file and triggers automatic browser download
 * @param {Array<object>} rows - Array of data rows
 * @param {Array<{ key: string, label: string, formatter?: (val: any, row: object) => any }>} columns - Column definitions
 * @param {string} filename - Filename including .csv
 */
export function exportToCsv({ rows = [], columns = [], filename = "export.csv" }) {
  if (!rows || rows.length === 0) {
    throw new Error("No data available to export.");
  }

  // Header row
  const headerLine = columns.map((col) => escapeCsvValue(col.label)).join(",");

  // Data lines
  const dataLines = rows.map((row) => {
    return columns
      .map((col) => {
        let rawVal = row[col.key];
        if (col.formatter) {
          rawVal = col.formatter(rawVal, row);
        }
        return escapeCsvValue(rawVal);
      })
      .join(",");
  });

  const csvContent = "\uFEFF" + [headerLine, ...dataLines].join("\r\n"); // Add BOM for Excel UTF-8 support
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
