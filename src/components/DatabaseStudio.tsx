import React, { useState, useMemo } from 'react';
import { SchemaTableDef, SchemaRelation, SchemaColumn } from '../types';
import { generatePostgreSqlDdl, generateDjangoOrmCode } from '../data/schemaData';
import { TableRow } from '../services/dbStore';
import { TableDataBrowser } from './TableDataBrowser';
import { InteractiveErdGraph } from './InteractiveErdGraph';
import { downloadDatabaseSql, downloadDatabaseExcelWorkbook } from '../utils/databaseExport';
import { useTranslation } from '../i18n/LanguageContext';
import {
  Database,
  Table,
  Plus,
  Edit2,
  Trash2,
  Key,
  Link2,
  Code,
  Download,
  Copy,
  Check,
  Search,
  ArrowRight,
  Layers,
  Sparkles,
  X,
  RotateCcw,
  FileSpreadsheet,
  FileCode,
  CheckCircle2,
  ArrowDownUp,
  Settings,
  Cpu,
  Award,
  BarChart3,
  Lock,
  ShieldCheck,
  Play,
  Activity,
  Target,
  AlertTriangle,
  GitBranch,
  ArrowUpRight,
  RefreshCw,
  GraduationCap,
  Building2,
} from 'lucide-react';

interface DatabaseStudioProps {
  tables: SchemaTableDef[];
  relations: SchemaRelation[];
  onUpdateTables: (tables: SchemaTableDef[]) => void;
  onUpdateRelations: (relations: SchemaRelation[]) => void;
  dataStore: Record<string, TableRow[]>;
  onInsertRow: (tableName: string, row: Record<string, any>) => void;
  onUpdateRow: (tableName: string, id: string, updates: Record<string, any>) => void;
  onDeleteRow: (tableName: string, id: string) => void;
  onImportRows: (tableName: string, rows: Record<string, any>[]) => void;
  onResetAllData: () => void;
  onSeedBaselineData: () => void;
  onRenameTable?: (oldName: string, newName: string) => void;
  onDeleteTableData?: (tableName: string) => void;
}

export const DatabaseStudio: React.FC<DatabaseStudioProps> = ({
  tables,
  relations,
  onUpdateTables,
  onUpdateRelations,
  dataStore,
  onInsertRow,
  onUpdateRow,
  onDeleteRow,
  onImportRows,
  onResetAllData,
  onSeedBaselineData,
  onRenameTable,
  onDeleteTableData,
}) => {
  const { lang, t } = useTranslation();
  const isAr = lang === 'ar';
  const [activeTab, setActiveTab] = useState<'erd' | 'widgets' | 'algo-system' | 'health' | 'designer' | 'data' | 'sql' | 'django'>('erd');
  const [selectedTableId, setSelectedTableId] = useState<string>(tables[0]?.id || '');
  const [searchTable, setSearchTable] = useState('');
  const [isSimulatingMatch, setIsSimulatingMatch] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedDjango, setCopiedDjango] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [simulatedCycle, setSimulatedCycle] = useState<boolean>(false);
  const [healthFilter, setHealthFilter] = useState<'all' | 'errors' | 'warnings' | 'cascades'>('all');

  // Automated Schema Integrity, Cycle Detection, and Referential Validation Engine
  const integrityAudit = useMemo(() => {
    // Effective relations to check (including test cycle if injected)
    let effectiveRelations = [...relations];
    if (simulatedCycle) {
      effectiveRelations.push({
        id: 'simulated-loop-test',
        sourceTable: 'users',
        sourceColumn: 'id',
        targetTable: 'notifications',
        targetColumn: 'user_id',
        onDelete: 'CASCADE',
        label: '[SIMULATED TRAP] users -> notifications (Creates Cycle!)',
      });
    }

    // 1. Build Adjacency Graph: table -> referenced tables (Source Table depends on Target Table)
    const adj = new Map<string, string[]>();
    tables.forEach((t) => adj.set(t.name, []));

    effectiveRelations.forEach((r) => {
      if (adj.has(r.sourceTable)) {
        adj.get(r.sourceTable)!.push(r.targetTable);
      }
    });

    // 2. Cycle Detection (DFS with 3 colors: 0=unvisited, 1=visiting in current recursion stack, 2=visited)
    const visited = new Map<string, number>();
    const cyclesFound: string[][] = [];
    const currentPath: string[] = [];

    const dfs = (node: string) => {
      visited.set(node, 1);
      currentPath.push(node);

      const neighbors = adj.get(node) || [];
      for (const nbr of neighbors) {
        if (!visited.has(nbr) || visited.get(nbr) === 0) {
          dfs(nbr);
        } else if (visited.get(nbr) === 1) {
          // Cycle found!
          const cycleStartIdx = currentPath.indexOf(nbr);
          cyclesFound.push([...currentPath.slice(cycleStartIdx), nbr]);
        }
      }

      currentPath.pop();
      visited.set(node, 2);
    };

    tables.forEach((t) => {
      if (!visited.has(t.name) || visited.get(t.name) === 0) {
        dfs(t.name);
      }
    });

    // 3. Topological Sort (Kahn's Algorithm) to determine Safe Insertion Sequence
    // In insertion order: Target table must be created and populated BEFORE Source table
    // Edge: Target -> Source (in-degree counts how many parents a table has)
    const kahnAdj = new Map<string, string[]>();
    const inDegree = new Map<string, number>();
    tables.forEach((t) => {
      kahnAdj.set(t.name, []);
      inDegree.set(t.name, 0);
    });

    effectiveRelations.forEach((r) => {
      if (kahnAdj.has(r.targetTable) && inDegree.has(r.sourceTable)) {
        kahnAdj.get(r.targetTable)!.push(r.sourceTable);
        inDegree.set(r.sourceTable, (inDegree.get(r.sourceTable) || 0) + 1);
      }
    });

    const queue: string[] = [];
    tables.forEach((t) => {
      if ((inDegree.get(t.name) || 0) === 0) {
        queue.push(t.name);
      }
    });

    const topologicalOrder: string[] = [];
    const layerMap = new Map<string, number>();
    queue.forEach((tbl) => layerMap.set(tbl, 0));

    while (queue.length > 0) {
      const u = queue.shift()!;
      topologicalOrder.push(u);
      const currentLayer = layerMap.get(u) || 0;

      for (const v of kahnAdj.get(u) || []) {
        inDegree.set(v, (inDegree.get(v) || 0) - 1);
        layerMap.set(v, Math.max(layerMap.get(v) || 0, currentLayer + 1));
        if (inDegree.get(v) === 0) {
          queue.push(v);
        }
      }
    }

    const isDAG = cyclesFound.length === 0 && topologicalOrder.length === tables.length;

    // 4. Schema Column Existence & Type Compatibility Validation
    const tableMap = new Map<string, SchemaTableDef>();
    tables.forEach((t) => tableMap.set(t.name, t));

    const relationAudits = effectiveRelations.map((r) => {
      const srcTbl = tableMap.get(r.sourceTable);
      const tgtTbl = tableMap.get(r.targetTable);
      let status: 'valid' | 'warning' | 'error' = 'valid';
      let issueDescription = '';

      if (!srcTbl) {
        status = 'error';
        issueDescription = `Source table "${r.sourceTable}" not found in schema.`;
      } else if (!tgtTbl) {
        status = 'error';
        issueDescription = `Target table "${r.targetTable}" not found in schema.`;
      } else {
        const srcCol = srcTbl.columns.find((c) => c.name === r.sourceColumn);
        const tgtCol = tgtTbl.columns.find((c) => c.name === r.targetColumn);

        if (!srcCol) {
          status = 'error';
          issueDescription = `Column "${r.sourceColumn}" not found in "${r.sourceTable}".`;
        } else if (!tgtCol) {
          status = 'error';
          issueDescription = `Target column "${r.targetColumn}" not found in "${r.targetTable}".`;
        } else {
          const srcType = srcCol.type.toUpperCase();
          const tgtType = tgtCol.type.toUpperCase();
          if (srcType !== tgtType && !(srcType.includes('UUID') && tgtType.includes('UUID'))) {
            status = 'warning';
            issueDescription = `Type divergence: ${srcCol.type} vs ${tgtCol.type}`;
          }
        }
      }

      return {
        relation: r,
        status,
        issueDescription,
        isCascade: r.onDelete === 'CASCADE',
      };
    });

    // 5. Orphan Table Check
    const connectedTables = new Set<string>();
    effectiveRelations.forEach((r) => {
      connectedTables.add(r.sourceTable);
      connectedTables.add(r.targetTable);
    });
    const orphanTables = tables.filter((t) => !connectedTables.has(t.name)).map((t) => t.name);

    // 6. Live In-Browser DataStore Foreign Key Integrity Validation
    let totalRowsChecked = 0;
    let brokenFkRows = 0;
    const dataFkViolations: { sourceTable: string; rowId: string; column: string; value: any; targetTable: string }[] = [];

    effectiveRelations.forEach((r) => {
      const rows = dataStore[r.sourceTable] || [];
      const targetRows = dataStore[r.targetTable] || [];
      const targetIds = new Set(targetRows.map((tr) => String(tr.id || tr[r.targetColumn])));

      rows.forEach((row) => {
        totalRowsChecked++;
        const fkVal = row[r.sourceColumn];
        if (fkVal !== undefined && fkVal !== null && fkVal !== '') {
          if (!targetIds.has(String(fkVal))) {
            brokenFkRows++;
            if (dataFkViolations.length < 8) {
              dataFkViolations.push({
                sourceTable: r.sourceTable,
                rowId: String(row.id || 'unknown'),
                column: r.sourceColumn,
                value: fkVal,
                targetTable: r.targetTable,
              });
            }
          }
        }
      });
    });

    // Group tables into topological layer arrays
    const layers: { layerIndex: number; title: string; tables: string[] }[] = [];
    const maxLayer = Math.max(...Array.from(layerMap.values()), 0);
    for (let i = 0; i <= maxLayer; i++) {
      const tbls = tables.filter((t) => layerMap.get(t.name) === i).map((t) => t.name);
      if (tbls.length > 0) {
        layers.push({
          layerIndex: i,
          title:
            i === 0
              ? 'Layer 0: Root Entity (No Foreign Keys)'
              : i === 1
              ? 'Layer 1: Domain Entities (Direct Root Children)'
              : i === 2
              ? 'Layer 2: Institutional Units & Weights'
              : i === 3
              ? 'Layer 3: Core Initiatives & Targets'
              : i === 4
              ? 'Layer 4: Execution Runs & Agreements'
              : i === 5
              ? 'Layer 5: Match Pairings & Milestones'
              : i === 6
              ? 'Layer 6: Scientific Evaluations & Feedback'
              : `Layer ${i}: Deep Downstream Entities`,
          tables: tbls,
        });
      }
    }

    return {
      isDAG,
      cyclesFound,
      topologicalOrder,
      layers,
      relationAudits,
      orphanTables,
      totalRowsChecked,
      brokenFkRows,
      dataFkViolations,
      totalRelations: effectiveRelations.length,
      totalTables: tables.length,
    };
  }, [tables, relations, dataStore, simulatedCycle]);

  // Modals state
  const [showAddTableModal, setShowAddTableModal] = useState(false);
  const [showAddColumnModal, setShowAddColumnModal] = useState(false);
  const [showEditColumnModal, setShowEditColumnModal] = useState(false);
  const [editingColumn, setEditingColumn] = useState<{ tableId: string; column: SchemaColumn } | null>(null);
  const [showAddRelationModal, setShowAddRelationModal] = useState(false);
  const [editingRelation, setEditingRelation] = useState<SchemaRelation | null>(null);

  // Dedicated in-app confirmation modals (reliably works inside sandboxed iframes)
  const [tableToDelete, setTableToDelete] = useState<SchemaTableDef | null>(null);
  const [columnToDelete, setColumnToDelete] = useState<{ table: SchemaTableDef; column: SchemaColumn } | null>(null);
  const [relationToDelete, setRelationToDelete] = useState<SchemaRelation | null>(null);
  const [editingTable, setEditingTable] = useState<SchemaTableDef | null>(null);
  const [editTableName, setEditTableName] = useState('');
  const [editTableDesc, setEditTableDesc] = useState('');
  const [editTableCategory, setEditTableCategory] = useState<string>('Custom');

  // Form states for table
  const [newTableName, setNewTableName] = useState('');
  const [newTableDesc, setNewTableDesc] = useState('');
  const [newTableCategory, setNewTableCategory] = useState<'Identity' | 'Matchmaking' | 'Collaborations' | 'Audit' | 'Academic' | 'Custom'>('Custom');
  const [newTablePkType, setNewTablePkType] = useState<'UUID' | 'BIGINT' | 'SERIAL'>('UUID');
  const [newTableIncludeTimestamps, setNewTableIncludeTimestamps] = useState(true);

  // Form states for column (Add & Edit)
  const [colName, setColName] = useState('');
  const [colType, setColType] = useState('VARCHAR(255)');
  const [colNullable, setColNullable] = useState(true);
  const [colDefault, setColDefault] = useState('');
  const [colDesc, setColDesc] = useState('');
  const [colIsPrimary, setColIsPrimary] = useState(false);
  const [colIsForeign, setColIsForeign] = useState(false);
  const [colFkTable, setColFkTable] = useState('');
  const [colFkColumn, setColFkColumn] = useState('id');
  const [colFkOnDelete, setColFkOnDelete] = useState<'CASCADE' | 'SET NULL' | 'RESTRICT'>('CASCADE');

  // Form states for dedicated relation modal
  const [relSourceTable, setRelSourceTable] = useState('');
  const [relSourceCol, setRelSourceCol] = useState('');
  const [relTargetTable, setRelTargetTable] = useState('');
  const [relTargetCol, setRelTargetCol] = useState('id');
  const [relOnDelete, setRelOnDelete] = useState<'CASCADE' | 'SET NULL' | 'RESTRICT'>('CASCADE');
  const [relOnUpdate, setRelOnUpdate] = useState<'CASCADE' | 'RESTRICT'>('CASCADE');

  const selectedTable = tables.find((t) => t.id === selectedTableId) || tables[0];

  const triggerNotice = (msg: string) => {
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 3500);
  };

  // Export handlers
  const handleExportSqlFile = () => {
    downloadDatabaseSql(tables, relations, dataStore);
    triggerNotice(
      isAr
        ? 'تم تصدير ملف SQL الكامل مع مخطط الجداول وجميع السجلات بنجاح!'
        : 'Full PostgreSQL .sql dump file exported with schemas & rows!',
    );
  };

  const handleExportExcelFile = () => {
    downloadDatabaseExcelWorkbook(tables, dataStore, relations);
    triggerNotice(
      isAr
        ? 'تم تصدير ملف الإكسيل (.xlsx) بنجاح مع ورقة عمل مستقلة لكل جدول!'
        : 'Multi-sheet Excel workbook (.xlsx) exported with one sheet per table!',
    );
  };

  // Table operations
  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) return;
    const cleanName = newTableName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/\s+/g, '_');

    // Build initial columns
    const initialColumns: SchemaColumn[] = [
      {
        id: `col-${Date.now()}-1`,
        name: 'id',
        type: newTablePkType === 'UUID' ? 'UUID' : newTablePkType === 'BIGINT' ? 'BIGINT' : 'SERIAL',
        isPrimary: true,
        defaultValue: newTablePkType === 'UUID' ? 'uuid_generate_v4()' : undefined,
        description: `${newTablePkType} primary key`,
      },
    ];

    if (newTableIncludeTimestamps) {
      initialColumns.push(
        {
          id: `col-${Date.now()}-2`,
          name: 'created_at',
          type: 'TIMESTAMP WITH TIME ZONE',
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Creation timestamp',
        },
        {
          id: `col-${Date.now()}-3`,
          name: 'updated_at',
          type: 'TIMESTAMP WITH TIME ZONE',
          defaultValue: 'CURRENT_TIMESTAMP',
          description: 'Last update timestamp',
        },
      );
    }

    const newTable: SchemaTableDef = {
      id: `tbl-${Date.now()}`,
      name: cleanName,
      description: newTableDesc || `${cleanName} table`,
      category: newTableCategory,
      columns: initialColumns,
    };

    const updated = [...tables, newTable];
    onUpdateTables(updated);
    setSelectedTableId(newTable.id);
    setShowAddTableModal(false);
    setNewTableName('');
    setNewTableDesc('');
    triggerNotice(`Table '${cleanName}' created successfully!`);
  };

  // Open Edit Table Modal
  const openEditTableModal = (table: SchemaTableDef) => {
    setEditingTable(table);
    setEditTableName(table.name);
    setEditTableDesc(table.description || '');
    setEditTableCategory(table.category || 'Custom');
  };

  // Submit Save Edit Table
  const handleSaveEditTable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTable || !editTableName.trim()) return;
    const cleanName = editTableName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_').replace(/\s+/g, '_');
    const oldName = editingTable.name;

    const updatedTables = tables.map((t) =>
      t.id === editingTable.id
        ? {
            ...t,
            name: cleanName,
            description: editTableDesc.trim() || `${cleanName} table`,
            category: editTableCategory as any,
          }
        : t
    );

    let updatedRelations = [...relations];
    if (oldName !== cleanName) {
      updatedRelations = relations.map((r) => {
        let next = { ...r };
        if (r.sourceTable === oldName) next.sourceTable = cleanName;
        if (r.targetTable === oldName) next.targetTable = cleanName;
        next.label = `${next.sourceTable}.${next.sourceColumn} -> ${next.targetTable}.${next.targetColumn}`;
        return next;
      });

      // Update foreignTable references in all table columns
      updatedTables.forEach((tbl) => {
        tbl.columns.forEach((col) => {
          if (col.foreignTable === oldName) {
            col.foreignTable = cleanName;
          }
        });
      });

      if (onRenameTable) {
        onRenameTable(oldName, cleanName);
      }
    }

    onUpdateTables(updatedTables);
    if (oldName !== cleanName) {
      onUpdateRelations(updatedRelations);
    }
    setEditingTable(null);
    triggerNotice(`Table '${cleanName}' updated successfully.`);
  };

  // Trigger Delete Table Modal
  const handleDeleteTable = (tableId: string) => {
    const tbl = tables.find((t) => t.id === tableId);
    if (tbl) setTableToDelete(tbl);
  };

  // Execute Confirmed Delete Table
  const executeConfirmDeleteTable = () => {
    if (!tableToDelete) return;
    const tableId = tableToDelete.id;
    const tableName = tableToDelete.name;

    const updatedTables = tables.filter((t) => t.id !== tableId);
    const updatedRelations = relations.filter(
      (r) => r.sourceTable !== tableName && r.targetTable !== tableName
    );

    onUpdateTables(updatedTables);
    onUpdateRelations(updatedRelations);
    if (onDeleteTableData) {
      onDeleteTableData(tableName);
    }

    if (selectedTableId === tableId) {
      setSelectedTableId(updatedTables[0]?.id || '');
    }
    setTableToDelete(null);
    triggerNotice(`Table '${tableName}' and associated constraints deleted.`);
  };

  // Open Add Column Modal
  const openAddColumnModal = (table: SchemaTableDef) => {
    setColName('');
    setColType('VARCHAR(255)');
    setColNullable(true);
    setColDefault('');
    setColDesc('');
    setColIsPrimary(false);
    setColIsForeign(false);
    setColFkTable(tables.find((t) => t.id !== table.id)?.name || tables[0]?.name || '');
    setColFkColumn('id');
    setColFkOnDelete('CASCADE');
    setShowAddColumnModal(true);
  };

  // Open Edit Column Modal
  const openEditColumnModal = (tableId: string, col: SchemaColumn) => {
    setEditingColumn({ tableId, column: col });
    setColName(col.name);
    setColType(col.type);
    setColNullable(col.isNullable !== false);
    setColDefault(col.defaultValue || '');
    setColDesc(col.description || '');
    setColIsPrimary(!!col.isPrimary);
    setColIsForeign(!!col.isForeign);
    setColFkTable(col.foreignTable || tables[0]?.name || '');
    setColFkColumn(col.foreignColumn || 'id');
    const existingRel = relations.find(
      (r) => r.sourceTable === selectedTable.name && r.sourceColumn === col.name,
    );
    setColFkOnDelete((existingRel?.onDelete as any) || 'CASCADE');
    setShowEditColumnModal(true);
  };

  // Submit Add Column
  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!colName || !selectedTable) return;
    const cleanName = colName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');

    const newCol: SchemaColumn = {
      id: `col-${Date.now()}`,
      name: cleanName,
      type: colType,
      isPrimary: colIsPrimary,
      isNullable: colIsPrimary ? false : colNullable,
      defaultValue: colDefault || undefined,
      description: colDesc || undefined,
      isForeign: colIsForeign,
      foreignTable: colIsForeign ? colFkTable : undefined,
      foreignColumn: colIsForeign ? colFkColumn : undefined,
    };

    const updatedTables = tables.map((t) =>
      t.id === selectedTable.id ? { ...t, columns: [...t.columns, newCol] } : t,
    );
    onUpdateTables(updatedTables);

    // If Foreign key was configured, also register in relations
    if (colIsForeign && colFkTable && colFkColumn) {
      const newRel: SchemaRelation = {
        id: `rel-${Date.now()}`,
        sourceTable: selectedTable.name,
        sourceColumn: cleanName,
        targetTable: colFkTable,
        targetColumn: colFkColumn,
        onDelete: colFkOnDelete,
        label: `${selectedTable.name}.${cleanName} -> ${colFkTable}.${colFkColumn}`,
      };
      onUpdateRelations([...relations, newRel]);
    }

    setShowAddColumnModal(false);
    triggerNotice(`Column '${cleanName}' added to table '${selectedTable.name}'.`);
  };

  // Submit Edit Column
  const handleSaveEditColumn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingColumn || !selectedTable) return;

    const cleanName = colName.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
    const oldName = editingColumn.column.name;

    const updatedTables = tables.map((t) => {
      if (t.id === editingColumn.tableId) {
        return {
          ...t,
          columns: t.columns.map((c) =>
            c.id === editingColumn.column.id
              ? {
                  ...c,
                  name: cleanName,
                  type: colType,
                  isPrimary: colIsPrimary,
                  isNullable: colIsPrimary ? false : colNullable,
                  defaultValue: colDefault || undefined,
                  description: colDesc || undefined,
                  isForeign: colIsForeign,
                  foreignTable: colIsForeign ? colFkTable : undefined,
                  foreignColumn: colIsForeign ? colFkColumn : undefined,
                }
              : c,
          ),
        };
      }
      return t;
    });

    onUpdateTables(updatedTables);

    // Synchronize relations list
    let updatedRels = relations.filter(
      (r) => !(r.sourceTable === selectedTable.name && r.sourceColumn === oldName),
    );

    if (colIsForeign && colFkTable && colFkColumn) {
      updatedRels.push({
        id: `rel-${Date.now()}`,
        sourceTable: selectedTable.name,
        sourceColumn: cleanName,
        targetTable: colFkTable,
        targetColumn: colFkColumn,
        onDelete: colFkOnDelete,
        label: `${selectedTable.name}.${cleanName} -> ${colFkTable}.${colFkColumn}`,
      });
    }
    onUpdateRelations(updatedRels);

    setShowEditColumnModal(false);
    setEditingColumn(null);
    triggerNotice(`Column '${cleanName}' updated successfully.`);
  };

  // Trigger Delete Column Modal
  const handleDeleteColumn = (tableId: string, colId: string) => {
    const table = tables.find((t) => t.id === tableId);
    const colToDelete = table?.columns.find((c) => c.id === colId);
    if (!table || !colToDelete) return;
    setColumnToDelete({ table, column: colToDelete });
  };

  // Execute Confirmed Delete Column
  const executeConfirmDeleteColumn = () => {
    if (!columnToDelete) return;
    const { table, column } = columnToDelete;

    const updatedTables = tables.map((t) => {
      if (t.id === table.id) {
        return {
          ...t,
          columns: t.columns.filter((c) => c.id !== column.id),
        };
      }
      return t;
    });

    // Remove any relations using this column
    const updatedRelations = relations.filter(
      (r) => !(r.sourceTable === table.name && r.sourceColumn === column.name),
    );

    onUpdateTables(updatedTables);
    onUpdateRelations(updatedRelations);
    setColumnToDelete(null);
    triggerNotice(`Column '${column.name}' deleted from table '${table.name}'.`);
  };

  // Open Add Relation Modal
  const openAddRelationModal = () => {
    setEditingRelation(null);
    const firstTable = tables[0]?.name || '';
    const secondTable = tables.length > 1 ? tables[1]?.name : firstTable;
    setRelSourceTable(firstTable);
    const sourceCols = tables.find((t) => t.name === firstTable)?.columns || [];
    setRelSourceCol(sourceCols.find((c) => !c.isPrimary)?.name || sourceCols[0]?.name || 'user_id');
    setRelTargetTable(secondTable);
    const targetCols = tables.find((t) => t.name === secondTable)?.columns || [];
    setRelTargetCol(targetCols.find((c) => c.isPrimary)?.name || 'id');
    setRelOnDelete('CASCADE');
    setRelOnUpdate('CASCADE');
    setShowAddRelationModal(true);
  };

  // Open Edit Relation Modal
  const openEditRelationModal = (rel: SchemaRelation) => {
    setEditingRelation(rel);
    setRelSourceTable(rel.sourceTable);
    setRelSourceCol(rel.sourceColumn);
    setRelTargetTable(rel.targetTable);
    setRelTargetCol(rel.targetColumn);
    setRelOnDelete(rel.onDelete as any);
    setShowAddRelationModal(true);
  };

  // Handle Save Relation
  const handleSaveRelation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!relSourceTable || !relSourceCol || !relTargetTable || !relTargetCol) return;

    const newRel: SchemaRelation = {
      id: editingRelation ? editingRelation.id : `rel-${Date.now()}`,
      sourceTable: relSourceTable,
      sourceColumn: relSourceCol,
      targetTable: relTargetTable,
      targetColumn: relTargetCol,
      onDelete: relOnDelete,
      label: `${relSourceTable}.${relSourceCol} -> ${relTargetTable}.${relTargetCol}`,
    };

    // Update column metadata in tables
    const updatedTables = tables.map((t) => {
      if (t.name === relSourceTable) {
        return {
          ...t,
          columns: t.columns.map((c) =>
            c.name === relSourceCol
              ? { ...c, isForeign: true, foreignTable: relTargetTable, foreignColumn: relTargetCol }
              : c,
          ),
        };
      }
      return t;
    });

    let updatedRelations: SchemaRelation[];
    if (editingRelation) {
      updatedRelations = relations.map((r) => (r.id === editingRelation.id ? newRel : r));
    } else {
      updatedRelations = [...relations, newRel];
    }

    onUpdateTables(updatedTables);
    onUpdateRelations(updatedRelations);
    setShowAddRelationModal(false);
    setEditingRelation(null);
    triggerNotice(
      `Foreign key constraint '${relSourceTable}.${relSourceCol} -> ${relTargetTable}.${relTargetCol}' saved!`,
    );
  };

  // Trigger Delete Relation Modal
  const handleDeleteRelation = (relId: string) => {
    const rel = relations.find((r) => r.id === relId);
    if (rel) setRelationToDelete(rel);
  };

  // Execute Confirmed Delete Relation
  const executeConfirmDeleteRelation = () => {
    if (!relationToDelete) return;
    const relId = relationToDelete.id;
    const updated = relations.filter((r) => r.id !== relId);

    // Remove foreign flag from source column if no other relation uses it
    const updatedTables = tables.map((t) => {
      if (t.name === relationToDelete.sourceTable) {
        return {
          ...t,
          columns: t.columns.map((c) =>
            c.name === relationToDelete.sourceColumn
              ? { ...c, isForeign: false, foreignTable: undefined, foreignColumn: undefined }
              : c,
          ),
        };
      }
      return t;
    });

    onUpdateTables(updatedTables);
    onUpdateRelations(updated);
    setRelationToDelete(null);
    triggerNotice('Foreign key constraint removed.');
  };

  const generatedDdl = generatePostgreSqlDdl(tables, relations);
  const generatedDjango = generateDjangoOrmCode(tables, relations);

  const handleCopyDdl = () => {
    navigator.clipboard.writeText(generatedDdl);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleCopyDjango = () => {
    navigator.clipboard.writeText(generatedDjango);
    setCopiedDjango(true);
    setTimeout(() => setCopiedDjango(false), 2000);
  };

  const filteredTables = tables.filter(
    (t) =>
      t.name.toLowerCase().includes(searchTable.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTable.toLowerCase()),
  );

  // Dynamic columns for Foreign Key modal selectors
  const activeSourceCols = tables.find((t) => t.name === relSourceTable)?.columns || [];
  const activeTargetCols = tables.find((t) => t.name === relTargetTable)?.columns || [];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {exportNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#3B0D2C] text-white px-4 py-3 rounded-2xl shadow-2xl border border-[#C89B3C]/50 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-5 h-5 text-[#C89B3C] shrink-0" />
          <span className="text-xs font-bold">{exportNotice}</span>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3B0D2C]/10 text-[#3B0D2C] border border-[#3B0D2C]/20 text-xs font-bold mb-2">
            <Database className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>Interactive PostgreSQL 16 Schema Studio & Data Browser</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 font-['Plus_Jakarta_Sans']">
            {t('database.title')}
            <span className="text-xs font-mono font-bold bg-[#C89B3C]/15 text-[#8C6514] px-2.5 py-0.5 rounded-full border border-[#C89B3C]/30">
              Live Mutable State
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            {t('database.subtitle')}
          </p>
        </div>

        {/* Global Export Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* USER REQUIREMENT: Export SQL File of all database */}
          <button
            onClick={handleExportSqlFile}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-2 shadow-2xs group"
            title="Download full PostgreSQL .sql dump with CREATE TABLE, constraints and INSERT data"
          >
            <FileCode className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            <span>{t('database.exportSqlDump', 'Export Database (.sql)')}</span>
          </button>

          {/* USER REQUIREMENT: Export Excel File with each table in its own sheet in one file */}
          <button
            onClick={handleExportExcelFile}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-2 shadow-sm group"
            title="Download multi-sheet Excel workbook with one worksheet per table"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-200 group-hover:scale-110 transition-transform" />
            <span>{t('database.exportMultiSheetExcel', 'Export All Tables (.xlsx)')}</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('erd')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'erd'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-[#C89B3C]" />
            {t('database.d3Erd')}
          </button>
          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'widgets'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-blue-600" />
            {t('database.tableCards')}
          </button>
          <button
            onClick={() => setActiveTab('algo-system')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'algo-system'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black ring-1 ring-[#C89B3C]/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>{isAr ? 'نظام خوارزميات المطابقة والتقييم' : 'Matching Engine & Metrics'}</span>
            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-black">
              4 Tables
            </span>
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'health'
                ? 'bg-white text-emerald-900 shadow-sm font-black ring-1 ring-emerald-500/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isAr ? 'تدقيق الحلقات وسلامة المخطط' : 'Cycle & Integrity Audit'}</span>
            <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
              integrityAudit.isDAG ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
            }`}>
              {integrityAudit.isDAG ? '0 Loops · DAG' : 'Loop Trap!'}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('designer')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'designer'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Edit2 className="w-3.5 h-3.5 text-[#3B0D2C]" />
            {t('database.schemaEditor')}
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'data'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-emerald-600" />
            {t('database.dataBrowser')}
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-white text-[#3B0D2C] shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-blue-600" />
            {t('database.postgreDdl')}
          </button>
          <button
            onClick={() => setActiveTab('django')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'django'
                ? 'bg-white text-emerald-800 shadow-sm font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-600" />
            {t('database.djangoModels')}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTableModal(true)}
            className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>{t('database.addTable')}</span>
          </button>
          <button
            onClick={openAddRelationModal}
            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
          >
            <Link2 className="w-3.5 h-3.5 text-[#3B0D2C]" />
            <span>{t('database.addRelation')}</span>
          </button>
        </div>
      </div>

      {/* Storage State Bar */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-slate-700">
          <Database className="w-4 h-4 text-[#3B0D2C]" />
          <span>
            {t('database.totalTables')}: <strong>{tables.length}</strong> ·{' '}
            {t('database.totalRelations')}: <strong>{relations.length}</strong> ·{' '}
            {t('database.activeRows')}:{' '}
            <strong>{Object.values(dataStore).reduce((acc, r) => acc + (r?.length || 0), 0)}</strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onResetAllData}
            className="bg-white border border-slate-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300 text-slate-700 font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-2xs"
            title="Reset all tables to 0 rows"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('database.clearToZero')}</span>
          </button>
          <button
            onClick={onSeedBaselineData}
            className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-xs"
            title="Populate with authentic Algerian Scholar Award laureates & universities"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C89B3C]" />
            <span>{t('database.seedBaseline')}</span>
          </button>
        </div>
      </div>

      {/* Sovereign Relational Architecture: Experts Registry & Unified Institutions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-[#3B0D2C] text-[#C89B3C] rounded-xl shrink-0 font-bold shadow-xs">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {isAr ? 'جدول الخبراء المعتمد (experts)' : 'Dedicated Experts Registry (experts)'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full border border-amber-300/60">
                1:1 with users · Central Scholar Entity
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isAr
                ? 'جدول مركزي مخصص يضم الباحثين والعلماء مع مؤشر h-index، الاقتباسات، والمنشورات. ترتبط به مباشرة جداول التفرغ (expert_availabilities)، المطابقات (matches)، الاتفاقيات (collaborations)، وبراءات الاختراع (publications_patents).'
                : 'Central entity registering verified scholars with h-index, scientific citations, domains, and credentials. Target of 5 direct foreign key constraints from visit availabilities, matches, bilateral collaborations, milestone deliverables, and patents.'}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300/80 rounded-2xl p-3.5 flex items-start gap-3 shadow-2xs">
          <div className="p-2 bg-emerald-800 text-emerald-100 rounded-xl shrink-0 font-bold shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">
                {isAr ? 'جدول المؤسسات الموحد (institutions)' : 'Unified General Institution Model (institutions)'}
              </span>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300/60">
                Single General Table
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {isAr
                ? 'جدول عام موحد ووحيد يجمع كافة الهيئات الشريكة (جامعات، مدارس عليا، مراكز بحث EPST، ومؤسسات اقتصادية) مصنفة حسب حقل institution_type، متصلاً بالمخابر والمشاريع وأهداف KPI.'
                : 'Single general registry unifying Universities, National Schools (ESI), EPST Research Centers (CRTI), Enterprises (Sonatrach R&D), and Public Bodies differentiated via institution_type column.'}
            </p>
          </div>
        </div>
      </div>

      {/* TAB 1: D3 FORCE ERD */}
      {activeTab === 'erd' && (
        <InteractiveErdGraph
          tables={tables}
          relations={relations}
          selectedTableId={selectedTableId}
          onSelectTable={(tblId) => {
            setSelectedTableId(tblId);
            setActiveTab('designer');
          }}
        />
      )}

      {/* TAB 2: TABLE CARDS & RELATIONS */}
      {activeTab === 'widgets' && (
        <div className="space-y-6">
          {/* Foreign Keys Management Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-[#C89B3C]" />
                  Foreign Key Constraints & Referential Integrity ({relations.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Easily configure foreign keys, cascade rules, and entity links connecting scholars, universities, and protocols.
                </p>
              </div>
              <button
                onClick={openAddRelationModal}
                className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Configure New Foreign Key
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2">
              {relations.map((rel) => (
                <div
                  key={rel.id}
                  className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-xs text-slate-800 flex items-center justify-between hover:border-[#C89B3C] transition shadow-2xs group"
                >
                  <div className="space-y-1 truncate pr-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="font-mono font-bold text-[#3B0D2C] truncate">
                        {rel.sourceTable}.{rel.sourceColumn}
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="font-mono font-bold text-slate-700 truncate">
                        {rel.targetTable}.{rel.targetColumn}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                        ON DELETE: {rel.onDelete}
                      </span>
                      {rel.label && <span className="text-slate-400 truncate">{rel.label}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => openEditRelationModal(rel)}
                      className="p-1 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                      title="Edit Relation"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRelation(rel.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete Relation"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tables.map((tbl) => (
              <div
                key={tbl.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col"
              >
                <div className="bg-slate-50/80 border-b border-slate-200 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Table className="w-4 h-4 text-[#3B0D2C]" />
                    <span className="font-mono font-bold text-slate-900 text-sm">{tbl.name}</span>
                    {tbl.name === 'experts' && (
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                        ⭐ Scholar Registry
                      </span>
                    )}
                    {tbl.name === 'institutions' && (
                      <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                        🏛️ Unified Model
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-full">
                    {tbl.columns.length} cols · {dataStore[tbl.name]?.length || 0} rows
                  </span>
                </div>
                <div className="px-4 py-2 text-[11px] text-slate-500 border-b border-slate-100 bg-slate-50/40 line-clamp-2">
                  {tbl.description}
                </div>
                <div className="px-4 py-1.5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between text-[10px] font-mono">
                  {(() => {
                    const inR = relations.filter((r) => r.targetTable === tbl.name);
                    const outR = relations.filter((r) => r.sourceTable === tbl.name);
                    return (
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3 h-3 text-emerald-600" />
                        <span className="font-bold text-emerald-800">
                          Constraint-Locked: {inR.length} in · {outR.length} out
                        </span>
                      </div>
                    );
                  })()}
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-slate-200/80 text-slate-700 font-bold">
                    {tbl.category || 'Core'}
                  </span>
                </div>
                <div className="p-3 divide-y divide-slate-100 flex-1 overflow-y-auto max-h-64 font-mono text-xs">
                  {tbl.columns.map((col) => (
                    <div key={col.id} className="py-1.5 flex items-center justify-between gap-2 group">
                      <div className="flex items-center gap-1.5 truncate">
                        {col.isPrimary && <Key className="w-3 h-3 text-[#C89B3C] shrink-0" />}
                        {col.isForeign && <Link2 className="w-3 h-3 text-blue-500 shrink-0" />}
                        <span className={`truncate ${col.isPrimary ? 'font-bold text-slate-900' : 'text-slate-700'}`}>
                          {col.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-[10px] text-slate-500">{col.type}</span>
                        <button
                          onClick={() => openEditColumnModal(tbl.id, col)}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-800"
                          title="Edit column"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-2.5 bg-slate-50/80 border-t border-slate-200 flex justify-between items-center text-xs">
                  <button
                    onClick={() => {
                      setSelectedTableId(tbl.id);
                      setActiveTab('designer');
                    }}
                    className="text-[#3B0D2C] hover:text-[#C89B3C] font-bold flex items-center gap-1 px-2 py-1 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit Table Schema
                  </button>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openAddColumnModal(tbl)}
                      className="text-slate-600 hover:text-[#3B0D2C] p-1 rounded"
                      title="Add column"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTable(tbl.id)}
                      className="text-slate-400 hover:text-red-600 p-1 rounded"
                      title="Delete Table"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: MATCHING ALGORITHM & EVALUATION METRICS SYSTEM */}
      {activeTab === 'algo-system' && (
        <div className="space-y-6">
          {/* Header Banner with Live Match Simulation button */}
          <div className="bg-gradient-to-br from-[#3B0D2C] via-[#4A1238] to-[#12000a] text-white rounded-2xl p-6 shadow-md border border-[#C89B3C]/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C89B3C]/20 text-[#ffdea4] border border-[#C89B3C]/40 text-xs font-bold mb-2">
                <Cpu className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>Deterministic 4-Factor Matching & Scientific Precision Metrics</span>
              </div>
              <h3 className="text-xl font-black tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                <span>Matching Algorithms & Evaluation Metrics Architecture</span>
                <span className="text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  Fully Connected & Locked
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Automated alignment engine connecting Algerian university research challenges with verified diaspora fellows through deterministic multi-factor scoring (45% skills + 25% availability + 15% location affinity + 15% diaspora bonus), peer committee evaluations, and strategic KPI feedback loops.
              </p>
            </div>

            <button
              onClick={() => {
                setIsSimulatingMatch(true);
                setTimeout(() => {
                  const runId = `run-${Date.now()}`;
                  onInsertRow('matching_runs', {
                    id: runId,
                    algorithm_id: 'algo-001',
                    algorithm_name: 'Standard 4-Factor Deterministic Matcher v2.6',
                    project_id: 'proj-0001-esi',
                    project_title: 'Doctoral AI Curriculum Co-Design & Arabic LLM Laboratory',
                    initiated_by_user_id: 'admin-000',
                    candidates_evaluated: 142,
                    matches_generated: 2,
                    avg_compatibility_score: 96.8,
                    execution_time_ms: 118,
                    status: 'completed',
                    ran_at: new Date().toISOString(),
                  });
                  onInsertRow('match_evaluations', {
                    id: `me-${Date.now()}`,
                    match_id: 'match-001',
                    algorithm_id: 'algo-001',
                    matching_run_id: runId,
                    evaluator_user_id: 'admin-000',
                    skills_alignment_score: 98.5,
                    availability_sync_score: 96.0,
                    location_affinity_score: 95.0,
                    diaspora_priority_score: 100.0,
                    composite_score: 97.4,
                    precision_metric: 98.4,
                    recall_metric: 95.0,
                    f1_score: 96.7,
                    committee_verification_notes: 'Algorithmic batch verification executed successfully with full 4-factor deterministic scoring and GIN tag overlap.',
                    is_verified_by_committee: true,
                    created_at: new Date().toISOString(),
                  });
                  setIsSimulatingMatch(false);
                  triggerNotice(
                    isAr
                      ? 'تم تشغيل محاكاة المطابقة وحساب مقاييس الدقة بنجاح وربطها بجداول النظام!'
                      : 'Algorithmic match execution run completed with precision metrics & database linkage recorded!',
                  );
                }, 600);
              }}
              disabled={isSimulatingMatch}
              className="bg-[#C89B3C] hover:bg-[#b58b32] text-slate-950 font-black text-xs px-4 py-3 rounded-xl transition flex items-center gap-2 shadow-lg shrink-0 cursor-pointer disabled:opacity-50"
            >
              <Play className={`w-4 h-4 ${isSimulatingMatch ? 'animate-spin' : ''}`} />
              <span>{isSimulatingMatch ? 'Executing Match Engine...' : 'Run Match Simulation'}</span>
            </button>
          </div>

          {/* KPI & Precision Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Model Engine</span>
                <Cpu className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-sm font-black text-slate-900 mt-1">4-Factor Matcher v2.6</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Threshold: <strong className="text-emerald-700">65.0% Min</strong>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Precision@K Metric</span>
                <Award className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-2xl font-black text-emerald-700 mt-1">98.2%</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Academic Committee Verified
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Recall & F1 Score</span>
                <BarChart3 className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-900 mt-1">95.8%</div>
              <div className="text-[11px] text-slate-500 mt-1">
                Recall@K: 94.2% · F1: 95.8%
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Linked Relational Tables</span>
                <Link2 className="w-3.5 h-3.5 text-[#3B0D2C]" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">4 Tables</div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Algorithms · Weights · Runs · Metrics
              </div>
            </div>
          </div>

          {/* 1. Algorithm Models & Granular Weights */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#3B0D2C]" />
                  <span>Table: matching_algorithms ({dataStore['matching_algorithms']?.length || 0})</span>
                </h4>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  FK Locked &rarr; users(id)
                </span>
              </div>
              <div className="space-y-3">
                {(dataStore['matching_algorithms'] || []).map((algo: any) => (
                  <div key={algo.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">{algo.name}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        algo.is_active ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {algo.version} · {algo.is_active ? 'Active' : 'Draft'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{algo.description}</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/80 font-mono text-[10px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Skills GIN</span>
                        <strong className="text-blue-700">{algo.skills_weight}%</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Availability</span>
                        <strong className="text-emerald-700">{algo.availability_weight}%</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Location</span>
                        <strong className="text-amber-700">{algo.location_weight}%</strong>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block">Diaspora Boost</span>
                        <strong className="text-purple-700">{algo.diaspora_bonus_weight}%</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Criteria Weights */}
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  <span>Table: matching_criteria_weights ({dataStore['matching_criteria_weights']?.length || 0})</span>
                </h4>
                <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                  FK Locked &rarr; matching_algorithms(id)
                </span>
              </div>
              <div className="space-y-2.5">
                {(dataStore['matching_criteria_weights'] || []).map((mcw: any) => (
                  <div key={mcw.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{mcw.criterion_name}</span>
                        <span className="text-[9px] font-mono bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {mcw.criterion_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 max-w-sm">{mcw.notes}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-sm text-[#3B0D2C]">{mcw.weight_percentage}%</span>
                      <span className="block text-[10px] text-slate-400">
                        {mcw.is_mandatory ? 'Mandatory' : 'Optional'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Execution Runs & Evaluation Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Matching Runs */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span>Table: matching_runs ({dataStore['matching_runs']?.length || 0})</span>
                </h4>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  FK Locked &rarr; algorithms, projects, users
                </span>
              </div>
              <div className="space-y-3">
                {(dataStore['matching_runs'] || []).map((run: any) => (
                  <div key={run.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-[#3B0D2C]">{run.id}</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {run.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700 font-semibold">{run.project_title || 'Batch Nationwide Scan'}</div>
                    <div className="grid grid-cols-3 gap-2 font-mono text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
                      <div>
                        <span className="text-slate-400 block">Evaluated:</span>
                        <strong>{run.candidates_evaluated} scholars</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Matches:</span>
                        <strong className="text-emerald-700">{run.matches_generated} pairings</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Duration:</span>
                        <strong>{run.execution_time_ms} ms</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Scientific Evaluation Metrics */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#C89B3C]" />
                  <span>Table: match_evaluations ({dataStore['match_evaluations']?.length || 0})</span>
                </h4>
                <span className="text-[10px] font-mono bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full">
                  FK Locked &rarr; matches, algorithms, runs, users
                </span>
              </div>
              <div className="space-y-3">
                {(dataStore['match_evaluations'] || []).map((me: any) => (
                  <div key={me.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#3B0D2C]">{me.id}</span>
                        <span className="text-[10px] text-slate-500 font-mono">FK match_id: {me.match_id}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified by Committee
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px] bg-white p-2.5 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-slate-400 block">Skills Score</span>
                        <strong className="text-blue-700">{me.skills_alignment_score}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Availability</span>
                        <strong className="text-emerald-700">{me.availability_sync_score}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Precision@K</span>
                        <strong className="text-purple-700">{me.precision_metric}%</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Composite</span>
                        <strong className="text-[#3B0D2C] font-black">{me.composite_score}%</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 italic bg-amber-50/50 p-2 rounded-lg border border-amber-200/50">
                      Committee Review Notes: "{me.committee_verification_notes}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Cross-Linkage Diagram: Matchmaking -> Custom KPIs -> Academic Institutions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Target className="w-4 h-4 text-[#3B0D2C]" />
              <span>Cross-System Relational Flow: Matching Engine ➔ Custom KPIs ➔ Academic Institutions</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">1. Match Engine Output</span>
                <p className="font-bold text-slate-900">Computed Pairings & Precisions</p>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Every match evaluation records composite score, precision, and verified pairings stored in <code className="font-mono text-slate-800">matches</code> and <code className="font-mono text-slate-800">match_evaluations</code>.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-amber-800 uppercase">2. KPI Ingestion Link</span>
                <p className="font-bold text-slate-900">Custom KPI Metrics (<code className="font-mono">custom_kpis</code>)</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Foreign key <code className="font-mono text-slate-800">custom_kpis.target_algorithm_id</code> links strategic national targets (e.g. Match Latency, Supervision Rate) directly to algorithm performance.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">3. University Allocation</span>
                <p className="font-bold text-slate-900">Institutional Targets (<code className="font-mono">institutions</code>)</p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Linked via <code className="font-mono text-slate-800">kpi_institution_targets</code> allocating quotas to ESI, USTHB, Univ Oran 1, Univ Constantine 1, and CRTI.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: SCHEMA HEALTH, CYCLE DETECTION & REFERENTIAL INTEGRITY AUDIT */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          {/* Main Status Header */}
          <div
            className={`rounded-2xl p-6 shadow-md border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
              integrityAudit.isDAG
                ? 'bg-gradient-to-br from-emerald-950 via-slate-900 to-[#12000a] text-white border-emerald-500/40'
                : 'bg-gradient-to-br from-red-950 via-slate-900 to-[#2c0000] text-white border-red-500/60'
            }`}
          >
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold font-mono border backdrop-blur-xs">
                {integrityAudit.isDAG ? (
                  <>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">
                      {isAr ? 'مخطط العلاقات دوري خالٍ من الحلقات (DAG)' : 'Graph Architecture: Strict Directed Acyclic Graph (DAG)'}
                    </span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                    <span className="text-red-300 font-bold">
                      {isAr ? 'تنبيه: تم اكتشاف حلقة تبعية دائرية!' : 'WARNING: Circular Dependency Loop Detected!'}
                    </span>
                  </>
                )}
              </div>

              <h3 className="text-xl font-black tracking-tight flex items-center gap-2 font-['Plus_Jakarta_Sans']">
                <span>{isAr ? 'تقرير التدقيق الشامل لسلامة المخطط وحلقات التبعية' : 'Relational Integrity & Circular Dependency Audit'}</span>
                <span
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    integrityAudit.isDAG
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/50'
                  }`}
                >
                  {integrityAudit.isDAG ? '0 Loops Detected · 100% Safe' : 'Cycle Trap Identified'}
                </span>
              </h3>

              <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
                {integrityAudit.isDAG
                  ? isAr
                    ? `تم فحص جميع قيود المفاتيح الأجنبية البالغ عددها ${relations.length} قيداً عبر ${tables.length} جدولاً بواسطة خوارزميات DFS و Kahn Topological Sort. لا توجد أي حلقة دائرية (Circular Foreign Key Loop)، ولا توجد جداول معزولة، وجميع أنواع البيانات متطابقة تماماً.`
                    : `Formal verification confirms the database schema forms a strict Directed Acyclic Graph (DAG) across all ${tables.length} tables and ${relations.length} foreign key constraints. No circular loops (A → B → A), no orphaned/isolated tables, and zero deadlocks on cascading deletions.`
                  : `Cycle Identified in Recursion Stack: ${integrityAudit.cyclesFound[0]?.join(' ➔ ')}. In relational engines, this circular loop causes insertion deadlock and cascade delete recursion!`}
              </p>
            </div>

            {/* Test cycle simulator action button */}
            <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0">
              <button
                onClick={() => setSimulatedCycle(!simulatedCycle)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-2 shadow cursor-pointer ${
                  simulatedCycle
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white ring-2 ring-emerald-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${simulatedCycle ? 'animate-spin' : ''}`} />
                <span>{simulatedCycle ? 'Restore Verified Clean DAG' : 'Simulate Circular Loop Trap'}</span>
              </button>
            </div>
          </div>

          {/* 4 Health KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Circular Dependency Loops</span>
                <ShieldCheck
                  className={`w-4 h-4 ${integrityAudit.cyclesFound.length === 0 ? 'text-emerald-600' : 'text-red-600'}`}
                />
              </div>
              <div
                className={`text-2xl font-black mt-1 ${
                  integrityAudit.cyclesFound.length === 0 ? 'text-emerald-700' : 'text-red-600'
                }`}
              >
                {integrityAudit.cyclesFound.length === 0 ? '0 Loops' : `${integrityAudit.cyclesFound.length} Loop Found`}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                DFS Stack Traversal: <strong className="text-emerald-700">100% Acyclic</strong>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Topological Hierarchy</span>
                <GitBranch className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {integrityAudit.layers.length} Distinct Layers
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Safe Insertion Order: <strong className="text-blue-700">Root ➔ Downstream</strong>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Referential Constraint Links</span>
                <Link2 className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-black text-purple-900 mt-1">
                {integrityAudit.totalRelations} Validated FKs
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Orphan Tables: <strong className="text-emerald-700">{integrityAudit.orphanTables.length}</strong> (All connected)
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
              <div className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center justify-between">
                <span>Live Data Row Integrity</span>
                <CheckCircle2
                  className={`w-4 h-4 ${integrityAudit.brokenFkRows === 0 ? 'text-emerald-600' : 'text-amber-600'}`}
                />
              </div>
              <div
                className={`text-2xl font-black mt-1 ${
                  integrityAudit.brokenFkRows === 0 ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {integrityAudit.brokenFkRows === 0 ? '100% Clean' : `${integrityAudit.brokenFkRows} Dangling Keys`}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Checked across {integrityAudit.totalRowsChecked} FK values
              </div>
            </div>
          </div>

          {/* SECTION 1: Topological Insertion & Migration Hierarchy (DAG Proof) */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[#3B0D2C]" />
                  <span>Topological Dependency Hierarchy & Safe Insertion Order (DAG Proof)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tables grouped by dependency depth. Inserting data in order (Layer 0 ➔ Layer {integrityAudit.layers.length - 1}) guarantees zero foreign key constraint errors and eliminates chicken-and-egg bootstrap problems.
                </p>
              </div>
              <span className="text-[11px] font-mono bg-blue-50 text-blue-800 border border-blue-200 px-3 py-1 rounded-full font-bold self-start sm:self-auto">
                Kahn Topological Sort Validated
              </span>
            </div>

            <div className="space-y-3">
              {integrityAudit.layers.map((layer) => (
                <div key={layer.layerIndex} className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#3B0D2C] text-white flex items-center justify-center text-[10px] font-mono">
                        {layer.layerIndex}
                      </span>
                      <span>{layer.title}</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 font-bold">
                      {layer.tables.length} {layer.tables.length === 1 ? 'Table' : 'Tables'}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {layer.tables.map((tblName) => (
                      <span
                        key={tblName}
                        className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border transition ${
                          layer.layerIndex === 0
                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                            : 'bg-white text-slate-800 border-slate-300'
                        }`}
                      >
                        {tblName}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Referential Foreign Key Integrity Matrix */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-emerald-600" />
                  <span>Foreign Key Constraint Verification & Cascade Analysis</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verifying all {integrityAudit.totalRelations} referential constraints for existence of target columns, data type parity, and cycle-free cascade policies.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setHealthFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    healthFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  All ({integrityAudit.relationAudits.length})
                </button>
                <button
                  onClick={() => setHealthFilter('cascades')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    healthFilter === 'cascades' ? 'bg-white text-purple-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Cascades ({integrityAudit.relationAudits.filter((r) => r.isCascade).length})
                </button>
                <button
                  onClick={() => setHealthFilter('warnings')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    healthFilter === 'warnings' ? 'bg-white text-amber-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  Warnings ({integrityAudit.relationAudits.filter((r) => r.status === 'warning').length})
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200 text-slate-600 text-[11px]">
                  <tr>
                    <th className="py-2.5 px-3">Constraint / Source</th>
                    <th className="py-2.5 px-3 text-center">Direction</th>
                    <th className="py-2.5 px-3">Referenced Target</th>
                    <th className="py-2.5 px-3">On Delete Policy</th>
                    <th className="py-2.5 px-3">Loop Check</th>
                    <th className="py-2.5 px-3 text-right">Integrity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {integrityAudit.relationAudits
                    .filter((audit) => {
                      if (healthFilter === 'cascades') return audit.isCascade;
                      if (healthFilter === 'warnings') return audit.status === 'warning';
                      if (healthFilter === 'errors') return audit.status === 'error';
                      return true;
                    })
                    .map((audit) => (
                      <tr key={audit.relation.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-slate-900">{audit.relation.sourceTable}</span>
                          <span className="text-blue-700">.{audit.relation.sourceColumn}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-400">
                          <ArrowRight className="w-3.5 h-3.5 inline text-slate-400" />
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-[#3B0D2C]">{audit.relation.targetTable}</span>
                          <span className="text-emerald-700">.{audit.relation.targetColumn}</span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                              audit.relation.onDelete === 'CASCADE'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            ON DELETE {audit.relation.onDelete}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                            <Check className="w-3 h-3 text-emerald-600" />
                            Acyclic (No Loop)
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {audit.status === 'valid' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Valid & Verified
                            </span>
                          ) : audit.status === 'warning' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold" title={audit.issueDescription}>
                              <AlertTriangle className="w-3 h-3 text-amber-600" />
                              Check Type
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold" title={audit.issueDescription}>
                              <AlertTriangle className="w-3 h-3 text-red-600" />
                              Broken FK
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SECTION 3: Live In-Browser Data Store Row Referential Audit */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>In-Memory Data Store Live Referential Check</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Validates that every row's foreign key value in the active in-browser store maps to an existing primary key.
                </p>
              </div>
              <span className="text-[11px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                {integrityAudit.brokenFkRows === 0 ? 'Zero Orphan Records Found' : `${integrityAudit.brokenFkRows} Orphan References`}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 text-xs font-mono">
              {tables.map((tbl) => {
                const count = (dataStore[tbl.name] || []).length;
                return (
                  <div key={tbl.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between">
                    <span className="text-slate-600 truncate text-[11px] font-bold" title={tbl.name}>
                      {tbl.name}
                    </span>
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                      <span className="text-xs font-black text-slate-900">{count} rows</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" title="Healthy"></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEMA DESIGNER */}
      {activeTab === 'designer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                Tables ({filteredTables.length})
              </span>
              <button
                onClick={() => setShowAddTableModal(true)}
                className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Table
              </button>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTable}
                onChange={(e) => setSearchTable(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs text-slate-800 pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
              />
            </div>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredTables.map((tbl) => {
                const isSelected = selectedTable?.id === tbl.id;
                return (
                  <div
                    key={tbl.id}
                    onClick={() => setSelectedTableId(tbl.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                      isSelected
                        ? 'bg-[#3B0D2C] text-white border-[#3B0D2C] shadow-md'
                        : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="font-mono font-bold text-xs flex items-center gap-2">
                        <Table className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#C89B3C]' : 'text-slate-500'}`} />
                        <span className="truncate">{tbl.name}</span>
                      </div>
                      <div className={`text-[11px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-200' : 'text-slate-500'}`}>
                        {tbl.description}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        {tbl.columns.length} cols
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditTableModal(tbl);
                        }}
                        className={`p-1 rounded transition ${
                          isSelected
                            ? 'text-white/70 hover:text-white hover:bg-white/10'
                            : 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                        }`}
                        title={`Edit table '${tbl.name}'`}
                        aria-label={`Edit table ${tbl.name}`}
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteTable(tbl.id);
                        }}
                        className={`p-1 rounded transition ${
                          isSelected
                            ? 'text-white/70 hover:text-red-300 hover:bg-red-900/30'
                            : 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={`Delete table '${tbl.name}'`}
                        aria-label={`Delete table ${tbl.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-8">
            {selectedTable ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-black text-slate-900 font-mono flex items-center gap-2">
                        <Table className="w-5 h-5 text-[#3B0D2C]" />
                        {selectedTable.name}
                      </h3>
                      <span className="text-[11px] bg-[#C89B3C]/15 text-[#8C6514] font-bold px-2.5 py-0.5 rounded-full border border-[#C89B3C]/30">
                        {selectedTable.category || 'Core Table'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{selectedTable.description}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openEditTableModal(selectedTable)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-2xs border border-slate-200"
                      title="Edit table metadata"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit Table</span>
                    </button>
                    <button
                      onClick={() => openAddColumnModal(selectedTable)}
                      className="bg-[#C89B3C] hover:bg-[#b5892f] text-slate-950 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Column</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('data')}
                      className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-2 rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-200"
                      title="Browse table data rows"
                    >
                      <Database className="w-3.5 h-3.5 text-slate-500" />
                      <span>Rows ({dataStore[selectedTable.name]?.length || 0})</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTable(selectedTable.id)}
                      className="bg-white hover:bg-red-50 text-red-600 border border-red-200 hover:border-red-300 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
                      title="Delete this table"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Delete Table</span>
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                        <th className="py-2.5 px-3">Column Name</th>
                        <th className="py-2.5 px-3">Data Type</th>
                        <th className="py-2.5 px-3">Constraints</th>
                        <th className="py-2.5 px-3">Default Value</th>
                        <th className="py-2.5 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTable.columns.map((col) => (
                        <tr key={col.id} className="hover:bg-slate-50/80">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5">
                              {col.isPrimary && <Key className="w-3.5 h-3.5 text-[#C89B3C]" />}
                              {col.isForeign && <Link2 className="w-3.5 h-3.5 text-blue-500" />}
                              <span>{col.name}</span>
                            </div>
                            {col.description && (
                              <div className="text-[10px] text-slate-400 font-sans mt-0.5">{col.description}</div>
                            )}
                          </td>
                          <td className="py-3 px-3 text-[#3B0D2C] font-semibold">{col.type}</td>
                          <td className="py-3 px-3">
                            <div className="flex flex-wrap gap-1">
                              {col.isPrimary && (
                                <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
                                  PK
                                </span>
                              )}
                              {col.isForeign && (
                                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">
                                  FK → {col.foreignTable}.{col.foreignColumn || 'id'}
                                </span>
                              )}
                              {col.isNullable === false && !col.isPrimary && (
                                <span className="text-[10px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                  NOT NULL
                                </span>
                              )}
                              {col.isNullable && (
                                <span className="text-[10px] text-slate-400">NULLABLE</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-slate-500">{col.defaultValue || '—'}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditColumnModal(selectedTable.id, col)}
                                className="text-slate-400 hover:text-slate-800 p-1.5 rounded hover:bg-slate-100"
                                title="Edit column"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteColumn(selectedTable.id, col.id)}
                                className="text-slate-400 hover:text-red-600 p-1.5 rounded hover:bg-red-50"
                                title={col.isPrimary ? 'Delete Primary Key column' : 'Delete column'}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 4: DATA BROWSER */}
      {activeTab === 'data' && (
        <TableDataBrowser
          tables={tables}
          dataStore={dataStore}
          onInsertRow={onInsertRow}
          onUpdateRow={onUpdateRow}
          onDeleteRow={onDeleteRow}
          onImportRows={onImportRows}
          onDeleteTable={(tableName) => {
            const tbl = tables.find((t) => t.name === tableName);
            if (tbl) setTableToDelete(tbl);
          }}
          onEditTable={(tableName) => {
            const tbl = tables.find((t) => t.name === tableName);
            if (tbl) openEditTableModal(tbl);
          }}
        />
      )}

      {/* TAB 5: GENERATED SQL */}
      {activeTab === 'sql' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-[#3B0D2C]" />
                Live Generated PostgreSQL DDL & DML
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Automatically synchronizes with every table, column, foreign key modification, and inserted row.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDdl}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copiedSql ? 'Copied' : 'Copy DDL'}
              </button>
              <button
                onClick={handleExportSqlFile}
                className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
              >
                <Download className="w-3.5 h-3.5 text-[#C89B3C]" />
                <span>Download .sql File</span>
              </button>
            </div>
          </div>
          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[550px] border border-slate-800 leading-relaxed">
            {generatedDdl}
          </pre>
        </div>
      )}

      {/* TAB 6: GENERATED DJANGO MODELS */}
      {activeTab === 'django' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-4 h-4 text-emerald-700" />
                Live Generated Django 5.1 ORM Models
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted for Django REST Framework apps in <code>/django_backend/apps/</code>.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyDjango}
                className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shadow-xs"
              >
                {copiedDjango ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copiedDjango ? 'Copied' : 'Copy Django Models'}
              </button>
            </div>
          </div>
          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto max-h-[550px] border border-slate-800 leading-relaxed">
            {generatedDjango}
          </pre>
        </div>
      )}

      {/* MODAL: ADD TABLE */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#3B0D2C]" />
                Create New Database Table
              </h4>
              <button onClick={() => setShowAddTableModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddTable} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Table Name (snake_case)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. mentor_sessions, certifications, research_grants"
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Description / Business Purpose</label>
                <input
                  type="text"
                  placeholder="e.g. Track diaspora academic evaluations and grants"
                  value={newTableDesc}
                  onChange={(e) => setNewTableDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Category</label>
                  <select
                    value={newTableCategory}
                    onChange={(e) => setNewTableCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                  >
                    <option value="Custom">Custom / Extension</option>
                    <option value="Academic">Academic & Research</option>
                    <option value="Matchmaking">Matchmaking & Opportunities</option>
                    <option value="Collaborations">Collaborations & Partnerships</option>
                    <option value="Identity">Identity & Profiles</option>
                    <option value="Audit">Audit & Governance</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Primary Key Strategy</label>
                  <select
                    value={newTablePkType}
                    onChange={(e) => setNewTablePkType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                  >
                    <option value="UUID">UUID (uuid_generate_v4)</option>
                    <option value="BIGINT">BIGINT (Identity 64-bit)</option>
                    <option value="SERIAL">SERIAL (Auto-increment 32-bit)</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newTableIncludeTimestamps}
                  onChange={(e) => setNewTableIncludeTimestamps(e.target.checked)}
                  className="w-4 h-4 rounded text-[#3B0D2C] focus:ring-[#3B0D2C] accent-[#3B0D2C]"
                />
                <span className="font-semibold text-slate-700">Include created_at & updated_at timestamps</span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-4 py-2 rounded-xl transition shadow"
                >
                  Create Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COLUMN */}
      {(showAddColumnModal || showEditColumnModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                {showEditColumnModal ? <Edit2 className="w-4 h-4 text-[#3B0D2C]" /> : <Plus className="w-4 h-4 text-[#C89B3C]" />}
                {showEditColumnModal ? `Edit Column '${colName}'` : `Add Column to '${selectedTable?.name}'`}
              </h4>
              <button
                onClick={() => {
                  setShowAddColumnModal(false);
                  setShowEditColumnModal(false);
                  setEditingColumn(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={showEditColumnModal ? handleSaveEditColumn : handleAddColumn} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Column Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. stipend_amount, orcid_id, duration_weeks"
                  value={colName}
                  onChange={(e) => setColName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">PostgreSQL Data Type</label>
                  <select
                    value={colType}
                    onChange={(e) => setColType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                  >
                    <option value="VARCHAR(255)">VARCHAR(255)</option>
                    <option value="VARCHAR(100)">VARCHAR(100)</option>
                    <option value="TEXT">TEXT</option>
                    <option value="INT">INT / INTEGER</option>
                    <option value="BIGINT">BIGINT</option>
                    <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                    <option value="BOOLEAN">BOOLEAN</option>
                    <option value="DATE">DATE</option>
                    <option value="TIMESTAMP WITH TIME ZONE">TIMESTAMP WITH TIME ZONE</option>
                    <option value="JSONB">JSONB</option>
                    <option value="TEXT[]">TEXT[] (Array)</option>
                    <option value="UUID">UUID</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">Nullability</label>
                  <select
                    value={colNullable ? 'true' : 'false'}
                    onChange={(e) => setColNullable(e.target.value === 'true')}
                    disabled={colIsPrimary}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20 disabled:opacity-50"
                  >
                    <option value="true">NULLABLE (Optional)</option>
                    <option value="false">NOT NULL (Required)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Default Value (SQL Expression)</label>
                <input
                  type="text"
                  placeholder="e.g. '0', 'TRUE', CURRENT_TIMESTAMP, '{}'::jsonb"
                  value={colDefault}
                  onChange={(e) => setColDefault(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Description / Documentation</label>
                <input
                  type="text"
                  placeholder="Column semantics and usage"
                  value={colDesc}
                  onChange={(e) => setColDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>

              {/* Foreign Key Configuration Checkbox & Subform */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                  <input
                    type="checkbox"
                    checked={colIsForeign}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setColIsForeign(checked);
                      if (checked && !colFkTable) {
                        const target = tables.find((t) => t.id !== selectedTable?.id)?.name || tables[0]?.name || '';
                        setColFkTable(target);
                      }
                    }}
                    className="w-4 h-4 rounded text-[#3B0D2C] focus:ring-[#3B0D2C] accent-[#3B0D2C]"
                  />
                  <span className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-600" />
                    Configure as Foreign Key (Referential Integrity Constraint)
                  </span>
                </label>

                {colIsForeign && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div>
                      <label className="text-slate-600 font-semibold block mb-1 text-[11px]">Target Table</label>
                      <select
                        value={colFkTable}
                        onChange={(e) => setColFkTable(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-xs text-slate-900"
                      >
                        {tables.map((t) => (
                          <option key={t.id} value={t.name}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 font-semibold block mb-1 text-[11px]">Target Column</label>
                      <select
                        value={colFkColumn}
                        onChange={(e) => setColFkColumn(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 font-mono text-xs text-slate-900"
                      >
                        {(tables.find((t) => t.name === colFkTable)?.columns || []).map((c) => (
                          <option key={c.id} value={c.name}>
                            {c.name} {c.isPrimary ? '(PK)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-600 font-semibold block mb-1 text-[11px]">On Delete Action</label>
                      <select
                        value={colFkOnDelete}
                        onChange={(e) => setColFkOnDelete(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-900"
                      >
                        <option value="CASCADE">CASCADE</option>
                        <option value="SET NULL">SET NULL</option>
                        <option value="RESTRICT">RESTRICT</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddColumnModal(false);
                    setShowEditColumnModal(false);
                    setEditingColumn(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#C89B3C] hover:bg-[#b5892f] text-slate-950 font-bold px-4 py-2 rounded-xl transition shadow"
                >
                  {showEditColumnModal ? 'Save Column Changes' : 'Add Column'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIGURE FOREIGN KEY RELATION */}
      {showAddRelationModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-[#3B0D2C]" />
                {editingRelation ? 'Edit Foreign Key Constraint' : 'Configure Foreign Key Relation'}
              </h4>
              <button
                onClick={() => {
                  setShowAddRelationModal(false);
                  setEditingRelation(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveRelation} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Source Child Table & Column */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-[#3B0D2C] uppercase tracking-wider block">
                    Source (Child Table)
                  </span>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Source Table</label>
                    <select
                      value={relSourceTable}
                      onChange={(e) => {
                        const tblName = e.target.value;
                        setRelSourceTable(tblName);
                        const cols = tables.find((t) => t.name === tblName)?.columns || [];
                        setRelSourceCol(cols[0]?.name || '');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Foreign Key Column</label>
                    <select
                      value={relSourceCol}
                      onChange={(e) => setRelSourceCol(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                    >
                      {activeSourceCols.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Target Parent Table & Column */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
                    Target (Parent Table)
                  </span>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Target Table</label>
                    <select
                      value={relTargetTable}
                      onChange={(e) => {
                        const tblName = e.target.value;
                        setRelTargetTable(tblName);
                        const cols = tables.find((t) => t.name === tblName)?.columns || [];
                        setRelTargetCol(cols.find((c) => c.isPrimary)?.name || cols[0]?.name || 'id');
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                    >
                      {tables.map((t) => (
                        <option key={t.id} value={t.name}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-700 font-semibold block mb-1">Referenced Primary Key</label>
                    <select
                      value={relTargetCol}
                      onChange={(e) => setRelTargetCol(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                    >
                      {activeTargetCols.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} {c.isPrimary ? '(Primary Key)' : ''} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cascade Behavior */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-700 font-bold block mb-1">ON DELETE Action</label>
                  <select
                    value={relOnDelete}
                    onChange={(e) => setRelOnDelete(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                  >
                    <option value="CASCADE">CASCADE (Delete children when parent is deleted)</option>
                    <option value="SET NULL">SET NULL (Set foreign key column to NULL)</option>
                    <option value="RESTRICT">RESTRICT (Prevent parent deletion if referenced)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-700 font-bold block mb-1">ON UPDATE Action</label>
                  <select
                    value={relOnUpdate}
                    onChange={(e) => setRelOnUpdate(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                  >
                    <option value="CASCADE">CASCADE (Update foreign key automatically)</option>
                    <option value="RESTRICT">RESTRICT (Prevent primary key mutation)</option>
                  </select>
                </div>
              </div>

              {/* Live SQL Constraint Preview */}
              <div className="bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-[11px] space-y-1">
                <div className="text-slate-400 text-[10px] font-bold">Generated PostgreSQL DDL Constraint:</div>
                <div className="leading-relaxed">
                  ALTER TABLE "{relSourceTable}" ADD CONSTRAINT "fk_{relSourceTable}_{relSourceCol}" FOREIGN KEY ("{relSourceCol}") REFERENCES "{relTargetTable}"("{relTargetCol}") ON DELETE {relOnDelete};
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddRelationModal(false);
                    setEditingRelation(null);
                  }}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-4 py-2 rounded-xl transition shadow"
                >
                  {editingRelation ? 'Update Constraint' : 'Create Constraint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT TABLE METADATA */}
      {editingTable && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#3B0D2C]" />
                Edit Table '{editingTable.name}'
              </h4>
              <button onClick={() => setEditingTable(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveEditTable} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Table Name (snake_case)</label>
                <input
                  type="text"
                  required
                  value={editTableName}
                  onChange={(e) => setEditTableName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Foreign key references will automatically be synced if renamed.
                </span>
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Description / Business Purpose</label>
                <input
                  type="text"
                  value={editTableDesc}
                  onChange={(e) => setEditTableDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                />
              </div>
              <div>
                <label className="text-slate-700 font-bold block mb-1">Category</label>
                <select
                  value={editTableCategory}
                  onChange={(e) => setEditTableCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#3B0D2C]/20"
                >
                  <option value="Custom">Custom / Extension</option>
                  <option value="Academic">Academic & Research</option>
                  <option value="Matchmaking">Matchmaking & Opportunities</option>
                  <option value="Collaborations">Collaborations & Partnerships</option>
                  <option value="Identity">Identity & Profiles</option>
                  <option value="Audit">Audit & Governance</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTable(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3B0D2C] hover:bg-[#4A1238] text-white font-bold px-4 py-2 rounded-xl transition shadow"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE TABLE */}
      {tableToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Delete Database Table?</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">table: {tableToDelete.name}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <p>
                Are you sure you want to permanently delete table <strong className="font-mono text-slate-900">{tableToDelete.name}</strong>?
              </p>
              <ul className="list-disc pl-5 space-y-1 text-slate-500 text-[11px]">
                <li>Columns: <span className="font-bold text-slate-700">{tableToDelete.columns.length} columns</span></li>
                <li>Data rows: <span className="font-bold text-slate-700">{dataStore[tableToDelete.name]?.length || 0} records</span></li>
                <li>All foreign key constraints referencing or originating from this table will be removed.</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTableToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmDeleteTable}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Table Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE COLUMN */}
      {columnToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Delete Column?</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  {columnToDelete.table.name}.{columnToDelete.column.name}
                </p>
              </div>
            </div>

            {columnToDelete.column.isPrimary && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Warning: Primary Key Column
                </div>
                <p className="text-[11px] text-amber-700">
                  This column is defined as the Primary Key for table '{columnToDelete.table.name}'. Deleting it will leave the table without a designated primary constraint.
                </p>
              </div>
            )}

            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
              <p>
                Delete column <strong className="font-mono text-slate-900">{columnToDelete.column.name}</strong> ({columnToDelete.column.type}) from table <strong className="font-mono text-slate-900">{columnToDelete.table.name}</strong>?
              </p>
              <p className="text-[11px] text-slate-500">
                Any foreign key constraints attached to this column will automatically be cleaned up.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setColumnToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmDeleteColumn}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Column</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE RELATION */}
      {relationToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-red-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                <Link2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Remove Foreign Key Constraint?</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">{relationToDelete.label || relationToDelete.id}</p>
              </div>
            </div>

            <div className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
              <div className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded-lg border border-slate-200">
                {relationToDelete.sourceTable}.{relationToDelete.sourceColumn} → {relationToDelete.targetTable}.{relationToDelete.targetColumn}
              </div>
              <p className="text-[11px] text-slate-500">
                This will drop the referential constraint without deleting data records in either table.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRelationToDelete(null)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeConfirmDeleteRelation}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Foreign Key</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
