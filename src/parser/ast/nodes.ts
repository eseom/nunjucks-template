import type { BaseNode, TemplateNodeType } from './types'

// HTML AST nodes
export interface DocumentNode extends BaseNode {
  type: 'Document'
  children: Array<ElementNode | TextNode | CommentNode | TemplateNode>
}

export interface ElementNode extends BaseNode {
  type: 'Element'
  tagName: string
  attributes: AttributeNode[]
  children: Array<ElementNode | TextNode | CommentNode | TemplateNode>
  selfClosing: boolean
  void: boolean // <br>, <img> etc
}

export interface AttributeNode extends BaseNode {
  type: 'Attribute'
  name: string
  value: string | null
  quoted: boolean
}

export interface TextNode extends BaseNode {
  type: 'Text'
  value: string
}

export interface CommentNode extends BaseNode {
  type: 'Comment'
  value: string
}

export interface DoctypeNode extends BaseNode {
  type: 'Doctype'
  value: string
}

// Jinja/Nunjucks template nodes
export interface TemplateNode extends BaseNode {
  templateType: TemplateNodeType
}

export interface TemplateTagNode extends TemplateNode {
  type: 'TemplateTag'
  templateType: TemplateNodeType
  tagName: string
  expression?: ExpressionNode
  body?: Array<ElementNode | TextNode | CommentNode | TemplateNode>
  alternate?: Array<ElementNode | TextNode | CommentNode | TemplateNode>
}

export interface VariableTagNode extends TemplateNode {
  type: 'VariableTag'
  templateType: 'VariableTag'
  expression: ExpressionNode
}

export interface CommentTagNode extends TemplateNode {
  type: 'CommentTag'
  templateType: 'CommentTag'
  value: string
}

// Expression nodes
export interface ExpressionNode extends BaseNode {
  expressionType: string
}

export interface IdentifierNode extends ExpressionNode {
  type: 'Expression'
  expressionType: 'Identifier'
  name: string
}

export interface LiteralNode extends ExpressionNode {
  type: 'Expression'
  expressionType: 'Literal'
  value: string | number | boolean | null
}

export interface FilterNode extends ExpressionNode {
  type: 'Expression'
  expressionType: 'Filter'
  expression: ExpressionNode
  filterName: string
  arguments: ExpressionNode[]
}

export interface AssignmentNode extends ExpressionNode {
  type: 'Expression'
  expressionType: 'Assignment'
  target: IdentifierNode
  value: ExpressionNode
}

export interface SubscriptAccessNode extends ExpressionNode {
  type: 'Expression'
  expressionType: 'SubscriptAccess'
  object: ExpressionNode
  index: ExpressionNode
}

export interface UnaryOperationNode extends ExpressionNode {
  type: 'Expression'
  expressionType: 'UnaryOperation'
  operator: string
  operand: ExpressionNode
}

// Specific template tags
export interface IfStatementNode extends TemplateNode {
  type: 'TemplateTag'
  templateType: 'IfStatement'
  test: ExpressionNode
  consequent: Array<ElementNode | TextNode | CommentNode | TemplateNode>
  alternate?: Array<ElementNode | TextNode | CommentNode | TemplateNode>
}

export interface ForStatementNode extends TemplateNode {
  type: 'TemplateTag'
  templateType: 'ForStatement'
  target: IdentifierNode
  iter: ExpressionNode
  body: Array<ElementNode | TextNode | CommentNode | TemplateNode>
  orelse?: Array<ElementNode | TextNode | CommentNode | TemplateNode>
}

export interface BlockStatementNode extends TemplateNode {
  type: 'TemplateTag'
  templateType: 'BlockStatement'
  name: string
  body: Array<ElementNode | TextNode | CommentNode | TemplateNode>
}

export interface ExtendsStatementNode extends TemplateNode {
  type: 'TemplateTag'
  templateType: 'ExtendsStatement'
  template: string
}

export interface IncludeStatementNode extends TemplateNode {
  type: 'TemplateTag'
  templateType: 'IncludeStatement'
  template: string
  withContext?: boolean
}

export interface MacroStatementNode extends TemplateNode {
  type: 'TemplateTag'
  templateType: 'MacroStatement'
  name: string
  parameters: IdentifierNode[]
  body: Array<ElementNode | TextNode | CommentNode | TemplateNode>
}

// Union types
export type ASTNode =
  | DocumentNode
  | ElementNode
  | AttributeNode
  | TextNode
  | CommentNode
  | DoctypeNode
  | TemplateTagNode
  | VariableTagNode
  | CommentTagNode
  | ExpressionNode
