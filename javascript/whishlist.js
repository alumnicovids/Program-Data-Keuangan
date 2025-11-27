import { formatRp, getLS, setLS } from "../javascript/utils.js";
import { els } from "../javascript/dom.js";

export const renderWishlist = () => {
  const w = getLS("wishlists");
  els.wishList.innerHTML =
    w
      .map((i) => {
        const pct = Math.min(100, Math.round((i.collected / i.price) * 100));
        return `
          <li class="whislist-item">
              <div><strong>${i.item}</strong> (${formatRp(
          i.collected
        )} / ${formatRp(i.price)})</div>
              <progress value="${i.collected}" max="${
          i.price
        }"></progress> <span>${pct}%</span>
              <div>
                  <button class="add-progress-btn" data-id="${i.id}">➕</button>
                  <button class="edit-progress-btn" data-id="${
                    i.id
                  }">✏️</button>
                  <button class="del-wish-btn" data-id="${i.id}">🗑️</button>
              </div>
          </li>`;
      })
      .join("") || '<li style="text-align:center">✨ Empty</li>';
};

export const setupWishlistHandlers = () => {
  els.wishBtn.onclick = () => {
    const item = els.wishItem.value;
    const price = parseFloat(els.wishPrice.value);
    if (!item || !price) return alert("⚠️ Please fill all fields");
    const w = getLS("wishlists");
    w.push({ id: Date.now(), item, price, collected: 0 });
    setLS("wishlists", w);
    els.wishItem.value = "";
    els.wishPrice.value = "";
    renderWishlist();
  };

  els.wishList.onclick = (e) => {
    const id = parseInt(e.target.dataset.id);
    const list = getLS("wishlists");
    const item = list.find((i) => i.id === id);

    if (e.target.classList.contains("del-wish-btn")) {
      if (confirm("🚨 Hapus wishlist ini?")) {
        setLS(
          "wishlists",
          list.filter((i) => i.id !== id)
        );
        renderWishlist();
      }
    } else if (e.target.classList.contains("add-progress-btn")) {
      const amt = parseFloat(prompt("💰 Tambahkan dana (Add Progress):"));
      if (amt > 0) {
        item.collected += amt;
        setLS("wishlists", list);
        renderWishlist();
      } else if (amt !== null && !isNaN(amt)) {
        alert("⚠️ Jumlah harus lebih dari nol.");
      }
    } else if (e.target.classList.contains("edit-progress-btn")) {
      const newCollectedStr = prompt(
        `✏️ Edit total dana terkumpul untuk ${item.item}. Saat ini: ${formatRp(
          item.collected
        )}`
      );
      const newCollected = parseFloat(newCollectedStr);

      if (
        newCollectedStr !== null &&
        !isNaN(newCollected) &&
        newCollected >= 0
      ) {
        item.collected = newCollected;
        setLS("wishlists", list);
        renderWishlist();
      } else if (newCollectedStr !== null) {
        alert("⚠️ Masukkan angka nol atau positif yang valid.");
      }
    }
  };
};
