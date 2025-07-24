import type { Position } from '../ast/types'

export interface Token {
  type: TokenType
  value: string
  start: Position
  end: Position
  raw: string
}

export enum TokenType {
  // HTML 관련 토큰
  TEXT = 'TEXT',
  TAG_OPEN = 'TAG_OPEN', // <
  TAG_CLOSE = 'TAG_CLOSE', // >
  TAG_NAME = 'TAG_NAME', // div, span 등
  TAG_SELF_CLOSE = 'TAG_SELF_CLOSE', // />
  TAG_END_OPEN = 'TAG_END_OPEN', // </
  ATTRIBUTE_NAME = 'ATTRIBUTE_NAME',
  ATTRIBUTE_VALUE = 'ATTRIBUTE_VALUE',
  EQUALS = 'EQUALS', // =
  QUOTE = 'QUOTE', // " 또는 '
  COMMENT = 'COMMENT', // <!-- -->
  DOCTYPE = 'DOCTYPE', // <!DOCTYPE html>

  // Jinja/Nunjucks 관련 토큰
  TEMPLATE_TAG_START = 'TEMPLATE_TAG_START', // {%
  TEMPLATE_TAG_END = 'TEMPLATE_TAG_END', // %}
  VARIABLE_START = 'VARIABLE_START', // {{
  VARIABLE_END = 'VARIABLE_END', // }}
  COMMENT_START = 'COMMENT_START', // {#
  COMMENT_END = 'COMMENT_END', // #}

  // 템플릿 키워드
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

  // 연산자
  PIPE = 'PIPE', // |
  DOT = 'DOT', // .
  LPAREN = 'LPAREN', // (
  RPAREN = 'RPAREN', // )
  LBRACKET = 'LBRACKET', // [
  RBRACKET = 'RBRACKET', // ]
  COMMA = 'COMMA', // ,
  ASSIGN = 'ASSIGN', // =
  
  // 비교 연산자
  EQ = 'EQ', // ==
  STRICT_EQ = 'STRICT_EQ', // ===
  NE = 'NE', // !=
  STRICT_NE = 'STRICT_NE', // !==
  LT = 'LT', // <
  LE = 'LE', // <=
  GT = 'GT', // >
  GE = 'GE', // >=

  // 논리 연산자
  AND = 'AND', // and
  OR = 'OR', // or
  NOT = 'NOT', // not

  // 리터럴
  IDENTIFIER = 'IDENTIFIER',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',

  // 공백 및 제어
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
