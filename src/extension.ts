import * as vscode from 'vscode'
import { createLanguageConfiguration } from './functions'
import { Jinja2Formatter } from './parser/jinja2-formatter'

export function activate(context: vscode.ExtensionContext): void {
  const supportedLanguages = ['jinja', 'jinja2', 'njk', 'nunjucks', 'twig']

  supportedLanguages.forEach((languageId) => {
    const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider(languageId, {
      provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken,
      ): vscode.ProviderResult<vscode.TextEdit[]> {
        const jinja2Config = vscode.workspace.getConfiguration('jinja2Formatter')

        try {
          const formatter = new Jinja2Formatter()
          const workspaceConfig = vscode.workspace.getConfiguration('editor')
          const jinja2Config = vscode.workspace.getConfiguration('jinja2Formatter')
          const activeEditor = vscode.window.activeTextEditor
          const activeEditorOptions = activeEditor.options

          const insertSpaces =
            options.insertSpaces ??
            activeEditorOptions?.insertSpaces ??
            workspaceConfig.get<boolean>('insertSpaces') ??
            true
          const indentChar = insertSpaces ? ' ' : '\t'
          const indentSize =
            indentChar === '\t'
              ? 1
              : (options.tabSize as number) ||
                (activeEditorOptions.tabSize as number) ||
                workspaceConfig.get<number>('tabSize') ||
                jinja2Config.get<number>('indentSize') ||
                2

          const preserveEmptyLines = jinja2Config.get<number>('preserveEmptyLine') || 0
          const maxLineLength = jinja2Config.get<number>('maxLineLength', 120)

          const formattedText = formatter.format(document.getText(), {
            indentSize,
            indentChar,
            maxLineLength,
            preserveEmptyLines,
            insertFinalNewline: true,
          })

          const fullRange = new vscode.Range(
            new vscode.Position(0, 0),
            new vscode.Position(
              document.lineCount - 1,
              document.lineAt(document.lineCount - 1).text.length,
            ),
          )

          return [vscode.TextEdit.replace(fullRange, formattedText)]
        } catch (error) {
          console.error('New parser formatting error:', error)
          vscode.window.showErrorMessage(`Jinja2 formatting failed: ${error}`)
          return []
        }
      },
    })
  })

  // Configure language settings for all supported languages
  supportedLanguages.forEach((languageId) => {
    vscode.languages.setLanguageConfiguration(languageId, createLanguageConfiguration())
  })

  // Register format command
  const formatCommand = vscode.commands.registerCommand('jinja2Formatter.formatDocument', () => {
    const editor = vscode.window.activeTextEditor
    if (editor) {
      vscode.commands.executeCommand('editor.action.formatDocument')
    }
  })

  context.subscriptions.push(formatCommand)
}

export function deactivate(): void {}
