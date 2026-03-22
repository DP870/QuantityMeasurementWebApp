// ------------------------------------------------------
// BASE URL FOR JSON‑SERVER
// ------------------------------------------------------
export const BASE_URL = "http://localhost:3000";


// ------------------------------------------------------
// UC‑JS‑03 : Fetch Units for Selected Type
// /units?type=length
// ------------------------------------------------------
export async function getUnits(type) {
    try {
        const res = await fetch(`${BASE_URL}/units?type=${type}`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        return await res.json(); // always an array
    }
    catch (err) {
        console.error("getUnits() failed:", err);
        return null; // caller will show error UI
    }
}


// ------------------------------------------------------
// UC‑JS‑04 : Fetch Conversion Record
// /conversions?from=km&to=m
// ------------------------------------------------------
export async function getConversion(from, to) {
    try {
        const res = await fetch(`${BASE_URL}/conversions?from=${from}&to=${to}`);

        if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json(); // always returns array

        if (!data.length) {
            throw new Error("No conversion found");
        }

        return data[0]; // json-server always returns an array
    }
    catch (err) {
        console.error("getConversion() failed:", err);
        throw err; // propagate to conversion.js or app.js
    }
}