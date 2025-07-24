import { NewNunjucksFormatter } from './parser/new-nunjucks-formatter';

async function testSimpleTemplates() {
  const formatter = new NewNunjucksFormatter();

  const simpleTests = [
    {
      name: 'Simple Variable',
      template: `<h1>{{ title }}</h1>`
    },
    {
      name: 'Simple Block',
      template: `{% block content %}Hello World{% endblock %}`
    },
    {
      name: 'Simple If',
      template: `{% if condition %}Yes{% endif %}`
    },
    {
      name: 'Simple For',
      template: `{% for item in items %}{{ item }}{% endfor %}`
    },
    {
      name: 'Mixed Content',
      template: `
<div>
  <h1>{{ title }}</h1>
  {% if show_content %}
    <p>Content here</p>
  {% endif %}
</div>`
    }
  ];

  for (const test of simpleTests) {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log(`Template: ${test.template}`);
    console.log('---');
    
    try {
      const result = formatter.format(test.template, {
        indentSize: 2,
        indentChar: ' '
      });
      
      console.log('✅ Formatted:');
      console.log(result);
      console.log('---');
      
    } catch (error) {
      console.error(`❌ Failed: ${error}`);
      if (error instanceof Error) {
        console.error(`Details: ${error.message}`);
      }
      console.log('---');
    }
  }
}

testSimpleTemplates();
