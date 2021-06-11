export function tryParseRangeExpression(expr: string): readonly [number, number | undefined] | undefined {
  const [startExpr, endExpr] = expr.split(",");
  const start = tryParsePositionExpression(startExpr);
  if (start === undefined) return undefined;
  return [start, endExpr === undefined ? endExpr : tryParsePositionExpression(endExpr)];
}

function tryParsePositionExpression(expr: string): number | undefined {
  const enum State {
    ParseOperator,
    ParseOperand,
  }

  let state = State.ParseOperand as State;
  let value: number | undefined;
  let operator: "+" | "-" = "+";
  let pos = 0;

  while (pos < expr.length) {
    skipSpace();
    const current = expr[pos];
    if (!current) break;

    switch (state) {
      case State.ParseOperand:
        if (isNumeric(current)) {
          value = operate(consumeInt());
          state = State.ParseOperator;
          continue;
        } else if (current === "+") {
          pos++;
          continue;
        } else if (current === "-") {
          flipSign();
          pos++;
          continue;
        } else {
          return undefined;
        }
      case State.ParseOperator:
        if (current === "+") {
          operator = "+";
          pos++;
          state = State.ParseOperand;
        } else if (current === "-") {
          operator = "-";
          pos++;
          state = State.ParseOperand;
        } else {
          return undefined;
        }
    }
  }
  return value !== undefined && value >= 0 ? value : undefined;

  function consumeInt(): number | undefined {
    let start = pos;
    while (pos < expr.length && isNumeric(expr[pos])) {
      pos++;
    }
    const int = +expr.slice(start, pos);
    if (Number.isSafeInteger(int)) {
      return int;
    }
  }

  function skipSpace() {
    while (pos < expr.length && /\s/.test(expr[pos])) {
      pos++;
    }
  }

  function operate(operand: number | undefined) {
    if (operand === undefined) return value;
    if (value === undefined) value = 0;
    switch (operator) {
      case "+":
        return value + operand;
      case "-":
        return value - operand;
    }
  }

  function flipSign() {
    if (operator === "+") {
      operator = "-";
    } else {
      operator = "+";
    }
  }
}

function isNumeric(char: string) {
  const code = char.charCodeAt(0);
  return 48 <= code && code <= 57;
}
