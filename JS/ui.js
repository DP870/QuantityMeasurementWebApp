

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
    const historyContainer = document.getElementById("history-list"); 
    // Ensure you have a <div id="history-list"> in your HTML
    
    if (!historyContainer) return;

    if (historyData.length === 0) {
        historyContainer.innerHTML = `<p class="empty-msg">No history yet.</p>`;
        return;
    }

    const historyHTML = historyData.map(record => `
        <div class="history-item">
            <div class="history-details">
                <span class="history-exp">${record.expression} = ${record.result}</span>
                <span class="history-type">${record.type} | ${record.action}</span>
            </div>
            <span class="history-time">${new Date(record.timestamp).toLocaleTimeString()}</span>
        </div>
    `).join("");

    historyContainer.innerHTML = historyHTML;
}