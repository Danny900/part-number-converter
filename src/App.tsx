/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Check,
  Trash2,
  FileSpreadsheet,
  Sun,
  Moon,
  Download,
  Layers,
} from 'lucide-react';
import {
  translateBatch,
  SAMPLE_WAREHOUSE_BATCH,
  BatchTranslationSummary,
} from './utils/translator';
import { buildStandaloneHtmlFile } from './utils/standaloneBuilder';
import { RowInspectorTable } from './components/RowInspectorTable';
import { DictionaryReference } from './components/DictionaryReference';

export default function App() {
  const [inputText, setInputText] = useState<string>(SAMPLE_WAREHOUSE_BATCH);
  const [strictTapeValidation, setStrictTapeValidation] = useState<boolean>(false);
  const [batchResult, setBatchResult] = useState<BatchTranslationSummary>(() =>
    translateBatch(SAMPLE_WAREHOUSE_BATCH, { strictTapeValidation: false })
  );
  const [isDark, setIsDark] = useState<boolean>(false);
  const [copiedOutput, setCopiedOutput] = useState<boolean>(false);
  const [autoConvert, setAutoConvert] = useState<boolean>(true);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const inputTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const outputTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const inputGutterRef = useRef<HTMLDivElement | null>(null);
  const outputGutterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleConvert = (
    sourceText: string = inputText,
    strictMode: boolean = strictTapeValidation
  ) => {
    const result = translateBatch(sourceText, { strictTapeValidation: strictMode });
    setBatchResult(result);
    setIsDirty(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nextValue = e.target.value;
    setInputText(nextValue);
    if (autoConvert) {
      setBatchResult(translateBatch(nextValue, { strictTapeValidation }));
      setIsDirty(false);
    } else {
      setIsDirty(true);
    }
  };

  const handleSyncScroll = (source: 'input' | 'output') => {
    const inputEl = inputTextareaRef.current;
    const outputEl = outputTextareaRef.current;
    if (!inputEl || !outputEl) return;

    const scrollTop = source === 'input' ? inputEl.scrollTop : outputEl.scrollTop;

    if (source === 'input') {
      outputEl.scrollTop = scrollTop;
    } else {
      inputEl.scrollTop = scrollTop;
    }

    if (inputGutterRef.current) {
      inputGutterRef.current.scrollTop = scrollTop;
    }
    if (outputGutterRef.current) {
      outputGutterRef.current.scrollTop = scrollTop;
    }
  };

  const handleCopyOutput = async () => {
    const textToCopy = batchResult.outputText;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    } catch {
      if (outputTextareaRef.current) {
        outputTextareaRef.current.select();
        document.execCommand('copy');
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
    }
  };

  const handleLoadSample = () => {
    setInputText(SAMPLE_WAREHOUSE_BATCH);
    handleConvert(SAMPLE_WAREHOUSE_BATCH);
  };

  const handleLoad500Rows = () => {
    const samplePool = [
      'CL10A106MQ',
      'CL31A106KPHNNNE',
      'CL31A106KAHNNNE',
      'CL05B104KO5NNNC',
      'CL21B105KBFNNNE',
      'CL03C101JB3NNNC',
      'CL32A226KQJNNNE',
      'CL21A475KAQNNNE',
      'CL02A104MQ2NNNC',
      'CL43B104KCFNNNE',
      'CL55B105KCHNNNE',
    ];
    const generated: string[] = [];
    for (let i = 0; i < 500; i++) {
      if (i > 0 && i % 25 === 0) {
        generated.push('');
      } else if (i > 0 && i % 40 === 0) {
        generated.push(`CL99X999XX_ROW_${i + 1}`);
      } else {
        generated.push(samplePool[i % samplePool.length]);
      }
    }
    const text = generated.join('\n');
    setInputText(text);
    handleConvert(text);
  };

  const handleClear = () => {
    setInputText('');
    handleConvert('');
  };

  const handleDownloadCsv = () => {
    const csvLines = ['"Row","Samsung_MPN","Venkel_IPN","Status"'];
    for (const row of batchResult.rows) {
      const escapedIn = row.trimmedInput.replace(/"/g, '""');
      const escapedOut = row.output.replace(/"/g, '""');
      csvLines.push(`${row.lineNumber},"${escapedIn}","${escapedOut}","${row.status}"`);
    }
    const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'venkel-ipn-batch-output.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadStandaloneHtml = () => {
    const htmlContent = buildStandaloneHtmlFile();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'index.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inputLineCount = inputText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').length;
  const outputLineCount = batchResult.rows.length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#workspace"
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          Venkel IPN Translator
        </a>

        {/* Zone 2: 4 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a
            href="#workspace"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Batch Converter
          </a>
          <a
            href="#inspector"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Row Diagnostics
          </a>
          <a
            href="#anatomy"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Token Anatomy
          </a>
          <a
            href="#dictionaries"
            className="hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Mapping Tables
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadStandaloneHtml}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-2"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Download Single-File HTML</span>
          </button>
        </div>
      </header>

      {/* Main Content Viewport */}
      <main id="workspace" className="flex-1 max-w-[1360px] w-full mx-auto px-6 py-8 space-y-8">
        {/* Workspace Header & Primary Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Warehouse Receiving Utility</span>
              <span aria-hidden="true">·</span>
              <span>Samsung MLCC to Venkel IPN</span>
              <span aria-hidden="true">·</span>
              <span>Strict 1:1 Line Preservation</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white text-balance">
              Samsung MLCC to Venkel IPN Batch Converter
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Paste a column of Samsung part numbers directly from Excel or your receiving sheet. Blank rows remain blank and invalid MPNs output{' '}
              <code className="font-mono text-xs font-semibold text-rose-600 dark:text-rose-400">
                [INVALID - CHECK MPN]
              </code>{' '}
              to preserve exact row alignment.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap xl:flex-nowrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsDark((prev) => !prev)}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              {isDark ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>Dark Mode</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleLoadSample}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 shrink-0" />
              <span>Sample Batch</span>
            </button>

            <button
              type="button"
              onClick={handleLoad500Rows}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5 shrink-0" />
              <span>500-Row Test</span>
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={() => handleConvert(inputText)}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 shrink-0" />
              <span>Convert</span>
            </button>

            <button
              type="button"
              onClick={handleCopyOutput}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-800 dark:border dark:border-slate-700 text-white dark:text-slate-100 hover:bg-slate-800 dark:hover:bg-slate-700 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 shadow-xs"
            >
              {copiedOutput ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Copied Output</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 shrink-0" />
                  <span>Copy Output</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Metrics & Sync Controls Strip (Unboxed clean metadata with tabular numerals) */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-3 text-slate-600 dark:text-slate-400">
            <span>
              Total Lines: <strong className="text-slate-900 dark:text-slate-100">{batchResult.totalLines}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Valid IPNs: <strong className="text-emerald-700 dark:text-emerald-400">{batchResult.validCount}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Flagged MPNs: <strong className="text-rose-600 dark:text-rose-400">{batchResult.invalidCount}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              Blank Rows: <strong className="text-slate-900 dark:text-slate-100">{batchResult.blankCount}</strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>
              1:1 Row Alignment:{' '}
              <strong className="text-blue-600 dark:text-blue-400">
                {inputLineCount === outputLineCount ? `${inputLineCount} : ${outputLineCount} Verified` : 'Pending Convert'}
              </strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-sans">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={strictTapeValidation}
                onChange={(e) => {
                  const nextStrict = e.target.checked;
                  setStrictTapeValidation(nextStrict);
                  handleConvert(inputText, nextStrict);
                }}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600"
              />
              <span>Strict Tape Code (E/C Only)</span>
            </label>

            <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoConvert}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setAutoConvert(checked);
                  if (checked) {
                    handleConvert(inputText, strictTapeValidation);
                  }
                }}
                className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-600"
              />
              <span>Live convert while typing/pasting</span>
            </label>

            <button
              type="button"
              onClick={handleDownloadCsv}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-4 whitespace-nowrap shrink-0"
            >
              Export Receiving CSV
            </button>
          </div>
        </div>

        {/* Two-Column Bulk Input / Output Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* Left Column: Bulk Input Textarea */}
          <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50">
              <label
                htmlFor="samsung-mpn-input"
                className="text-xs font-semibold text-slate-900 dark:text-slate-100"
              >
                Samsung MPN Batch Input
              </label>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>{inputLineCount} rows</span>
                <span aria-hidden="true">·</span>
                <span>Editable</span>
              </div>
            </div>

            <div className="relative flex flex-1 h-[368px]">
              {/* Line Number Gutter */}
              <div
                ref={inputGutterRef}
                aria-hidden="true"
                className="w-12 py-4 px-2 select-none overflow-hidden bg-slate-50 dark:bg-slate-950/60 border-r border-slate-200/80 dark:border-slate-800 text-right font-mono text-xs leading-6 text-slate-400 dark:text-slate-600 tabular-nums"
              >
                {Array.from({ length: inputLineCount }, (_, i) => (
                  <div key={i + 1}>{i + 1}</div>
                ))}
              </div>

              <textarea
                id="samsung-mpn-input"
                ref={inputTextareaRef}
                value={inputText}
                onChange={handleInputChange}
                onScroll={() => handleSyncScroll('input')}
                spellCheck={false}
                placeholder={`Paste column of Samsung MLCC part numbers here (one per line)...\nCL10A106MQ\nCL31A106KAHNNNE`}
                className="flex-1 w-full p-4 font-mono text-sm leading-6 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none resize-none overflow-y-auto whitespace-pre"
              />
            </div>
          </div>

          {/* Right Column: Read-Only Converted IPNs Textarea */}
          <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/50">
              <label
                htmlFor="venkel-ipn-output"
                className="text-xs font-semibold text-slate-900 dark:text-slate-100"
              >
                Venkel IPN Batch Output (Read-Only)
              </label>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                <span>{outputLineCount} rows</span>
                <span aria-hidden="true">·</span>
                <span>{isDirty ? 'Click Convert to refresh' : '1:1 Synced'}</span>
              </div>
            </div>

            <div className="relative flex flex-1 h-[368px]">
              {/* Line Number Gutter */}
              <div
                ref={outputGutterRef}
                aria-hidden="true"
                className="w-12 py-4 px-2 select-none overflow-hidden bg-slate-50 dark:bg-slate-950/60 border-r border-slate-200/80 dark:border-slate-800 text-right font-mono text-xs leading-6 text-slate-400 dark:text-slate-600 tabular-nums"
              >
                {batchResult.rows.map((row) => (
                  <div
                    key={row.lineNumber}
                    className={
                      row.status === 'invalid'
                        ? 'text-rose-600 dark:text-rose-400 font-semibold'
                        : ''
                    }
                  >
                    {row.lineNumber}
                  </div>
                ))}
              </div>

              <textarea
                id="venkel-ipn-output"
                ref={outputTextareaRef}
                value={batchResult.outputText}
                readOnly
                onScroll={() => handleSyncScroll('output')}
                spellCheck={false}
                placeholder="Converted Venkel IPNs appear here with strict 1:1 line mapping..."
                className="flex-1 w-full p-4 font-mono text-sm leading-6 bg-slate-50/40 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none resize-none overflow-y-auto whitespace-pre"
              />
            </div>
          </div>
        </div>

        {/* Line-by-Line Diagnostic & Breakdown Table */}
        <RowInspectorTable rows={batchResult.rows} />

        {/* Reference Specification & Dictionaries */}
        <DictionaryReference />
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 mt-12">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <span>Venkel IPN Batch Translator · Warehouse Receiving MPN Normalization Utility</span>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleDownloadStandaloneHtml}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Download Offline Single-File index.html
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Download CSV Report
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
