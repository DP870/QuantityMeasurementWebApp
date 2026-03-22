/**
 * UC-JS-07: Apply Conversion Factor or Formula
 */
export function applyConversion(value, convObj) {
    if (isNaN(value) || value === null) throw new Error("Invalid number");

    if (convObj.factor !== null && convObj.factor !== undefined) {
        return parseFloat((value * convObj.factor).toFixed(6));
    } else if (convObj.formula) {
        try {
            const expr = convObj.formula.replace(/x/g, value);
            return parseFloat(eval(expr).toFixed(6));
        } catch (e) {
            throw new Error("Bad formula");
        }
    }
    return value;
}

/**
 * UC-JS-08: Compare Two Measurement Values
 */
export function compareValues(v1, u1, v2, u2, base1, base2) {
    // Exception Flow
    if (isNaN(v1) || isNaN(v2)) return "Invalid values — cannot compare";

    // Main Flow
    if (base1 > base2) return `${v1} ${u1} is GREATER than ${v2} ${u2}`;
    if (base1 < base2) return `${v1} ${u1} is LESS than ${v2} ${u2}`;
    
    return `${v1} ${u1} is EQUAL to ${v2} ${u2}`;
}

/**
 * Standard conversion bridge
 */
export function convert(value, unitFrom, unitTo, formulas = []) {
    if (unitFrom.symbol === unitTo.symbol) return value;

    if (unitFrom.type === "temperature") {
        const match = formulas.find(f => f.from === unitFrom.symbol && f.to === unitTo.symbol);
        return match ? applyConversion(value, { formula: match.formula }) : value;
    }

    if (unitFrom.base_factor && unitTo.base_factor) {
        const factor = unitFrom.base_factor / unitTo.base_factor;
        return applyConversion(value, { factor: factor });
    }

    return value;
}