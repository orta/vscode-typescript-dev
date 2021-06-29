import * as vscode from "vscode";
import { basename } from "path";
import { BaselinesProvider, TreeNode } from "./baselines";
import { createBaselineFinder } from "./baselineFinder";
import { baselineToTester } from "./baselineToTest";

// https://code.visualstudio.com/api/references/commands

import { activatePosition } from "./position";
import { setTypeScriptCodeBaseContext } from "./context";
import { startupTwoslash } from "./twoslashCompletion";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(setTypeScriptCodeBaseContext));
  setTypeScriptCodeBaseContext();
  activatePosition(context);

  // Provides a hover with the full info for exceptions
  const completionDispose = startupTwoslash();
  context.subscriptions.push(completionDispose);

  // export function activate(context: vscode.ExtensionContext) {
  const workspace = vscode.workspace.workspaceFolders![0];
  const watcher = createBaselineFinder(workspace.uri.fsPath);
  watcher.startTimer();

  const baselinesProvider = new BaselinesProvider(watcher.resultsEmitter);
  vscode.window.registerTreeDataProvider("tsDev.baselines", baselinesProvider);

  const getTest = baselineToTester({ tscRoot: workspace.uri.fsPath });

  const diffTool = vscode.commands.registerCommand("tsDev.openDiffTool", () => require("child_process").exec("gulp diff"));

  const open = vscode.commands.registerCommand("tsDev.openReferenceShort", (item: TreeNode) => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.file(item.uri.fsPath.replace("local", "reference")));
  });

  const diff = vscode.commands.registerCommand("tsDev.openDiffShort", (item: TreeNode) => {
    const local = vscode.Uri.file(item.uri.fsPath);
    const ref = vscode.Uri.file(item.uri.fsPath.replace("local", "reference"));
    vscode.commands.executeCommand("vscode.diff", ref, local, `Diff for ${item.display}`);
  });

  const test = vscode.commands.registerCommand("tsDev.openTestShort", (item: TreeNode) => {
    const testFile = getTest(item.uri.fsPath);
    if (!testFile) {
      vscode.window.showErrorMessage(`Could not find a test file for ${item.uri.fsPath}`, "Copy Local Path").then((res) => {
        if (res && res.length) {
          vscode.env.clipboard.writeText(item.uri.fsPath);
          vscode.window.showInformationMessage("Copied");
        }
      });
    } else {
      const [path, line] = testFile.split(":");
      const opts: vscode.TextDocumentShowOptions = line
        ? {
          selection: new vscode.Range(new vscode.Position(Number(line), 0), new vscode.Position(Number(line), 0)),
        }
        : {};
      vscode.commands.executeCommand("vscode.open", vscode.Uri.file(path), opts);
    }
  });

  const copy = vscode.commands.registerCommand("tsDev.copyPath", (item: TreeNode) => {
    vscode.env.clipboard.writeText(item.uri.fsPath);
    vscode.window.showInformationMessage("Copied");
  });

  context.subscriptions.push(open, test, diff, copy, diffTool);
}
