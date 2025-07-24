// AST 노드의 기본 타입 정의

export interface Position {
  line: number
  column: number
  offset: number
}

export interface Location {
  start: Position
  end: Position
}

export interface BaseNode {
  type: string
  loc?: Location
  raw?: string
}

// HTML 관련 노드 타입
export type HTMLNodeType = 'Document' | 'Element' | 'Text' | 'Comment' | 'Attribute' | 'Doctype'

// Jinja/Nunjucks 관련 노드 타입
export type TemplateNodeType =
  | 'TemplateTag' // {% ... %}
  | 'VariableTag' // {{ ... }}
  | 'CommentTag' // {# ... #}
  | 'Expression'
  | 'Filter'
  | 'Test'
  | 'Assignment'
  | 'IfStatement'
  | 'ForStatement'
  | 'BlockStatement'
  | 'ExtendsStatement'
  | 'IncludeStatement'
  | 'MacroStatement'

export type NodeType = HTMLNodeType | TemplateNodeType
