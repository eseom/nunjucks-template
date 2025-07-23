import * as vscode from 'vscode';
import { createLanguageConfiguration } from './functions';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const prettydiff = require('prettydiff');

interface PrettyDiffOptions {
  source: string;
  lang: string;
  mode: string;
  indent_size: number;
  inchar: string;
  wrap: number;
  preserve: number;
  jekyll: boolean;
  [key: string]: any;
}

const prettyDiffWrapper = (
  document: vscode.TextDocument,
  range: vscode.Range,
  options: vscode.FormattingOptions
): vscode.TextEdit => {
  const source = document.getText(range);
  const workspaceConfig = vscode.workspace.getConfiguration('editor');
  const htmlConfig = vscode.workspace.getConfiguration('html');
  const nunjucksTemplateConfig = vscode.workspace.getConfiguration('nunjucksTemplate');
  const activeEditor = vscode.window.activeTextEditor;
  
  if (!activeEditor) {
    throw new Error('No active editor found');
  }

  const activeEditorOptions = activeEditor.options;
  const indent_size = (activeEditorOptions.tabSize as number) || workspaceConfig.get<number>('tabSize') || 2;
  const inchar = activeEditorOptions.insertSpaces ? ' ' : '\t';
  const wrap = htmlConfig.get<number>('format.wrapLineLength') || 120;
  const preserve = nunjucksTemplateConfig.get<number>('preserveEmptyLine') || 0;

  const prettydiffOptions: PrettyDiffOptions = {
    // Basic configuration
    source,
    lang: 'twig',
    mode: 'beautify',
    indent_size,
    inchar,
    wrap,
    preserve,
    jekyll: true,
    
    // Formatting options - simplified
    attribute_sort: false,
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
    content: false,
    correct: false,
    crlf: false,
    css_insert_lines: false,
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
    vertical: false
  };

  prettydiff.options = prettydiffOptions;
  return vscode.TextEdit.replace(range, prettydiff());
};

export function activate(context: vscode.ExtensionContext): void {
  // Register document formatting provider
  const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider('njk', {
    provideDocumentFormattingEdits(
      document: vscode.TextDocument,
      options: vscode.FormattingOptions,
      token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.TextEdit[]> {
      const replacements: vscode.TextEdit[] = [];

      // Process frontmatter
      let frontmatterStarted = false;
      let lineToStart = 0;
      for (let i = 0; i <= document.lineCount; i++) {
        const line = document.lineAt(i).text.trim();
        if (line !== '---' && !frontmatterStarted) {
          lineToStart = 0;
          break;
        }
        if (line === '---') {
          if (!frontmatterStarted) {
            frontmatterStarted = true;
            continue;
          }
          if (frontmatterStarted) {
            lineToStart = i + 1;
            break;
          }
        }
      }

      if (lineToStart !== 0) {
        replacements.push(
          vscode.TextEdit.replace(
            new vscode.Range(
              new vscode.Position(lineToStart, 0),
              new vscode.Position(lineToStart, 0)
            ),
            '\n'
          )
        );
      }

      // Formatting
      const start = new vscode.Position(lineToStart, 0);
      const end = new vscode.Position(
        document.lineCount - 1,
        document.lineAt(document.lineCount - 1).text.length
      );
      const range = new vscode.Range(start, end);
      
      try {
        replacements.push(prettyDiffWrapper(document, range, options));
      } catch (error) {
        console.error('Formatting error:', error);
        vscode.window.showErrorMessage('Nunjucks formatting failed: ' + error);
      }

      return replacements;
    },
  });

  // Configure language settings
  vscode.languages.setLanguageConfiguration('njk', createLanguageConfiguration());

  // Add to subscriptions
  context.subscriptions.push(formattingProvider);
}

export function deactivate(): void {
  // Clean up resources if needed
}
