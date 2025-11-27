export const formatRp = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n);

export const getLS = (k) => JSON.parse(localStorage.getItem(k) || "[]");
export const setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

export const typeIcons = {
  Pemasukan: "💰",
  Pengeluaran: "💸",
  "Tarik Tunai": "🏧",
  "E-Wallet": "📱",
};

export const typeMap = {
  income: "Pemasukan",
  expense: "Pengeluaran",
  withdrawal: "Tarik Tunai",
  "e-wallet": "E-Wallet",
};

export const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
