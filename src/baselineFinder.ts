import * as vscode from "vscode";

export const createBaselineFinder = (workspaceRoot: string) => {
  const emitter = new vscode.EventEmitter<vscode.Uri[]>();

  const run = () => {
    const local = new vscode.RelativePattern(workspaceRoot, "tests/baselines/local/**/*");
    vscode.workspace.findFiles(local.pattern, null, 100).then((r) => emitter.fire(r));
  };

  let interval: any | undefined = undefined;

  const startTimer = () => {
    if (interval) clearInterval(interval);
    run();
    // Every 30s
    setInterval(run, 30 * 1000);
  };

  const stopTimer = () => {
    if (interval) clearInterval(interval);
  };

  return {
    resultsEmitter: emitter,
    run,
    startTimer,
    stopTimer,
  };
};

export type Runner = ReturnType<typeof createBaselineFinder>;
