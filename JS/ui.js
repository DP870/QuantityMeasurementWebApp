/**
 * UC-JS-03: Populate Unit Dropdown
 */
export function populateDropdown(selectEl, units) {
    if (!selectEl) {
        console.warn("selectEl is null");
        return;
    }
    selectEl.innerHTML = "";
    
    // Add disabled default prompt
    const defaultOpt = document.createElement("option");
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    defaultOpt.textContent = "-- Select Unit --";
    selectEl.appendChild(defaultOpt);

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
 * UC-JS-05: Render History List
 */
export function renderHistory(records) {
    const list = document.querySelector("#history-list");
    if (!list) return;

    list.innerHTML = "";

    // Exception Flow: records is undefined or empty
    if (!records || !records.length) {
        list.innerHTML = "<li>No history yet.</li>";
        return;
    }

    // Main Flow: Newest-first (Assumes API returns sorted or sort here)
    records.forEach(r => {
        const li = document.createElement("li");
        // Apply a class if you want specific styling for the list items
        li.className = "history-item"; 
        li.textContent = `${r.expression}  =  ${r.result}  (${new Date(r.timestamp).toLocaleString()})`;
        list.appendChild(li);
    });
}

export function populateDropdowns(units) {
    populateDropdown(document.getElementById("select-from"), units);
    populateDropdown(document.getElementById("select-to"), units);
}

export function toggleOperators(show) {
    const wrapper = document.getElementById("operator-wrapper");
    if (wrapper) wrapper.style.display = show ? "block" : "none";
}