"use client";

export interface AssetClass {
  label: string;
  allocationPct: number;
  returnPct: number;
}

export const DEFAULT_PORTFOLIO: AssetClass[] = [
  { label: "US Stocks", allocationPct: 60, returnPct: 10 },
  { label: "Intl Stocks", allocationPct: 20, returnPct: 8 },
  { label: "Bonds", allocationPct: 15, returnPct: 4 },
  { label: "Cash", allocationPct: 5, returnPct: 2 },
];

export function blendedReturn(assets: AssetClass[]): number {
  const total = assets.reduce((s, a) => s + a.allocationPct, 0);
  if (total === 0) return 0;
  return assets.reduce((s, a) => s + (a.allocationPct / total) * a.returnPct, 0);
}

interface Props {
  assets: AssetClass[];
  onChange: (next: AssetClass[]) => void;
}

export function PortfolioMix({ assets, onChange }: Props) {
  const totalAlloc = assets.reduce((s, a) => s + a.allocationPct, 0);
  const blended = blendedReturn(assets);
  const allocOk = Math.abs(totalAlloc - 100) < 0.01;

  const update = (i: number, field: keyof AssetClass, raw: string) => {
    onChange(
      assets.map((a, j) => {
        if (j !== i) return a;
        if (field === "label") return { ...a, label: raw };
        const num = raw === "" ? 0 : Number(raw);
        if (Number.isNaN(num)) return a;
        return { ...a, [field]: num };
      })
    );
  };

  const remove = (i: number) => onChange(assets.filter((_, j) => j !== i));

  const add = () =>
    onChange([...assets, { label: "Custom", allocationPct: 0, returnPct: 7 }]);

  return (
    <fieldset className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
      <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        Investment Portfolio
      </legend>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="text-left font-medium pb-2 pr-2">Asset class</th>
              <th className="text-right font-medium pb-2 px-2 w-20">Alloc %</th>
              <th className="text-right font-medium pb-2 px-2 w-20">Return %</th>
              <th className="pb-2 w-5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {assets.map((asset, i) => (
              <tr key={i}>
                <td className="py-1.5 pr-2">
                  <input
                    type="text"
                    value={asset.label}
                    onChange={(e) => update(i, "label", e.target.value)}
                    className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </td>
                <td className="py-1.5 px-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={asset.allocationPct ?? 0}
                    onChange={(e) => update(i, "allocationPct", e.target.value)}
                    className="w-full text-right rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-1.5 px-2">
                  <input
                    type="number"
                    min={-100}
                    max={100}
                    step={0.1}
                    value={asset.returnPct ?? 0}
                    onChange={(e) => update(i, "returnPct", e.target.value)}
                    className="w-full text-right rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-1.5 py-1 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </td>
                <td className="py-1.5 pl-1 text-center">
                  {assets.length > 1 && (
                    <button
                      onClick={() => remove(i)}
                      className="text-zinc-400 hover:text-red-500 transition-colors text-base leading-none"
                      aria-label="Remove"
                    >
                      ×
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t border-zinc-200 dark:border-zinc-700">
              <td className="pt-2 text-zinc-500 dark:text-zinc-400">Total</td>
              <td
                className={`pt-2 px-2 text-right font-medium ${
                  allocOk ? "text-zinc-700 dark:text-zinc-300" : "text-red-500"
                }`}
              >
                {totalAlloc.toFixed(1)}%
              </td>
              <td className="pt-2 px-2 text-right font-medium text-zinc-700 dark:text-zinc-300">
                {blended.toFixed(2)}%
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {!allocOk && (
        <p className="mt-2 text-xs text-red-500">
          Allocations must sum to 100% (currently {totalAlloc.toFixed(1)}%)
        </p>
      )}

      <div className="mt-3 flex items-center justify-between">
        <button
          onClick={add}
          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
        >
          + Add asset class
        </button>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          Blended return:{" "}
          <span className="font-medium text-zinc-800 dark:text-zinc-200">
            {blended.toFixed(2)}%
          </span>
        </div>
      </div>
    </fieldset>
  );
}
