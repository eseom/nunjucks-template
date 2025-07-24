import type {
  BlockStatementNode,
  CommentTagNode,
  ExpressionNode,
  ExtendsStatementNode,
  FilterNode,
  ForStatementNode,
  IdentifierNode,
  IfStatementNode,
  LiteralNode,
  MacroStatementNode,
  TemplateNode,
  VariableTagNode,
} from '../ast/nodes'
import type { Token } from '../lexer/tokens'
import { TokenType } from '../lexer/tokens'
import { HTMLParser } from './html-parser'

export class JinjaParser extends HTMLParser {
  constructor(input: string | Token[]) {
    if (typeof input === 'string') {
      super(input)
    } else {
      // When token array is passed
      super('') // Call parent class with dummy string
      this.tokens = input // Set tokens directly
      this.current = 0
    }
  }

  protected parseNode(): any {
    const token = this.peek()

    switch (token.type) {
      case TokenType.TEMPLATE_TAG_START:
        return this.parseTemplateTag()
      case TokenType.VARIABLE_START:
        return this.parseVariableTag()
      case TokenType.COMMENT_START:
        return this.parseCommentTag()
      default:
        return super.parseNode()
    }
  }

  private parseTemplateTag(): TemplateNode {
    const startToken = this.consume(TokenType.TEMPLATE_TAG_START, 'Expected "{%"')

    // Skip whitespace
    this.skipWhitespace()

    const tagToken = this.peek()

    switch (tagToken.type) {
      case TokenType.IF:
        return this.parseIfStatement(startToken)
      case TokenType.FOR:
        return this.parseForStatement(startToken)
      case TokenType.BLOCK:
        return this.parseBlockStatement(startToken)
      case TokenType.EXTENDS:
        return this.parseExtendsStatement(startToken)
      case TokenType.MACRO:
        return this.parseMacroStatement(startToken)
      case TokenType.SET:
        return this.parseSetStatement(startToken)
      case TokenType.IDENTIFIER:
        // Special tags like raw, endraw, etc.
        if (tagToken.value === 'raw') {
          return this.parseRawStatement(startToken)
        }
        // Regular identifiers are handled as basic template tags
        return this.parseGenericTemplateTag(startToken)
      default:
        return this.parseGenericTemplateTag(startToken)
    }
  }

  private parseIfStatement(startToken: Token): IfStatementNode {
    this.consume(TokenType.IF, 'Expected "if"')
    this.skipWhitespace()

    const test = this.parseExpression()
    this.skipWhitespace()
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')

    const consequent = this.parseTemplateBody(['elif', 'else', 'endif'])
    let alternate: any[] | undefined

    // Handle elif/else
    if (this.checkTemplateTag('elif')) {
      this.consume(TokenType.TEMPLATE_TAG_START, 'Expected "{%"')
      this.skipWhitespace()
      this.consume(TokenType.ELIF, 'Expected "elif"')
      this.skipWhitespace()
      // Parse elif condition (to be implemented later)
      const elifTest = this.parseExpression()
      this.skipWhitespace()
      this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')
      alternate = this.parseTemplateBody(['endif'])
    } else if (this.checkTemplateTag('else')) {
      this.consume(TokenType.TEMPLATE_TAG_START, 'Expected "{%"')
      this.skipWhitespace()
      this.consume(TokenType.ELSE, 'Expected "else"')
      this.skipWhitespace()
      this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')
      alternate = this.parseTemplateBody(['endif'])
    }

    // Consume endif
    this.consumeEndTag('endif')

    return {
      type: 'TemplateTag',
      templateType: 'IfStatement',
      test,
      consequent,
      alternate,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseForStatement(startToken: Token): ForStatementNode {
    this.consume(TokenType.FOR, 'Expected "for"')
    this.skipWhitespace()

    // Parse target(s) - can be single identifier or multiple identifiers separated by commas
    const targets: any[] = []
    targets.push(this.parseIdentifier())
    
    this.skipWhitespace()
    while (this.check(TokenType.COMMA)) {
      this.advance() // consume comma
      this.skipWhitespace()
      targets.push(this.parseIdentifier())
      this.skipWhitespace()
    }

    this.consume(TokenType.IN, 'Expected "in"')
    this.skipWhitespace()

    const iter = this.parseExpression()
    this.skipWhitespace()
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')

    const body = this.parseTemplateBody(['else', 'endfor'])
    let orelse: any[] | undefined

    if (this.checkTemplateTag('else')) {
      this.consume(TokenType.TEMPLATE_TAG_START, 'Expected "{%"')
      this.skipWhitespace()
      this.consume(TokenType.ELSE, 'Expected "else"')
      this.skipWhitespace()
      this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')
      orelse = this.parseTemplateBody(['endfor'])
    }

    this.consumeEndTag('endfor')

    return {
      type: 'TemplateTag',
      templateType: 'ForStatement',
      target: targets.length === 1 ? targets[0] : targets,
      iter,
      body,
      orelse,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseBlockStatement(startToken: Token): BlockStatementNode {
    this.consume(TokenType.BLOCK, 'Expected "block"')
    this.skipWhitespace()

    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected block name')
    this.skipWhitespace()
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')

    const body = this.parseTemplateBody(['endblock'])
    this.consumeEndTag('endblock')

    return {
      type: 'TemplateTag',
      templateType: 'BlockStatement',
      name: nameToken.value,
      body,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseExtendsStatement(startToken: Token): ExtendsStatementNode {
    this.consume(TokenType.EXTENDS, 'Expected "extends"')
    this.skipWhitespace()

    const templateToken = this.consume(TokenType.STRING, 'Expected template name')
    this.skipWhitespace()
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')

    return {
      type: 'TemplateTag',
      templateType: 'ExtendsStatement',
      template: templateToken.value,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseMacroStatement(startToken: Token): MacroStatementNode {
    this.consume(TokenType.MACRO, 'Expected "macro"')
    this.skipWhitespace()

    const nameToken = this.consume(TokenType.IDENTIFIER, 'Expected macro name')
    this.skipWhitespace()
    this.consume(TokenType.LPAREN, 'Expected "("')

    const parameters: IdentifierNode[] = []
    while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
      this.skipWhitespace()

      if (this.check(TokenType.IDENTIFIER)) {
        const param = this.parseIdentifier()
        parameters.push(param)

        // Handle default value (e.g., name='default')
        if (this.check(TokenType.ASSIGN)) {
          this.advance() // =
          this.skipWhitespace()
          // Parse default value (simplified - only strings, numbers, identifiers)
          if (
            this.check(TokenType.STRING) ||
            this.check(TokenType.NUMBER) ||
            this.check(TokenType.IDENTIFIER)
          ) {
            this.advance() // Consume default value
          }
        }
      }

      this.skipWhitespace()
      if (this.check(TokenType.COMMA)) {
        this.advance()
      }
    }

    this.consume(TokenType.RPAREN, 'Expected ")"')
    this.skipWhitespace()
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')

    const body = this.parseTemplateBody(['endmacro'])
    this.consumeEndTag('endmacro')

    return {
      type: 'TemplateTag',
      templateType: 'MacroStatement',
      name: nameToken.value,
      parameters,
      body,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseSetStatement(startToken: Token): any {
    this.consume(TokenType.SET, 'Expected "set"')
    this.skipWhitespace()

    const target = this.parseIdentifier()
    this.skipWhitespace()
    this.consume(TokenType.ASSIGN, 'Expected "="')
    this.skipWhitespace()

    const value = this.parseExpression()
    this.skipWhitespace()
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')

    return {
      type: 'TemplateTag',
      templateType: 'Assignment',
      target,
      value,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseRawStatement(startToken: Token): any {
    this.consume(TokenType.IDENTIFIER, 'Expected "raw"') // raw
    this.skipWhitespace()
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')

    // Handle all content until {% endraw %} as text
    const contentStart = this.current
    while (!this.isAtEnd() && !this.checkTemplateTag('endraw')) {
      this.advance()
    }

    const rawContent = this.tokens
      .slice(contentStart, this.current)
      .map((t) => t.value)
      .join('')

    this.consumeEndTag('endraw')

    return {
      type: 'TemplateTag',
      templateType: 'RawStatement',
      content: rawContent,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseGenericTemplateTag(startToken: Token): any {
    // General template tags (from, import, etc.)
    const tokens = []
    while (!this.check(TokenType.TEMPLATE_TAG_END) && !this.isAtEnd()) {
      tokens.push(this.advance().value)
    }
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')

    const content = tokens.join(' ').trim()

    return {
      type: 'TemplateTag',
      templateType: 'GenericTag',
      content: content,
      tokens: content,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseVariableTag(): VariableTagNode {
    const startToken = this.consume(TokenType.VARIABLE_START, 'Expected "{{"')
    this.skipWhitespace()

    const expression = this.parseExpression()
    this.skipWhitespace()
    this.consume(TokenType.VARIABLE_END, 'Expected "}}"')

    return {
      type: 'VariableTag',
      templateType: 'VariableTag',
      expression,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseCommentTag(): CommentTagNode {
    const startToken = this.consume(TokenType.COMMENT_START, 'Expected "{#"')

    const contentTokens = []
    while (!this.check(TokenType.COMMENT_END) && !this.isAtEnd()) {
      contentTokens.push(this.advance())
    }

    this.consume(TokenType.COMMENT_END, 'Expected "#}"')

    return {
      type: 'CommentTag',
      templateType: 'CommentTag',
      value: contentTokens.map((t) => t.value).join(''),
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseExpression(): ExpressionNode {
    return this.parseLogicalOrExpression()
  }

  private parseLogicalOrExpression(): ExpressionNode {
    let expr = this.parseLogicalAndExpression()

    while (this.check(TokenType.OR)) {
      const operator = this.advance()
      this.skipWhitespace()
      const right = this.parseLogicalAndExpression()

      expr = {
        type: 'Expression',
        expressionType: 'BinaryOperation',
        operator: operator.value,
        left: expr,
        right: right,
      } as any
    }

    return expr
  }

  private parseLogicalAndExpression(): ExpressionNode {
    let expr = this.parseLogicalNotExpression()

    while (this.check(TokenType.AND)) {
      const operator = this.advance()
      this.skipWhitespace()
      const right = this.parseLogicalNotExpression()

      expr = {
        type: 'Expression',
        expressionType: 'BinaryOperation',
        operator: operator.value,
        left: expr,
        right: right,
      } as any
    }

    return expr
  }

  private parseLogicalNotExpression(): ExpressionNode {
    if (this.check(TokenType.NOT)) {
      const operator = this.advance()
      this.skipWhitespace()
      const operand = this.parseLogicalNotExpression()

      return {
        type: 'Expression',
        expressionType: 'UnaryOperation',
        operator: operator.value,
        operand: operand,
      } as any
    }

    return this.parseFilterExpression()
  }

  private parseFilterExpression(): ExpressionNode {
    let expr = this.parseComparisonExpression()

    while (this.check(TokenType.PIPE)) {
      this.advance() // |
      this.skipWhitespace()

      const filterName = this.consume(TokenType.IDENTIFIER, 'Expected filter name').value
      const args: ExpressionNode[] = []

      // Handle filter arguments (simplified)
      if (this.check(TokenType.LPAREN)) {
        this.advance() // (
        while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
          this.skipWhitespace()
          args.push(this.parsePrimaryExpression())
          this.skipWhitespace()
          if (this.check(TokenType.COMMA)) {
            this.advance()
          }
        }
        this.consume(TokenType.RPAREN, 'Expected ")"')
      }

      expr = {
        type: 'Expression',
        expressionType: 'Filter',
        expression: expr,
        filterName,
        arguments: args,
      } as FilterNode
    }

    return expr
  }

  private parseComparisonExpression(): ExpressionNode {
    let expr = this.parsePrimaryExpression()

    while (this.check(TokenType.EQ) || this.check(TokenType.STRICT_EQ) || 
           this.check(TokenType.NE) || this.check(TokenType.STRICT_NE) ||
           this.check(TokenType.LT) || this.check(TokenType.LE) ||
           this.check(TokenType.GT) || this.check(TokenType.GE)) {
      
      const operator = this.advance()
      this.skipWhitespace()
      const right = this.parsePrimaryExpression()

      expr = {
        type: 'Expression',
        expressionType: 'BinaryOperation',
        operator: operator.value,
        left: expr,
        right: right,
      } as any
    }

    return expr
  }

  private parsePrimaryExpression(): ExpressionNode {
    const token = this.peek()

    switch (token.type) {
      case TokenType.IDENTIFIER:
        return this.parseAttributeAccess()
      case TokenType.DOT:
        // Handle expressions that start with a dot (e.g., .property)
        // This can happen when object part is missing or malformed
        this.advance() // consume the dot
        const property = this.parseIdentifier()
        return {
          type: 'Expression',
          expressionType: 'AttributeAccess',
          object: {
            type: 'Expression',
            expressionType: 'Identifier',
            name: '',
          } as IdentifierNode,
          property: property,
        } as any
      case TokenType.STRING:
        this.advance()
        return {
          type: 'Expression',
          expressionType: 'Literal',
          value: token.value,
        } as LiteralNode
      case TokenType.NUMBER:
        this.advance()
        return {
          type: 'Expression',
          expressionType: 'Literal',
          value: parseFloat(token.value),
        } as LiteralNode
      case TokenType.BOOLEAN:
        this.advance()
        return {
          type: 'Expression',
          expressionType: 'Literal',
          value: token.value === 'true',
        } as LiteralNode
      case TokenType.LPAREN:
        this.advance() // (
        const expr = this.parseExpression()
        this.consume(TokenType.RPAREN, 'Expected ")"')
        return expr
      default:
        throw new Error(`Unexpected token in expression: ${token.type}`)
    }
  }

  private parseAttributeAccess(): ExpressionNode {
    let expr = this.parseIdentifier()

    while (this.check(TokenType.DOT) || this.check(TokenType.LPAREN) || this.check(TokenType.LBRACKET)) {
      if (this.check(TokenType.DOT)) {
        this.advance() // .
        const property = this.parseIdentifier()
        expr = {
          type: 'Expression',
          expressionType: 'AttributeAccess',
          object: expr,
          property: property,
        } as any
      } else if (this.check(TokenType.LBRACKET)) {
        // Array/dictionary access
        this.advance() // [
        this.skipWhitespace()
        const index = this.parseExpression()
        this.skipWhitespace()
        this.consume(TokenType.RBRACKET, 'Expected "]"')
        expr = {
          type: 'Expression',
          expressionType: 'SubscriptAccess',
          object: expr,
          index: index,
        } as any
      } else if (this.check(TokenType.LPAREN)) {
        // Function call
        this.advance() // (
        const args: ExpressionNode[] = []

        while (!this.check(TokenType.RPAREN) && !this.isAtEnd()) {
          this.skipWhitespace()

          // Check for keyword arguments (identifier = expression)
          if (this.check(TokenType.IDENTIFIER) && this.peekNext()?.type === TokenType.ASSIGN) {
            const keyToken = this.advance() // identifier
            this.advance() // =
            const value = this.parseExpression()

            // Handle keyword arguments as special expressions
            args.push({
              type: 'Expression',
              expressionType: 'KeywordArgument',
              key: keyToken.value,
              value: value,
            } as any)
          } else {
            // Regular positional arguments
            args.push(this.parseExpression())
          }

          this.skipWhitespace()
          if (this.check(TokenType.COMMA)) {
            this.advance()
          }
        }

        this.consume(TokenType.RPAREN, 'Expected ")"')

        expr = {
          type: 'Expression',
          expressionType: 'FunctionCall',
          function: expr,
          arguments: args,
        } as any
      }
    }

    return expr
  }

  private parseIdentifier(): IdentifierNode {
    const token = this.consume(TokenType.IDENTIFIER, 'Expected identifier')
    return {
      type: 'Expression',
      expressionType: 'Identifier',
      name: token.value,
    }
  }

  private parseTemplateBody(endTags: string[]): any[] {
    const body = []

    while (!this.isAtEnd() && !this.checkAnyTemplateTag(endTags)) {
      const node = this.parseNode()
      if (node) {
        body.push(node)
      }
    }

    return body
  }

  private skipWhitespace(): void {
    while ((this.check(TokenType.WHITESPACE) || this.check(TokenType.NEWLINE)) && !this.isAtEnd()) {
      this.advance()
    }
  }

  private checkTemplateTag(tagName: string): boolean {
    if (!this.check(TokenType.TEMPLATE_TAG_START)) {
      return false
    }

    // Check next tokens from current position
    if (this.current + 1 < this.tokens.length) {
      const nextToken = this.tokens[this.current + 1]

      // First check by token type
      switch (tagName) {
        case 'if':
          return nextToken.type === TokenType.IF
        case 'elif':
          return nextToken.type === TokenType.ELIF
        case 'else':
          return nextToken.type === TokenType.ELSE
        case 'endif':
          return nextToken.type === TokenType.ENDIF
        case 'for':
          return nextToken.type === TokenType.FOR
        case 'endfor':
          return nextToken.type === TokenType.ENDFOR
        case 'block':
          return nextToken.type === TokenType.BLOCK
        case 'endblock':
          return nextToken.type === TokenType.ENDBLOCK
        case 'extends':
          return nextToken.type === TokenType.EXTENDS
        case 'include':
          return nextToken.type === TokenType.INCLUDE
        case 'macro':
          return nextToken.type === TokenType.MACRO
        case 'endmacro':
          return nextToken.type === TokenType.ENDMACRO
        case 'set':
          return nextToken.type === TokenType.SET
        default:
          // Check as general identifier
          return nextToken.type === TokenType.IDENTIFIER && nextToken.value === tagName
      }
    }

    return false
  }

  private checkAnyTemplateTag(tagNames: string[]): boolean {
    return tagNames.some((tag) => this.checkTemplateTag(tag))
  }

  private consumeTemplateTag(tagName: string): void {
    this.consume(TokenType.TEMPLATE_TAG_START, `Expected "{%"`)
    this.skipWhitespace()
    const token = this.consume(TokenType.IDENTIFIER, `Expected "${tagName}"`)
    if (token.value !== tagName) {
      throw new Error(`Expected "${tagName}", got "${token.value}"`)
    }
    this.skipWhitespace()
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')
  }

  private consumeEndTag(tagName: string): void {
    this.consume(TokenType.TEMPLATE_TAG_START, `Expected "{%"`)
    this.skipWhitespace()

    // Check directly by token type
    let expectedTokenType: TokenType
    switch (tagName) {
      case 'endif':
        expectedTokenType = TokenType.ENDIF
        break
      case 'endfor':
        expectedTokenType = TokenType.ENDFOR
        break
      case 'endblock':
        expectedTokenType = TokenType.ENDBLOCK
        break
      case 'endmacro':
        expectedTokenType = TokenType.ENDMACRO
        break
      case 'endraw':
        expectedTokenType = TokenType.IDENTIFIER
        break // endraw has no separate token
      default:
        expectedTokenType = TokenType.IDENTIFIER
        break
    }

    this.consume(expectedTokenType, `Expected "${tagName}"`)
    this.skipWhitespace()
    this.consume(TokenType.TEMPLATE_TAG_END, 'Expected "%}"')
  }
}
