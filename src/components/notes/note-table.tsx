'use client';

import { useCallback, useId } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TableData {
  headers: string[];
  rows: string[][];
}

interface NoteTableProps {
  data: TableData;
  onChange: (data: TableData) => void;
  readOnly?: boolean;
  className?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function createEmptyTable(cols = 3, rows = 2): TableData {
  return {
    headers: Array.from({ length: cols }, (_, i) => `Kolom ${i + 1}`),
    rows: Array.from({ length: rows }, () => Array.from({ length: cols }, () => '')),
  };
}

export function serializeTable(data: TableData): string {
  return JSON.stringify(data);
}

export function deserializeTable(content: string): TableData {
  try {
    const parsed = JSON.parse(content) as TableData;
    if (Array.isArray(parsed.headers) && Array.isArray(parsed.rows)) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return createEmptyTable();
}

// ─── Component ────────────────────────────────────────────────────────────────

export function NoteTable({ data, onChange, readOnly = false, className }: NoteTableProps) {
  const tableId = useId();

  const updateHeader = useCallback(
    (colIndex: number, value: string) => {
      const headers = [...data.headers];
      headers[colIndex] = value;
      onChange({ ...data, headers });
    },
    [data, onChange]
  );

  const updateCell = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const rows = data.rows.map((r) => [...r]);
      if (rows[rowIndex]) rows[rowIndex][colIndex] = value;
      onChange({ ...data, rows });
    },
    [data, onChange]
  );

  const addColumn = useCallback(() => {
    const headers = [...data.headers, `Kolom ${data.headers.length + 1}`];
    const rows = data.rows.map((r) => [...r, '']);
    onChange({ headers, rows });
  }, [data, onChange]);

  const removeColumn = useCallback(
    (colIndex: number) => {
      if (data.headers.length <= 1) return;
      const headers = data.headers.filter((_, i) => i !== colIndex);
      const rows = data.rows.map((r) => r.filter((_, i) => i !== colIndex));
      onChange({ headers, rows });
    },
    [data, onChange]
  );

  const addRow = useCallback(() => {
    const newRow = Array.from({ length: data.headers.length }, () => '');
    onChange({ ...data, rows: [...data.rows, newRow] });
  }, [data, onChange]);

  const removeRow = useCallback(
    (rowIndex: number) => {
      if (data.rows.length <= 1) return;
      const rows = data.rows.filter((_, i) => i !== rowIndex);
      onChange({ ...data, rows });
    },
    [data, onChange]
  );

  const colCount = data.headers.length;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table
          className="w-full text-sm border-collapse"
          aria-label="Tabel catatan"
          id={tableId}
        >
          {/* Header row */}
          <thead>
            <tr className="bg-[var(--surface-subtle)]">
              {data.headers.map((header, ci) => (
                <th
                  key={`${tableId}-h-${ci}`}
                  className="border-b border-[var(--border)] px-0 py-0 font-medium text-left relative group"
                >
                  {readOnly ? (
                    <span className="block px-3 py-2 text-[var(--text-secondary)]">{header || `Kolom ${ci + 1}`}</span>
                  ) : (
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={header}
                        onChange={(e) => updateHeader(ci, e.target.value)}
                        placeholder={`Kolom ${ci + 1}`}
                        aria-label={`Header kolom ${ci + 1}`}
                        className={cn(
                          'flex-1 min-w-0 px-3 py-2 bg-transparent',
                          'text-[var(--text-secondary)] font-medium text-xs uppercase tracking-wide',
                          'placeholder:text-[var(--text-tertiary)]',
                          'outline-none focus:bg-[var(--accent-subtle)]',
                          'transition-colors'
                        )}
                      />
                      {!readOnly && colCount > 1 && (
                        <button
                          type="button"
                          onClick={() => removeColumn(ci)}
                          aria-label={`Hapus kolom ${ci + 1}`}
                          className={cn(
                            'opacity-0 group-hover:opacity-100 p-1 mr-1',
                            'text-[var(--text-tertiary)] hover:text-[var(--error)]',
                            'transition-opacity outline-none focus-visible:opacity-100',
                            'focus-visible:ring-1 focus-visible:ring-[var(--error)] rounded'
                          )}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  )}
                </th>
              ))}
              {/* Spacer for row-delete button */}
              {!readOnly && <th className="w-8 border-b border-[var(--border)]" aria-hidden="true" />}
            </tr>
          </thead>

          {/* Body rows */}
          <tbody>
            {data.rows.map((row, ri) => (
              <tr
                key={`${tableId}-r-${ri}`}
                className="group border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-subtle)] transition-colors"
              >
                {row.map((cell, ci) => (
                  <td
                    key={`${tableId}-c-${ri}-${ci}`}
                    className="px-0 py-0 border-r border-[var(--border)] last:border-r-0"
                  >
                    {readOnly ? (
                      <span className="block px-3 py-2 text-[var(--text-primary)]">{cell}</span>
                    ) : (
                      <input
                        type="text"
                        value={cell}
                        onChange={(e) => updateCell(ri, ci, e.target.value)}
                        placeholder="—"
                        aria-label={`Sel baris ${ri + 1} kolom ${ci + 1}`}
                        className={cn(
                          'w-full px-3 py-2 bg-transparent',
                          'text-[var(--text-primary)]',
                          'placeholder:text-[var(--text-tertiary)]',
                          'outline-none focus:bg-[var(--accent-subtle)]',
                          'transition-colors'
                        )}
                      />
                    )}
                  </td>
                ))}
                {/* Row delete */}
                {!readOnly && (
                  <td className="w-8 px-1 border-r-0">
                    {data.rows.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRow(ri)}
                        aria-label={`Hapus baris ${ri + 1}`}
                        className={cn(
                          'opacity-0 group-hover:opacity-100 p-1',
                          'text-[var(--text-tertiary)] hover:text-[var(--error)]',
                          'transition-opacity outline-none focus-visible:opacity-100',
                          'focus-visible:ring-1 focus-visible:ring-[var(--error)] rounded'
                        )}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action buttons */}
      {!readOnly && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={addRow}
            className="h-7 text-xs gap-1.5 text-[var(--text-secondary)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah baris
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={addColumn}
            className="h-7 text-xs gap-1.5 text-[var(--text-secondary)]"
          >
            <Plus className="h-3.5 w-3.5" />
            Tambah kolom
          </Button>
        </div>
      )}
    </div>
  );
}
