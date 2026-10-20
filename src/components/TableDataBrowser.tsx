import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { SchemaTableDef } from '../types';
import { TableRow, exportTableToCsv, parseCsvToRows } from '../services/dbStore';
import {
  Table,
  Plus,
  Trash2,
  Edit2,
  Download,
  Upload,
  Search,
  FileSpreadsheet,
  FileCode,
  Check,
  X,
  AlertCircle,
  Database,
} from 'lucide-react';

interface TableDataBrowserProps {
  tables: SchemaTableDef[];
  dataStore: Record<string, TableRow[]>;
  onInsertRow: (tableName: string, row: Record<string, any>) => void;
  onUpdateRow: (tableName: string, id: string, updates: Record<string, any>) => void;
  onDeleteRow: (tableName: string, id: string) => void;
  onImportRows: (tableName: string, rows: Record<string, any>[]) => void;
  onDeleteTable?: (tableName: string) => void;
  onEditTable?: (tableName: string) => void;
}

export const TableDataBrowser: React.FC<TableDataBrowserProps> = ({
  tables,
  dataStore,
  onInsertRow,
  onUpdateRow,
  onDeleteRow,
  onImportRows,
  onDeleteTable,
  onEditTable,
}) => {
  const [selectedTableName, setSelectedTableName] = useState<string>(tables[0]?.name || 'users');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRowModal, setShowAddRowModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingRow, setEditingRow] = useState<TableRow | null>(null);
  const [rowToDelete, setRowToDelete] = useState<TableRow | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3000);
  };

  // Import modal state
  const [importText, setImportText] = useState('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv');
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  // Form fields state
  const [formFields, setFormFields] = useState<Record<string, any>>({});

  const currentTableDef = tables.find((t) => t.name === selectedTableName) || tables[0];
  const currentRows = dataStore[selectedTableName] || [];

  const filteredRows = currentRows.filter((row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return Object.values(row).some((val) => {
      if (val === null || val === undefined) return false;
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return str.toLowerCase().includes(term);
    });
  });

  const handleOpenAddRow = () => {
    const initial: Record<string, any> = {};
    currentTableDef?.columns.forEach((col) => {
      if (col.isPrimary && col.type.includes('UUID')) {
        initial[col.name] = crypto.randomUUID();
      } else if (col.defaultValue && col.defaultValue.includes('CURRENT_TIMESTAMP')) {
        initial[col.name] = new Date().toISOString();
      } else if (col.type === 'BOOLEAN') {
        initial[col.name] = false;
      } else if (col.type.includes('[]')) {
        initial[col.name] = [];
      } else if (col.type === 'JSONB') {
        initial[col.name] = {};
      } else {
        initial[col.name] = '';
      }
    });
    setFormFields(initial);
    setShowAddRowModal(true);
  };

  const handleSubmitAddRow = (e: React.FormEvent) => {
    e.preventDefault();
    onInsertRow(selectedTableName, formFields);
    setShowAddRowModal(false);
    showToast(`New record inserted into '${selectedTableName}'!`);
  };

  const handleOpenEditRow = (row: TableRow) => {
    setEditingRow(row);
    setFormFields({ ...row });
  };

  const handleSubmitEditRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRow) return;
    onUpdateRow(selectedTableName, editingRow.id, formFields);
    setEditingRow(null);
    showToast(`Record '${editingRow.id}' updated in '${selectedTableName}'!`);
  };

  const handleExportCsv = () => {
    const cols = currentTableDef?.columns.map((c) => c.name) || Object.keys(currentRows[0] || {});
    const csvContent = exportTableToCsv(currentRows, cols);
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dz_bridge_${selectedTableName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportJson = () => {
    const jsonContent = JSON.stringify(currentRows, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dz_bridge_${selectedTableName}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(currentRows);
    const wb = XLSX.utils.book_new();
    const cleanSheetName = selectedTableName.slice(0, 31).replace(/[\\/?*:[\]]/g, '_');
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);
    XLSX.writeFile(wb, `dz_bridge_${selectedTableName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleProcessImport = () => {
    setImportError(null);
    try {
      let parsedRows: Record<string, any>[] = [];
      if (importFormat === 'json') {
        const parsed = JSON.parse(importText);
        if (Array.isArray(parsed)) {
          parsedRows = parsed;
        } else if (typeof parsed === 'object') {
          parsedRows = [parsed];
        } else {
          throw new Error('JSON must contain an array of row objects.');
        }
      } else {
        parsedRows = parseCsvToRows(importText);
      }

      if (parsedRows.length === 0) {
        throw new Error('No valid row records found in the provided input.');
      }

      const normalizedRows = parsedRows.map((r) => ({
        id: r.id || crypto.randomUUID(),
        ...r,
      }));

      onImportRows(selectedTableName, normalizedRows);
      setImportSuccessCount(normalizedRows.length);
      setTimeout(() => {
        setShowImportModal(false);
        setImportSuccessCount(null);
        setImportText('');
      }, 1200);
    } catch (err: any) {
      setImportError(err.message || 'Failed to parse import dataset.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice Feedback */}
      {toastNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastNotice}</span>
          </div>
          <button onClick={() => setToastNotice(null)} className="text-emerald-700 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table Selector & Top Action Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Select Table:
          </label>
          <select
            value={selectedTableName}
            onChange={(e) => {
              setSelectedTableName(e.target.value);
              setSearchTerm('');
            }}
            className="bg-slate-50 border border-slate-300 font-mono text-xs font-bold text-slate-900 rounded-xl px-3.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
          >
            {tables.map((tbl) => (
              <option key={tbl.id} value={tbl.name}>
                {tbl.name} ({dataStore[tbl.name]?.length || 0} rows)
              </option>
            ))}
          </select>
          <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
            {currentRows.length} total rows
          </span>

          {onEditTable && (
            <button
              onClick={() => onEditTable(selectedTableName)}
              className="p-1.5 rounded-xl text-slate-600 hover:text-[#3B0D2C] hover:bg-slate-100 border border-slate-200 transition"
              title="Edit table schema & metadata"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {onDeleteTable && (
            <button
              onClick={() => onDeleteTable(selectedTableName)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition"
              title="Delete this table permanently"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Buttons: Add Record, Import, Export */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleOpenAddRow}
            className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C89B3C]" />
            Insert Row
          </button>
          <button
            onClick={() => {
              setImportText('');
              setImportError(null);
              setShowImportModal(true);
            }}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <Upload className="w-3.5 h-3.5 text-blue-600" />
            Import Data
          </button>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handleExportCsv}
              disabled={currentRows.length === 0}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1"
              title="Export Table as CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              CSV
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleExportExcel}
              disabled={currentRows.length === 0}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1"
              title="Export Table as Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              XLSX
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={handleExportJson}
              disabled={currentRows.length === 0}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-slate-900 disabled:opacity-40 flex items-center gap-1"
              title="Export Table as JSON"
            >
              <FileCode className="w-3.5 h-3.5 text-[#C89B3C]" />
              JSON
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar & Table Header */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden space-y-3 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-black text-slate-900 font-mono flex items-center gap-2">
              <Table className="w-4 h-4 text-[#3B0D2C]" />
              Table: {selectedTableName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{currentTableDef?.description}</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Filter in ${selectedTableName}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-xs text-slate-800 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20 w-64"
            />
          </div>
        </div>

        {/* Data Grid */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          {filteredRows.length > 0 ? (
            <table className="w-full text-left text-xs font-mono divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-bold text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  {currentTableDef?.columns.map((col) => (
                    <th key={col.id} className="py-2.5 px-3 whitespace-nowrap">
                      <span>{col.name}</span>
                      <span className="block text-[9px] text-slate-400 font-normal">{col.type}</span>
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.map((row, index) => (
                  <tr key={row.id || index} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{index + 1}</td>
                    {currentTableDef?.columns.map((col) => {
                      const val = row[col.name];
                      return (
                        <td key={col.id} className="py-2.5 px-3 text-slate-800 max-w-xs truncate">
                          {val === null || val === undefined ? (
                            <span className="text-slate-300 italic">null</span>
                          ) : typeof val === 'object' ? (
                            <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
                              {JSON.stringify(val)}
                            </span>
                          ) : typeof val === 'boolean' ? (
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                val ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {val ? 'TRUE' : 'FALSE'}
                            </span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEditRow(row)}
                          className="p-1 rounded text-slate-500 hover:text-[#3B0D2C] hover:bg-slate-100"
                          title="Edit Row"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setRowToDelete(row)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title="Delete Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-400 space-y-3 bg-white">
              <Database className="w-10 h-10 mx-auto text-slate-300" />
              <div>
                <div className="text-sm font-bold text-slate-700">0 Data Rows in '{selectedTableName}'</div>
                <p className="text-xs text-slate-500 mt-1">
                  This table currently contains 0 records. Insert rows directly, import CSV/JSON, or seed baseline scholar data.
                </p>
              </div>
              <div className="flex justify-center gap-2 pt-2">
                <button
                  onClick={handleOpenAddRow}
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#C89B3C]" />
                  Insert First Row
                </button>
                <button
                  onClick={() => setShowImportModal(true)}
                  className="bg-white border border-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  Import Dataset
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: INSERT OR EDIT ROW */}
      {(showAddRowModal || editingRow) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {editingRow ? <Edit2 className="w-4 h-4 text-[#3B0D2C]" /> : <Plus className="w-4 h-4 text-[#3B0D2C]" />}
                <span>
                  {editingRow ? 'Edit Record' : 'Insert New Record'} into '{selectedTableName}'
                </span>
              </h4>
              <button
                onClick={() => {
                  setShowAddRowModal(false);
                  setEditingRow(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={editingRow ? handleSubmitEditRow : handleSubmitAddRow}
              className="space-y-3 text-xs overflow-y-auto pr-1 flex-1"
            >
              {currentTableDef?.columns.map((col) => {
                const value = formFields[col.name];
                return (
                  <div key={col.id} className="space-y-1">
                    <label className="text-slate-700 font-bold flex items-center justify-between">
                      <span className="font-mono">{col.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal font-sans">
                        {col.type} {col.isNullable ? '(optional)' : '(required)'}
                      </span>
                    </label>

                    {col.type === 'BOOLEAN' ? (
                      <select
                        value={value === true ? 'true' : 'false'}
                        onChange={(e) =>
                          setFormFields((prev) => ({ ...prev, [col.name]: e.target.value === 'true' }))
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                      >
                        <option value="true">TRUE</option>
                        <option value="false">FALSE</option>
                      </select>
                    ) : col.type === 'TEXT' ? (
                      <textarea
                        rows={2}
                        value={value || ''}
                        onChange={(e) =>
                          setFormFields((prev) => ({ ...prev, [col.name]: e.target.value }))
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                      />
                    ) : col.type === 'JSONB' || col.type.includes('[]') ? (
                      <textarea
                        rows={2}
                        value={typeof value === 'object' ? JSON.stringify(value) : value || ''}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            setFormFields((prev) => ({ ...prev, [col.name]: parsed }));
                          } catch (_) {
                            setFormFields((prev) => ({ ...prev, [col.name]: e.target.value }));
                          }
                        }}
                        placeholder='{"key": "value"} or ["item1", "item2"]'
                        className="w-full bg-slate-50 font-mono border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                      />
                    ) : (
                      <input
                        type={col.type.includes('INT') || col.type.includes('DECIMAL') ? 'number' : 'text'}
                        step={col.type.includes('DECIMAL') ? '0.01' : undefined}
                        value={value !== undefined && value !== null ? value : ''}
                        onChange={(e) =>
                          setFormFields((prev) => ({ ...prev, [col.name]: e.target.value }))
                        }
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                      />
                    )}
                  </div>
                );
              })}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRowModal(false);
                    setEditingRow(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-5 py-2 rounded-xl transition shadow"
                >
                  {editingRow ? 'Save Changes' : 'Insert Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: IMPORT DATA */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                Import Dataset into '{selectedTableName}'
              </h4>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-700">Format:</span>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    checked={importFormat === 'csv'}
                    onChange={() => setImportFormat('csv')}
                  />
                  <span>CSV</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="format"
                    checked={importFormat === 'json'}
                    onChange={() => setImportFormat('json')}
                  />
                  <span>JSON Array</span>
                </label>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">
                  Paste Raw {importFormat.toUpperCase()} Data
                </label>
                <textarea
                  rows={8}
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder={
                    importFormat === 'csv'
                      ? 'email,role,status\nkarim.mansouri@tum.de,expert,active'
                      : '[{"email": "karim.mansouri@tum.de", "role": "expert", "status": "active"}]'
                  }
                  className="w-full bg-slate-950 font-mono text-xs text-emerald-300 border border-slate-800 rounded-xl p-3 focus:outline-none"
                />
              </div>

              {importError && (
                <div className="p-3 bg-red-50 text-red-800 rounded-xl text-xs border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccessCount !== null && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs border border-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Successfully imported {importSuccessCount} rows into '{selectedTableName}'!</span>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcessImport}
                  disabled={!importText.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-5 py-2 rounded-xl transition shadow disabled:opacity-50"
                >
                  Process & Insert Rows
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* MODAL: CONFIRM DELETE ROW */}
      {rowToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Delete Record?</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-[200px]">ID: {rowToDelete.id}</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this row from table <strong className="font-mono text-slate-900">{selectedTableName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRowToDelete(null)}
                className="px-3.5 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteRow(selectedTableName, rowToDelete.id);
                  showToast(`Record '${rowToDelete.id}' deleted from '${selectedTableName}'.`);
                  setRowToDelete(null);
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition shadow flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Row</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
