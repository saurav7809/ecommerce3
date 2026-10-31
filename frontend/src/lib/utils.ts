export function formatCurrency(amount: number | null | undefined, currency = 'INR'): string {
  if (amount == null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatEstimatedDelivery(daysMin = 2, daysMax = 5): string {
  const now = new Date();
  const minDate = new Date(now);
  minDate.setDate(now.getDate() + daysMin);
  const maxDate = new Date(now);
  maxDate.setDate(now.getDate() + daysMax);

  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', weekday: 'short' };
  return `${minDate.toLocaleDateString('en-IN', options)} - ${maxDate.toLocaleDateString('en-IN', options)}`;
}

export function calculateSavings(compareAtPrice?: number, price?: number): { amount: number; percentage: number } {
  if (!compareAtPrice || !price || compareAtPrice <= price) {
    return { amount: 0, percentage: 0 };
  }
  const amount = compareAtPrice - price;
  const percentage = Math.round((amount / compareAtPrice) * 100);
  return { amount, percentage };
}

export function clsx(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
