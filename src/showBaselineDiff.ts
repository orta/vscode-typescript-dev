import * as vscode from "vscode"

export const showBaselineDiff = (opts: { path: string }) => {
  vscode.window.showOpenDialog

  // if (original !== null) {
  // let filename = vscode.workspace.asRelativePath(file)
  console.log(opts.path)
  vscode.commands.executeCommand(
    "vscode.diff",
    vscode.Uri.parse(opts.path),
    vscode.Uri.parse(opts.path.replace("local/", "reference/")),
    "OK"
  )
  // }
}
