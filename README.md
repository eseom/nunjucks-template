# jinja-family-template

This is a jinja-family(jinja, twig, and nunjucks etc) supporting extension for vscode with complete features.

# feature

- jinja template *syntax*
- jinja formatter with *prettydiff2*
- yaml syntax (frontmatter)

## configurations

- By default, detects .jinja, .njk, .twig files automatically.
- Additionally, use `files.associations`

#### extension's own configurations

```json
"jinjaFamilyTemplate.preserveEmptyLine": 3
```

(suggested at issue PR #30 by @sdegutis)

#### other configurations

```json
"files.associations": {
  "*.html": "jinja-family"
},
```

- For vscode embedded emmet, notify that `jinja-family` is html file type

```json
"emmet.includeLanguages": {
  "jinja-family": "html"
},
```

- max line length follows standard vscode html.format.wrapLineLength

```json
"html.format.wrapLineLength": 120
```

- for vscode-icons ([issue #6](https://github.com/eseom/jinja-family-template/issues/6))

```json
"vsicons.associations.files": [
  { "icon": "jinja", "extensions": ["jinja"], "format": "svg" }
],
```

- for Material Icon Theme by [Heitor Augusto](https://github.com/HeitorAugustoLN)

```json
"material-icon-theme.files.associations": {
  "*.html": "jinja",
  "*.njk": "jinja",
  "*.twig": "jinja"
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

- https://github.com/eseom/jinja-family-template
- https://marketplace.visualstudio.com/items?itemName=eseom.jinja-family-template#overview
