import * as XLSX from 'xlsx';
import { SchemaTableDef, SchemaRelation } from '../types';
import { TableRow } from '../services/dbStore';

/**
 * Escapes a string value for safe SQL insertion
 */
function escapeSqlValue(value: any, columnType?: string): string {
  if (value === null || value === undefined) {
    return 'NULL';
  }

  if (typeof value === 'boolean') {
    return value ? 'TRUE' : 'FALSE';
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (Array.isArray(value)) {
    const formattedItems = value.map((item) => `"${String(item).replace(/"/g, '""')}"`);
    return `'{${formattedItems.join(',')}}'`;
  }

  if (typeof value === 'object') {
    const jsonStr = JSON.stringify(value).replace(/'/g, "''");
    return `'${jsonStr}'::jsonb`;
  }

  const str = String(value);

  // If column is timestamp/date or looks like ISO string
  if (columnType?.includes('TIMESTAMP') || columnType?.includes('DATE')) {
    return `'${str.replace(/'/g, "''")}'`;
  }

  return `'${str.replace(/'/g, "''")}'`;
}

/**
 * Generates a complete PostgreSQL 16 SQL dump file containing schema definitions,
 * foreign key constraints, and INSERT statements for all table rows in dataStore.
 */
export function generateFullDatabaseSql(
  tables: SchemaTableDef[],
  relations: SchemaRelation[],
  dataStore: Record<string, TableRow[]>,
): string {
  const timestamp = new Date().toISOString();
  let sql = `-- ==============================================================================
-- DZ-BRIDGE: COMPREHENSIVE POSTGRESQL 16 DATABASE DUMP
-- Platform for Algerian Scholar Award & Diaspora Knowledge Transfer
-- Export Date: ${timestamp}
-- Total Tables: ${tables.length}
-- Total Relations: ${relations.length}
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('expert', 'organization', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_status') THEN
        CREATE TYPE user_status AS ENUM ('pending_verification', 'active', 'suspended', 'deactivated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_status') THEN
        CREATE TYPE project_status AS ENUM ('draft', 'submitted', 'under_review', 'matched', 'contact_initiated', 'confirmed', 'in_progress', 'completed', 'cancelled', 'unsuccessful');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'match_status') THEN
        CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected', 'expired');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'collaboration_status') THEN
        CREATE TYPE collaboration_status AS ENUM ('pending', 'active', 'completed', 'cancelled');
    END IF;
END $$;\n\n`;

  // 3. TABLE DEFINITIONS
  sql += `-- ==============================================================================
-- 3. TABLE SCHEMAS (DDL)
-- ==============================================================================\n\n`;

  tables.forEach((tbl) => {
    sql += `-- Table: ${tbl.name} (${tbl.category || 'Core'})\n`;
    if (tbl.description) {
      sql += `-- Description: ${tbl.description}\n`;
    }
    sql += `CREATE TABLE IF NOT EXISTS "${tbl.name}" (\n`;

    const colDefs = tbl.columns.map((col) => {
      let line = `    "${col.name}" ${col.type}`;
      if (col.isPrimary) {
        line += ' PRIMARY KEY DEFAULT uuid_generate_v4()';
      }
      if (col.isNullable === false && !col.isPrimary) {
        line += ' NOT NULL';
      }
      if (col.defaultValue && !col.isPrimary) {
        line += ` DEFAULT ${col.defaultValue}`;
      }
      return line;
    });

    sql += colDefs.join(',\n');
    sql += '\n);\n\n';
  });

  // 4. DATA INSERTS
  sql += `-- ==============================================================================
-- 4. TABLE DATA (DML INSERT STATEMENTS)
-- ==============================================================================\n\n`;

  let totalRowsDumped = 0;
  tables.forEach((tbl) => {
    const rows = dataStore[tbl.name] || [];
    if (rows.length > 0) {
      sql += `-- Data for Table "${tbl.name}" (${rows.length} rows)\n`;
      const colNames = tbl.columns.map((c) => `"${c.name}"`).join(', ');

      rows.forEach((row) => {
        const values = tbl.columns.map((col) => {
          const val = row[col.name];
          return escapeSqlValue(val, col.type);
        });

        sql += `INSERT INTO "${tbl.name}" (${colNames})\nVALUES (${values.join(', ')})\nON CONFLICT DO NOTHING;\n`;
        totalRowsDumped++;
      });
      sql += '\n';
    } else {
      sql += `-- Table "${tbl.name}": 0 rows present\n\n`;
    }
  });

  // 5. FOREIGN KEY CONSTRAINTS (added after data loading to avoid dependency order conflicts)
  sql += `-- ==============================================================================
-- 5. RELATIONAL FOREIGN KEY CONSTRAINTS
-- ==============================================================================\n\n`;

  relations.forEach((rel) => {
    const constraintName = `fk_${rel.sourceTable}_${rel.sourceColumn}_to_${rel.targetTable}`;
    sql += `-- Constraint: ${rel.sourceTable}.${rel.sourceColumn} -> ${rel.targetTable}.${rel.targetColumn}\n`;
    sql += `DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = '${constraintName}'
    ) THEN
        ALTER TABLE "${rel.sourceTable}"
        ADD CONSTRAINT "${constraintName}"
        FOREIGN KEY ("${rel.sourceColumn}")
        REFERENCES "${rel.targetTable}"("${rel.targetColumn}")
        ON DELETE ${rel.onDelete};
    END IF;
END $$;\n\n`;
  });

  sql += `-- ==============================================================================
-- End of Database Dump. Total rows: ${totalRowsDumped}
-- ==============================================================================\n`;

  return sql;
}

/**
 * Downloads the full database SQL file to the user's browser.
 */
export function downloadDatabaseSql(
  tables: SchemaTableDef[],
  relations: SchemaRelation[],
  dataStore: Record<string, TableRow[]>,
): void {
  const sqlContent = generateFullDatabaseSql(tables, relations, dataStore);
  const blob = new Blob([sqlContent], { type: 'application/sql;charset=utf-8;' });
  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `dz_bridge_database_dump_${dateStr}.sql`;

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports all database tables into a single Excel (.xlsx) file,
 * with each table contained in its own dedicated worksheet.
 * Also includes Schema Dictionary and Foreign Keys overview sheets.
 */
export function downloadDatabaseExcelWorkbook(
  tables: SchemaTableDef[],
  dataStore: Record<string, TableRow[]>,
  relations: SchemaRelation[],
): void {
  const wb = XLSX.utils.book_new();

  // 1. Data Sheets: Each table gets its own Excel sheet
  tables.forEach((tbl) => {
    const rows = dataStore[tbl.name] || [];
    let ws: XLSX.WorkSheet;

    if (rows.length > 0) {
      const formattedRows = rows.map((r) => {
        const item: Record<string, any> = {};
        tbl.columns.forEach((col) => {
          const val = r[col.name];
          if (val === undefined || val === null) {
            item[col.name] = '';
          } else if (typeof val === 'object') {
            item[col.name] = JSON.stringify(val);
          } else {
            item[col.name] = val;
          }
        });
        return item;
      });
      ws = XLSX.utils.json_to_sheet(formattedRows);
    } else {
      // Empty table with column header definitions
      const headers = tbl.columns.map((c) => c.name);
      ws = XLSX.utils.aoa_to_sheet([headers]);
    }

    // Excel sheet name limit is 31 characters and cannot contain certain symbols
    let safeSheetName = tbl.name.replace(/[\\/?*:[\]]/g, '_').slice(0, 31);
    if (wb.SheetNames.includes(safeSheetName)) {
      safeSheetName = safeSheetName.slice(0, 26) + '_' + Math.floor(Math.random() * 900 + 100);
    }

    XLSX.utils.book_append_sheet(wb, ws, safeSheetName);
  });

  // 2. Schema Dictionary Sheet
  const dictRows: any[] = [];
  tables.forEach((tbl) => {
    tbl.columns.forEach((col) => {
      dictRows.push({
        'Table Name': tbl.name,
        'Category': tbl.category || 'Core',
        'Column Name': col.name,
        'Data Type': col.type,
        'Primary Key': col.isPrimary ? 'YES' : 'NO',
        'Foreign Key': col.isForeign ? `YES (${col.foreignTable}.${col.foreignColumn || 'id'})` : 'NO',
        'Nullable': col.isNullable !== false ? 'YES' : 'NO',
        'Default Value': col.defaultValue || '',
        'Description': col.description || '',
      });
    });
  });
  const dictSheet = XLSX.utils.json_to_sheet(dictRows);
  XLSX.utils.book_append_sheet(wb, dictSheet, 'SCHEMA_DICTIONARY');

  // 3. Foreign Keys Relations Sheet
  const relRows = relations.map((rel) => ({
    'Relation ID': rel.id,
    'Source Table (Child)': rel.sourceTable,
    'Source Column': rel.sourceColumn,
    'Target Table (Parent)': rel.targetTable,
    'Target Column': rel.targetColumn,
    'On Delete Action': rel.onDelete,
    'Label': rel.label || `${rel.sourceTable}.${rel.sourceColumn} -> ${rel.targetTable}.${rel.targetColumn}`,
  }));
  const relSheet = XLSX.utils.json_to_sheet(relRows);
  XLSX.utils.book_append_sheet(wb, relSheet, 'FOREIGN_KEYS');

  const dateStr = new Date().toISOString().slice(0, 10);
  const fileName = `dz_bridge_all_tables_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}
