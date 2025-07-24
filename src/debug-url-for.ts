import { Jinja2Formatter } from './parser/jinja2-formatter'
import fs from 'fs'

const formatter = new Jinja2Formatter()

console.log('🚀 Testing URL_FOR Debug')
console.log('==================================================')

const template = fs.readFileSync('./src/debug-url-for.txt', 'utf8')
console.log('📝 Template:', template)

try {
  const result = formatter.format(template)
  console.log('✅ Result:', result)
} catch (error) {
  console.error('❌ Error:', error)
}
