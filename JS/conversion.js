import { getConversion } from "./api.js";


// ------------------------------------------------------
// Helper: safely evaluate formulas like "(x*9/5)+32"
// ------------------------------------------------------
function evalFormula(formula, x) {
    return Function("x", `return ${formula}`)(x);
}


// ------------------------------------------------------
// UC‑JS‑05 : CONVERSION ENGINE
// ------------------------------------------------------
export async function convert(value, fromUnit, toUnit) {
    if (fromUnit === toUnit) return value; // alternate flow: direct return

    try {
        const conv = await getConversion(fromUnit, toUnit);

        if (conv.factor !== null) {
            return value * conv.factor; // simple multiplication
        }

        if (conv.formula !== null) {
            return evalFormula(conv.formula, value); // temperature formulas
        }
    }
    catch (err) {
        console.error("convert() failed:", err);
        return null;
    }
}


// ------------------------------------------------------
// UC‑JS‑05 Additional: Comparison
// ------------------------------------------------------
export async function compare(v1, unit1, v2, unit2) {
    const converted = await convert(v2, unit2, unit1);
    if (converted === null) return null;

    if (v1 > converted) return ">";
    if (v1 < converted) return "<";
    return "=";
}


// ------------------------------------------------------
// UC‑JS‑05 Additional: Arithmetic (+, -, *, /)
// ------------------------------------------------------
export async function arithmetic(v1, unit1, v2, unit2, operator) {
    const v2Converted = await convert(v2, unit2, unit1);
    if (v2Converted === null) return null;

    switch (operator) {
        case "+": return v1 + v2Converted;
        case "-": return v1 - v2Converted;
        case "*": return v1 * v2Converted;
        case "/": return v1 / v2Converted;
        default: return null;
    }
}