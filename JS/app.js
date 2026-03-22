import { getUnits, saveHistory, getHistory, getConversions } from "./api.js";
import { populateDropdowns, toggleOperators, renderHistory } from "./ui.js";
import { convert, compareValues, applyConversion } from "./conversion.js";

const state = {
    type: "length",
    action: "Comparison", // Default action
    fromVal: 0,
    toVal: 0,      // New: second value for comparison
    fromUnit: "",
    toUnit: "",
    unitsData: [],
    formulas: []
};

let debounceTimer;

document.addEventListener("DOMContentLoaded", async () => {
    await loadUnits(state.type);
    await loadHistory();
    attachEventListeners();
    updateInputStates(); // Initial UI check
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

// Controls whether the second box is "Read Only" or "Editable"
function updateInputStates() {
    const toInput = document.getElementById("input-to");
    if (state.action === "Comparison") {
        toInput.removeAttribute("readonly");
        toInput.placeholder = "Enter second value";
    } else {
        toInput.setAttribute("readonly", true);
        toInput.placeholder = "Result";
    }
}

function performCalculation() {
    const outputField = document.getElementById("input-to");
    const unitFrom = state.unitsData.find(u => u.symbol === state.fromUnit);
    const unitTo = state.unitsData.find(u => u.symbol === state.toUnit);

    if (!unitFrom || !unitTo) return;

    if (state.action === "Comparison") {
        // Normalise both to base units for comparison
        const base1 = applyConversion(state.fromVal, { factor: unitFrom.base_factor || 1 });
        const base2 = applyConversion(state.toVal, { factor: unitTo.base_factor || 1 });
        
        const comparisonResult = compareValues(state.fromVal, state.fromUnit, state.toVal, state.toUnit, base1, base2);
        console.log("Comparison result:", comparisonResult); 
        // Note: In comparison mode, we usually log or show a label. 
        // If you want to see the text in the box, uncomment next line:
        // outputField.value = comparisonResult; 
    } else {
        const result = convert(state.fromVal, unitFrom, unitTo, state.formulas);
        outputField.value = result;
    }
}

async function handleHistorySaving() {
    if (state.fromVal === 0 && state.toVal === 0) return;

    const record = {
        type: state.type,
        action: state.action,
        expression: state.action === "Comparison" 
            ? `${state.fromVal}${state.fromUnit} vs ${state.toVal}${state.toUnit}`
            : `${state.fromVal} ${state.fromUnit} to ${state.toUnit}`,
        result: document.getElementById("input-to").value,
        timestamp: new Date().toISOString()
    };

    await saveHistory(record);
    await loadHistory();
}

function attachEventListeners() {
    // UNIT TYPE
    document.querySelectorAll(".unit-box").forEach(card => {
        card.addEventListener("click", async () => {
            state.type = card.getAttribute("data-type");
            document.querySelectorAll(".unit-box").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            await loadUnits(state.type);
        });
    });

    // ACTION MODE
    document.querySelectorAll(".mode-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            state.action = btn.textContent.trim();
            document.querySelectorAll(".mode-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            updateInputStates();
            performCalculation();
        });
    });

    // INPUT FROM
    document.getElementById("input-from").addEventListener("input", (e) => {
        state.fromVal = Number(e.target.value) || 0;
        performCalculation();
        
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleHistorySaving();
        }, 5000); // 5 SECOND DELAY
    });

    // INPUT TO (For Comparison Mode)
    document.getElementById("input-to").addEventListener("input", (e) => {
        if (state.action === "Comparison") {
            state.toVal = Number(e.target.value) || 0;
            performCalculation();
            
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                handleHistorySaving();
            }, 5000); // 5 SECOND DELAY
        }
    });

    // DROPDOWNS
    document.getElementById("select-from").addEventListener("change", (e) => {
        state.fromUnit = e.target.value;
        performCalculation();
    });

    document.getElementById("select-to").addEventListener("change", (e) => {
        state.toUnit = e.target.value;
        performCalculation();
    });
}