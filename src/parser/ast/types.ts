// Base type definitions for AST nodes

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

// HTML related node types
export type HTMLNodeType = 'Document' | 'Element' | 'Text' | 'Comment' | 'Attribute' | 'Doctype'

// Jinja/Nunjucks related node types
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
