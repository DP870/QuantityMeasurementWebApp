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
        // Default units (Select the first options after prompt)
        state.fromUnit = units[0].symbol;
        state.toUnit = units[0].symbol;
        
        populateDropdowns(units);
        
        // Match the state to the newly populated dropdowns
        document.getElementById("select-from").value = state.fromUnit;
        document.getElementById("select-to").value = state.toUnit;
        
        performCalculation();
    }
}

async function loadHistory() {
    const historyData = await getHistory();
    renderHistory(historyData);
}

function updateInputStates() {
    const toInput = document.getElementById("input-to");
    const resultText = document.getElementById("result-text");

    if (state.action === "Conversion") {
        toInput.setAttribute("readonly", true);
        resultText.textContent = "---";
    } else {
        toInput.removeAttribute("readonly");
        toInput.value = state.toVal || "";
        resultText.textContent = "Enter second value...";
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
        } 
        else if (state.action === "Comparison") {
            const base1 = applyConversion(state.fromVal, { factor: unitFrom.base_factor || 1 });
            const base2 = applyConversion(state.toVal, { factor: unitTo.base_factor || 1 });
            resultDisplay.textContent = compareValues(state.fromVal, state.fromUnit, state.toVal, state.toUnit, base1, base2);
        } 
        else {
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

    // INPUTS
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

    // OPERATOR SELECT
    document.getElementById("select-operator").addEventListener("change", (e) => {
        state.operator = e.target.value;
        performCalculation();
        triggerSave();
    });

    // CATEGORY/MODE
    document.querySelectorAll(".unit-box").forEach(card => {
        card.addEventListener("click", async () => {
            state.type = card.getAttribute("data-type");
            document.querySelectorAll(".unit-box").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            await loadUnits(state.type);
        });
    });

    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            state.action = btn.textContent.trim();
            document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            updateInputStates();
            toggleOperators(state.action === "Arithmetic");
            performCalculation();
        });
    });

    // DROPDOWNS
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