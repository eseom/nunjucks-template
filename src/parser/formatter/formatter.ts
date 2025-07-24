import type { DocumentNode } from '../ast/nodes'

export interface FormattingOptions {
  indentSize: number
  indentChar: string
  maxLineLength: number
  preserveEmptyLines: number
  insertFinalNewline: boolean
}

export interface Formatter {
  format(document: DocumentNode, options: FormattingOptions): string
}

export class BaseFormatter implements Formatter {
  format(document: DocumentNode, options: FormattingOptions): string {
    return this.formatNode(document, options, 0)
  }

  protected formatNode(node: any, options: FormattingOptions, indentLevel: number): string {
    switch (node.type) {
      case 'Document':
        return this.formatDocument(node, options, indentLevel)
      case 'Element':
        return this.formatElement(node, options, indentLevel)
      case 'Text':
        return this.formatText(node, options, indentLevel)
      case 'Comment':
        return this.formatComment(node, options, indentLevel)
      case 'Doctype':
        return this.formatDoctype(node, options, indentLevel)
      default:
        return ''
    }
  }

  protected formatDocument(
    node: DocumentNode,
    options: FormattingOptions,
    indentLevel: number,
  ): string {
    const formatted = node.children
      .map((child) => this.formatNode(child, options, indentLevel))
      .filter((text) => text.trim().length > 0)
      .join('\n')

    return options.insertFinalNewline ? formatted + '\n' : formatted
  }

  protected formatElement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)
    const tagName = node.tagName
    const attributes = this.formatAttributes(node.attributes, options)

    if (node.selfClosing || node.void) {
      return `${indent}<${tagName}${attributes}${node.selfClosing ? ' />' : '>'}`
    }

    const hasChildren = node.children && node.children.length > 0
    if (!hasChildren) {
      return `${indent}<${tagName}${attributes}></${tagName}>`
    }

    const childrenFormatted = node.children
      .map((child: any) => this.formatNode(child, options, indentLevel + 1))
      .filter((text: string) => text.trim().length > 0)
      .join('\n')

    if (childrenFormatted.trim().length === 0) {
      return `${indent}<${tagName}${attributes}></${tagName}>`
    }

    return `${indent}<${tagName}${attributes}>\n${childrenFormatted}\n${indent}</${tagName}>`
  }

  protected formatAttributes(attributes: any[], options: FormattingOptions): string {
    if (!attributes || attributes.length === 0) {
      return ''
    }

    return (
      ' ' +
      attributes
        .map((attr) => {
          if (attr.value === null) {
            return attr.name
          }
          const quote = attr.quoted ? '"' : ''
          return `${attr.name}=${quote}${attr.value}${quote}`
        })
        .join(' ')
    )
  }

  protected formatText(node: any, options: FormattingOptions, indentLevel: number): string {
    const text = node.value.trim()
    if (text.length === 0) {
      return ''
    }
    return this.getIndent(options, indentLevel) + text
  }

  protected formatComment(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)
    return `${indent}<!-- ${node.value} -->`
  }

  protected formatDoctype(node: any, options: FormattingOptions, indentLevel: number): string {
    return node.value
  }

  protected getIndent(options: FormattingOptions, level: number): string {
    return options.indentChar.repeat(options.indentSize * level)
  }
}
