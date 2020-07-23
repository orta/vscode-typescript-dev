import * as vscode from "vscode"
import * as fs from "fs"
import * as path from "path"

export class BaselinesProvider implements vscode.TreeDataProvider<BaselineFile> {
  private _onDidChangeTreeData: vscode.EventEmitter<BaselineFile | undefined> = new vscode.EventEmitter<
    BaselineFile | undefined
  >()
  readonly onDidChangeTreeData: vscode.Event<BaselineFile | undefined> = this._onDidChangeTreeData.event

  // private watcher: vscode.FileSystemWatcher
  private changedFiles: vscode.Uri[] = []
  private watcherDisposables: vscode.Disposable[] = []

  constructor(private workspaceRoot: vscode.Uri, context: vscode.ExtensionContext) {
    // TODO: how to dispose?
    // const local = new vscode.RelativePattern(workspaceRoot.toString(), "tests/baselines/local/**/*")
    // console.log("looking at", local)
    // const watcher = vscode.workspace.createFileSystemWatcher("tests/**/*")
    // watcher.onDidChange((uri) => console.log("change: " + uri.toString()))
    // watcher.onDidCreate((uri) => console.log("create: " + uri.toString()))
    // watcher.onDidDelete((uri) => console.log("delete: " + uri.toString()))
    // this.watcherDisposables.push(changeD, createdD)
    // context.subscriptions.push(watcher)
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
  }

  getTreeItem(element: BaselineFile): vscode.TreeItem {
    return element
  }

  async getChildren(element?: BaselineFile): Promise<BaselineFile[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("No dependency in empty workspace")
      return Promise.resolve([])
    }
    const files = await vscode.workspace.findFiles("tests/baselines/local/*")

    return files.map((f) => {
      const cmd = {
        command: "io.orta.typescript-dev.show-baseline-diff",
        title: "",
        arguments: [f],
      }
      return new BaselineFile(path.basename(f.path), "1", vscode.TreeItemCollapsibleState.None, cmd)
    })

    // if (element) {
    //   return Promise.resolve(
    //     this.getDepsInPackageJson(path.join(this.workspaceRoot, "node_modules", element.label, "package.json"))
    //   )
    // } else {
    //   const packageJsonPath = path.join(this.workspaceRoot, "package.json")
    //   if (this.pathExists(packageJsonPath)) {
    //     return Promise.resolve(this.getDepsInPackageJson(packageJsonPath))
    //   } else {
    //     vscode.window.showInformationMessage("Workspace has no package.json")
    //     return Promise.resolve([])
    //   }
    // }
  }

  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getDepsInPackageJson(packageJsonPath: string): BaselineFile[] {
    // if (this.pathExists(packageJsonPath)) {
    //   const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"))
    //   const toDep = (moduleName: string, version: string): Dependency => {
    //     if (this.pathExists(path.join(this.workspaceRoot, "node_modules", moduleName))) {
    //       return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.Collapsed)
    //     } else {
    //       return new Dependency(moduleName, version, vscode.TreeItemCollapsibleState.None, {
    //         command: "extension.openPackageOnNpm",
    //         title: "",
    //         arguments: [moduleName],
    //       })
    //     }
    //   }
    //   const deps = packageJson.dependencies
    //     ? Object.keys(packageJson.dependencies).map((dep) => toDep(dep, packageJson.dependencies[dep]))
    //     : []
    //   const devDeps = packageJson.devDependencies
    //     ? Object.keys(packageJson.devDependencies).map((dep) => toDep(dep, packageJson.devDependencies[dep]))
    //     : []
    //   return deps.concat(devDeps)
    // } else {
    //   return []
    // }
    return []
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p)
    } catch (err) {
      return false
    }

    return true
  }
}

export class BaselineFile extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly command?: vscode.Command
  ) {
    super(label, collapsibleState)
  }

  // @ts-ignore
  get tooltip(): string {
    return `${this.label}-${this.version}`
  }

  // @ts-ignore
  get description(): string {
    return this.version
  }

  iconPath = {
    light: path.join(__filename, "..", "..", "resources", "light", "dependency.svg"),
    dark: path.join(__filename, "..", "..", "resources", "dark", "dependency.svg"),
  }

  contextValue = "dependency"
}
