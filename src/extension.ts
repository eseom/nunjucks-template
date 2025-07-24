import * as vscode from 'vscode';
import { createLanguageConfiguration } from './functions';
import { NewNunjucksFormatter } from './parser/new-nunjucks-formatter';

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

/**
 * Detect template engine based on file extension and content
 */
function detectTemplateEngine(document: vscode.TextDocument): string {
  const fileName = document.fileName.toLowerCase();
  
  // Detect by file extension
  if (fileName.endsWith('.jinja') || fileName.endsWith('.jinja2') || fileName.endsWith('.j2')) {
    return 'jinja2';
  }
  if (fileName.endsWith('.njk') || fileName.endsWith('.nunjucks')) {
    return 'nunjucks';
  }
  if (fileName.endsWith('.twig')) {
    return 'twig';
  }
  
  // Check language ID
  if (document.languageId === 'jinja' || document.languageId === 'jinja2') {
    return 'jinja2';
  }
  if (document.languageId === 'njk' || document.languageId === 'nunjucks') {
    return 'nunjucks';
  }
  if (document.languageId === 'twig') {
    return 'twig';
  }
  
  // Default to jinja2 for universal compatibility
  return 'jinja2';
}

const prettyDiffWrapper = (
  document: vscode.TextDocument,
  range: vscode.Range,
  options: vscode.FormattingOptions
): vscode.TextEdit => {
  const source = document.getText(range);
  const workspaceConfig = vscode.workspace.getConfiguration('editor');
  const htmlConfig = vscode.workspace.getConfiguration('html');
  const jinja2Config = vscode.workspace.getConfiguration('jinja2Formatter');
  const activeEditor = vscode.window.activeTextEditor;
  
  if (!activeEditor) {
    throw new Error('No active editor found');
  }

  // 새 파서 사용 여부 확인
  const useNewParser = jinja2Config.get<boolean>('useNewParser');
  
  if (useNewParser) {
    const newFormatter = new NewNunjucksFormatter();
    const activeEditorOptions = activeEditor.options;
    const indent_size = (activeEditorOptions.tabSize as number) || workspaceConfig.get<number>('tabSize') || 2;
    const inchar = activeEditorOptions.insertSpaces ? ' ' : '\t';
    const preserve = jinja2Config.get<number>('preserveEmptyLine') || 0;

    const formattingOptions = {
      indentSize: indent_size,
      indentChar: inchar,
      maxLineLength: htmlConfig.get<number>('format.wrapLineLength') || 120,
      preserveEmptyLines: preserve,
      insertFinalNewline: true
    };

    const formatted = newFormatter.format(source, formattingOptions);
    return vscode.TextEdit.replace(range, formatted);
  }

  // 기존 prettydiff 로직
  const activeEditorOptions = activeEditor.options;
  const indent_size = (activeEditorOptions.tabSize as number) || workspaceConfig.get<number>('tabSize') || 2;
  const inchar = activeEditorOptions.insertSpaces ? ' ' : '\t';
  const wrap = htmlConfig.get<number>('format.wrapLineLength') || 120;
  const preserve = jinja2Config.get<number>('preserveEmptyLine') || 0;

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
  const supportedLanguages = ['jinja', 'jinja2', 'njk', 'nunjucks', 'twig'];

  // Register document formatting provider for all supported languages
  supportedLanguages.forEach(languageId => {
    const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider(languageId, {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken
      ): vscode.ProviderResult<vscode.TextEdit[]> {
        const jinja2Config = vscode.workspace.getConfiguration('jinja2Formatter');
        const useNewParser = jinja2Config.get<boolean>('useNewParser', true);
        
        // Use new parser by default for better results
        if (useNewParser) {
          try {
            const formatter = new NewNunjucksFormatter();
            const indentSize = jinja2Config.get<number>('indentSize', 2);
            const maxLineLength = jinja2Config.get<number>('maxLineLength', 120);
            const preserveEmptyLines = jinja2Config.get<number>('preserveEmptyLine', 1);
            
            const formattedText = formatter.format(document.getText(), {
              indentSize,
              indentChar: ' ',
              maxLineLength,
              preserveEmptyLines,
              insertFinalNewline: true
            });
            
            const fullRange = new vscode.Range(
              new vscode.Position(0, 0),
              new vscode.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length)
            );
            
            return [vscode.TextEdit.replace(fullRange, formattedText)];
          } catch (error) {
            console.error('New parser formatting error:', error);
            vscode.window.showErrorMessage(`Jinja2 formatting failed: ${error}`);
            return [];
          }
        }
        
        // Fallback to prettydiff for compatibility
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
          vscode.window.showErrorMessage('Jinja2 formatting failed: ' + error);
        }

        return replacements;
      },
    });

    context.subscriptions.push(formattingProvider);
  });

  // Configure language settings for all supported languages
  supportedLanguages.forEach(languageId => {
    vscode.languages.setLanguageConfiguration(languageId, createLanguageConfiguration());
  });

  // Register format command
  const formatCommand = vscode.commands.registerCommand('jinja2Formatter.formatDocument', () => {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      vscode.commands.executeCommand('editor.action.formatDocument');
    }
  });

  context.subscriptions.push(formatCommand);
}

export function deactivate(): void {
  // Clean up resources if needed
}
