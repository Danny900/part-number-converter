/**
 * Generates a 100% standalone, zero-build single-file index.html application
 * using Vanilla HTML, plain JavaScript, and Tailwind CDN so the user can also
 * save and double-click the file offline/locally in any browser.
 */
export function buildStandaloneHtmlFile(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Venkel IPN Batch Translator — Samsung MLCC to Venkel IPN</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }
        }
      }
    };
  </script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
</head>
<body class="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen font-sans antialiased transition-colors duration-150">
  <header class="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between gap-8">
      <span class="text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0">
        Venkel IPN Translator
      </span>
      <div class="flex items-center gap-3 shrink-0">
        <button id="themeToggleBtn" type="button" class="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0">
          Toggle Dark Mode
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-8 space-y-6">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Samsung MLCC to Venkel IPN Batch Converter
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Strict 1:1 row mapping for warehouse receiving spreadsheets. Blank lines remain blank; unmapped rows output <code class="font-mono text-xs">[INVALID - CHECK MPN]</code>.
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2.5">
        <button id="sampleBtn" type="button" class="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0">
          Load Sample Batch
        </button>
        <button id="clearBtn" type="button" class="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0">
          Clear
        </button>
        <button id="convertBtn" type="button" class="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors whitespace-nowrap shrink-0">
          Convert
        </button>
        <button id="copyBtn" type="button" class="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-white transition-colors whitespace-nowrap shrink-0">
          Copy Output
        </button>
      </div>
    </div>

    <div id="statsBar" class="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400 font-mono">
      <span id="statTotal">Total Rows: 0</span>
      <span>·</span>
      <span id="statValid" class="text-emerald-700 dark:text-emerald-400">Valid IPNs: 0</span>
      <span>·</span>
      <span id="statInvalid" class="text-rose-700 dark:text-rose-400">Invalid MPNs: 0</span>
      <span>·</span>
      <span id="statBlank">Blank Rows: 0</span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div class="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50">
          <label for="mpnInput" class="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Samsung MPN Input (Paste Spreadsheet Column)
          </label>
          <span class="text-xs text-slate-500 dark:text-slate-400 font-mono">1-Indexed Pos 1–10</span>
        </div>
        <textarea
          id="mpnInput"
          rows="18"
          spellcheck="false"
          placeholder="Paste Samsung MLCC part numbers here (one per line)&#10;Example:&#10;CL10A106MQ&#10;CL31A106KAHNNNE"
          class="w-full flex-1 p-4 font-mono text-sm leading-6 bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-y"
        ></textarea>
      </div>

      <div class="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
        <div class="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/50">
          <label for="ipnOutput" class="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Venkel IPN Output (Read-Only · 1:1 Line Alignment)
          </label>
          <span id="copyStatus" class="text-xs text-blue-600 dark:text-blue-400 font-medium">Ready</span>
        </div>
        <textarea
          id="ipnOutput"
          rows="18"
          readonly
          spellcheck="false"
          placeholder="Converted Venkel IPNs will appear here with strict 1:1 row alignment..."
          class="w-full flex-1 p-4 font-mono text-sm leading-6 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none resize-y"
        ></textarea>
      </div>
    </div>
  </main>

  <script>
    const SIZE_MAP = {
      "2": "01005", "02": "01005",
      "3": "0201",  "03": "0201",
      "5": "0402",  "05": "0402",
      "10": "0603",
      "21": "0805",
      "31": "1206",
      "32": "1210",
      "42": "1808",
      "43": "1812",
      "55": "2220"
    };

    const DIELECTRIC_MAP = {
      "C": "C0G",
      "A": "X5R",
      "B": "X7R",
      "X": "X6S",
      "F": "Y5V",
      "Y": "X7S",
      "Z": "X7T"
    };

    const VOLTAGE_MAP = {
      "R": "4R0",
      "Q": "6R3",
      "P": "100",
      "O": "160",
      "A": "250",
      "L": "350",
      "B": "500",
      "C": "101",
      "D": "201",
      "E": "251",
      "G": "501",
      "H": "631"
    };

    const INVALID_TOKEN = "[INVALID - CHECK MPN]";
    const INVALID_TAPE_TOKEN = "[INVALID TAPE CODE]";

    function translateSamsungToVenkel(rawLine, strictTapeValidation = false) {
      const trimmed = rawLine.trim();
      if (trimmed === "") return { output: "", status: "blank" };

      const str = trimmed.toUpperCase();
      if (!str.startsWith("CL")) return { output: INVALID_TOKEN, status: "invalid" };

      const twoCharSize = str.slice(2, 4);
      const oneCharSize = str.slice(2, 3);
      let venkelSize = "";
      let offset = 4;

      if (twoCharSize.length === 2 && SIZE_MAP[twoCharSize]) {
        venkelSize = SIZE_MAP[twoCharSize];
        offset = 4;
      } else if ((oneCharSize === "2" || oneCharSize === "3" || oneCharSize === "5") && SIZE_MAP[oneCharSize]) {
        venkelSize = SIZE_MAP[oneCharSize];
        offset = 3;
      } else {
        return { output: INVALID_TOKEN, status: "invalid" };
      }

      if (str.length < offset + 6) {
        return { output: INVALID_TOKEN, status: "invalid" };
      }

      const dielectricCode = str.slice(offset, offset + 1);
      const valueCode = str.slice(offset + 1, offset + 4);
      const toleranceCode = str.slice(offset + 4, offset + 5);
      const voltageCode = str.slice(offset + 5, offset + 6);

      const venkelDielectric = DIELECTRIC_MAP[dielectricCode];
      const venkelVoltage = VOLTAGE_MAP[voltageCode];

      if (!venkelDielectric || !venkelVoltage) {
        return { output: INVALID_TOKEN, status: "invalid" };
      }

      if (!/^[0-9R]{3}$/.test(valueCode) || !/^[A-Z]$/.test(toleranceCode)) {
        return { output: INVALID_TOKEN, status: "invalid" };
      }

      // Dynamic Taping/Packaging Suffix Evaluation:
      // Isolate the very last character of the input Samsung MPN
      const lastChar = str.charAt(str.length - 1);
      let venkelSuffix = "NE";
      if (lastChar === "E") {
        venkelSuffix = "NE";
      } else if (lastChar === "C") {
        venkelSuffix = "NP";
      } else if (strictTapeValidation) {
        return { output: INVALID_TAPE_TOKEN, status: "invalid" };
      } else {
        venkelSuffix = "NE";
      }

      return {
        output: "C" + venkelSize + venkelDielectric + venkelVoltage + "-" + valueCode + toleranceCode + venkelSuffix,
        status: "valid"
      };
    }

    const inputEl = document.getElementById("mpnInput");
    const outputEl = document.getElementById("ipnOutput");
    const convertBtn = document.getElementById("convertBtn");
    const copyBtn = document.getElementById("copyBtn");
    const sampleBtn = document.getElementById("sampleBtn");
    const clearBtn = document.getElementById("clearBtn");
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const copyStatus = document.getElementById("copyStatus");

    function runBatchConversion() {
      const normalized = inputEl.value.replace(/\\r\\n/g, "\\n").replace(/\\r/g, "\\n");
      const lines = normalized.split("\\n");
      let valid = 0, invalid = 0, blank = 0;

      const results = lines.map((line) => {
        const res = translateSamsungToVenkel(line);
        if (res.status === "valid") valid++;
        else if (res.status === "invalid") invalid++;
        else blank++;
        return res.output;
      });

      outputEl.value = results.join("\\n");
      document.getElementById("statTotal").textContent = "Total Rows: " + lines.length;
      document.getElementById("statValid").textContent = "Valid IPNs: " + valid;
      document.getElementById("statInvalid").textContent = "Invalid MPNs: " + invalid;
      document.getElementById("statBlank").textContent = "Blank Rows: " + blank;
    }

    convertBtn.addEventListener("click", runBatchConversion);

    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(outputEl.value);
        copyStatus.textContent = "Copied to clipboard";
        setTimeout(() => { copyStatus.textContent = "Ready"; }, 2000);
      } catch (e) {
        outputEl.select();
        document.execCommand("copy");
        copyStatus.textContent = "Copied to clipboard";
      }
    });

    sampleBtn.addEventListener("click", () => {
      inputEl.value = [
        "CL10A106MQ",
        "CL31A106KPHNNNE",
        "CL31A106KAHNNNE",
        "CL05B104KO5NNNC",
        "",
        "CL21B105KBFNNNE",
        "CL99Z999XX",
        "CL03C101JB3NNNC"
      ].join("\\n");
      runBatchConversion();
    });

    clearBtn.addEventListener("click", () => {
      inputEl.value = "";
      outputEl.value = "";
      runBatchConversion();
    });

    themeToggleBtn.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
    });
  </script>
</body>
</html>`;
}
