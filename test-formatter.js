const { SimpleTokenizer } = require('./out/parser/lexer/simple-tokenizer');
const { JinjaParser } = require('./out/parser/parser/jinja-parser');
const { JinjaFormatter } = require('./out/parser/formatter/jinja-formatter');

console.log('Testing Jinja Parser + Formatter...\n');

// 복잡한 실제 템플릿 테스트
const complexTemplate = `<!DOCTYPE html>
<html>
<head>
    <title>{{ title }}</title>
</head>
<body>
    {% block content %}
        {% if user %}
            <h1>Hello, {{ user.name }}!</h1>
            {% for item in user.items %}
                <div class="item">{{ item.title }}</div>
            {% endfor %}
        {% else %}
            <p>Please login</p>
        {% endif %}
    {% endblock %}
</body>
</html>`;

console.log('Original Template:');
console.log(complexTemplate);
console.log('\n' + '='.repeat(80) + '\n');

try {
  // 파싱
  const tokenizer = new SimpleTokenizer(complexTemplate);
  const tokens = tokenizer.tokenize();
  
  const parser = new JinjaParser(tokens);
  const ast = parser.parse();
  
  console.log('Parsing succeeded!');
  console.log('Document children count:', ast.children.length);
  
  // 포매팅
  const formatter = new JinjaFormatter();
  const formattingOptions = {
    indentSize: 2,
    indentChar: ' ',
    maxLineLength: 120,
    preserveEmptyLines: 1,
    insertFinalNewline: true
  };
  const formatted = formatter.format(ast, formattingOptions);
  
  console.log('\nFormatted Template:');
  console.log(formatted);
  
} catch (error) {
  console.error('Error:', error.message);
  console.error(error.stack);
}
