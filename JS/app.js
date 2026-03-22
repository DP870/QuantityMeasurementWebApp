import { getUnits,saveHistory } from "./api.js";
import { populateDropdowns, toggleOperators, renderHistory } from "./ui.js";

import { convert } from "./conversion.js"; // We will add the conversion logic here

// ------------------------------------------------------
// GLOBAL STATE
// ------------------------------------------------------
const state = {
    type: "length",
    action: "Conversion",
    fromVal: 0,
    fromUnit: "",
    toUnit: "",
    unitsData: [] // Store current units for quick math access
};

// ------------------------------------------------------
// APP INITIALISATION
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    console.log("App Initialized.");

    // 1. Set default UI states
    const typeCards = document.querySelectorAll(".unit-box");
    const modeButtons = document.querySelectorAll(".mode-btn");
    
    if (typeCards.length) typeCards[0].classList.add("active");
    if (modeButtons.length) modeButtons[1].classList.add("active");

    // 2. Load initial data
    await loadUnits(state.type);
    
    // 3. Start listening for user interaction
    attachEventListeners();
});

// ------------------------------------------------------
// LOAD UNITS (Fetches from db.json via api.js)
// ------------------------------------------------------
async function loadUnits(type) {
    const units = await getUnits(type.toLowerCase());
    if (units && units.length > 0) {
        state.unitsData = units; // Save to state for math logic
        state.fromUnit = units[0].symbol;
        state.toUnit = units[0].symbol;
        
        populateDropdowns(units);
        performCalculation(); // Reset calc with new units
    }
}


// ------------------------------------------------------
// EVENT LISTENERS
// ------------------------------------------------------
function attachEventListeners() {
    // 1. TYPE CARDS (Length, Weight, etc.)
    document.querySelectorAll(".unit-box").forEach(card => {
        card.addEventListener("click", async () => {
            const selected = card.querySelector(".box-label").textContent.trim().toLowerCase();
            state.type = selected;

            document.querySelectorAll(".unit-box").forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            await loadUnits(selected);
        });
    });

    // 2. ACTION BUTTONS (Comparison, Conversion, Arithmetic)
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const action = btn.textContent.trim();
            state.action = action;

            document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            toggleOperators(action === "Arithmetic");
        });
    });

    // 3. INPUT FIELD (Left side)
    const fromInput = document.querySelector(".value-input:not([readonly])");
    fromInput.addEventListener("input", (e) => {
        state.fromVal = Number(e.target.value) || 0;
        performCalculation();
    });

    // 4. DROPDOWNS
    const selects = document.querySelectorAll(".unit-select");
    selects[0].addEventListener("change", (e) => {
        state.fromUnit = e.target.value;
        performCalculation();
    });
    selects[1].addEventListener("change", (e) => {
        state.toUnit = e.target.value;
        performCalculation();
    });
}

function performCalculation() {
    // If data hasn't loaded yet, stop the function
    if (!state.unitsData || state.unitsData.length === 0 || !state.fromUnit) {
        return; 
    }

    const unitFrom = state.unitsData.find(u => u.symbol === state.fromUnit);
    const unitTo = state.unitsData.find(u => u.symbol === state.toUnit);

    // Ensure BOTH units were found before doing math
    if (unitFrom && unitTo) {
        const result = convert(state.fromVal, unitFrom, unitTo);
        document.getElementById("input-to").value = result;
    }
}