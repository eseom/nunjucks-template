// import * as prettydiff from "prettydiff";
import * as vscode from "vscode";

const prettydiff = require('prettydiff')

const prettyDiffWrapper = (document, range, options) => {
  const source = document.getText(range);
  const workspaceConfig = vscode.workspace.getConfiguration("editor");
  const activeEditorOptions = vscode.window.activeTextEditor.options;
  const indent_size = activeEditorOptions.tabSize || workspaceConfig.tabSize;
  const inchar = activeEditorOptions.insertSpaces ? " " : "\t";

  prettydiff.options = {
    ...prettydiff.options,
    source,
    lang: "twig",
    mode: "beautify",
    indent_size,
    inchar,
    jekyll: true,
  }

  return [vscode.TextEdit.replace(range, prettydiff())];
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider("njk", {
      provideDocumentFormattingEdits(document, options, token) {
        // entire contents
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(
          document.lineCount - 1,
          document.lineAt(document.lineCount - 1).text.length
        );
        const rng = new vscode.Range(start, end);
        return prettyDiffWrapper(document, rng, options);
      },
    })
  );

  const EMPTY_ELEMENTS: string[] = [
    "area",
    "base",
    "br",
    "col",
    "embed",
    "hr",
    "img",
    "input",
    "keygen",
    "link",
    "menuitem",
    "meta",
    "param",
    "source",
    "track",
    "wbr",
  ];
  vscode.languages.setLanguageConfiguration("njk", {
    onEnterRules: [
      {
        beforeText: new RegExp(
          `<(?!(?:${EMPTY_ELEMENTS.join(
            "|"
          )}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`,
          "i"
        ),
        afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
        action: { indentAction: vscode.IndentAction.IndentOutdent },
      },
      {
        beforeText: new RegExp(
          `<(?!(?:${EMPTY_ELEMENTS.join(
            "|"
          )}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`,
          "i"
        ),
        action: { indentAction: vscode.IndentAction.Indent },
      },
    ],
  });
}

export function deactivate() {}
