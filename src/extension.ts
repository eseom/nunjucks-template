// import * as prettydiff from "prettydiff";
import * as vscode from "vscode";

const prettydiff = require('prettydiff')

const prettyDiffWrapper = (document, range, options) => {
  const source = document.getText(range);
  const workspaceConfig = vscode.workspace.getConfiguration("editor");
  const htmlConfig = vscode.workspace.getConfiguration("html");
  const activeEditorOptions = vscode.window.activeTextEditor.options;
  const indent_size = activeEditorOptions.tabSize || workspaceConfig.tabSize;
  const inchar = activeEditorOptions.insertSpaces ? " " : "\t";
  const wrap = htmlConfig.format.wrapLineLength

  prettydiff.options = {
    // ...prettydiff.options,
    diff_label: 'New Sample',
    language_name: 'JavaScript',
    source_label: 'Source Sample',
    lexerOptions: {},
    attribute_sort: false,
    attribute_sort_list: '',
    brace_line: false,
    brace_padding: false,
    brace_style: 'none',
    braces: false,
    case_space: false,
    color: 'white',
    comment_line: false,
    comments: false,
    complete_document: false,
    compressed_css: false,
    conditional: false,
    config: '',
    content: false,
    correct: false,
    crlf: false,
    css_insert_lines: false,
    diff: '',
    diff_comments: false,
    diff_context: -1,
    diff_format: 'text',
    diff_rendered_html: false,
    diff_space_ignore: false,
    diff_view: 'sidebyside',
    else_line: false,
    end_comma: 'never',
    end_quietly: 'default',
    force_attribute: false,
    force_indent: false,
    format_array: 'default',
    format_object: 'default',
    function_name: false,
    help: 80,
    indent_char: ' ',
    indent_level: 0,
    jsscope: 'none',
    language: 'auto',
    language_default: 'text',
    lexer: 'auto',
    list_options: false,
    method_chain: 3,
    minify_keep_comments: false,
    minify_wrap: false,
    never_flatten: false,
    new_line: false,
    no_case_indent: false,
    no_lead_zero: false,
    no_semicolon: false,
    node_error: false,
    object_sort: false,
    output: '',
    parse_format: 'parallel',
    parse_space: false,
    preserve: 3,
    preserve_comment: false,
    preserve_text: false,
    quote: false,
    quote_convert: 'none',
    read_method: 'auto',
    selector_list: false,
    semicolon: false,
    space: true,
    space_close: false,
    styleguide: 'none',
    summary_only: false,
    tag_merge: false,
    tag_sort: false,
    ternary_line: false,
    top_comments: false,
    unformatted: false,
    variable_list: 'none',
    version: false,
    vertical: false,
    wrap,
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
