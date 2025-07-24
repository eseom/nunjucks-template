import type {
  ASTNode,
  AttributeNode,
  CommentNode,
  DoctypeNode,
  DocumentNode,
  ElementNode,
  TemplateNode,
  TextNode,
} from '../ast/nodes'
import { SimpleTokenizer } from '../lexer/simple-tokenizer'
import type { Token } from '../lexer/tokens'
import { TokenType, VOID_ELEMENTS } from '../lexer/tokens'

export class HTMLParser {
  protected tokens: Token[]
  protected current: number = 0

  constructor(input: string) {
    const tokenizer = new SimpleTokenizer(input)
    this.tokens = tokenizer.tokenize().filter(
      (token) => token.type !== TokenType.WHITESPACE, // 공백 토큰 제거 (필요시 유지 가능)
    )
  }

  public parse(): DocumentNode {
    const children: Array<ElementNode | TextNode | CommentNode | TemplateNode> = []

    while (!this.isAtEnd()) {
      const node = this.parseNode()
      if (
        node &&
        (node.type === 'Element' ||
          node.type === 'Text' ||
          node.type === 'Comment' ||
          node.type === 'Doctype' ||
          'templateType' in node)
      ) {
        children.push(node as ElementNode | TextNode | CommentNode | TemplateNode)
      }
    }

    return {
      type: 'Document',
      children,
      loc:
        children.length > 0
          ? {
              start: children[0].loc?.start || { line: 1, column: 1, offset: 0 },
              end: children[children.length - 1].loc?.end || { line: 1, column: 1, offset: 0 },
            }
          : undefined,
    }
  }

  protected parseNode(): ASTNode | null {
    const token = this.peek()

    switch (token.type) {
      case TokenType.TAG_OPEN:
        return this.parseElement()
      case TokenType.COMMENT:
        return this.parseComment()
      case TokenType.DOCTYPE:
        return this.parseDoctype()
      case TokenType.TEXT:
      case TokenType.NEWLINE:
        return this.parseText()
      case TokenType.EOF:
        return null
      default:
        this.advance() // 알 수 없는 토큰 건너뛰기
        return null
    }
  }

  private parseElement(): ElementNode {
    const startToken = this.consume(TokenType.TAG_OPEN, 'Expected "<"')
    const tagNameToken = this.consume(TokenType.TAG_NAME, 'Expected tag name')

    const tagName = tagNameToken.value
    const attributes = this.parseAttributes()

    let selfClosing = false
    const isVoid = VOID_ELEMENTS.has(tagName.toLowerCase())

    if (this.check(TokenType.TAG_SELF_CLOSE)) {
      this.advance()
      selfClosing = true
    } else {
      this.consume(TokenType.TAG_CLOSE, 'Expected ">"')
    }

    const children: Array<ElementNode | TextNode | CommentNode | TemplateNode> = []

    // self-closing이나 void 엘리먼트가 아닌 경우 children 파싱
    if (!selfClosing && !isVoid) {
      while (!this.isAtEnd() && !this.isClosingTag(tagName)) {
        const child = this.parseNode()
        if (
          child &&
          (child.type === 'Element' ||
            child.type === 'Text' ||
            child.type === 'Comment' ||
            'templateType' in child)
        ) {
          children.push(child as ElementNode | TextNode | CommentNode | TemplateNode)
        }
      }

      // 닫는 태그 처리
      if (this.isClosingTag(tagName)) {
        this.consume(TokenType.TAG_END_OPEN, 'Expected "</"')
        this.consume(TokenType.TAG_NAME, 'Expected tag name')
        this.consume(TokenType.TAG_CLOSE, 'Expected ">"')
      }
    }

    return {
      type: 'Element',
      tagName,
      attributes,
      children,
      selfClosing,
      void: isVoid,
      loc: {
        start: startToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseAttributes(): AttributeNode[] {
    const attributes: AttributeNode[] = []

    while (
      !this.check(TokenType.TAG_CLOSE) &&
      !this.check(TokenType.TAG_SELF_CLOSE) &&
      !this.isAtEnd()
    ) {
      if (this.check(TokenType.ATTRIBUTE_NAME)) {
        const attr = this.parseAttribute()
        if (attr) {
          attributes.push(attr)
        }
      } else {
        this.advance() // 예상치 못한 토큰 건너뛰기
      }
    }

    return attributes
  }

  private parseAttribute(): AttributeNode | null {
    const nameToken = this.consume(TokenType.ATTRIBUTE_NAME, 'Expected attribute name')

    let value: string | null = null
    let quoted = false

    if (this.check(TokenType.EQUALS)) {
      this.advance() // =

      if (this.check(TokenType.STRING)) {
        const valueToken = this.advance()
        value = valueToken.value
        quoted = true
      } else if (this.check(TokenType.ATTRIBUTE_VALUE)) {
        const valueToken = this.advance()
        value = valueToken.value
        quoted = false
      }
    }

    return {
      type: 'Attribute',
      name: nameToken.value,
      value,
      quoted,
      loc: {
        start: nameToken.start,
        end: this.previous().end,
      },
    }
  }

  private parseText(): TextNode {
    const tokens: Token[] = []

    while (!this.isAtEnd() && (this.check(TokenType.TEXT) || this.check(TokenType.NEWLINE))) {
      tokens.push(this.advance())
    }

    const value = tokens.map((t) => t.value).join('')

    return {
      type: 'Text',
      value,
      loc:
        tokens.length > 0
          ? {
              start: tokens[0].start,
              end: tokens[tokens.length - 1].end,
            }
          : undefined,
    }
  }

  private parseComment(): CommentNode {
    const token = this.consume(TokenType.COMMENT, 'Expected comment')

    // <!-- content --> 형식에서 content 부분만 추출
    const match = token.value.match(/^<!--\s*(.*?)\s*-->$/s)
    const value = match ? match[1] : token.value

    return {
      type: 'Comment',
      value,
      loc: {
        start: token.start,
        end: token.end,
      },
    }
  }

  private parseDoctype(): DoctypeNode {
    const token = this.consume(TokenType.DOCTYPE, 'Expected doctype')

    return {
      type: 'Doctype',
      value: token.value,
      loc: {
        start: token.start,
        end: token.end,
      },
    }
  }

  private isClosingTag(tagName: string): boolean {
    return (
      this.check(TokenType.TAG_END_OPEN) &&
      this.checkNext(TokenType.TAG_NAME) &&
      this.peekNext().value.toLowerCase() === tagName.toLowerCase()
    )
  }

  protected check(type: TokenType): boolean {
    if (this.isAtEnd()) return false
    return this.peek().type === type
  }

  protected checkNext(type: TokenType): boolean {
    if (this.current + 1 >= this.tokens.length) return false
    return this.tokens[this.current + 1].type === type
  }

  protected advance(): Token {
    if (!this.isAtEnd()) this.current++
    return this.previous()
  }

  protected isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF
  }

  protected peek(): Token {
    return this.tokens[this.current]
  }

  protected peekNext(): Token {
    if (this.current + 1 >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1] // EOF 토큰
    }
    return this.tokens[this.current + 1]
  }

  protected previous(): Token {
    return this.tokens[this.current - 1]
  }

  protected consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance()

    const current = this.peek()
    throw new Error(
      `${message} at line ${current.start.line}, column ${current.start.column}. Got ${current.type}`,
    )
  }
}
