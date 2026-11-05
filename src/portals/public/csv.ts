/** Build CSV text from rows of cells, quoting cells that need it. */
export function toCsv(rows: string[][]): string {
  return rows
    .map((row) => row.map((cell) => (/[",\r\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join(','))
    .join('\r\n');
}

/** Byte-order mark, so spreadsheets read the file as UTF-8 (dashes and en dashes stay intact). */
const BOM = String.fromCharCode(0xfeff);

/** Save rows as a CSV file in the browser: a Blob and an object URL, no server. */
export function downloadCsv(fileName: string, rows: string[][]): void {
  const blob = new Blob([`${BOM}${toCsv(rows)}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
