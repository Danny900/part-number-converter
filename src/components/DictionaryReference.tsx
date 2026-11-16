import {
  DISPLAY_SIZE_DICTIONARY,
  DIELECTRIC_DICTIONARY,
  VOLTAGE_DICTIONARY,
  VOLTAGE_LABELS,
} from '../utils/translator';

export function DictionaryReference() {
  return (
    <section id="dictionaries" className="space-y-8 pt-6 border-t border-slate-200 dark:border-slate-800">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Samsung to Venkel Translation Specification
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Deterministic character-position mapping table used by the warehouse receiving engine. The final character of the Samsung MPN dynamically determines the Venkel packaging suffix (<code className="font-mono font-semibold text-slate-900 dark:text-slate-100">E → NE</code>, <code className="font-mono font-semibold text-slate-900 dark:text-slate-100">C → NP</code>, otherwise defaults to <code className="font-mono font-semibold text-slate-900 dark:text-slate-100">NE</code> or flags <code className="font-mono font-semibold text-rose-600 dark:text-rose-400">[INVALID TAPE CODE]</code> in strict mode).
          </p>
        </div>
        <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
          Format: <span className="text-slate-900 dark:text-slate-100 font-semibold">[Prefix][Size][Dielectric][Voltage]-[Value][Tolerance][Suffix]</span>
        </div>
      </div>

      {/* Character Anatomy Strip */}
      <div id="anatomy" className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            1-Indexed Character Position Anatomy
          </h3>
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Examples: <span className="text-slate-900 dark:text-slate-200 font-semibold">CL05B104KO5NNNC</span> → <span className="text-blue-600 dark:text-blue-400 font-semibold">C0402X7R160-104KNP</span> · <span className="text-slate-900 dark:text-slate-200 font-semibold">CL31A106KPHNNNE</span> → <span className="text-blue-600 dark:text-blue-400 font-semibold">C1206X5R100-106KNE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 font-mono">
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Chars 1–2 · Type</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">CL → C</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">MLCC Prefix</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Chars 3–4 · Size</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">05 → 0402</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">EIA Package</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Char 5 · Dielectric</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">B → X7R</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">Temp Coeff</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Chars 6–8 · Value</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">104 → 104</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">Direct Copy (0.1µF)</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Char 9 · Tolerance</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">K → K</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">Direct Copy (±10%)</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Char 10 · Voltage</div>
            <div className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">O → 160</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">Placed Before Hyphen</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400">Final Char · Tape</div>
            <div className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">E→NE · C→NP</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1 font-sans">Other → NE (Default)</div>
          </div>
        </div>
      </div>

      {/* Three Dictionary Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Size Dictionary */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Characters 3–4: Size Dictionary
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">10 Codes</span>
          </div>
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/50">
                <th className="py-2.5 px-4 font-medium">Samsung</th>
                <th className="py-2.5 px-4 font-medium">Venkel EIA</th>
                <th className="py-2.5 px-4 font-medium text-right font-sans">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {DISPLAY_SIZE_DICTIONARY.map((row) => (
                <tr key={row.samsung} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-4 font-semibold text-slate-900 dark:text-slate-100">{row.samsung}</td>
                  <td className="py-2 px-4 text-blue-600 dark:text-blue-400 font-semibold">{row.venkel}</td>
                  <td className="py-2 px-4 text-right text-slate-500 dark:text-slate-400 font-sans">{row.metric}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dielectric Dictionary */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Character 5: Dielectric Dictionary
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">7 Codes</span>
          </div>
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/50">
                <th className="py-2.5 px-4 font-medium">Samsung</th>
                <th className="py-2.5 px-4 font-medium text-right">Venkel Dielectric</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {Object.entries(DIELECTRIC_DICTIONARY).map(([sam, ven]) => (
                <tr key={sam} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-4 font-semibold text-slate-900 dark:text-slate-100">{sam}</td>
                  <td className="py-2 px-4 text-right text-blue-600 dark:text-blue-400 font-semibold">{ven}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Voltage Dictionary */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              Character 10: Voltage Dictionary
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">12 Codes</span>
          </div>
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-950/50">
                <th className="py-2.5 px-4 font-medium">Samsung</th>
                <th className="py-2.5 px-4 font-medium">Venkel Code</th>
                <th className="py-2.5 px-4 font-medium text-right font-sans">Rated Voltage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/70">
              {Object.entries(VOLTAGE_DICTIONARY).map(([sam, ven]) => (
                <tr key={sam} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2 px-4 font-semibold text-slate-900 dark:text-slate-100">{sam}</td>
                  <td className="py-2 px-4 text-blue-600 dark:text-blue-400 font-semibold">{ven}</td>
                  <td className="py-2 px-4 text-right text-slate-500 dark:text-slate-400 font-sans">
                    {VOLTAGE_LABELS[sam]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
