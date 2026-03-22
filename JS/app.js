// ---------------------------
// Global State Object
// ---------------------------
const state = {
    type: "Length",
    action: "Conversion",
    fromVal: null,
    fromUnit: "",
    toVal: null,
    toUnit: "",
    operator: "+"
};

document.addEventListener("DOMContentLoaded", async () => {
    console.log("App Loaded.");

    // --- 1. Attach all event listeners ---
    attachEventListeners();

    // --- 2. Load default units (Length) into both dropdowns ---
    await loadUnits("length");   // our DB uses lowercase "length"

    // --- 3. Set FIRST Type Card as active ---
    const typeCards = document.querySelectorAll(".unit-box");
    if (typeCards.length > 0) typeCards[0].classList.add("active");

    // --- 4. Set FIRST Action Button as active ---
    const modeButtons = document.querySelectorAll(".mode-btn");
    if (modeButtons.length > 0) modeButtons[1].classList.add("active");  
    // (Comparison = index 0, Conversion = index 1, Arithmetic = index 2)

    // --- 5. Hide operator row at start (Conversion mode) ---
    toggleOperators(false);

    // --- 6. Load History from backend ---
    await loadHistory();
});