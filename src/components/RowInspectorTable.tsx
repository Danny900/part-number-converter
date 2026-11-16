import { useState, useMemo } from 'react';
import { Search, CheckCircle2, AlertTriangle, MinusCircle } from 'lucide-react';
import { TranslationRowResult } from '../utils/translator';

interface RowInspectorTableProps {
  rows: TranslationRowResult[];
}

type FilterMode = 'all' | 'valid' | 'invalid' | 'blank';

export function RowInspectorTable({ rows }: RowInspectorTableProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (filterMode !== 'all' && row.status !== filterMode) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.trim().toLowerCase();
        const matchesLine = String(row.lineNumber).includes(q);
        const matchesInput = row.rawInput.toLowerCase().includes(q);
        const matchesOutput = row.output.toLowerCase().includes(q);
        const matchesError = (row.errorReason || '').toLowerCase().includes(q);
        return matchesLine || matchesInput || matchesOutput || matchesError;
      }
      return true;
    });
  }, [rows, filterMode, searchQuery]);

  const counts = useMemo(() => {
    let valid = 0;
    let invalid = 0;
    let blank = 0;
    for (const r of rows) {
      if (r.status === 'valid') valid++;
      else if (r.status === 'invalid') invalid++;
      else blank++;
    }
    return { all: rows.length, valid, invalid, blank };
  }, [rows]);

  return (
    <section id="inspector" className="space-y-4 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Line-by-Line Receiving Verification Log
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
            Inspect individual spreadsheet row mappings, parsed capacitor parameters, and exact validation diagnostics for flagged MPNs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Interactive Segmented Filter Controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Rows ({counts.all})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('valid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterMode === 'valid'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Valid ({counts.valid})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('invalid')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterMode === 'invalid'
                  ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Invalid ({counts.invalid})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('blank')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                filterMode === 'blank'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Blank ({counts.blank})
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by MPN, IPN, or row #..."
              aria-label="Filter conversion log rows"
              className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 z-10">
              <tr>
                <th className="py-2.5 px-4 font-medium w-16 font-mono">Row #</th>
                <th className="py-2.5 px-4 font-medium">Samsung MPN (Input)</th>
                <th className="py-2.5 px-4 font-medium">Venkel IPN (Output)</th>
                <th className="py-2.5 px-4 font-medium">Status</th>
                <th className="py-2.5 px-4 font-medium">Parsed Token Breakdown / Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70 font-mono">
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 dark:text-slate-400 font-sans">
                    No rows match the current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredRows.slice(0, 200).map((row) => (
                  <tr
                    key={row.lineNumber}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                      row.status === 'invalid' ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 text-slate-400 dark:text-slate-500 tabular-nums">
                      {row.lineNumber}
                    </td>
                    <td className="py-2.5 px-4 text-slate-900 dark:text-slate-100 font-medium">
                      {row.status === 'blank' ? (
                        <span className="text-slate-400 dark:text-slate-600 italic font-sans">Empty row</span>
                      ) : (
                        row.trimmedInput
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-semibold">
                      {row.status === 'valid' && (
                        <span className="text-blue-600 dark:text-blue-400">{row.output}</span>
                      )}
                      {row.status === 'invalid' && (
                        <span className="text-rose-600 dark:text-rose-400">{row.output}</span>
                      )}
                      {row.status === 'blank' && (
                        <span className="text-slate-400 dark:text-slate-600 italic font-sans">Blank line preserved</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      {row.status === 'valid' && (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Valid</span>
                        </span>
                      )}
                      {row.status === 'invalid' && (
                        <span className="inline-flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          <span>Check MPN</span>
                        </span>
                      )}
                      {row.status === 'blank' && (
                        <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                          <MinusCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>Blank</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 dark:text-slate-400">
                      {row.status === 'valid' && row.segments && (
                        <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                          <span>Size {row.segments.sizeRaw}→{row.segments.venkelSize}</span>
                          <span aria-hidden="true">·</span>
                          <span>Diel {row.segments.dielectricRaw}→{row.segments.venkelDielectric}</span>
                          <span aria-hidden="true">·</span>
                          <span>Volt {row.segments.voltageRaw}→{row.segments.venkelVoltage}</span>
                          <span aria-hidden="true">·</span>
                          <span>Val {row.segments.valueRaw}{row.segments.toleranceRaw}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">
                            {row.segments.tapeRuleApplied === 'E->NE' && 'Tape E→NE'}
                            {row.segments.tapeRuleApplied === 'C->NP' && 'Tape C→NP'}
                            {row.segments.tapeRuleApplied === 'DEFAULT->NE' &&
                              `Tape (${row.segments.lastCharRaw})→NE`}
                          </span>
                        </div>
                      )}
                      {row.status === 'invalid' && (
                        <span className="text-rose-700 dark:text-rose-400">{row.errorReason}</span>
                      )}
                      {row.status === 'blank' && (
                        <span className="text-slate-400 dark:text-slate-500">1:1 vertical alignment spacer</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredRows.length > 200 && (
          <div className="px-4 py-2 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            Showing first 200 of {filteredRows.length} matching rows in the diagnostic table. All {rows.length} rows are present in the Output textarea above.
          </div>
        )}
      </div>
    </section>
  );
}
