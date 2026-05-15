"use client";

import { CalculatorInputs } from "@/lib/calculator";

type Suffix = "$" | "%" | "yrs";

interface FieldDef {
  key: keyof CalculatorInputs;
  label: string;
  suffix: Suffix;
  step?: number;
  min?: number;
}

interface SectionDef {
  title: string;
  fields: FieldDef[];
}

const SECTIONS: SectionDef[] = [
  {
    title: "Home & Mortgage",
    fields: [
      { key: "homePrice", label: "Home price", suffix: "$", step: 1000 },
      { key: "downPaymentPct", label: "Down payment", suffix: "%", step: 1 },
      { key: "mortgageRatePct", label: "Mortgage rate", suffix: "%", step: 0.125 },
      { key: "mortgageTermYears", label: "Loan term", suffix: "yrs", step: 1 },
      { key: "extraMonthlyPayment", label: "Extra monthly payment", suffix: "$", step: 50 },
    ],
  },
  {
    title: "Costs of Owning",
    fields: [
      { key: "propertyTaxRatePct", label: "Property tax rate", suffix: "%", step: 0.1 },
      { key: "homeInsuranceAnnual", label: "Home insurance / yr", suffix: "$", step: 100 },
      { key: "hoaMonthly", label: "HOA / mo", suffix: "$", step: 25 },
      { key: "maintenanceRatePct", label: "Maintenance / yr", suffix: "%", step: 0.1 },
      { key: "closingCostPct", label: "Closing costs", suffix: "%", step: 0.1 },
      { key: "sellingCostPct", label: "Selling costs", suffix: "%", step: 0.1 },
      { key: "homeAppreciationPct", label: "Home appreciation / yr", suffix: "%", step: 0.1 },
    ],
  },
  {
    title: "Renting",
    fields: [
      { key: "monthlyRent", label: "Monthly rent", suffix: "$", step: 50 },
      { key: "rentGrowthPct", label: "Rent growth / yr", suffix: "%", step: 0.1 },
      { key: "rentersInsuranceAnnual", label: "Renter's insurance / yr", suffix: "$", step: 50 },
    ],
  },
  {
    title: "Tax",
    fields: [
      { key: "marginalTaxRatePct", label: "Marginal tax rate", suffix: "%", step: 1 },
      { key: "standardDeductionAnnual", label: "Standard deduction", suffix: "$", step: 100 },
      { key: "saltCapAnnual", label: "SALT cap", suffix: "$", step: 100 },
    ],
  },
  {
    title: "Horizon",
    fields: [{ key: "timeHorizonYears", label: "Time horizon", suffix: "yrs", step: 1 }],
  },
];

const REFI_FIELDS: FieldDef[] = [
  { key: "refinanceYear", label: "Refinance at year", suffix: "yrs", step: 1 },
  { key: "refinanceRatePct", label: "New rate", suffix: "%", step: 0.125 },
  { key: "refinanceTermYears", label: "New term", suffix: "yrs", step: 1 },
  { key: "refinanceClosingCostPct", label: "Refi closing costs", suffix: "%", step: 0.1 },
];

interface Props {
  values: CalculatorInputs;
  onChange: (next: CalculatorInputs) => void;
}

export function InputForm({ values, onChange }: Props) {
  const update = (key: keyof CalculatorInputs, raw: string) => {
    const num = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(num)) return;
    onChange({ ...values, [key]: num });
  };

  return (
    <div className="space-y-6">
      {SECTIONS.map((section) => (
        <fieldset key={section.title} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
          <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {section.title}
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {section.fields.map((field) => (
              <label key={field.key} className="flex flex-col text-xs gap-1">
                <span className="text-zinc-600 dark:text-zinc-400">{field.label}</span>
                <div className="relative">
                  {field.suffix === "$" && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-500 text-sm pointer-events-none">
                      $
                    </span>
                  )}
                  <input
                    type="number"
                    inputMode="decimal"
                    step={field.step}
                    min={field.min ?? 0}
                    value={(values[field.key] as number) ?? 0}
                    onChange={(e) => update(field.key, e.target.value)}
                    className={`w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      field.suffix === "$" ? "pl-6 pr-9" : "pl-2 pr-9"
                    }`}
                  />
                  {field.suffix !== "$" && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs pointer-events-none">
                      {field.suffix}
                    </span>
                  )}
                </div>
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4">
        <legend className="px-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
          Refinance
        </legend>
        <label className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={values.refinanceEnabled}
            onChange={(e) => onChange({ ...values, refinanceEnabled: e.target.checked })}
            className="rounded border-zinc-300 dark:border-zinc-700 accent-blue-500"
          />
          Model a refinance
        </label>
        {values.refinanceEnabled && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {REFI_FIELDS.map((field) => (
              <label key={field.key} className="flex flex-col text-xs gap-1">
                <span className="text-zinc-600 dark:text-zinc-400">{field.label}</span>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step={field.step}
                    min={0}
                    value={(values[field.key] as number) ?? 0}
                    onChange={(e) => update(field.key, e.target.value)}
                    className="w-full rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 py-1.5 pl-2 pr-9 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 text-xs pointer-events-none">
                    {field.suffix}
                  </span>
                </div>
              </label>
            ))}
          </div>
        )}
      </fieldset>
    </div>
  );
}
