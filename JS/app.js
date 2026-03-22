import { getUnits, saveHistory, getHistory, getConversions } from "./api.js";
import { populateDropdowns, toggleOperators, renderHistory } from "./ui.js";
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
    console.log("History loaded from DB:", historyData); // Debugging line
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
    const resultText = document.getElementById("result-text"); // The new div
    
    const unitFrom = state.unitsData.find(u => u.symbol === state.fromUnit);
    const unitTo = state.unitsData.find(u => u.symbol === state.toUnit);

    if (!unitFrom || !unitTo) return;

    if (state.action === "Arithmetic") {
        const v2normalised = convert(state.toVal, unitTo, unitFrom, state.formulas);
        const result = performArithmetic(state.fromVal, v2normalised, state.operator);
        resultText.textContent = `${result} ${state.fromUnit}`;
    } 
    else if (state.action === "Comparison") {
        const base1 = applyConversion(state.fromVal, { factor: unitFrom.base_factor || 1 });
        const base2 = applyConversion(state.toVal, { factor: unitTo.base_factor || 1 });
        resultText.textContent = compareValues(state.fromVal, state.fromUnit, state.toVal, state.toUnit, base1, base2);
    } 
    else {
        const result = convert(state.fromVal, unitFrom, unitTo, state.formulas);
        outputField.value = result;
        resultText.textContent = `${result} ${state.toUnit}`;
    }
}

async function handleHistorySaving() {
    // SECURITY CHECK: Don't save if values are zero
    if (state.fromVal === 0 && state.toVal === 0) {
        console.warn("Save cancelled: Values are zero.");
        return;
    }

    const unitFrom = state.unitsData.find(u => u.symbol === state.fromUnit);
    const unitTo = state.unitsData.find(u => u.symbol === state.toUnit);
    let displayResult = "";
    let expression = "";

    if (state.action === "Arithmetic") {
        const v2normalised = convert(state.toVal, unitTo, unitFrom, state.formulas);
        const result = performArithmetic(state.fromVal, v2normalised, state.operator);
        displayResult = `${result} ${state.fromUnit}`;
        expression = `${state.fromVal}${state.fromUnit} ${state.operator} ${state.toVal}${state.toUnit}`;
    } else if (state.action === "Comparison") {
        const base1 = applyConversion(state.fromVal, { factor: unitFrom.base_factor || 1 });
        const base2 = applyConversion(state.toVal, { factor: unitTo.base_factor || 1 });
        displayResult = compareValues(state.fromVal, state.fromUnit, state.toVal, state.toUnit, base1, base2);
        expression = `${state.fromVal}${state.fromUnit} vs ${state.toVal}${state.toUnit}`;
    } else {
        displayResult = document.getElementById("input-to").value;
        expression = `${state.fromVal} ${state.fromUnit} to ${state.toUnit}`;
    }

    const record = {
        type: state.type,
        action: state.action,
        expression: expression,
        result: displayResult,
        timestamp: new Date().toISOString()
    };

    console.log("Attempting to save record:", record);

    try {
        await saveHistory(record);
        await loadHistory(); // Refresh the list
    } catch (err) {
        console.error("Failed to save to db.json. Is json-server running?", err);
    }
}

function attachEventListeners() {
    const fromInput = document.getElementById("input-from");
    const toInput = document.getElementById("input-to");

    const triggerSave = () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleHistorySaving();
        }, 5000); // 5 seconds
    };

    fromInput.addEventListener("input", (e) => {
        state.fromVal = Number(e.target.value) || 0;
        performCalculation();
        triggerSave();
    });

    toInput.addEventListener("input", (e) => {
        if (state.action !== "Conversion") {
            state.toVal = Number(e.target.value) || 0;
            triggerSave();
        }
    });

    document.querySelectorAll(".unit-box").forEach(card => {
        card.addEventListener("click", async () => {
            state.type = card.getAttribute("data-type");
            await loadUnits(state.type);
        });
    });

    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            state.action = btn.textContent.trim();
            updateInputStates();
            performCalculation();
        });
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