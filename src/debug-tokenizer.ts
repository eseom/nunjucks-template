import { SimpleTokenizer } from './parser/lexer/simple-tokenizer'

const tokenizer = new SimpleTokenizer('<a href="{{ url_for("partner-show.index", key=row.uniq_key) }}">🔗</a>')
const tokens = tokenizer.tokenize()

console.log('🚀 Tokenizer Debug')
console.log('==================================================')
tokens.forEach((token, i) => {
  console.log(`${i}: ${token.type} = "${token.value}"`)
})
