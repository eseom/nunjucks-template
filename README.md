# nunjucks-template

This is the Nunjucks-supporting extension for vscode with complete features.

# feature

- nunjucks template syntax
- nunjucks formatter with prettydiff2
- yaml syntax

## configurations

- By default, detects .nj, .njk files automatically.
- Additionally, use `files.associations`

#### extension's own configurations

```json
"nunjucksTemplate.preserveEmptyLine": 3
```

(suggested at issue PR #30 by @sdegutis)

#### other configurations

```json
"files.associations": {
  "*.html": "njk"
},
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
