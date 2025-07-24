import * as fs from 'fs'
import * as path from 'path'
import { Jinja2Formatter } from './parser/jinja2-formatter'

// Load complex Jinja template from file
function loadTestTemplate(): string {
  const templatePath = path.join(__dirname, '..', 'src', 'complex-jinja-template2.txt')
  return fs.readFileSync(templatePath, 'utf8')
}

async function testParser() {
  const formatter = new Jinja2Formatter()
  const testTemplate = loadTestTemplate()

  console.log('🚀 Testing Jinja Template Parser')
  console.log('='.repeat(50))

  try {
    console.log('📝 Original template:')
    console.log(testTemplate)
    console.log('\n' + '='.repeat(50))

    console.log('⚙️  Parsing and formatting...\n')

    const result = formatter.format(testTemplate, {
      indentSize: 4,
      indentChar: ' ',
      maxLineLength: 100,
      insertFinalNewline: true,
    })

    console.log('✅ Formatted result:')
    console.log('='.repeat(50))
    console.log(result)
    console.log('='.repeat(50))

    console.log('\n✨ Parsing completed successfully!')

    // 🔄 Double formatting test - Run formatter on the result again
    console.log('\n🔄 Testing formatter idempotency (double formatting)...')
    console.log('='.repeat(60))

    try {
      const secondResult = formatter.format(result, {
        indentSize: 4,
        indentChar: ' ',
        maxLineLength: 100,
        insertFinalNewline: true,
      })

      console.log('✅ Second formatting result:')
      console.log('='.repeat(50))
      console.log(secondResult)
      console.log('='.repeat(50))

      // Compare results
      if (result === secondResult) {
        console.log(
          '\n🎉 SUCCESS: Formatter is idempotent! First and second results are identical.',
        )
      } else {
        console.log('\n⚠️  WARNING: Formatter results differ between first and second run.')
        console.log('This indicates the formatter is not fully stable.')

        // Analyze differences
        const lines1 = result.split('\n')
        const lines2 = secondResult.split('\n')
        const maxLines = Math.max(lines1.length, lines2.length)

        console.log('\n📊 Differences:')
        for (let i = 0; i < maxLines; i++) {
          const line1 = lines1[i] || '<missing>'
          const line2 = lines2[i] || '<missing>'
          if (line1 !== line2) {
            console.log(`Line ${i + 1}:`)
            console.log(`  First:  "${line1}"`)
            console.log(`  Second: "${line2}"`)
          }
        }
      }
    } catch (secondError) {
      console.error('❌ Second formatting failed:', secondError)
    }
  } catch (error) {
    console.error('❌ Parsing failed:')
    console.error(error)

    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 5).join('\n'),
      })
    }
  }
}

// Add simple HTML test as well
async function testSimpleHTML() {
  const formatter = new Jinja2Formatter()

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
`

  console.log('\n🧪 Testing Simple HTML:')
  console.log('='.repeat(30))

  try {
    const result = formatter.format(simpleHTML)
    console.log('Simple HTML formatted:')
    console.log(result)
  } catch (error) {
    console.error('Simple HTML test failed:', error)
  }
}

// Execute
testParser().catch(console.error)
