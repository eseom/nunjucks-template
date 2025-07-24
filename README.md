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
  "njk": "html"
},
```

- max line length follows standard vscode html.format.wrapLineLength

```json
"html.format.wrapLineLength": 120
```

- for vscode-icons ([issue #6](https://github.com/eseom/nunjucks-template/issues/6))

```json
"vsicons.associations.files": [
  { "icon": "nunjucks", "extensions": ["njk"], "format": "svg" }
],
```

- for Material Icon Theme by [Heitor Augusto](https://github.com/HeitorAugustoLN)

```json
"material-icon-theme.files.associations": {
  "*.html": "nunjucks"
},
```

## snippets

| Trigger   | Snippet                             |
| --------- | ----------------------------------- |
| n-extends | {% extends '${name}' %}             |
| n-block   | {% block ${name} %}{% endblock %}   |
| n-if      | {% if condition %}{% endif %}       |
| n-for     | {% for ${condition} %}{% endfor %}  |
| n-macro   | {% macro ${name}() %}{% endmacro %} |

## links

- https://github.com/eseom/nunjucks-template
- https://marketplace.visualstudio.com/items?itemName=eseom.nunjucks-template#overview
