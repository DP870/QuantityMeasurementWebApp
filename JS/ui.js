export function renderHistory(historyData) {
    const historyList = document.getElementById("history-list");
    if (!historyList) return;

    if (!historyData || historyData.length === 0) {
        historyList.innerHTML = `<p class="no-history">No history yet.</p>`;
        return;
    }

    const html = historyData.map(item => `
        <div class="history-card">
            <div class="history-main">
                <strong>${item.expression}</strong>
            </div>
            <div class="history-result">= ${item.result}</div>
            <div class="history-footer">
                <span>${item.type} | ${item.action}</span>
                <span>${new Date(item.timestamp).toLocaleTimeString()}</span>
            </div>
        </div>
    `).join("");

    historyList.innerHTML = html;
}

export function populateDropdowns(units) {
    const selectFrom = document.getElementById("select-from");
    const selectTo = document.getElementById("select-to");

    const options = units.map(u => `<option value="${u.symbol}">${u.label} (${u.symbol})</option>`).join("");
    
    selectFrom.innerHTML = options;
    selectTo.innerHTML = options;
}

export function toggleOperators(show) {
   
}