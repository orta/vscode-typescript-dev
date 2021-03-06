import * as vscode from "vscode"
import { basename } from "path"
import { activatePosition } from "./position"
import { setTypeScriptCodeBaseContext } from "./context"
import { twoslashCompetions } from "./twoslashCompletion"

export function activate(context: vscode.ExtensionContext) {
  const funcs = handleTestFiles()
  let disposable = vscode.commands.registerCommand("io.orta.typescript-dev.declare-current-test-file", funcs.set)
  context.subscriptions.push(disposable)

  let disposable2 = vscode.commands.registerCommand("io.orta.typescript-dev.run-current-test-file", funcs.run)
  context.subscriptions.push(disposable2)

  context.subscriptions.push(vscode.workspace.onDidChangeWorkspaceFolders(setTypeScriptCodeBaseContext))
  setTypeScriptCodeBaseContext()
  activatePosition(context)

  // https://code.visualstudio.com/api/extension-guides/task-provider
  const tasks = vscode.tasks.registerTaskProvider("tsc-dev", {
    provideTasks: async () => {
      return [
        new vscode.Task(
          { type: "shell", task: "pre-compile-all" },
          "pre-compile-all",
          "tsc-dev",
          new vscode.ShellExecution("gulp tests"),
          "$gulp-tsc"
        ),
        new vscode.Task(
          { type: "shell", task: "pre-compile-tests" },
          "pre-compile-tests",
          "tsc-dev",
          new vscode.ShellExecution("gulp tests --built"),
          "$gulp-tsc"
        ),
      ]
    },

    // NOOP because we provide all the tasks
    resolveTask: async () => undefined,
  })

  // Provides a hover with the full info for exceptions
  const completionDispose = vscode.languages.registerCompletionItemProvider(
    "typescript",
    twoslashCompetions,
    // prettier-ignore
    ".",
    "@",
    "/",
    "-",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z"
  )
  context.subscriptions.push(completionDispose, tasks)
}

const handleTestFiles = () => {
  let activeTestFileURI: vscode.Uri | undefined
  let hasChangedSrcFolder = true

  const prettyName = (uri: vscode.Uri) => basename(uri.path)

  return {
    onSave: (e: vscode.TextDocument) => {
      if (e.uri.path.includes("/src/")) {
        hasChangedSrcFolder = true
        console.log("CHANGED SRC")
      }
    },

    set: () => {
      const currentEditor = vscode.window.activeTextEditor
      if (!currentEditor) {
        vscode.window.showInformationMessage("You aren't looking at a file for tests")
        return
      }

      activeTestFileURI = currentEditor.document.uri
      vscode.window.showInformationMessage(`Set the current test file to: ${prettyName(activeTestFileURI)}`)
    },

    run: () => {
      if (!activeTestFileURI) {
        vscode.window.showInformationMessage("You haven't set an active test file yet")
        return
      }

      const workspace = vscode.workspace.workspaceFolders
      if (!workspace) {
        vscode.window.showInformationMessage("Somehow you're not in a workspace")
        return
      }

      // Reset the changed src check
      hasChangedSrcFolder = false

      vscode.window.showInformationMessage(`Running tests for ${prettyName(activeTestFileURI)}`)
      const runTask: vscode.DebugConfiguration = {
        type: "node",
        request: "launch",
        name: "Test run for TSC",
        program: "${workspaceRoot}/node_modules/mocha/bin/_mocha",
        args: [
          "-u",
          "bdd",
          "--timeout",
          "2000000",
          "--colors",
          "built/local/run.js",
          "-f",
          `${activeTestFileURI.path}`,
        ],
        env: {
          NODE_ENV: "testing",
        },
        //"stopOnEntry": true,
        sourceMaps: true,
        console: "integratedTerminal",
        preLaunchTask: hasChangedSrcFolder ? "tsc-dev: pre-compile-all" : "tsc-dev: pre-compile-tests",
        outFiles: ["${workspaceRoot}/built/local/run.js"],
      }

      vscode.debug.startDebugging(workspace[0], runTask)
    },
  }
}

// this method is called when your extension is deactivated
export function deactivate() {}
