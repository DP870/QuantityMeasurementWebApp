import { getUnits } from "./api.js";
import { populateDropdowns, toggleOperators, renderHistory } from "./ui.js";

// ------------------------------------------------------
// GLOBAL STATE
// ------------------------------------------------------
const state = {
    type: "Length",
    action: "Conversion",
    fromVal: null,
    fromUnit: "",
    toVal: null,
    toUnit: "",
    operator: "+"
};


// ------------------------------------------------------
// APP INITIALISATION (UC‑JS‑02/03/04)
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    console.log("App Loaded.");

    attachEventListeners();

    await loadUnits("length"); // default category

    // Set first type card active
    const typeCards = document.querySelectorAll(".unit-box");
    if (typeCards.length) typeCards[0].classList.add("active");

    // Set Conversion button active
    const modeButtons = document.querySelectorAll(".mode-btn");
    if (modeButtons.length) modeButtons[1].classList.add("active");

    toggleOperators(false);

    await loadHistory();
});


// ------------------------------------------------------
// LOAD UNITS for a type (UC‑JS‑03)
// ------------------------------------------------------
async function loadUnits(type) {
    const units = await getUnits(type);

    if (!units) {
        console.error("Could not load units");
        return;
    }

    populateDropdowns(units);
}


// ------------------------------------------------------
// HISTORY LOADER (UC‑JS‑07 later)
// ------------------------------------------------------
async function loadHistory() {
    renderHistory([]); // placeholder
}


// ------------------------------------------------------
// EVENT LISTENERS
// ------------------------------------------------------
function attachEventListeners() {

    // TYPE CARDS
    const typeCards = document.querySelectorAll(".unit-box");
    typeCards.forEach(card => {
        card.addEventListener("click", async () => {
            const selected = card.querySelector(".box-label").textContent.trim().toLowerCase();
            state.type = selected;

            typeCards.forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            await loadUnits(selected);
        });
    });

    // ACTION BUTTONS (Comparison, Conversion, Arithmetic)
    const buttons = document.querySelectorAll(".mode-btn");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.textContent.trim();
            state.action = action;

            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            toggleOperators(action === "Arithmetic");
        });
    });

    // INPUT FIELDS
    const inputs = document.querySelectorAll(".value-input");
    inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
            if (index === 0) state.fromVal = Number(input.value);
        });
    });

    // DROPDOWNS
    const selects = document.querySelectorAll(".unit-select");
    selects.forEach((select, index) => {
        select.addEventListener("change", () => {
            if (index === 0) state.fromUnit = select.value;
            if (index === 1) state.toUnit = select.value;
        });
    });
}