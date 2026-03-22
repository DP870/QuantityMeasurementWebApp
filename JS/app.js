import { getUnits, saveHistory, getHistory } from "./api.js";
import { populateDropdowns, toggleOperators, renderHistory } from "./ui.js";
import { convert } from "./conversion.js";

// ------------------------------------------------------
// 1. GLOBAL STATE & GLOBALS
// ------------------------------------------------------
const state = {
    type: "length",
    action: "Conversion",
    fromVal: 0,
    fromUnit: "",
    toUnit: "",
    unitsData: []
};

let debounceTimer; // Prevents database overload and page lag

// ------------------------------------------------------
// 2. INITIALIZATION
// ------------------------------------------------------
document.addEventListener("DOMContentLoaded", async () => {
    console.log("App Initialized.");

    // Set initial UI active states
    const typeCards = document.querySelectorAll(".unit-box");
    const modeButtons = document.querySelectorAll(".mode-btn");
    
    if (typeCards.length) typeCards[0].classList.add("active");
    if (modeButtons.length) modeButtons[1].classList.add("active");

    // Load initial data
    await loadUnits(state.type);
    await loadHistory();
    
    attachEventListeners();
});

// ------------------------------------------------------
// 3. DATA LOADERS
// ------------------------------------------------------
async function loadUnits(type) {
    const units = await getUnits(type.toLowerCase());
    if (units && units.length > 0) {
        state.unitsData = units;
        state.fromUnit = units[0].symbol;
        state.toUnit = units[0].symbol;
        
        populateDropdowns(units);
        performCalculation(); // Update UI with default units
    }
}

async function loadHistory() {
    const historyData = await getHistory();
    renderHistory(historyData);
}

// ------------------------------------------------------
// 4. LOGIC ENGINE
// ------------------------------------------------------

// Updates the "TO" input field instantly (No database work here)
function performCalculation() {
    const outputField = document.getElementById("input-to");
    
    const unitFrom = state.unitsData.find(u => u.symbol === state.fromUnit);
    const unitTo = state.unitsData.find(u => u.symbol === state.toUnit);

    if (unitFrom && unitTo) {
        const result = convert(state.fromVal, unitFrom, unitTo);
        outputField.value = result;
    }
}

// Handles saving to db.json in the background
async function handleHistorySaving() {
    // Don't save empty/zero calculations to history
    if (state.fromVal === 0) return;

    const record = {
        type: state.type,
        action: state.action,
        expression: `${state.fromVal} ${state.fromUnit} to ${state.toUnit}`,
        result: document.getElementById("input-to").value,
        timestamp: new Date().toISOString()
    };

    try {
        await saveHistory(record);
        const updatedHistory = await getHistory();
        renderHistory(updatedHistory);
    } catch (error) {
        console.error("Non-critical history save failed:", error);
    }
}

// ------------------------------------------------------
// 5. EVENT LISTENERS
// ------------------------------------------------------
function attachEventListeners() {
    // A. Type Cards (Length, Weight, etc.)
    document.querySelectorAll(".unit-box").forEach(card => {
        card.addEventListener("click", async () => {
            const selected = card.getAttribute("data-type") || card.querySelector(".box-label").textContent.trim().toLowerCase();
            state.type = selected;

            document.querySelectorAll(".unit-box").forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            await loadUnits(selected);
        });
    });

    // B. Mode Buttons
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            state.action = btn.textContent.trim();
            document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            toggleOperators(state.action === "Arithmetic");
        });
    });

    // C. Value Input (Anti-Reset & Anti-Reload Logic)
    const fromInput = document.getElementById("input-from");
    fromInput.addEventListener("input", (e) => {
        const val = e.target.value;

        if (val === "") {
            state.fromVal = 0;
            document.getElementById("input-to").value = 0;
            return; // Stops the cursor from jumping
        }

        state.fromVal = Number(val);
        
        // 1. Update math UI instantly
        performCalculation();

        // 2. Debounce history saving (waits for typing to stop)
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleHistorySaving();
        }, 500); 
    });

    // D. Dropdowns
    document.getElementById("select-from").addEventListener("change", (e) => {
        state.fromUnit = e.target.value;
        performCalculation();
        handleHistorySaving(); // Save immediately on dropdown change
    });

    document.getElementById("select-to").addEventListener("change", (e) => {
        state.toUnit = e.target.value;
        performCalculation();
        handleHistorySaving();
    });
}