const { SimpleTokenizer } = require('./out/parser/lexer/simple-tokenizer');
const { JinjaParser } = require('./out/parser/parser/jinja-parser');

console.log('Testing Jinja Parser...\n');

// 테스트할 템플릿들
const templates = [
  '{{ title }}',
  '{% block content %}Hello{% endblock %}',
  '{% if user %}{{ user.name }}{% endif %}',
  '{% for item in items %}{{ item }}{% endfor %}'
];

templates.forEach((template, index) => {
  console.log(`Test ${index + 1}: ${template}`);
  console.log('='.repeat(50));
  
  try {
    // 토큰화
    const tokenizer = new SimpleTokenizer(template);
    const tokens = tokenizer.tokenize();
    
    console.log('Tokens:');
    tokens.forEach((token, i) => {
      const line = token.location?.line || '?';
      const column = token.location?.column || '?';
      console.log(`  ${i}: ${token.type}: "${token.value}" (${line}:${column})`);
    });
    
    // 파싱
    const parser = new JinjaParser(tokens);
    const ast = parser.parse();
    
    console.log('\nAST:');
    console.log(JSON.stringify(ast, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error.stack);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
});
