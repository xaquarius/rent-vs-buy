"use client";

import { useMemo, useState } from "react";
import { InputForm } from "@/components/InputForm";
import { ResultsChart } from "@/components/ResultsChart";
import {
  CalculatorInputs,
  DEFAULT_INPUTS,
  calculate,
  findBreakEvenYear,
  formatCurrency,
} from "@/lib/calculator";

export default function Home() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);

  const results = useMemo(() => calculate(inputs), [inputs]);
  const breakEvenYear = useMemo(() => findBreakEvenYear(results), [results]);
  const final = results[results.length - 1];

  const verdict =
    breakEvenYear === null
      ? "Renting wins over your time horizon."
      : `Buying breaks even in year ${breakEvenYear}.`;

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Rent vs. Buy Calculator</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Compares net worth over time: home equity + invested surplus for the buyer vs. an invested
            portfolio for the renter.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          <div className="order-2 lg:order-1">
            <InputForm values={inputs} onChange={setInputs} />
          </div>

          <div className="order-1 lg:order-2 space-y-4">
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <div className="text-sm text-zinc-600 dark:text-zinc-400">Verdict</div>
              <div className="text-lg font-medium mt-1">{verdict}</div>
              <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
                <div>
                  <div className="text-emerald-600 font-medium">Buying — net worth at year {final.year}</div>
                  <div className="text-2xl font-semibold mt-1">{formatCurrency(final.buyingNetWorth)}</div>
                  <div className="text-xs text-zinc-500 mt-1">
                    Home equity after sale: {formatCurrency(final.homeEquityAfterSale)} · investments:{" "}
                    {formatCurrency(final.buyerInvestments)}
                  </div>
                </div>
                <div>
                  <div className="text-sky-600 font-medium">Renting — net worth at year {final.year}</div>
                  <div className="text-2xl font-semibold mt-1">{formatCurrency(final.rentingNetWorth)}</div>
                  <div className="text-xs text-zinc-500 mt-1">Invested portfolio</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <ResultsChart results={results} breakEvenYear={breakEvenYear} />
            </div>
          </div>
        </div>

        <footer className="mt-8 text-xs text-zinc-500 dark:text-zinc-500">
          Notes: assumes a fixed-rate mortgage, both parties invest any monthly surplus at the same return,
          and itemized deductions apply only when they exceed the standard deduction. Set marginal tax rate
          to 0 to ignore tax effects.
        </footer>
      </div>
    </main>
  );
}
