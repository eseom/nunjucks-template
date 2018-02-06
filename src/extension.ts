import * as vscode from 'vscode'
import * as path from 'path'
import * as fs from 'fs'
import * as mkdirp from 'mkdirp'
import * as prettydiff from 'prettydiff2'

// const snippetsArr = require('./hover/filters.json');
// const functionsArr = require('./functions');
import functions from './functions'

function createHover(snippet, type) {
  const example =
    typeof snippet.example == 'undefined' ? '' : snippet.example;
  const description =
    typeof snippet.description == 'undefined' ? '' : snippet.description;
  return new vscode.Hover({
    language: type,
    value: description + '\n\n' + example
  });
}

const prettyDiff = (document, range, options) => {
  const result = [];
  const content = document.getText(range)
  const workspaceConfig = vscode.workspace.getConfiguration('editor');
  const activeEditorOptions = vscode.window.activeTextEditor.options
  const insize = activeEditorOptions.tabSize || workspaceConfig.tabSize
  const inchar = activeEditorOptions.insertSpaces ? ' ' : '\t'

  const newText = prettydiff({
    source: content,
    lang: 'twig',
    mode: 'beautify',
    insize,
    inchar,
    // newline: vscodeConfig.newLine,
    // objsort: vscodeConfig.methodChain,
    // wrap: vscodeConfig.wrap,
    // methodchain: vscodeConfig.methodchain,
    // ternaryline: vscodeConfig.ternaryLine,
  });
  result.push(vscode.TextEdit.replace(range, newText));
  return result;
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.languages.registerDocumentFormattingEditProvider('njk', {
      provideDocumentFormattingEdits(document, options, token) {
        // entire contnets
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(
          document.lineCount - 1,
          document.lineAt(document.lineCount - 1).text.length
        );
        const rng = new vscode.Range(start, end);
        return prettyDiff(document, rng, options);
      }
    })
  )
}

export function deactivate() {
}