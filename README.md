# Jinja2 Family Template

**Universal formatter and syntax highlighting for Jinja2 template family**

> The ID of this extension is nunjuck-template because it originated from Nunjucks. Since it is applicable to all Jinja2-based template engines actually, I wanted to transform this extension into a Jinja2 Family Template.

A Visual Studio Code extension for syntax highlighting, snippet support, and formatting assistance for Jinja2-family templating languages. This includes:

- **Jinja2** (Python / Flask)
- **Nunjucks** (Node.js / Eleventy)
- **Django templates**
- **Twig** (partial support)

---

## ✨ Features

- Integrated template formatter without any dependencies
- Syntax highlighting
- Comment toggling
- Template block recognition
- Language ID association for `.html`, `.njk`, `.j2`, `.jinja`, etc.
- Lightweight and fast

---

## 🛠 Supported File Extensions

| Extension | Recognized as |
| --------- | ------------- |
| `.j2`     | Jinja2        |
| `.jinja`  | Jinja2        |
| `.njk`    | Nunjucks      |
| `.html`   | With `{% %}`  |
| `.twig`   | (limited)     |

---

## 📦 Installation

Search for `Jinja2 Family Template` in the **Extensions** sidebar in VS Code or install via CLI:

```bash
code --install-extension your-publisher-name.nunjucks-template
```

# Jinja2 Formatter

**Universal formatter and syntax highlighting for Jinja2 template family**

A comprehensive VS Code extension that provides formatting, syntax highlighting, and snippets for multiple template engines in the Jinja2 family.

## Supported Template Engines

- **Jinja2** (`.jinja`, `.jinja2`, `.j2`) - Python templating engine
- **Nunjucks** (`.njk`, `.nunjucks`) - JavaScript port of Jinja2
- **Twig** (`.twig`) - PHP templating engine
- **Django Templates** (`.html` with Django syntax) - Django's template system

## Features

✅ **Advanced Formatting**

- Smart indentation for nested template blocks
- Proper handling of `{% if %}`, `{% for %}`, `{% macro %}`, etc.
- Support for complex expressions and filters
- Keyword argument formatting in function calls

✅ **Syntax Highlighting**

- Template tags: `{% %}`
- Variable expressions: `{{ }}`
- Comments: `{# #}`
- Mixed HTML + template syntax

✅ **Auto-Detection**

- Automatically detects template engine based on file extension
- Fallback to universal Jinja2 syntax

✅ **Modern Parser**

- Built-in AST-based parser (replaces outdated prettydiff)
- Better error handling and edge case support

## Configuration

## Configuration

### Extension Settings

```json
{
  "jinja2Formatter.preserveEmptyLine": 1,
  "jinja2Formatter.useNewParser": true,
  "jinja2Formatter.indentSize": 2,
  "jinja2Formatter.maxLineLength": 120,
  "jinja2Formatter.templateEngine": "auto"
}
```

### File Associations

Associate your template files with the appropriate language:

```json
{
  "files.associations": {
    "*.html": "jinja",
    "*.htm": "jinja",
    "*.j2": "jinja",
    "*.jinja": "jinja",
    "*.jinja2": "jinja",
    "*.njk": "njk",
    "*.nunjucks": "njk",
    "*.twig": "twig"
  }
}
```

## Usage

1. **Automatic Formatting**: The extension will format your templates when you save (if format on save is enabled)
2. **Manual Formatting**: Use `Ctrl+Shift+P` → "Format Document" or `Alt+Shift+F`
3. **Custom Command**: Use `Ctrl+Shift+P` → "Format Jinja2 Template"

## Template Examples

### Jinja2/Nunjucks

```jinja
{% extends "base.html" %}

{% block content %}
  {% for item in items %}
    <div class="item {% if item.featured %}featured{% endif %}">
      <h2>{{ item.title|title }}</h2>
      <p>{{ item.description|truncate(100) }}</p>
    </div>
  {% endfor %}
{% endblock %}
```

### Twig

```twig
{% extends "base.html.twig" %}

{% block content %}
  {% for item in items %}
    <div class="item {{ item.featured ? 'featured' : '' }}">
      <h2>{{ item.title|title }}</h2>
      <p>{{ item.description|truncate(100) }}</p>
    </div>
  {% endfor %}
{% endblock %}
```

- For vscode embedded emmet, notify that `njk` is html file type

```json
"emmet.includeLanguages": {
  "html": "html",
  "htm": "html",
  "j2": "html",
  "jinja": "html",
  "jinja2": "html",
  "njk": "html",
  "nunjucks": "html",
  "twig": "html"
},
```

- max line length follows standard vscode html.format.wrapLineLength

```json
"html.format.wrapLineLength": 120
```

- for vscode-icons ([issue #6](https://github.com/eseom/nunjucks-template/issues/6))

```json
"vsicons.associations.files": [
  { "icon": "nunjucks", "extensions": ["njk", "html", "htm", "j2", "jinja", "jinja2", "nunjucks", "twig"], "format": "svg" }
],
```

- for Material Icon Theme by [Heitor Augusto](https://github.com/HeitorAugustoLN)

```json
"material-icon-theme.files.associations": {
  "*.html": "jinja2",
  "*.htm": "jinja2",
  "*.j2": "jinja2",
  "*.jinja": "jinja2",
  "*.jinja2": "jinja2",
  "*.njk": "jinja2",
  "*.nunjucks": "jinja2",
  "*.twig": "jinja2",
},
```

## snippets

| Trigger   | Snippet                             |
| --------- | ----------------------------------- |
| j-extends | {% extends '${name}' %}             |
| j-block   | {% block ${name} %}{% endblock %}   |
| j-if      | {% if condition %}{% endif %}       |
| j-for     | {% for ${condition} %}{% endfor %}  |
| j-macro   | {% macro ${name}() %}{% endmacro %} |

## links

- https://github.com/eseom/jinja2-family-formatter
- https://marketplace.visualstudio.com/items?itemName=eseom.nunjucks-template#overview
