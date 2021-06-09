import * as vscode from "vscode";

export function setTypeScriptCodeBaseContext() {
  const isTypeScriptCodeBase = !!vscode.workspace.workspaceFolders?.some((f) => f.name === "TypeScript");
  vscode.commands.executeCommand("setContext", "io.orta.typescript-dev.isTypeScriptCodeBase", isTypeScriptCodeBase);
}
