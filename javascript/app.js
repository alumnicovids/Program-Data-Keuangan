import { els } from "../javascript/dom.js";
import { initThemeToggle } from "../javascript/theme.js";
import {
  populateDates,
  renderList,
  updateSummary,
  setupTransactionForm,
  setupTransactionListHandlers,
} from "../javascript/transaction.js";
import {
  renderWishlist,
  setupWishlistHandlers,
} from "../javascript/whishlist.js";

const renderAll = () => {
  renderList(els.search.value);
  updateSummary();
  renderWishlist();
};

const init = () => {
  initThemeToggle();
  populateDates();
  renderAll();

  setupTransactionForm(renderAll);
  setupTransactionListHandlers(renderAll);
  setupWishlistHandlers();

  els.search.oninput = () => renderList(els.search.value);
  els.selMonth.onchange = updateSummary;
  els.selYear.onchange = updateSummary;

  els.navLinks.forEach(
    (l) =>
      (l.onclick = (e) => {
        e.preventDefault();
        const id = l.getAttribute("href");
        els.cards.forEach((c) => c.classList.remove("active-card"));
        document.querySelector(id).classList.add("active-card");
        els.navLinks.forEach((n) => n.classList.remove("active-link"));
        l.classList.add("active-link");
        if (id === "#manage-card") updateSummary();
      })
  );
};

document.addEventListener("DOMContentLoaded", init);
