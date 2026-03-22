export function applyConversion(value, convObj) {
    if (isNaN(value)) throw new Error("Invalid number");
    if (convObj.factor !== null && convObj.factor !== undefined) {
        return parseFloat((value * convObj.factor).toFixed(6));
    } else if (convObj.formula) {
        const expr = convObj.formula.replace(/x/g, value);
        return parseFloat(eval(expr).toFixed(6));
    }
    return value;
}

export function compareValues(v1, u1, v2, u2, base1, base2) {
    if (isNaN(v1) || isNaN(v2)) return "Invalid values — cannot compare";
    if (base1 > base2) return `${v1} ${u1} is GREATER than ${v2} ${u2}`;
    if (base1 < base2) return `${v1} ${u1} is LESS than ${v2} ${u2}`;
    return `${v1} ${u1} is EQUAL to ${v2} ${u2}`;
}

export function performArithmetic(v1, v2normalised, op) {
    switch(op) {
        case "+": return parseFloat((v1 + v2normalised).toFixed(6));
        case "-": return parseFloat((v1 - v2normalised).toFixed(6));
        case "*": return parseFloat((v1 * v2normalised).toFixed(6));
        case "/": 
            if (v2normalised === 0) throw new Error("Divide by zero");
            return parseFloat((v1 / v2normalised).toFixed(6));
        default: throw new Error("Unknown operator");
    }
}

export function convert(value, unitFrom, unitTo, formulas = []) {
    if (unitFrom.symbol === unitTo.symbol) return value;
    if (unitFrom.type === "temperature") {
        const match = formulas.find(f => f.from === unitFrom.symbol && f.to === unitTo.symbol);
        return match ? applyConversion(value, { formula: match.formula }) : value;
    }
    const factor = unitFrom.base_factor / unitTo.base_factor;
    return applyConversion(value, { factor });
}