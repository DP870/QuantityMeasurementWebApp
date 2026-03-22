

export function populateDropdowns(units) {
    const selects = document.querySelectorAll(".unit-select");
    
    // 1. Generate the HTML string for all options
    // unit.label is the text (e.g., "Meter") 
    // unit.symbol is the value (e.g., "m")
    const optionsHTML = units.map(unit => 
        `<option value="${unit.symbol}">${unit.label} (${unit.symbol})</option>`
    ).join("");

    // 2. Clear the old options and inject the new ones
    selects.forEach(select => {
        select.innerHTML = optionsHTML;
    });
}

export function toggleOperators(show) {
    // This can remain a placeholder for now
    console.log("Arithmetic mode active:", show);
}

export function renderHistory(historyData) {
    // This can remain a placeholder for now
    console.log("Rendering history...");
}