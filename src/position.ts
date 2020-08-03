import * as vscode from "vscode";

const goToPositionCommandName = "io.orta.typescript-dev.go-to-position";
const togglePositionCommandName = "io.orta.typescript-dev.toggle-position";

export function activatePosition(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.commands.registerCommand(goToPositionCommandName, async () => {
    const expr = await vscode.window.showInputBox({
      prompt: "Zero-based position or comma-separated range. Addition and subtraction expressions are allowed."
    });

    if (vscode.window.activeTextEditor && expr) {
      const range = tryParseRangeExpression(expr);
      if (range !== undefined && vscode.window.activeTextEditor) {
        const start = vscode.window.activeTextEditor.document.positionAt(range[0]);
        const end = range[1] === undefined ? start : vscode.window.activeTextEditor.document.positionAt(range[1]);
        vscode.window.activeTextEditor.selection = new vscode.Selection(start, end);
      }

      vscode.window.activeTextEditor.revealRange(vscode.window.activeTextEditor.selection, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
  }));

  let positionStatusBarItem: vscode.StatusBarItem;
  let positionStatusBarItemVisible = false; // This seems to be private state of `StatusBarItem`, so I have to track it myself?
  context.subscriptions.push(vscode.commands.registerCommand(togglePositionCommandName, () => {
    if (!positionStatusBarItem) {
      positionStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100.45);
      positionStatusBarItem.command = goToPositionCommandName;
      context.subscriptions.push(positionStatusBarItem);
      context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(() => updatePosition(positionStatusBarItem)));
      context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(() => updatePosition(positionStatusBarItem)));
      updatePosition(positionStatusBarItem);
    }

    if (positionStatusBarItemVisible) {
      positionStatusBarItem.hide();
    } else {
      positionStatusBarItem.show();
    }
    positionStatusBarItemVisible = !positionStatusBarItemVisible;
  }));
}

function updatePosition(statusBarItem: vscode.StatusBarItem) {
  const focus = vscode.window.activeTextEditor?.document.offsetAt(vscode.window.activeTextEditor.selection.active);
  const anchor = vscode.window.activeTextEditor?.document.offsetAt(vscode.window.activeTextEditor.selection.anchor);
  if (focus !== undefined && anchor !== undefined) {
    const lower = Math.min(focus, anchor);
    const upper = Math.max(focus, anchor);
    statusBarItem.text = "Pos " + lower + (upper === lower ? "" : `, ${upper}`);
  }
}

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
      case "+": return value + operand;
      case "-": return value - operand;
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
