import type { Position } from '../ast/types'

export interface Token {
  type: TokenType
  value: string
  start: Position
  end: Position
  raw: string
}

export enum TokenType {
  // HTML related tokens
  TEXT = 'TEXT',
  TAG_OPEN = 'TAG_OPEN', // <
  TAG_CLOSE = 'TAG_CLOSE', // >
  TAG_NAME = 'TAG_NAME', // div, span, etc.
  TAG_SELF_CLOSE = 'TAG_SELF_CLOSE', // />
  TAG_END_OPEN = 'TAG_END_OPEN', // </
  ATTRIBUTE_NAME = 'ATTRIBUTE_NAME',
  ATTRIBUTE_VALUE = 'ATTRIBUTE_VALUE',
  EQUALS = 'EQUALS', // =
  QUOTE = 'QUOTE', // " or '
  COMMENT = 'COMMENT', // <!-- -->
  DOCTYPE = 'DOCTYPE', // <!DOCTYPE html>

  // Jinja/Nunjucks related tokens
  TEMPLATE_TAG_START = 'TEMPLATE_TAG_START', // {%
  TEMPLATE_TAG_END = 'TEMPLATE_TAG_END', // %}
  VARIABLE_START = 'VARIABLE_START', // {{
  VARIABLE_END = 'VARIABLE_END', // }}
  COMMENT_START = 'COMMENT_START', // {#
  COMMENT_END = 'COMMENT_END', // #}

  // Template keywords
  IF = 'IF',
  ELIF = 'ELIF',
  ELSE = 'ELSE',
  ENDIF = 'ENDIF',
  FOR = 'FOR',
  IN = 'IN',
  ENDFOR = 'ENDFOR',
  BLOCK = 'BLOCK',
  ENDBLOCK = 'ENDBLOCK',
  EXTENDS = 'EXTENDS',
  INCLUDE = 'INCLUDE',
  MACRO = 'MACRO',
  ENDMACRO = 'ENDMACRO',
  SET = 'SET',

  // Operators
  PIPE = 'PIPE', // |
  DOT = 'DOT', // .
  LPAREN = 'LPAREN', // (
  RPAREN = 'RPAREN', // )
  LBRACKET = 'LBRACKET', // [
  RBRACKET = 'RBRACKET', // ]
  COMMA = 'COMMA', // ,
  ASSIGN = 'ASSIGN', // =
  COLON = 'COLON', // :

  // Comparison operators
  EQ = 'EQ', // ==
  STRICT_EQ = 'STRICT_EQ', // ===
  NE = 'NE', // !=
  STRICT_NE = 'STRICT_NE', // !==
  LT = 'LT', // <
  LE = 'LE', // <=
  GT = 'GT', // >
  GE = 'GE', // >=

  // Logical operators
  AND = 'AND', // and
  OR = 'OR', // or
  NOT = 'NOT', // not

  // Literals
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',

  // Whitespace and control
  WHITESPACE = 'WHITESPACE',
  NEWLINE = 'NEWLINE',
  EOF = 'EOF',
}

export const TEMPLATE_KEYWORDS = new Set([
  'if',
  'elif',
  'else',
  'endif',
  'for',
  'in',
  'endfor',
  'block',
  'endblock',
  'extends',
  'include',
  'macro',
  'endmacro',
  'set',
  'and',
  'or',
  'not',
  'true',
  'false',
  'null',
])

export const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])
