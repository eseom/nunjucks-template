import * as vscode from 'vscode';

// Utility functions for Nunjucks template extension

export const EMPTY_ELEMENTS: string[] = [
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'keygen',
  'link',
  'menuitem',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
];

export function createLanguageConfiguration() {
  return {
    onEnterRules: [
      {
        beforeText: new RegExp(
          `<(?!(?:${EMPTY_ELEMENTS.join(
            '|'
          )}))([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`,
          'i'
        ),
        afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>/i,
        action: { indentAction: vscode.IndentAction.IndentOutdent },
      },
      {
        beforeText: new RegExp(
          `<(?!(?:${EMPTY_ELEMENTS.join(
            '|'
          )}))(\\w[\\w\\d]*)([^/>]*(?!/)>)[^<]*$`,
          'i'
        ),
        action: { indentAction: vscode.IndentAction.Indent },
      },
    ],
  };
}