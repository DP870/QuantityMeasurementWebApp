import { getUnits, saveHistory, getHistory, getConversions } from "./api.js";
import { populateDropdowns, toggleOperators, renderHistory } from "./ui.js";
import { convert, compareValues, applyConversion, performArithmetic } from "./conversion.js";
// Toggle for Arithmetic is done.
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
    // Initial UI Setup: Ensure 'Length' and 'Conversion' are highlighted on start
    const defaultType = document.querySelector(`.unit-box[data-type="${state.type}"]`);
    const defaultAction = Array.from(document.querySelectorAll(".mode-btn")).find(btn => btn.textContent.trim() === state.action);
    
    if (defaultType) defaultType.classList.add("active");
    if (defaultAction) defaultAction.classList.add("active");

    await loadUnits(state.type);
    await loadHistory();
    attachEventListeners();
    updateInputStates();
});

async function loadUnits(type) {
    const units = await getUnits(type.toLowerCase());
    if (type.toLowerCase() === "temperature") {
        state.formulas = await getConversions(); 
    }
    if (units && units.length > 0) {
        state.unitsData = units;
        state.fromUnit = units[0].symbol;
        state.toUnit = units[0].symbol;
        populateDropdowns(units);
        performCalculation();
    }
}

async function loadHistory() {
    const historyData = await getHistory();
    renderHistory(historyData);
}

function updateInputStates() {
    const toInput = document.getElementById("input-to");
    if (state.action === "Conversion") {
        toInput.setAttribute("readonly", true);
    } else {
        toInput.removeAttribute("readonly");
    }
}

function performCalculation() {
    const outputField = document.getElementById("input-to");
    const resultDisplay = document.getElementById("result-text");
    const unitFrom = state.unitsData.find(u => u.symbol === state.fromUnit);
    const unitTo = state.unitsData.find(u => u.symbol === state.toUnit);

    if (!unitFrom || !unitTo) return;

    try {
        if (state.action === "Arithmetic") {
            const v2normalised = convert(state.toVal, unitTo, unitFrom, state.formulas);
            const result = performArithmetic(state.fromVal, v2normalised, state.operator);
            resultDisplay.textContent = `${result} ${state.fromUnit}`;
        } else if (state.action === "Comparison") {
            const base1 = applyConversion(state.fromVal, { factor: unitFrom.base_factor || 1 });
            const base2 = applyConversion(state.toVal, { factor: unitTo.base_factor || 1 });
            resultDisplay.textContent = compareValues(state.fromVal, state.fromUnit, state.toVal, state.toUnit, base1, base2);
        } else {
            const result = convert(state.fromVal, unitFrom, unitTo, state.formulas);
            outputField.value = result;
            resultDisplay.textContent = `${result} ${state.toUnit}`;
        }
    } catch (err) {
        resultDisplay.textContent = err.message;
    }
}

async function handleHistorySaving() {
    if (state.fromVal === 0 && state.toVal === 0) return;

    const resultDisplay = document.getElementById("result-text");
    const record = {
        type: state.type,
        action: state.action,
        expression: state.action === "Conversion" 
            ? `${state.fromVal}${state.fromUnit} to ${state.toUnit}`
            : `${state.fromVal}${state.fromUnit} ${state.operator || 'vs'} ${state.toVal}${state.toUnit}`,
        result: resultDisplay.textContent,
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

    // 1. UNIT TYPE SELECTION (Highlights Length, Weight, etc.)
    document.querySelectorAll(".unit-box").forEach(card => {
        card.addEventListener("click", async () => {
            // Remove active from all types, add to clicked one
            document.querySelectorAll(".unit-box").forEach(c => c.classList.remove("active"));
            card.classList.add("active");

            state.type = card.getAttribute("data-type");
            await loadUnits(state.type);
        });
    });

    // 2. ACTION SELECTION (Highlights Conversion, Comparison, Arithmetic)
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            // Remove active from all buttons, add to clicked one
            document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            state.action = btn.textContent.trim();
            updateInputStates();
            toggleOperators(state.action === "Arithmetic");
            performCalculation();
        });
    });

    // 3. INPUT FIELDS
    document.getElementById("input-from").addEventListener("input", (e) => {
        state.fromVal = Number(e.target.value) || 0;
        performCalculation();
        triggerSave();
    });

    document.getElementById("input-to").addEventListener("input", (e) => {
        if (state.action !== "Conversion") {
            state.toVal = Number(e.target.value) || 0;
            performCalculation();
            triggerSave();
        }
    });

    // 4. DROPDOWNS & OPERATORS
    document.getElementById("select-operator").addEventListener("change", (e) => {
        state.operator = e.target.value;
        performCalculation();
        triggerSave();
    });

    document.getElementById("select-from").addEventListener("change", (e) => {
        state.fromUnit = e.target.value;
        performCalculation();
        triggerSave();
    });

    document.getElementById("select-to").addEventListener("change", (e) => {
        state.toUnit = e.target.value;
        performCalculation();
        triggerSave();
    });
}