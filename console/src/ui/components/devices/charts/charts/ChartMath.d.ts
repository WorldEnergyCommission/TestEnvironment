/**
 * This function returns all allowed mathjs functions
 * @returns a list of allowed function names
 */
export declare function getAllowedMathJsFunctions(): string[];

/**
 * This function returns all the used variable names in the expression
 * @param {string} expression
 * @returns a list of all the used variables
 */
export declare function getVariableNames(expression: string): string[];

/**
 * @param {string} expression
 * @returns the count of variables appearing within the expression.
 */
export declare function getVariableCount(expression: string): number;

/**
 * Calculates the result of the expression using the given variable scope.
 * @param {string} expression The expression string.
 * @param {Object} scope Object containing a mapping from each variable to a value.
 * @returns The result of the calculation.
 */
export function calculate(expression: string, scope: Record<string, any>): number;

/**
 * Creates a scope object for using in a calculation.
 * @param {number} index the index of the datapoint in the chart series that should be treated
 * @param {string[]} variableNames array of variables names appearing in the expression
 * @param {string[]} aggregations array of aggregations corresponding to each variable within variableNames
 * @param {Object} variableValues
 * @returns an object containing a mapping <variable_name> -> value, of current point in time (index)
 */
export function getScope(
  index: number,
  variableNames: string[],
  aggregations: string[],
  variableValues: Record<string, any>,
): Record<string, any>;

/**
 * Takes the given expression and adds the suffix "_<agg>" to each variable.
 * @param {string} expression the expression string
 * @param {string[]} aggregations the array of aggregations in the order of appearence of the variables
 * @returns the new expression string with the replaced names.
 */
export function addAggsToExpression(expression: string, aggregations: string[]): string;

/**
 * Checks if the expression can be parsed.
 * @param {string} expression
 * @returns true if the expression can be parsed successfully.
 */
export function canBeParsed(expression: string): boolean;
