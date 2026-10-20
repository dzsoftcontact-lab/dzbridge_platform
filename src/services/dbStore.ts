export interface TableRow {
  id: string;
  [key: string]: any;
}

export type DbTablesMap = Record<string, TableRow[]>;

export const SYSTEM_TABLE_NAMES = [
  'users',
  'profiles',
  'expert_availabilities',
  'projects',
  'matches',
  'collaborations',
  'ratings',
  'activity_logs',
  'project_status_histories',
];

export function formatCsvCell(val: any): string {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'object') {
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }
  return `"${String(val).replace(/"/g, '""')}"`;
}

export function exportTableToCsv(rows: TableRow[], columnNames: string[]): string {
  if (!columnNames || columnNames.length === 0) {
    if (rows.length === 0) return '';
    columnNames = Object.keys(rows[0]);
  }
  const header = columnNames.map(formatCsvCell).join(',');
  const lines = rows.map((row) =>
    columnNames.map((col) => formatCsvCell(row[col])).join(','),
  );
  return [header, ...lines].join('\r\n');
}

export function parseCsvToRows(csvText: string): Record<string, any>[] {
  const clean = csvText.trim();
  if (!clean) return [];
  const lines = clean.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]);
  const result: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = splitCsvLine(lines[i]);
    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      let val: any = values[idx] !== undefined ? values[idx] : null;
      if (val !== null) {
        if (typeof val === 'string' && val.toLowerCase() === 'true') val = true;
        else if (typeof val === 'string' && val.toLowerCase() === 'false') val = false;
        else if (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '') val = Number(val);
        else if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
          try {
            val = JSON.parse(val);
          } catch (_) {}
        }
      }
      rowObj[h] = val;
    });
    result.push(rowObj);
  }
  return result;
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result.map((s) => s.replace(/^"|"$/g, ''));
}
