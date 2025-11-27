export const els = {
  themeBtn: document.querySelector(".theme-toggle"),
  navLinks: document.querySelectorAll(".side-nav a"),
  cards: document.querySelectorAll("main section"),
  form: document.getElementById("input-form"),
  search: document.getElementById("search-data"),
  list: document.getElementById("transaction-list"),
  wishList: document.getElementById("whislist-list"),
  selMonth: document.getElementById("select-month"),
  selYear: document.getElementById("select-year"),
  chartCtx: document.getElementById("financial-chart"),
  wishBtn: document.getElementById("add-wish-btn"),
  wishItem: document.getElementById("wish-item"),
  wishPrice: document.getElementById("wish-price"),
  submitBtn: document
    .getElementById("input-form")
    .querySelector('button[type="submit"]'),
};

let chartInstance = null;
export const getChartInstance = () => chartInstance;
export const setChartInstance = (instance) => {
  chartInstance = instance;
};
