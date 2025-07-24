import { getCSSLanguageService, TextDocument } from 'vscode-css-languageservice'
import { BaseFormatter, FormattingOptions } from './formatter'

export { FormattingOptions }

export class JinjaFormatter extends BaseFormatter {
  private cssLanguageService = getCSSLanguageService()

  protected formatElement(node: any, options: FormattingOptions, indentLevel: number): string {
    // Special handling for <style> tags to use VS Code CSS formatter
    if (node.tagName === 'style') {
      return this.formatStyleElement(node, options, indentLevel)
    }

    // Special handling for <script> tags to format JavaScript content
    if (node.tagName === 'script') {
      return this.formatScriptElement(node, options, indentLevel)
    }

    return super.formatElement(node, options, indentLevel)
  }

  private formatStyleElement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)
    const attributes = this.formatAttributes(node.attributes, options)

    if (!node.children || node.children.length === 0) {
      return `${indent}<style${attributes}></style>`
    }

    // Extract CSS content
    const cssContent = node.children
      .map((child: any) => {
        if (child.type === 'Text') {
          return child.value
        }
        return ''
      })
      .join('')

    if (!cssContent.trim()) {
      return `${indent}<style${attributes}></style>`
    }

    try {
      // Use VS Code CSS Language Service to format the CSS
      const cssDocument = TextDocument.create('temp.css', 'css', 1, cssContent)
      const stylesheet = this.cssLanguageService.parseStylesheet(cssDocument)

      // Get formatting options for CSS
      const formatOptions = {
        insertSpaces: options.insertSpaces ?? true,
        tabSize: options.tabSize ?? options.indentSize ?? 2,
      }

      // Format the CSS content
      const edits = this.cssLanguageService.format(cssDocument, undefined, formatOptions)

      let formattedCSS = cssContent
      if (edits && edits.length > 0) {
        // Apply edits in reverse order to maintain positions
        edits.sort(
          (a, b) =>
            b.range.start.line - a.range.start.line ||
            b.range.start.character - a.range.start.character,
        )

        const lines = formattedCSS.split('\n')
        edits.forEach((edit) => {
          const startLine = edit.range.start.line
          const startChar = edit.range.start.character
          const endLine = edit.range.end.line
          const endChar = edit.range.end.character

          if (startLine === endLine) {
            // Single line edit
            lines[startLine] =
              lines[startLine].slice(0, startChar) + edit.newText + lines[startLine].slice(endChar)
          } else {
            // Multi-line edit
            const beforeText = lines[startLine].slice(0, startChar)
            const afterText = lines[endLine].slice(endChar)
            const newLines = [beforeText + edit.newText + afterText]
            lines.splice(startLine, endLine - startLine + 1, ...newLines)
          }
        })
        formattedCSS = lines.join('\n')
      }

      // Clean and apply proper indentation to each line of the formatted CSS
      const cssLines = formattedCSS.split('\n')
      const indentedCSS = cssLines
        .map((line: string, index: number) => {
          const trimmedLine = line.trim()
          if (trimmedLine === '') {
            // Preserve empty lines but don't add unnecessary whitespace
            return index === 0 || index === cssLines.length - 1 ? '' : ''
          }

          // Determine indentation level based on CSS structure
          let cssIndentLevel = indentLevel + 1 // Base indentation for CSS content

          // If the line starts with a CSS property (contains colon) or is inside a rule
          // add an extra level of indentation
          if (
            trimmedLine.includes(':') &&
            !trimmedLine.startsWith('@') &&
            !trimmedLine.startsWith('/*')
          ) {
            // This is likely a CSS property, add extra indentation
            cssIndentLevel += 1
          } else if (trimmedLine === '}') {
            // Closing brace should align with the selector
            cssIndentLevel = indentLevel + 1
          } else if (trimmedLine.endsWith('{')) {
            // Opening brace line (selector) should have base CSS indentation
            cssIndentLevel = indentLevel + 1
          }

          // Apply template indentation + CSS-specific indentation
          return this.getIndent(options, cssIndentLevel) + trimmedLine
        })
        .filter((line, index, array) => {
          // Remove empty lines at the beginning and end
          if (line.trim() === '') {
            return index !== 0 && index !== array.length - 1
          }
          return true
        })
        .join('\n')

      return `${indent}<style${attributes}>\n${indentedCSS}\n${indent}</style>`
    } catch (error) {
      // Fallback to simple formatting if CSS parsing fails
      console.warn('CSS formatting failed, using fallback:', error)
      const lines = cssContent.split('\n')
      const indentedCSS = lines
        .map((line: string) => {
          const trimmedLine = line.trim()
          if (trimmedLine === '') return ''
          return this.getIndent(options, indentLevel + 1) + trimmedLine
        })
        .filter((line) => line.length > 0)
        .join('\n')

      return `${indent}<style${attributes}>\n${indentedCSS}\n${indent}</style>`
    }
  }

  private formatScriptElement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)
    const attributes = this.formatAttributes(node.attributes, options)

    if (!node.children || node.children.length === 0) {
      return `${indent}<script${attributes}></script>`
    }

    // Extract JavaScript content, preserving Jinja tags
    const scriptContent = this.extractMixedContent(node.children, options)

    if (!scriptContent.trim()) {
      return `${indent}<script${attributes}></script>`
    }

    try {
      // Format JavaScript while preserving Jinja templates
      const formattedJS = this.formatJavaScriptWithJinja(scriptContent, options, indentLevel + 1)
      return `${indent}<script${attributes}>\n${formattedJS}\n${indent}</script>`
    } catch (error) {
      // Fallback to simple formatting if JS parsing fails
      console.warn('JavaScript formatting failed, using fallback:', error)
      const lines = scriptContent.split('\n')
      const indentedJS = lines
        .map((line: string) => {
          const trimmedLine = line.trim()
          if (trimmedLine === '') return ''
          return this.getIndent(options, indentLevel + 1) + trimmedLine
        })
        .filter((line) => line.length > 0)
        .join('\n')

      return `${indent}<script${attributes}>\n${indentedJS}\n${indent}</script>`
    }
  }

  private extractMixedContent(children: any[], options: FormattingOptions): string {
    return children
      .map((child: any) => {
        if (child.type === 'Text') {
          return child.value
        } else if (child.type === 'VariableTag') {
          // Preserve Jinja variable tags
          const expr = this.formatExpression(child.expression)
          return `{{ ${expr} }}`
        } else if (child.type === 'TemplateTag') {
          // Preserve Jinja template tags
          return this.formatTemplateTag(child, options, 0)
        }
        return ''
      })
      .join('')
  }

  private formatJavaScriptWithJinja(content: string, options: FormattingOptions, indentLevel: number): string {
    // Simple JavaScript formatting that preserves Jinja tags
    const lines = content.split('\n')
    let formattedLines: string[] = []
    
    for (let line of lines) {
      const trimmedLine = line.trim()
      if (trimmedLine === '') {
        continue
      }

      // Basic JavaScript formatting
      let formattedLine = trimmedLine

      // Handle lines with Jinja tags - be more careful with spacing
      if (formattedLine.includes('{{') && formattedLine.includes('}}')) {
        // For lines with Jinja variable tags, add spaces around = if not already present
        formattedLine = formattedLine.replace(/(\w+)=(\{\{[^}]+\}\})/g, '$1 = $2')
        formattedLine = formattedLine.replace(/(\{\{[^}]+\}\})=(\w+)/g, '$1 = $2')
      } else if (!formattedLine.includes('{{') && !formattedLine.includes('{%')) {
        // For pure JavaScript lines, add spaces around operators
        formattedLine = formattedLine
          .replace(/([^=!<>])=([^=])/g, '$1 = $2') // = but not == != <= >=
          .replace(/\s+=\s+/g, ' = ') // Clean up multiple spaces
      }

      // Apply indentation
      const indentedLine = this.getIndent(options, indentLevel) + formattedLine
      formattedLines.push(indentedLine)
    }

    return formattedLines.join('\n')
  }

  protected formatNode(node: any, options: FormattingOptions, indentLevel: number): string {
    // First handle basic HTML nodes
    const baseResult = super.formatNode(node, options, indentLevel)
    if (baseResult) {
      return baseResult
    }

    // Handle Jinja template nodes
    switch (node.type) {
      case 'TemplateTag':
        return this.formatTemplateTag(node, options, indentLevel)
      case 'VariableTag':
        return this.formatVariableTag(node, options, indentLevel)
      case 'CommentTag':
        return this.formatCommentTag(node, options, indentLevel)
      default:
        return ''
    }
  }

  private formatTemplateTag(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)

    switch (node.templateType) {
      case 'IfStatement':
        return this.formatIfStatement(node, options, indentLevel)
      case 'ForStatement':
        return this.formatForStatement(node, options, indentLevel)
      case 'BlockStatement':
        return this.formatBlockStatement(node, options, indentLevel)
      case 'ExtendsStatement':
        return `${indent}{% extends "${node.template}" %}`
      case 'MacroStatement':
        return this.formatMacroStatement(node, options, indentLevel)
      case 'Assignment':
        return this.formatAssignment(node, options, indentLevel)
      case 'RawStatement':
        return this.formatRawStatement(node, options, indentLevel)
      case 'GenericTag':
        return `${indent}{% ${node.content} %}`
      default:
        return `${indent}{% unknown %}`
    }
  }

  private formatIfStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)
    const testExpr = this.formatExpression(node.test)

    let result = `${indent}{% if ${testExpr} %}`

    if (node.consequent && node.consequent.length > 0) {
      const bodyFormatted = node.consequent
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n')

      if (bodyFormatted.trim().length > 0) {
        result += '\n' + bodyFormatted
      }
    }

    if (node.alternate && node.alternate.length > 0) {
      result += `\n${indent}{% else %}`
      const alternateFormatted = node.alternate
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n')

      if (alternateFormatted.trim().length > 0) {
        result += '\n' + alternateFormatted
      }
    }

    result += `\n${indent}{% endif %}`
    return result
  }

  private formatForStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)

    // Handle multiple targets (e.g., key, value)
    let targetExpr: string
    if (Array.isArray(node.target)) {
      targetExpr = node.target.map((target: any) => this.formatExpression(target)).join(', ')
    } else {
      targetExpr = this.formatExpression(node.target)
    }

    const iterExpr = this.formatExpression(node.iter)

    let result = `${indent}{% for ${targetExpr} in ${iterExpr} %}`

    if (node.body && node.body.length > 0) {
      const bodyFormatted = node.body
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n')

      if (bodyFormatted.trim().length > 0) {
        result += '\n' + bodyFormatted
      }
    }

    if (node.orelse && node.orelse.length > 0) {
      result += `\n${indent}{% else %}`
      const elseFormatted = node.orelse
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n')

      if (elseFormatted.trim().length > 0) {
        result += '\n' + elseFormatted
      }
    }

    result += `\n${indent}{% endfor %}`
    return result
  }

  private formatBlockStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)

    const scopedStr = node.scoped ? ' scoped' : ''
    let result = `${indent}{% block ${node.name}${scopedStr} %}`

    if (node.body && node.body.length > 0) {
      const bodyFormatted = node.body
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n')

      if (bodyFormatted.trim().length > 0) {
        result += '\n' + bodyFormatted
      }
    }

    result += `\n${indent}{% endblock %}`
    return result
  }

  private formatMacroStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)
    const params = node.parameters ? node.parameters.map((p: any) => p.name).join(', ') : ''

    let result = `${indent}{% macro ${node.name}(${params}) %}`

    if (node.body && node.body.length > 0) {
      const bodyFormatted = node.body
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n')

      if (bodyFormatted.trim().length > 0) {
        result += '\n' + bodyFormatted
      }
    }

    result += `\n${indent}{% endmacro %}`
    return result
  }

  private formatAssignment(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)
    const target = this.formatExpression(node.target)
    const value = this.formatExpression(node.value)
    return `${indent}{% set ${target} = ${value} %}`
  }

  private formatRawStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)

    // Keep raw block content as is (preserve original line breaks and spaces)
    let content = node.content
    if (typeof content !== 'string') {
      content = ''
    }

    // Remove unnecessary line breaks at start and end (if any)
    content = content.trim()

    // Add line breaks before and after if content exists, otherwise keep on one line
    if (content) {
      return `${indent}{% raw %}\n${content}\n${indent}{% endraw %}`
    } else {
      return `${indent}{% raw %}{% endraw %}`
    }
  }

  private formatVariableTag(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)
    const expr = this.formatExpression(node.expression)
    return `${indent}{{ ${expr} }}`
  }

  private formatCommentTag(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel)
    return `${indent}{# ${node.value.trim()} #}`
  }

  private formatExpression(expr: any): string {
    if (!expr) return ''

    switch (expr.expressionType) {
      case 'Identifier':
        return expr.name
      case 'Literal':
        if (typeof expr.value === 'string') {
          return `"${expr.value}"`
        }
        return String(expr.value)
      case 'Filter':
        const baseExpr = this.formatExpression(expr.expression)
        const args = expr.arguments
          ? expr.arguments.map((arg: any) => this.formatExpression(arg)).join(', ')
          : ''
        return args ? `${baseExpr}|${expr.filterName}(${args})` : `${baseExpr}|${expr.filterName}`
      case 'AttributeAccess':
        const object = this.formatExpression(expr.object)
        const property = this.formatExpression(expr.property)
        return `${object}.${property}`
      case 'SubscriptAccess':
        const subscriptObject = this.formatExpression(expr.object)
        const index = this.formatExpression(expr.index)
        return `${subscriptObject}[${index}]`
      case 'SliceAccess':
        const sliceObject = this.formatExpression(expr.object)
        const start = expr.start ? this.formatExpression(expr.start) : ''
        const stop = expr.stop ? this.formatExpression(expr.stop) : ''
        const step = expr.step ? this.formatExpression(expr.step) : ''

        if (step) {
          return `${sliceObject}[${start}:${stop}:${step}]`
        } else {
          return `${sliceObject}[${start}:${stop}]`
        }
      case 'FunctionCall':
        const funcName = this.formatExpression(expr.function)
        const funcArgs = expr.arguments
          ? expr.arguments
              .map((arg: any) => {
                // Handle keyword arguments
                if (arg.expressionType === 'KeywordArgument') {
                  const value = this.formatExpression(arg.value)
                  return `${arg.key}=${value}`
                }
                return this.formatExpression(arg)
              })
              .join(', ')
          : ''
        return `${funcName}(${funcArgs})`
      case 'KeywordArgument':
        const value = this.formatExpression(expr.value)
        return `${expr.key}=${value}`
      case 'BinaryOperation':
        const left = this.formatExpression(expr.left)
        const right = this.formatExpression(expr.right)
        return `${left} ${expr.operator} ${right}`
      case 'UnaryOperation':
        const operand = this.formatExpression(expr.operand)
        return `${expr.operator} ${operand}`
      case 'ArrayLiteral':
        const elements = expr.elements
          ? expr.elements.map((element: any) => this.formatExpression(element)).join(', ')
          : ''
        return `[${elements}]`
      default:
        return String(expr.value || expr.name || '')
    }
  }
}
