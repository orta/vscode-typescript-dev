# VS Code TypeScript Dev

An extension for working in the TypeScript codebase.

## Features

- Choose a test file and re-run that file easily from anywhere in your editor.
- Restart VS Code’s TS Server process with a debug port listening. Handy for debugging language service features in a real world environment:
  1. Open the TypeScript codebase in VS Code. Run `npm run build` in the console.
  2. Open any other TypeScript codebase in another VS Code window.
  3. In that codebase, edit or create `.vscode/settings.json` to include the option `"typescript.tsdk": "../path/to/TypeScript/built/local"`.
  4. Open any TypeScript file in that same window and run the command “TSC: Restart TS Server with debugging enabled”
  5. Back in the TypeScript codebase window, run command “Debug: Attach to Node Process.” You should see a VS Code process listening on port 9229 (or nearby if 9229 was busy).

### For more information

- [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
- [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
