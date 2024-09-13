import * as math from "mathjs";

// define limitedEvaluate and limitedParse for increased security
// disable all other features
const m = math.create(math.all);
const limitedEvaluate = m.evaluate;
const limitedParse = m.parse;

m.import(
  {
    import: () => {
      throw new Error("Function import is disabled");
    },
    createUnit: () => {
      throw new Error("Function createUnit is disabled");
    },
    evaluate: () => {
      throw new Error("Function evaluate is disabled");
    },
    parse: () => {
      throw new Error("Function parse is disabled");
    },
    simplify: () => {
      throw new Error("Function simplify is disabled");
    },
    derivative: () => {
      throw new Error("Function derivative is disabled");
    },
  },
  { override: true },
);

// --------------------- end of security stuff ---------------------

// override isAlpha check of parser, to allow dots ('.') in variable names
limitedParse.isAlpha = (c, cPrev, cNext) => math.parse.isAlpha(c, cPrev, cNext) || c === ".";

/**
 * This function returns all allowed mathjs functions
 * @returns a list of allowed function names
 */
export function getAllowedMathJsFunctions() {
  return [
    "abs",
    "cbrt",
    "cube",
    "sqrt",
    "square",
    "pow",
    "ceil",
    "round",
    "floor",
    "fix",
    "exp",
    "log",
    "log2",
    "log10",
    "sign",
    "sin",
    "cos",
    "tan",
  ];
}

/**
 * This function returns all the used variable names in the expression
 * @param {string} expression
 * @returns a list of all the used variables
 */
export function getVariableNames(expression) {
  // variables must only contain alphanumeric characters, dots and underlines
  // the length of the variable name must be between 1 and 50
  const variableNameCandidates = expression.match(/[a-zA-Z][a-zA-Z\d._]{0,49}/g) ?? [];
  return variableNameCandidates.filter((x) => !getAllowedMathJsFunctions().includes(x));
}

/**
 * @param {string} expression
 * @returns the count of variables appearing within the expression.
 */
export function getVariableCount(expression) {
  return getVariableNames(expression).length;
}

/**
 * Calculates the result of the expression using the given variable scope.
 * If the expression or the scope are not valid, 0 is returned.
 * @param {string} expression The expression string.
 * @param {Object} scope Object containing a mapping from each variable to a value.
 * @returns The result of the calculation, or 0 if there was an error.
 */
export function calculate(expression, scope) {
  try {
    // remove possible newlines from expression, as they are not wanted
    const exprWithoutNewlines = expression.replace(/\r?\n|\r/g, " ");
    const result = limitedEvaluate(exprWithoutNewlines, scope);

    if (typeof result !== "number" || !isFinite(result)) {
      return null;
    } else {
      return result;
    }
  } catch (_) {
    // expression contains some error or scope is erroneous -> return null
    return null;
  }
}

/**
 * Checks if the expression can be parsed.
 * @param {string} expression
 * @returns true if the expression can be parsed successfully.
 */
export function canBeParsed(expression) {
  try {
    const variableNames = getVariableNames(expression);
    for (const variableName of variableNames) {
      expression = expression.replaceAll(variableName, "0");
    }
    limitedParse(expression);
    return true;
  } catch (_) {
    return false;
  }
}

/**
 * Creates a scope object for using in a calculation.
 * @param {number} index the index of the datapoint in the chart series that should be treated
 * @param {string[]} variableNames array of variables names appearing in the expression
 * @param {string[]} aggregations array of aggregations corresponding to each variable within variableNames
 * @param {Object} variableValues
 * @returns an object containing a mapping <variable_name> -> value, of current point in time (index)
 */
export function getScope(index, variableNames, aggregations, variableValues) {
  const scope = {};
  variableNames.forEach((v, i) => {
    const key = `${v}_${aggregations[i]}`;
    scope[key] = variableValues[key][index] !== undefined ? variableValues[key][index][1] : 0;
  });
  return scope;
}

/**
 * Takes the given expression and adds the suffix "_<agg>" to each variable.
 * @param {string} expression the expression string
 * @param {string[]} aggregations the array of aggregations in the order of appearence of the variables
 * @returns the new expression string with the replaced names.
 */
export function addAggsToExpression(expression, aggregations) {
  const variableNames = getVariableNames(expression);
  let newExpression = "";
  variableNames.forEach((v, i) => {
    // look for next occurrence of variable
    const foundIndex = expression.indexOf(v);
    // take part before found index
    newExpression += expression.substring(0, foundIndex);
    // add "<variable>_<agg>"
    newExpression += `${v}_${aggregations[i]}`;
    // set expression to remaining part
    expression = expression.substring(foundIndex + v.length);
  });
  newExpression += expression;

  return newExpression;
}
