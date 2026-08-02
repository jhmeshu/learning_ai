export const uid = (): string =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const round2 = (n: number): number => Math.round(n * 100) / 100;

export const fmt = (n: number): string =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

export const toLocalISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const todayISO = (): string => toLocalISO(new Date());

export const thisMonthKey = (): string => todayISO().slice(0, 7);

export const monthKey = (date: string): string => date.slice(0, 7);

export const monthLabel = (key: string): string => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });
};

export const prettyDate = (date: string): string => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
