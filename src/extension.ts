import * as vscode from "vscode";
import { BaselinesProvider, TreeNode } from "./baselines";
import { showBaselineDiff } from "./showBaselineDiff";
import { createBaselineFinder } from "./baselineFinder";
import { baselineToTester } from "./baselineToTest";

export function activate(context: vscode.ExtensionContext) {
  const workspace = vscode.workspace.workspaceFolders![0];
  const watcher = createBaselineFinder(workspace.uri.fsPath);
  watcher.startTimer();

  const baselinesProvider = new BaselinesProvider(watcher.resultsEmitter);
  vscode.window.registerTreeDataProvider("tsDev.baselines", baselinesProvider);

  let disposable = vscode.commands.registerCommand("io.orta.typescript-dev.show-baseline-diff", showBaselineDiff);
  context.subscriptions.push(disposable);

  let cmd1 = vscode.commands.registerCommand("tsDev.openReferenceShort", (item: TreeNode) => {
    vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(item.uri.fsPath.replace("local", "reference")));
  });

  const getTest = baselineToTester({ tscRoot: workspace.uri.fsPath });

  let cmd2 = vscode.commands.registerCommand("tsDev.openTestShort", (item: TreeNode) => {
    const testFile = getTest(item.uri.fsPath);
    if (!testFile) {
      vscode.window.showErrorMessage(`Could not find a test file for ${item.uri.fsPath}`);
    } else {
      // const [path, number] = testFile.split(":")[0];
      // const meta: vscode.TextDocumentShowOptions = ;
      // const d = vscode.window.showTextDocument();
      vscode.commands.executeCommand("vscode.open", "file:/" + vscode.Uri.parse(testFile));
    }
  });
  context.subscriptions.push(cmd2);
}
