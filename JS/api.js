const BASE_URL = "http://localhost:3000";

export async function getUnits(type) {
    try {
        // We fetch ALL units and filter them in JavaScript to avoid URL encoding issues
        const response = await fetch("http://localhost:3000/units");
        const allUnits = await response.json();
        
        // This ensures "Weight" matches "weight"
        return allUnits.filter(u => u.type.toLowerCase() === type.toLowerCase());
    } catch (error) {
        console.error("Error fetching units:", error);
        return [];
    }
}

export async function getConversion() {
    try {
        const response = await fetch(`${BASE_URL}/conversions`);
        return await response.json();
    } catch (error) {
        console.error("Conversion fetch error:", error);
        return [];
    }
}
export async function saveHistory(record) {
    try {
        const res = await fetch(`${BASE_URL}/history`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(record)
        });
        
        if (!res.ok) throw new Error("Failed to save history");
        
        return await res.json();
    } catch (error) {
        // Exception Flow: Log error but do not block the user
        console.error("History Save Error:", error);
        return null; 
    }
}
