import { NewNunjucksFormatter } from './parser/new-nunjucks-formatter';

// 제공해주신 복잡한 Jinja 템플릿으로 테스트
const testTemplate = `{% extends "base_layout.html" %}
{% from _self import render_input %}

{% macro render_input(name, value='', type='text', placeholder='') %}
    <input
        type="{{ type }}"
        name="{{ name }}"
        value="{{ value|e }}"
        placeholder="{{ placeholder }}"
        class="input-field {{ name }}"
    >
{% endmacro %}

{% block title %}Jinja Test Page{% endblock %}

{% block body %}
<body class="{% if dark_mode %}dark{% else %}light{% endif %}">
    <header class="{{ user.role }}">
        <h1>Welcome, {{ user.name|title }}</h1>
        <p>Today is {{ now() }}</p>
    </header>

    <nav>
        <ul>
            {% for link in nav_links %}
                <li class="{% if loop.first %}first{% elif loop.last %}last{% endif %}">
                    <a href="{{ link.url }}">{{ link.label }}</a>
                </li>
            {% endfor %}
        </ul>
    </nav>

    <main>
        <section class="profile {{ 'highlight' if user.is_premium }}">
            <h2>User Profile</h2>
            {% if user.is_active %}
                <p>Status: <span class="active">Active</span></p>
            {% else %}
                <p>Status: <span class="inactive">Inactive</span></p>
            {% endif %}
            <p>Email: {{ user.email|default("No email provided") }}</p>
            <p>Balance: $` + `{{ user.balance|float|round(2) }}` + `</p>
        </section>

        <section class="products">
            <h2>Product List</h2>
            <ul>
            {% for product in products %}
                <li class="product-item {% if product.on_sale %}sale{% endif %}">
                    <strong>{{ product.name }}</strong>
                    - $` + `{{ product.price }}` + `
                </li>
            {% else %}
                <li>No products available.</li>
            {% endfor %}
            </ul>
        </section>

        <section class="form-section">
            <h2>Contact Form</h2>
            <form method="post" class="contact-form">
                {{ render_input('username', user.name, placeholder='Enter your name') }}
                {{ render_input('email', user.email, type='email', placeholder='Enter your email') }}
                <button type="submit">Submit</button>
            </form>
        </section>

        {% set announcement = "Server maintenance at midnight." %}
        <section class="announcement">
            <p><strong>Notice:</strong> {{ announcement }}</p>
        </section>

        <section class="raw-example">
            <h2>Raw Block Example</h2>
            {% raw %}
            <p>This will not be rendered: {{ test_variable }}</p>
            {% endraw %}
        </section>

        {# This is a Jinja comment and will not be rendered in the HTML #}
    </main>

    <footer class="footer">
        <p>&copy; {{ year }} MyCompany</p>
    </footer>
</body>
{% endblock %}`;

async function testParser() {
  const formatter = new NewNunjucksFormatter();

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
