export interface CalculatorInputs {
  homePrice: number;
  downPaymentPct: number;
  mortgageRatePct: number;
  mortgageTermYears: number;

  propertyTaxRatePct: number;
  homeInsuranceAnnual: number;
  hoaMonthly: number;
  maintenanceRatePct: number;
  closingCostPct: number;
  sellingCostPct: number;
  homeAppreciationPct: number;

  monthlyRent: number;
  rentGrowthPct: number;
  rentersInsuranceAnnual: number;

  investmentReturnPct: number;
  marginalTaxRatePct: number;
  standardDeductionAnnual: number;
  saltCapAnnual: number;

  timeHorizonYears: number;
}

export interface YearResult {
  year: number;
  homeValue: number;
  mortgageBalance: number;
  homeEquityAfterSale: number;
  buyerInvestments: number;
  renterInvestments: number;
  buyingNetWorth: number;
  rentingNetWorth: number;
  cumulativeBuyCost: number;
  cumulativeRentCost: number;
  monthlyBuyCost: number;
  monthlyRentCost: number;
}

export const DEFAULT_INPUTS: CalculatorInputs = {
  homePrice: 600_000,
  downPaymentPct: 20,
  mortgageRatePct: 6.5,
  mortgageTermYears: 30,

  propertyTaxRatePct: 1.2,
  homeInsuranceAnnual: 1_500,
  hoaMonthly: 0,
  maintenanceRatePct: 1.0,
  closingCostPct: 3,
  sellingCostPct: 6,
  homeAppreciationPct: 3,

  monthlyRent: 2_800,
  rentGrowthPct: 3,
  rentersInsuranceAnnual: 200,

  investmentReturnPct: 7,
  marginalTaxRatePct: 24,
  standardDeductionAnnual: 29_200,
  saltCapAnnual: 10_000,

  timeHorizonYears: 30,
};

export function calculate(inputs: CalculatorInputs): YearResult[] {
  const downPayment = inputs.homePrice * (inputs.downPaymentPct / 100);
  const loanAmount = inputs.homePrice - downPayment;
  const closingCosts = inputs.homePrice * (inputs.closingCostPct / 100);

  const monthlyRate = inputs.mortgageRatePct / 100 / 12;
  const totalPayments = inputs.mortgageTermYears * 12;
  const monthlyPI =
    monthlyRate === 0
      ? loanAmount / totalPayments
      : (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);

  const monthlyAppreciation = Math.pow(1 + inputs.homeAppreciationPct / 100, 1 / 12) - 1;
  const monthlyRentGrowth = Math.pow(1 + inputs.rentGrowthPct / 100, 1 / 12) - 1;
  const monthlyReturn = Math.pow(1 + inputs.investmentReturnPct / 100, 1 / 12) - 1;

  let homeValue = inputs.homePrice;
  let mortgageBalance = loanAmount;
  let currentRent = inputs.monthlyRent;

  // Both parties start with the same cash: downPayment + closingCosts.
  // Buyer spends it (downPayment becomes equity; closingCosts is gone).
  // Renter invests it at the market return.
  let renterInvestments = downPayment + closingCosts;
  let buyerInvestments = 0;

  let cumulativeBuyCost = downPayment + closingCosts;
  let cumulativeRentCost = 0;

  const results: YearResult[] = [];

  const sellCostNow = homeValue * (inputs.sellingCostPct / 100);
  results.push({
    year: 0,
    homeValue,
    mortgageBalance,
    homeEquityAfterSale: homeValue - mortgageBalance - sellCostNow,
    buyerInvestments: 0,
    renterInvestments,
    buyingNetWorth: homeValue - mortgageBalance - sellCostNow,
    rentingNetWorth: renterInvestments,
    cumulativeBuyCost,
    cumulativeRentCost,
    monthlyBuyCost: 0,
    monthlyRentCost: 0,
  });

  for (let year = 1; year <= inputs.timeHorizonYears; year++) {
    let yearBuyCost = 0;
    let yearRentCost = 0;
    let yearMortgageInterest = 0;
    let yearPropertyTax = 0;
    let lastMonthBuyCost = 0;
    let lastMonthRentCost = 0;

    for (let m = 0; m < 12; m++) {
      let monthlyInterest = 0;
      let monthlyPrincipal = 0;
      let monthlyMortgagePayment = 0;
      if (mortgageBalance > 0) {
        monthlyInterest = mortgageBalance * monthlyRate;
        monthlyPrincipal = Math.min(monthlyPI - monthlyInterest, mortgageBalance);
        monthlyMortgagePayment = monthlyInterest + monthlyPrincipal;
        mortgageBalance -= monthlyPrincipal;
      }
      yearMortgageInterest += monthlyInterest;

      const monthlyPropertyTax = (homeValue * (inputs.propertyTaxRatePct / 100)) / 12;
      const monthlyInsurance = inputs.homeInsuranceAnnual / 12;
      const monthlyMaintenance = (homeValue * (inputs.maintenanceRatePct / 100)) / 12;
      yearPropertyTax += monthlyPropertyTax;

      const monthlyBuyCost =
        monthlyMortgagePayment +
        monthlyPropertyTax +
        monthlyInsurance +
        inputs.hoaMonthly +
        monthlyMaintenance;

      const monthlyRentersIns = inputs.rentersInsuranceAnnual / 12;
      const monthlyRentCost = currentRent + monthlyRentersIns;

      yearBuyCost += monthlyBuyCost;
      yearRentCost += monthlyRentCost;
      lastMonthBuyCost = monthlyBuyCost;
      lastMonthRentCost = monthlyRentCost;

      // Whichever party pays less invests the difference at the market return.
      const delta = monthlyBuyCost - monthlyRentCost;
      if (delta > 0) {
        renterInvestments += delta;
      } else if (delta < 0) {
        buyerInvestments += -delta;
      }

      renterInvestments *= 1 + monthlyReturn;
      buyerInvestments *= 1 + monthlyReturn;

      homeValue *= 1 + monthlyAppreciation;
      currentRent *= 1 + monthlyRentGrowth;
    }

    // Annual itemized-deduction benefit. Set marginalTaxRatePct to 0 to disable.
    const cappedPropertyTax = Math.min(yearPropertyTax, inputs.saltCapAnnual);
    const itemizedDeduction = yearMortgageInterest + cappedPropertyTax;
    const taxableDeduction = Math.max(0, itemizedDeduction - inputs.standardDeductionAnnual);
    const taxBenefit = taxableDeduction * (inputs.marginalTaxRatePct / 100);

    buyerInvestments += taxBenefit;
    yearBuyCost -= taxBenefit;

    cumulativeBuyCost += yearBuyCost;
    cumulativeRentCost += yearRentCost;

    const sellCost = homeValue * (inputs.sellingCostPct / 100);
    const homeEquityAfterSale = homeValue - mortgageBalance - sellCost;

    results.push({
      year,
      homeValue,
      mortgageBalance,
      homeEquityAfterSale,
      buyerInvestments,
      renterInvestments,
      buyingNetWorth: homeEquityAfterSale + buyerInvestments,
      rentingNetWorth: renterInvestments,
      cumulativeBuyCost,
      cumulativeRentCost,
      monthlyBuyCost: lastMonthBuyCost,
      monthlyRentCost: lastMonthRentCost,
    });
  }

  return results;
}

export function findBreakEvenYear(results: YearResult[]): number | null {
  for (const r of results) {
    if (r.year === 0) continue;
    if (r.buyingNetWorth >= r.rentingNetWorth) return r.year;
  }
  return null;
}

export function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}
