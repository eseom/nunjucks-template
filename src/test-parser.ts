import { NewNunjucksFormatter } from './parser/new-nunjucks-formatter';
import * as fs from 'fs';
import * as path from 'path';

// 복잡한 Jinja 템플릿을 파일에서 읽어오기
function loadTestTemplate(): string {
  const templatePath = path.join(__dirname, '..', 'src', 'complex-jinja-template.html');
  return fs.readFileSync(templatePath, 'utf8');
}

async function testParser() {
  const formatter = new NewNunjucksFormatter();
  const testTemplate = loadTestTemplate();

  console.log('🚀 Testing Jinja Template Parser');
  console.log('=' .repeat(50));
  
  try {
    console.log('📝 Original template:');
    console.log(testTemplate);
    console.log('\n' + '=' .repeat(50));
    
    console.log('⚙️  Parsing and formatting...\n');
    
    const result = formatter.format(testTemplate, {
      indentSize: 2,
      indentChar: ' ',
      maxLineLength: 100,
      insertFinalNewline: true
    });
    
    console.log('✅ Formatted result:');
    console.log('=' .repeat(50));
    console.log(result);
    console.log('=' .repeat(50));
    
    console.log('\n✨ Parsing completed successfully!');
    
  } catch (error) {
    console.error('❌ Parsing failed:');
    console.error(error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n')
      });
    }
  }
}

// 간단한 HTML 테스트도 추가
async function testSimpleHTML() {
  const formatter = new NewNunjucksFormatter();
  
  const simpleHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Test</title>
</head>
<body>
    <div class="container">
        <h1>Hello World</h1>
        <p>This is a test.</p>
    </div>
</body>
</html>
`;

  console.log('\n🧪 Testing Simple HTML:');
  console.log('=' .repeat(30));
  
  try {
    const result = formatter.format(simpleHTML);
    console.log('Simple HTML formatted:');
    console.log(result);
  } catch (error) {
    console.error('Simple HTML test failed:', error);
  }
}

// 실행
testParser().then(() => {
  return testSimpleHTML();
}).catch(console.error);
