import type { DocumentNode } from '../ast/nodes';
import { BaseFormatter, FormattingOptions } from './formatter';

export { FormattingOptions };

export class JinjaFormatter extends BaseFormatter {
  
  protected formatNode(node: any, options: FormattingOptions, indentLevel: number): string {
    // 먼저 기본 HTML 노드들 처리
    const baseResult = super.formatNode(node, options, indentLevel);
    if (baseResult) {
      return baseResult;
    }

    // Jinja 템플릿 노드들 처리
    switch (node.type) {
      case 'TemplateTag':
        return this.formatTemplateTag(node, options, indentLevel);
      case 'VariableTag':
        return this.formatVariableTag(node, options, indentLevel);
      case 'CommentTag':
        return this.formatCommentTag(node, options, indentLevel);
      default:
        return '';
    }
  }

  private formatTemplateTag(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel);
    
    switch (node.templateType) {
      case 'IfStatement':
        return this.formatIfStatement(node, options, indentLevel);
      case 'ForStatement':
        return this.formatForStatement(node, options, indentLevel);
      case 'BlockStatement':
        return this.formatBlockStatement(node, options, indentLevel);
      case 'ExtendsStatement':
        return `${indent}{% extends "${node.template}" %}`;
      case 'MacroStatement':
        return this.formatMacroStatement(node, options, indentLevel);
      case 'Assignment':
        return this.formatAssignment(node, options, indentLevel);
      case 'RawStatement':
        return this.formatRawStatement(node, options, indentLevel);
      case 'GenericTag':
        return `${indent}{% ${node.content} %}`;
      default:
        return `${indent}{% unknown %}`;
    }
  }

  private formatIfStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel);
    const testExpr = this.formatExpression(node.test);
    
    let result = `${indent}{% if ${testExpr} %}`;
    
    if (node.consequent && node.consequent.length > 0) {
      const bodyFormatted = node.consequent
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n');
      
      if (bodyFormatted.trim().length > 0) {
        result += '\n' + bodyFormatted;
      }
    }
    
    if (node.alternate && node.alternate.length > 0) {
      result += `\n${indent}{% else %}`;
      const alternateFormatted = node.alternate
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n');
      
      if (alternateFormatted.trim().length > 0) {
        result += '\n' + alternateFormatted;
      }
    }
    
    result += `\n${indent}{% endif %}`;
    return result;
  }

  private formatForStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel);
    const targetExpr = this.formatExpression(node.target);
    const iterExpr = this.formatExpression(node.iter);
    
    let result = `${indent}{% for ${targetExpr} in ${iterExpr} %}`;
    
    if (node.body && node.body.length > 0) {
      const bodyFormatted = node.body
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n');
      
      if (bodyFormatted.trim().length > 0) {
        result += '\n' + bodyFormatted;
      }
    }
    
    if (node.orelse && node.orelse.length > 0) {
      result += `\n${indent}{% else %}`;
      const elseFormatted = node.orelse
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n');
      
      if (elseFormatted.trim().length > 0) {
        result += '\n' + elseFormatted;
      }
    }
    
    result += `\n${indent}{% endfor %}`;
    return result;
  }

  private formatBlockStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel);
    
    let result = `${indent}{% block ${node.name} %}`;
    
    if (node.body && node.body.length > 0) {
      const bodyFormatted = node.body
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n');
      
      if (bodyFormatted.trim().length > 0) {
        result += '\n' + bodyFormatted;
      }
    }
    
    result += `\n${indent}{% endblock %}`;
    return result;
  }

  private formatMacroStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel);
    const params = node.parameters ? node.parameters.map((p: any) => p.name).join(', ') : '';
    
    let result = `${indent}{% macro ${node.name}(${params}) %}`;
    
    if (node.body && node.body.length > 0) {
      const bodyFormatted = node.body
        .map((child: any) => this.formatNode(child, options, indentLevel + 1))
        .filter((text: string) => text.trim().length > 0)
        .join('\n');
      
      if (bodyFormatted.trim().length > 0) {
        result += '\n' + bodyFormatted;
      }
    }
    
    result += `\n${indent}{% endmacro %}`;
    return result;
  }

  private formatAssignment(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel);
    const target = this.formatExpression(node.target);
    const value = this.formatExpression(node.value);
    return `${indent}{% set ${target} = ${value} %}`;
  }

  private formatRawStatement(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel);
    
    // Raw 블록의 내용을 그대로 유지 (원래 줄바꿈 및 공백 보존)
    let content = node.content;
    if (typeof content !== 'string') {
      content = '';
    }
    
    // 시작과 끝의 불필요한 줄바꿈 제거 (있다면)
    content = content.trim();
    
    // 내용이 있으면 앞뒤로 줄바꿈 추가, 없으면 한 줄로
    if (content) {
      return `${indent}{% raw %}\n${content}\n${indent}{% endraw %}`;
    } else {
      return `${indent}{% raw %}{% endraw %}`;
    }
  }

  private formatVariableTag(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel);
    const expr = this.formatExpression(node.expression);
    return `${indent}{{ ${expr} }}`;
  }

  private formatCommentTag(node: any, options: FormattingOptions, indentLevel: number): string {
    const indent = this.getIndent(options, indentLevel);
    return `${indent}{# ${node.value.trim()} #}`;
  }

  private formatExpression(expr: any): string {
    if (!expr) return '';
    
    switch (expr.expressionType) {
      case 'Identifier':
        return expr.name;
      case 'Literal':
        if (typeof expr.value === 'string') {
          return `"${expr.value}"`;
        }
        return String(expr.value);
      case 'Filter':
        const baseExpr = this.formatExpression(expr.expression);
        const args = expr.arguments ? expr.arguments.map((arg: any) => this.formatExpression(arg)).join(', ') : '';
        return args ? `${baseExpr}|${expr.filterName}(${args})` : `${baseExpr}|${expr.filterName}`;
      case 'AttributeAccess':
        const object = this.formatExpression(expr.object);
        const property = this.formatExpression(expr.property);
        return `${object}.${property}`;
      case 'FunctionCall':
        const funcName = this.formatExpression(expr.function);
        const funcArgs = expr.arguments ? expr.arguments.map((arg: any) => {
          // 키워드 인수 처리
          if (arg.expressionType === 'KeywordArgument') {
            const value = this.formatExpression(arg.value);
            return `${arg.key}=${value}`;
          }
          return this.formatExpression(arg);
        }).join(', ') : '';
        return `${funcName}(${funcArgs})`;
      case 'KeywordArgument':
        const value = this.formatExpression(expr.value);
        return `${expr.key}=${value}`;
      default:
        return String(expr.value || expr.name || '');
    }
  }
}
