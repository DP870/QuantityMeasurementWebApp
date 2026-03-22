import { getUnits, saveHistory, getHistory, getConversions } from "./api.js";
import { populateDropdown, renderHistory, toggleOperators } from "./ui.js";
import { convert, compareValues, applyConversion, performArithmetic } from "./conversion.js";

const state = {
    type: "length",
    action: "Conversion",
    fromVal: 0,
    toVal: 0,
    fromUnit: "",
    toUnit: "",
    operator: "+",
    unitsData: [],
    formulas: []
};

let debounceTimer;

document.addEventListener("DOMContentLoaded", async () => {
    // Initial UI state setup
    const initialType = document.querySelector(`.unit-box[data-type="${state.type}"]`);
    if (initialType) initialType.classList.add("active");

    // Action button highlight (Conversion by default)
    document.querySelectorAll(".mode-btn").forEach(btn => {
        if (btn.textContent.trim() === state.action) btn.classList.add("active");
    });

    await loadUnits(state.type);
    await loadHistory();
    attachEventListeners();
});

/**
 * UC-JS-01: Handle Type Card Click
 */
async function handleTypeClick(card) {
    state.type = card.dataset.type;
    
    // Set Active Visuals
    document.querySelectorAll(".unit-box").forEach(c => c.classList.remove("active"));
    card.classList.add("active");

    // Reset UI
    document.getElementById("input-from").value = "";
    document.getElementById("input-to").value = "";
    document.getElementById("result-text").textContent = "---";

    // Refresh Data
    await loadUnits(state.type);
}

/**
 * UC-JS-02: Handle Action Tab Click
 */
function handleActionClick(btn) {
    // 1. Update State
    state.action = btn.textContent.trim();

    // 2. Set Active Visuals
    document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // 3. Toggle Operator Visibility
    toggleOperators(state.action === "Arithmetic");

    // 4. Clear Result (showResult(0, ""))
    document.getElementById("result-text").textContent = "---";
    
    // Toggle Read-Only for Input 2
    const toInput = document.getElementById("input-to");
    toInput.readOnly = (state.action === "Conversion");
    
    // If switching to Conversion, clear value in box 2
    if (state.action === "Conversion") toInput.value = "";
}

async function loadUnits(type) {
    const units = await getUnits(type.toLowerCase());
    state.unitsData = units;
    
    const fromSelect = document.getElementById("select-from");
    const toSelect = document.getElementById("select-to");
    
    populateDropdown(fromSelect, units);
    populateDropdown(toSelect, units);

    if (type.toLowerCase() === "temperature") {
        state.formulas = await getConversions();
    }
}

async function loadHistory() {
    const data = await getHistory();
    renderHistory(data);
}

async function handleHistorySaving() {
    // Don't save if both inputs are zero or empty
    if (!state.fromVal && !state.toVal) return;

    const resultStr = document.getElementById("result-text").textContent;
    const record = {
        type: state.type,
        action: state.action,
        expression: state.action === "Conversion" 
            ? `${state.fromVal}${state.fromUnit} to ${state.toUnit}`
            : `${state.fromVal}${state.fromUnit} ${state.operator} ${state.toVal}${state.toUnit}`,
        result: resultStr,
        timestamp: new Date().toISOString()
    };

    await saveHistory(record);
    await loadHistory();
}

function attachEventListeners() {
    const triggerSave = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => handleHistorySaving(), 5000);
    };

    // UC-JS-01: Type Selection
    document.querySelectorAll(".unit-box").forEach(card => {
        card.addEventListener("click", () => handleTypeClick(card));
    });

    // UC-JS-02: Action Selection
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => handleActionClick(btn));
    });

    // Inputs & Selects (Triggering the 5s save)
    document.getElementById("input-from").addEventListener("input", (e) => {
        state.fromVal = Number(e.target.value) || 0;
        triggerSave();
    });

    document.getElementById("input-to").addEventListener("input", (e) => {
        if (state.action !== "Conversion") {
            state.toVal = Number(e.target.value) || 0;
            triggerSave();
        }
    });

    document.getElementById("select-from").addEventListener("change", (e) => {
        state.fromUnit = e.target.value;
        triggerSave();
    });

    document.getElementById("select-to").addEventListener("change", (e) => {
        state.toUnit = e.target.value;
        triggerSave();
    });

    document.getElementById("select-operator").addEventListener("change", (e) => {
        state.operator = e.target.value;
        triggerSave();
    });
}