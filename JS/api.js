const BASE_URL = "http://localhost:3000";

export async function getUnits(type) {
    const res = await fetch(`${BASE_URL}/units?type=${type}`);
    return await res.json();
}

export async function getConversions() {
    const res = await fetch(`${BASE_URL}/conversions`);
    return await res.json();
}

export async function saveHistory(record) {
    await fetch(`${BASE_URL}/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record)
    });
}

export async function getHistory() {
    const res = await fetch(`${BASE_URL}/history?_sort=timestamp&_order=desc`);
    return await res.json();
}