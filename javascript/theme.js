import { els } from "../javascript/dom.js";

export const initThemeToggle = () => {
  const theme = localStorage.getItem("theme") || "night";
  document.body.className = theme;
  els.themeBtn.textContent =
    theme === "pink" ? "🌸 Pink Theme" : "🌙 Night Theme";

  els.themeBtn.onclick = () => {
    const newTheme = document.body.classList.contains("pink")
      ? "night"
      : "pink";
    document.body.className = newTheme;
    localStorage.setItem("theme", newTheme);
    els.themeBtn.textContent =
      newTheme === "pink" ? "🌸 Pink Theme" : "🌙 Night Theme";
  };
};
