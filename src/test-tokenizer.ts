import { SimpleTokenizer } from './parser/lexer/simple-tokenizer';

// 간단한 토큰화 테스트
function testTokenizer() {
  console.log('🔍 Testing Simple Tokenizer...\n');
  
  const testCases = [
    `{% extends "base.html" %}`,
    `{{ user.name }}`,
    `{# comment #}`,
    `<div class="test">Hello</div>`,
    `{% if condition %}text{% endif %}`,
    `{% block content %}Hello{% endblock %}`
  ];

  testCases.forEach((test, index) => {
    console.log(`Test ${index + 1}: ${test}`);
    console.log('Tokens:');
    
    try {
      const tokenizer = new SimpleTokenizer(test);
      const tokens = tokenizer.tokenize();
      
      tokens.forEach(token => {
        console.log(`  ${token.type}: "${token.value}" (${token.start.line}:${token.start.column})`);
      });
    } catch (error) {
      console.error(`  Error: ${error}`);
    }
    
    console.log('');
  });
}

testTokenizer();
