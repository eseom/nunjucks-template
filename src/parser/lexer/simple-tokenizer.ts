import type { Position } from '../ast/types'
import { TEMPLATE_KEYWORDS, Token, TokenType } from './tokens'

export class SimpleTokenizer {
  private input: string
  private position: number = 0
  private line: number = 1
  private column: number = 1
  private tokens: Token[] = []

  constructor(input: string) {
    this.input = input
  }

  public tokenize(): Token[] {
    while (this.position < this.input.length) {
      this.scanToken()
    }

    this.addToken(TokenType.EOF, '')
    return this.tokens
  }

  private scanToken(): void {
    const c = this.current()

    // Check template syntax first
    if (c === '{') {
      if (this.peek(1) === '%') {
        this.scanTemplateTag()
        return
      } else if (this.peek(1) === '{') {
        this.scanVariableTag()
        return
      } else if (this.peek(1) === '#') {
        this.scanCommentTag()
        return
      }
    }

    // Check HTML tags
    if (c === '<') {
      if (this.peek(1) === '!' && this.peek(2) === '-' && this.peek(3) === '-') {
        this.scanHtmlComment()
        return
      } else if (this.peek(1) === '!') {
        this.scanDoctype()
        return
      } else if (this.peek(1) === '/') {
        this.addToken(TokenType.TAG_END_OPEN, '</')
        this.advance(2)
        this.scanTagName()
        return
      } else {
        this.addToken(TokenType.TAG_OPEN, '<')
        this.advance()
        this.scanTagName()
        return
      }
    }

    // Other characters
    switch (c) {
      case '>':
        this.addToken(TokenType.TAG_CLOSE, '>')
        this.advance()
        break
      case '/':
        if (this.peek(1) === '>') {
          this.addToken(TokenType.TAG_SELF_CLOSE, '/>')
          this.advance(2)
        } else {
          this.scanText()
        }
        break
      case '\n':
        this.addToken(TokenType.NEWLINE, '\n')
        this.advance()
        this.line++
        this.column = 0
        break
      case ' ':
      case '\r':
      case '\t':
        this.scanWhitespace()
        break
      default:
        this.scanText()
        break
    }
  }

  private scanTemplateTag(): void {
    this.addToken(TokenType.TEMPLATE_TAG_START, '{%')
    this.advance(2)

    this.skipWhitespace()

    // Scan tag content
    while (!this.isAtEnd() && !(this.current() === '%' && this.peek(1) === '}')) {
      if (this.isWhitespace(this.current())) {
        this.skipWhitespace()
      } else if (this.isAlpha(this.current())) {
        this.scanIdentifier()
      } else if (this.current() === '"' || this.current() === "'") {
        this.scanString()
      } else if (this.isDigit(this.current())) {
        this.scanNumber()
      } else {
        this.scanOperator()
      }
    }

    if (this.current() === '%' && this.peek(1) === '}') {
      this.addToken(TokenType.TEMPLATE_TAG_END, '%}')
      this.advance(2)
    }
  }

  private scanVariableTag(): void {
    this.addToken(TokenType.VARIABLE_START, '{{')
    this.advance(2)

    this.skipWhitespace()

    // Scan variable content
    while (!this.isAtEnd() && !(this.current() === '}' && this.peek(1) === '}')) {
      if (this.isWhitespace(this.current())) {
        this.skipWhitespace()
      } else if (this.isAlpha(this.current())) {
        this.scanIdentifier()
      } else if (this.current() === '"' || this.current() === "'") {
        this.scanString()
      } else if (this.isDigit(this.current())) {
        this.scanNumber()
      } else {
        this.scanOperator()
      }
    }

    if (this.current() === '}' && this.peek(1) === '}') {
      this.addToken(TokenType.VARIABLE_END, '}}')
      this.advance(2)
    }
  }

  private scanCommentTag(): void {
    this.addToken(TokenType.COMMENT_START, '{#')
    this.advance(2)

    const start = this.position
    while (!this.isAtEnd() && !(this.current() === '#' && this.peek(1) === '}')) {
      if (this.current() === '\n') {
        this.line++
        this.column = 0
      }
      this.advance()
    }

    const content = this.input.substring(start, this.position).trim()
    if (content) {
      this.addToken(TokenType.TEXT, content)
    }

    if (this.current() === '#' && this.peek(1) === '}') {
      this.addToken(TokenType.COMMENT_END, '#}')
      this.advance(2)
    }
  }

  private scanHtmlComment(): void {
    const start = this.position
    this.advance(4) // <!--

    while (!this.isAtEnd()) {
      if (this.current() === '-' && this.peek(1) === '-' && this.peek(2) === '>') {
        this.advance(3) // -->
        break
      }
      if (this.current() === '\n') {
        this.line++
        this.column = 0
      }
      this.advance()
    }

    const value = this.input.substring(start, this.position)
    this.addToken(TokenType.COMMENT, value)
  }

  private scanDoctype(): void {
    const start = this.position
    while (!this.isAtEnd() && this.current() !== '>') {
      if (this.current() === '\n') {
        this.line++
        this.column = 0
      }
      this.advance()
    }
    if (!this.isAtEnd()) this.advance() // >

    const value = this.input.substring(start, this.position)
    this.addToken(TokenType.DOCTYPE, value)
  }

  private scanTagName(): void {
    this.skipWhitespace()

    if (this.isAlpha(this.current())) {
      const start = this.position
      while (
        this.isAlphaNumeric(this.current()) ||
        this.current() === '-' ||
        this.current() === ':'
      ) {
        this.advance()
      }
      const tagName = this.input.substring(start, this.position)
      this.addToken(TokenType.TAG_NAME, tagName)

      this.scanAttributes()
    }
  }

  private scanAttributes(): void {
    while (!this.isAtEnd() && this.current() !== '>' && this.current() !== '/') {
      this.skipWhitespace()

      if (this.current() === '>' || this.current() === '/') break

      if (this.isAlpha(this.current())) {
        // Attribute name
        const start = this.position
        while (
          this.isAlphaNumeric(this.current()) ||
          this.current() === '-' ||
          this.current() === ':'
        ) {
          this.advance()
        }
        const attrName = this.input.substring(start, this.position)
        this.addToken(TokenType.ATTRIBUTE_NAME, attrName)

        this.skipWhitespace()

        if (this.current() === '=') {
          this.addToken(TokenType.EQUALS, '=')
          this.advance()
          this.skipWhitespace()

          if (this.current() === '"' || this.current() === "'") {
            this.scanString()
          } else {
            // Unquoted attribute value
            const valueStart = this.position
            while (
              !this.isAtEnd() &&
              !this.isWhitespace(this.current()) &&
              this.current() !== '>' &&
              this.current() !== '/'
            ) {
              this.advance()
            }
            if (this.position > valueStart) {
              const value = this.input.substring(valueStart, this.position)
              this.addToken(TokenType.ATTRIBUTE_VALUE, value)
            }
          }
        }
      } else {
        this.advance()
      }
    }
  }

  private scanIdentifier(): void {
    const start = this.position
    while (this.isAlphaNumeric(this.current()) || this.current() === '_') {
      this.advance()
    }

    const value = this.input.substring(start, this.position)
    const type = this.getIdentifierType(value)
    this.addToken(type, value)
  }

  private scanString(): void {
    const quote = this.current()
    this.advance() // Starting quote

    const start = this.position
    while (!this.isAtEnd() && this.current() !== quote) {
      if (this.current() === '\n') {
        this.line++
        this.column = 0
      }
      this.advance()
    }

    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`)
    }

    const value = this.input.substring(start, this.position)
    this.advance() // 끝 따옴표
    this.addToken(TokenType.STRING, value)
  }

  private scanNumber(): void {
    const start = this.position
    while (this.isDigit(this.current())) {
      this.advance()
    }

    if (this.current() === '.' && this.isDigit(this.peek(1))) {
      this.advance() // .
      while (this.isDigit(this.current())) {
        this.advance()
      }
    }

    const value = this.input.substring(start, this.position)
    this.addToken(TokenType.NUMBER, value)
  }

  private scanOperator(): void {
    const c = this.current()
    switch (c) {
      case '|':
        this.addToken(TokenType.PIPE, '|')
        this.advance()
        break
      case '.':
        this.addToken(TokenType.DOT, '.')
        this.advance()
        break
      case '(':
        this.addToken(TokenType.LPAREN, '(')
        this.advance()
        break
      case ')':
        this.addToken(TokenType.RPAREN, ')')
        this.advance()
        break
      case '[':
        this.addToken(TokenType.LBRACKET, '[')
        this.advance()
        break
      case ']':
        this.addToken(TokenType.RBRACKET, ']')
        this.advance()
        break
      case ',':
        this.addToken(TokenType.COMMA, ',')
        this.advance()
        break
      case '=':
        if (this.peek(1) === '=') {
          if (this.peek(2) === '=') {
            // ===
            this.addToken(TokenType.STRICT_EQ, '===')
            this.advance()
            this.advance()
            this.advance()
          } else {
            // ==
            this.addToken(TokenType.EQ, '==')
            this.advance()
            this.advance()
          }
        } else {
          // =
          this.addToken(TokenType.ASSIGN, '=')
          this.advance()
        }
        break
      case '!':
        if (this.peek(1) === '=') {
          if (this.peek(2) === '=') {
            // !==
            this.addToken(TokenType.STRICT_NE, '!==')
            this.advance()
            this.advance()
            this.advance()
          } else {
            // !=
            this.addToken(TokenType.NE, '!=')
            this.advance()
            this.advance()
          }
        } else {
          // Single ! - could be for 'not' operator, but for now just skip
          this.advance()
        }
        break
      case '<':
        if (this.peek(1) === '=') {
          // <=
          this.addToken(TokenType.LE, '<=')
          this.advance()
          this.advance()
        } else {
          // <
          this.addToken(TokenType.LT, '<')
          this.advance()
        }
        break
      case '>':
        if (this.peek(1) === '=') {
          // >=
          this.addToken(TokenType.GE, '>=')
          this.advance()
          this.advance()
        } else {
          // >
          this.addToken(TokenType.GT, '>')
          this.advance()
        }
        break
      default:
        this.advance()
        break
    }
  }

  private scanWhitespace(): void {
    const start = this.position
    while (this.isWhitespace(this.current()) && !this.isAtEnd()) {
      this.advance()
    }
    const value = this.input.substring(start, this.position)
    this.addToken(TokenType.WHITESPACE, value)
  }

  private scanText(): void {
    const start = this.position
    while (
      !this.isAtEnd() &&
      this.current() !== '<' &&
      this.current() !== '{' &&
      this.current() !== '\n' &&
      !this.isWhitespace(this.current())
    ) {
      this.advance()
    }

    if (this.position > start) {
      const value = this.input.substring(start, this.position)
      this.addToken(TokenType.TEXT, value)
    } else {
      this.advance() // 알 수 없는 문자 건너뛰기
    }
  }

  private skipWhitespace(): void {
    while (this.isWhitespace(this.current()) && !this.isAtEnd()) {
      this.advance()
    }
  }

  private getIdentifierType(text: string): TokenType {
    if (TEMPLATE_KEYWORDS.has(text.toLowerCase())) {
      switch (text.toLowerCase()) {
        case 'if':
          return TokenType.IF
        case 'elif':
          return TokenType.ELIF
        case 'else':
          return TokenType.ELSE
        case 'endif':
          return TokenType.ENDIF
        case 'for':
          return TokenType.FOR
        case 'in':
          return TokenType.IN
        case 'endfor':
          return TokenType.ENDFOR
        case 'block':
          return TokenType.BLOCK
        case 'endblock':
          return TokenType.ENDBLOCK
        case 'extends':
          return TokenType.EXTENDS
        case 'include':
          return TokenType.INCLUDE
        case 'macro':
          return TokenType.MACRO
        case 'endmacro':
          return TokenType.ENDMACRO
        case 'set':
          return TokenType.SET
        case 'true':
        case 'false':
          return TokenType.BOOLEAN
        default:
          return TokenType.IDENTIFIER
      }
    }
    return TokenType.IDENTIFIER
  }

  private current(): string {
    if (this.isAtEnd()) return '\0'
    return this.input.charAt(this.position)
  }

  private peek(offset: number = 1): string {
    const pos = this.position + offset
    if (pos >= this.input.length) return '\0'
    return this.input.charAt(pos)
  }

  private advance(count: number = 1): void {
    for (let i = 0; i < count && !this.isAtEnd(); i++) {
      this.position++
      this.column++
    }
  }

  private isAtEnd(): boolean {
    return this.position >= this.input.length
  }

  private isAlpha(c: string): boolean {
    return /[a-zA-Z_]/.test(c)
  }

  private isDigit(c: string): boolean {
    return /[0-9]/.test(c)
  }

  private isAlphaNumeric(c: string): boolean {
    return this.isAlpha(c) || this.isDigit(c)
  }

  private isWhitespace(c: string): boolean {
    return c === ' ' || c === '\r' || c === '\t'
  }

  private addToken(type: TokenType, value: string): void {
    const start: Position = {
      line: this.line,
      column: this.column - value.length,
      offset: this.position - value.length,
    }
    const end: Position = {
      line: this.line,
      column: this.column,
      offset: this.position,
    }

    this.tokens.push({
      type,
      value,
      start,
      end,
      raw: value,
    })
  }
}
