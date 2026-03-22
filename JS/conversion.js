import { getConversion } from "./api.js";


// ------------------------------------------------------
// Helper: safely evaluate formulas like "(x*9/5)+32"
// ------------------------------------------------------
function evalFormula(formula, x) {
    return Function("x", `return ${formula}`)(x);
}


// js/conversion.js
export function convert(value, unitFrom, unitTo) {
    if (value === 0) return 0;

    // Handle Temperature (requires formulas, not just factors)
    if (unitFrom.type === "temperature") {
        if (unitFrom.symbol === unitTo.symbol) return value;
        
        let result = value;
        // Convert to Celsius first as base
        if (unitFrom.symbol === "°F") result = (value - 32) * 5/9;
        if (unitFrom.symbol === "K") result = value - 273.15;

        // Convert from Celsius to Target
        if (unitTo.symbol === "°F") return (result * 9/5) + 32;
        if (unitTo.symbol === "K") return result + 273.15;
        return result; // return Celsius
    }

    // Handle Length, Weight, Volume using base_factor
    // Logic: (Value * FromFactor) / ToFactor
    const result = (value * unitFrom.base_factor) / unitTo.base_factor;
    
    // Round to 4 decimal places to keep it clean
    return Math.round(result * 10000) / 10000;
}