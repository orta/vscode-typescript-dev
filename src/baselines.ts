import * as vscode from "vscode";
import * as path from "path";

import { Runner } from "./baselineFinder";

export type TreeNode = {
  uri: vscode.Uri;
  type: "edited" | "deleted" | "added";
  display: string;
  open: boolean;
};

export class BaselinesProvider implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | null> = new vscode.EventEmitter<TreeNode | null>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | null> = this._onDidChangeTreeData.event;
  private root: vscode.Uri[] = [];

  constructor(runEventEmitter: Runner["resultsEmitter"]) {
    runEventEmitter.event((e) => {
      this.root = e.sort();
      this._onDidChangeTreeData.fire(null);
    });
  }

  urlToBaseLineNode(uri: vscode.Uri): TreeNode {
    return {
      uri: uri,
      type: "edited",
      display: path.basename(uri.fsPath),
      open: false,
    };
  }

  getChildren(node: TreeNode): Thenable<TreeNode[]> {
    if (!node) {
      if (this.root) {
        return Promise.resolve(this.root.map(this.urlToBaseLineNode));
      } else {
        return Promise.resolve([]);
      }
    } else {
      return Promise.resolve([]);
    }
  }

  getTreeItem(node: TreeNode): vscode.TreeItem {
    const hasChildren = false; // node.children.length;
    const collapsed = false
      ? true
        ? vscode.TreeItemCollapsibleState.Expanded
        : vscode.TreeItemCollapsibleState.Collapsed
      : vscode.TreeItemCollapsibleState.None;

    const treeItem: vscode.TreeItem = new vscode.TreeItem(node.display, collapsed);

    treeItem.command = {
      command: "vscode.open",
      title: `Open changed file`,
      arguments: [node.uri],
    };

    treeItem.contextValue = "edited";
    treeItem.resourceUri = node.uri;
    return treeItem;
  }
}
