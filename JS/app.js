import { getUnits, saveHistory, getHistory, getConversions } from "./api.js";
import { populateDropdowns, toggleOperators, renderHistory } from "./ui.js";
import { convert } from "./conversion.js";

const state = {
    type: "length",
    action: "Conversion",
    fromVal: 0,
    fromUnit: "",
    toUnit: "",
    unitsData: [],
    formulas: [] // New: Stores temperature formulas from UC-JS-07
};

let debounceTimer;

document.addEventListener("DOMContentLoaded", async () => {
    const typeCards = document.querySelectorAll(".unit-box");
    const modeButtons = document.querySelectorAll(".mode-btn");
    
    if (typeCards.length) typeCards[0].classList.add("active");
    if (modeButtons.length) modeButtons[1].classList.add("active");

    await loadUnits(state.type);
    await loadHistory();
    attachEventListeners();
});

async function loadUnits(type) {
    const units = await getUnits(type.toLowerCase());
    
    // UC-JS-07: If temperature, fetch formulas too
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

function performCalculation() {
    const outputField = document.getElementById("input-to");
    const unitFrom = state.unitsData.find(u => u.symbol === state.fromUnit);
    const unitTo = state.unitsData.find(u => u.symbol === state.toUnit);

    if (unitFrom && unitTo) {
        // Pass state.formulas for UC-JS-07 compliance
        const result = convert(state.fromVal, unitFrom, unitTo, state.formulas);
        outputField.value = result;
    }
}

async function handleHistorySaving() {
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
        await loadHistory();
    } catch (error) {
        console.error("History save failed:", error);
    }
}

function attachEventListeners() {
    // 1. UNIT TYPE SELECTION
    document.querySelectorAll(".unit-box").forEach(card => {
        card.addEventListener("click", async () => {
            const selected = card.getAttribute("data-type") || card.querySelector(".box-label").textContent.trim().toLowerCase();
            state.type = selected;
            document.querySelectorAll(".unit-box").forEach(c => c.classList.remove("active"));
            card.classList.add("active");
            await loadUnits(selected);
        });
    });

    // 2. INPUT FIELD (Anti-Reset/Reload)
    const fromInput = document.getElementById("input-from");
    fromInput.addEventListener("input", (e) => {
        if (e.target.value === "") {
            state.fromVal = 0;
            document.getElementById("input-to").value = 0;
            return; 
        }
        state.fromVal = Number(e.target.value);
        performCalculation();

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            handleHistorySaving();
        }, 500);
    });

    // 3. DROPDOWNS
    document.getElementById("select-from").addEventListener("change", (e) => {
        state.fromUnit = e.target.value;
        performCalculation();
        handleHistorySaving();
    });

    document.getElementById("select-to").addEventListener("change", (e) => {
        state.toUnit = e.target.value;
        performCalculation();
        handleHistorySaving();
    });
}