import * as vscode from 'vscode'
import { FormattingOptions, JinjaFormatter } from './formatter/jinja-formatter'
import { JinjaParser } from './parser/jinja-parser'

export class Jinja2Formatter {
  private parser: JinjaParser
  private formatter: JinjaFormatter

  constructor() {
    this.formatter = new JinjaFormatter()
  }

  public format(input: string, options: Partial<FormattingOptions> = {}): string {
    const defaultOptions: FormattingOptions = {
      indentSize: 2,
      indentChar: ' ',
      maxLineLength: 120,
      preserveEmptyLines: 0,
      insertFinalNewline: true,
    }

    const formattingOptions = { ...defaultOptions, ...options }

    try {
      this.parser = new JinjaParser(input)
      const ast = this.parser.parse()
      return this.formatter.format(ast, formattingOptions)
    } catch (error) {
      console.error('Parsing error:', error)
      throw error
    }
  }
}
