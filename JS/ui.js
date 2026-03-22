/**
 * UC-JS-03: Populate Unit Dropdown
 */
export function populateDropdown(selectEl, units) {
    // Exception Flow: selectEl is null
    if (!selectEl) {
        console.warn("Target select element is null.");
        return;
    }

    // Main Flow: Reset and add default
    selectEl.innerHTML = "";
    const defaultOpt = document.createElement("option");
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    defaultOpt.textContent = "-- Select Unit --";
    selectEl.appendChild(defaultOpt);

    // Alternate Flow: Only add units if the array isn't empty
    if (units && units.length > 0) {
        units.forEach(u => {
            const opt = document.createElement("option");
            opt.value = u.symbol;
            opt.textContent = `${u.label} (${u.symbol})`;
            selectEl.appendChild(opt);
        });
    }
}

/**
 * Helper to populate both dropdowns at once
 */
export function populateDropdowns(units) {
    const selectFrom = document.getElementById("select-from");
    const selectTo = document.getElementById("select-to");
    populateDropdown(selectFrom, units);
    populateDropdown(selectTo, units);
}

/**
 * Renders history cards into the list
 */
export function renderHistory(historyData) {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    if (!historyData || historyData.length === 0) {
        historyList.innerHTML = `<p class="no-history">No history yet.</p>`;
        return;
    }

    historyList.innerHTML = historyData.map(item => `
        <div class="history-card" style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 8px;">
            <div style="font-size: 0.9rem; color: #666;">${item.type.toUpperCase()} | ${item.action}</div>
            <div style="font-weight: bold; margin: 5px 0;">${item.expression}</div>
            <div style="color: #4A90E2; font-weight: bold;">Result: ${item.result}</div>
            <div style="font-size: 0.75rem; color: #999; margin-top: 5px;">${new Date(item.timestamp).toLocaleString()}</div>
        </div>
    `).join("");
}

/**
 * Toggles the visibility of the operator dropdown (+ - * /)
 */
export function toggleOperators(show) {
    const wrapper = document.getElementById("operator-wrapper");
    if (wrapper) {
        wrapper.style.display = show ? "block" : "none";
    }
}