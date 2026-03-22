/**
 * UC-JS-07: Apply Conversion Factor or Formula
 */
export function applyConversion(value, convObj) {
    // Exception Flow: value is NaN
    if (isNaN(value) || value === null) {
        throw new Error("Invalid number");
    }

    // Main Flow: Factor calculation (Length, Weight, Volume)
    if (convObj.factor !== null && convObj.factor !== undefined) {
        const result = value * convObj.factor;
        return parseFloat(result.toFixed(6));
    } 
    
    // Main Flow: Formula path (Temperature)
    else if (convObj.formula) {
        try {
            // Replace 'x' in the formula string with the actual value
            const expr = convObj.formula.replace(/x/g, value);
            // Execute the math string
            const result = eval(expr); 
            return parseFloat(result.toFixed(6));
        } catch (e) {
            // Exception Flow: eval throws
            throw new Error("Bad formula");
        }
    }

    return value;
}

/**
 * Bridge function to determine if we use Base Factors or Formulas
 */
export function convert(value, unitFrom, unitTo, formulas = []) {
    // Alternate Flow: fromUnit === toUnit
    if (unitFrom.symbol === unitTo.symbol) {
        return value;
    }

    // TEMPERATURE PATH: Look for a matching formula in the formulas array
    if (unitFrom.type === "temperature") {
        const match = formulas.find(f => f.from === unitFrom.symbol && f.to === unitTo.symbol);
        if (match) {
            return applyConversion(value, { formula: match.formula });
        }
        return value; 
    }

    // STANDARD PATH: Use base_factor (Length, Weight, Volume)
    if (unitFrom.base_factor && unitTo.base_factor) {
        const factor = unitFrom.base_factor / unitTo.base_factor;
        return applyConversion(value, { factor: factor });
    }

    return value;
}
