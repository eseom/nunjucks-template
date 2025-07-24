import type { Position } from '../ast/types'
import { TEMPLATE_KEYWORDS, Token, TokenType } from './tokens'

export class Tokenizer {
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
    const c = this.advance()

    switch (c) {
      case ' ':
      case '\r':
      case '\t':
        this.scanWhitespace()
        break
      case '\n':
        this.addToken(TokenType.NEWLINE, c)
        this.line++
        this.column = 1
        break
      case '<':
        this.scanLessThan()
        break
      case '>':
        this.addToken(TokenType.TAG_CLOSE, c)
        break
      case '/':
        if (this.peek() === '>') {
          this.advance()
          this.addToken(TokenType.TAG_SELF_CLOSE, '/>')
        } else {
          this.addToken(TokenType.TEXT, c)
        }
        break
      case '=':
        this.addToken(TokenType.EQUALS, c)
        break
      case '"':
      case "'":
        this.scanString(c)
        break
      case '{':
        this.scanTemplateStart()
        break
      case '}':
        this.scanTemplateEnd()
        break
      case '|':
        this.addToken(TokenType.PIPE, c)
        break
      case '.':
        this.addToken(TokenType.DOT, c)
        break
      case '(':
        this.addToken(TokenType.LPAREN, c)
        break
      case ')':
        this.addToken(TokenType.RPAREN, c)
        break
      case '[':
        this.addToken(TokenType.LBRACKET, c)
        break
      case ']':
        this.addToken(TokenType.RBRACKET, c)
        break
      case ',':
        this.addToken(TokenType.COMMA, c)
        break
      default:
        if (this.isAlpha(c)) {
          this.scanIdentifier()
        } else if (this.isDigit(c)) {
          this.scanNumber()
        } else {
          this.addToken(TokenType.TEXT, c)
        }
        break
    }
  }

  private scanWhitespace(): void {
    const start = this.position - 1
    while (this.isWhitespace(this.peek()) && !this.isAtEnd()) {
      this.advance()
    }
    const value = this.input.substring(start, this.position)
    this.addToken(TokenType.WHITESPACE, value)
  }

  private scanLessThan(): void {
    if (this.peek() === '!' && this.peekNext() === '-' && this.peekAt(2) === '-') {
      this.scanComment()
    } else if (this.peek() === '!') {
      this.scanDoctype()
    } else if (this.peek() === '/') {
      this.advance()
      this.addToken(TokenType.TAG_END_OPEN, '</')
      this.scanTagName()
    } else {
      this.addToken(TokenType.TAG_OPEN, '<')
      this.scanTagName()
    }
  }

  private scanTagName(): void {
    // Skip whitespace
    while (this.isWhitespace(this.peek()) && !this.isAtEnd()) {
      this.advance()
    }

    if (this.isAlpha(this.peek())) {
      const start = this.position
      while (this.isAlphaNumeric(this.peek()) || this.peek() === '-' || this.peek() === ':') {
        this.advance()
      }
      const value = this.input.substring(start, this.position)
      this.addToken(TokenType.TAG_NAME, value)

      // Scan attributes
      this.scanAttributes()
    }
  }

  private scanAttributes(): void {
    while (!this.isAtEnd() && this.peek() !== '>' && this.peek() !== '/') {
      // Skip whitespace
      while (this.isWhitespace(this.peek()) && !this.isAtEnd()) {
        this.advance()
      }

      if (this.peek() === '>' || this.peek() === '/') {
        break
      }

      // Scan attribute name
      if (this.isAlpha(this.peek())) {
        const start = this.position
        while (this.isAlphaNumeric(this.peek()) || this.peek() === '-' || this.peek() === ':') {
          this.advance()
        }
        const attrName = this.input.substring(start, this.position)
        this.addToken(TokenType.ATTRIBUTE_NAME, attrName)

        // Skip whitespace
        while (this.isWhitespace(this.peek()) && !this.isAtEnd()) {
          this.advance()
        }

        // Check = sign
        if (this.peek() === '=') {
          this.advance()
          this.addToken(TokenType.EQUALS, '=')

          // Skip whitespace
          while (this.isWhitespace(this.peek()) && !this.isAtEnd()) {
            this.advance()
          }

          // Scan attribute value
          if (this.peek() === '"' || this.peek() === "'") {
            this.scanString(this.peek())
          } else {
            // Unquoted attribute value
            const valueStart = this.position
            while (
              !this.isAtEnd() &&
              !this.isWhitespace(this.peek()) &&
              this.peek() !== '>' &&
              this.peek() !== '/'
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
        this.advance() // Skip unexpected character
      }
    }
  }

  private scanComment(): void {
    const start = this.position - 1
    this.advance() // !
    this.advance() // -
    this.advance() // -

    while (!this.isAtEnd()) {
      if (this.peek() === '-' && this.peekNext() === '-' && this.peekAt(2) === '>') {
        this.advance() // -
        this.advance() // -
        this.advance() // >
        break
      }
      if (this.peek() === '\n') this.line++
      this.advance()
    }

    const value = this.input.substring(start, this.position)
    this.addToken(TokenType.COMMENT, value)
  }

  private scanDoctype(): void {
    const start = this.position - 1
    while (!this.isAtEnd() && this.peek() !== '>') {
      if (this.peek() === '\n') this.line++
      this.advance()
    }
    if (!this.isAtEnd()) this.advance() // >

    const value = this.input.substring(start, this.position)
    this.addToken(TokenType.DOCTYPE, value)
  }

  private scanTemplateStart(): void {
    const next = this.peek()
    if (next === '%') {
      this.advance()
      this.addToken(TokenType.TEMPLATE_TAG_START, '{%')
    } else if (next === '{') {
      this.advance()
      this.addToken(TokenType.VARIABLE_START, '{{')
    } else if (next === '#') {
      this.advance()
      this.addToken(TokenType.COMMENT_START, '{#')
    } else {
      this.addToken(TokenType.TEXT, '{')
    }
  }

  private scanTemplateEnd(): void {
    const next = this.peek()
    if (next === '%') {
      this.advance()
      this.addToken(TokenType.TEMPLATE_TAG_END, '%}')
    } else if (next === '}') {
      this.advance()
      this.addToken(TokenType.VARIABLE_END, '}}')
    } else if (next === '#') {
      this.advance()
      this.addToken(TokenType.COMMENT_END, '#}')
    } else {
      this.addToken(TokenType.TEXT, '}')
    }
  }

  private scanString(quote: string): void {
    const start = this.position - 1
    while (!this.isAtEnd() && this.peek() !== quote) {
      if (this.peek() === '\n') this.line++
      this.advance()
    }

    if (this.isAtEnd()) {
      throw new Error(`Unterminated string at line ${this.line}`)
    }

    this.advance() // closing quote
    const value = this.input.substring(start + 1, this.position - 1)
    this.addToken(TokenType.STRING, value)
  }

  private scanIdentifier(): void {
    const start = this.position - 1
    while (this.isAlphaNumeric(this.peek())) {
      this.advance()
    }

    const value = this.input.substring(start, this.position)
    const type = this.getIdentifierType(value)
    this.addToken(type, value)
  }

  private scanNumber(): void {
    const start = this.position - 1
    while (this.isDigit(this.peek())) {
      this.advance()
    }

    if (this.peek() === '.' && this.isDigit(this.peekNext())) {
      this.advance() // .
      while (this.isDigit(this.peek())) {
        this.advance()
      }
    }

    const value = this.input.substring(start, this.position)
    this.addToken(TokenType.NUMBER, value)
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

  private advance(): string {
    const char = this.input.charAt(this.position++)
    this.column++
    return char
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0'
    return this.input.charAt(this.position)
  }

  private peekNext(): string {
    if (this.position + 1 >= this.input.length) return '\0'
    return this.input.charAt(this.position + 1)
  }

  private peekAt(offset: number): string {
    const pos = this.position + offset
    if (pos >= this.input.length) return '\0'
    return this.input.charAt(pos)
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
