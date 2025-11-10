export function ceilToFraction(value: number, fraction: number): number {
  if (fraction <= 0) {
    throw new Error("Fraction must be greater than 0");
  }
  const multiplier = 1 / fraction;
  return Math.ceil(value * multiplier) / multiplier;
}

// Examples:
// console.log(ceilToFraction(0.2, 0.5));   // 0.5
// console.log(ceilToFraction(0.4, 0.5));   // 0.5
// console.log(ceilToFraction(0.5, 0.5));   // 0.5
// console.log(ceilToFraction(0.6, 0.5));   // 1
// console.log(ceilToFraction(0.99, 0.5));  // 1
// console.log(ceilToFraction(1.004, 0.5)); // 1.5
