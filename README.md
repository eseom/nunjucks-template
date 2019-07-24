# nunjucks-template

This is the Nunjucks-supporting extension for vscode with complete features.

## configurations

- By default, detects .nj, .njk files automatically.
- Additionally, use `files.associations`
```
"files.associations": {
  "*.html": "njk"
},
```
- For vscode embedded emmet, notify that `njk` is html file type

```
"emmet.includeLanguages": {
  "njk": "html"
},
```

## snippets

| Trigger        | Snippet                              |
|----------------|--------------------------------------|
| n-extends      | {% extends '${name}' %}              |
| n-block        | {% block ${name} %}{% endblock %}    |
| n-if           | {% if condition %}{% endif %}        |
| n-for          | {% for ${condition} %}{% endfor %}   |
| n-macro        | {% macro ${name}() %}{% endmacro %}  |

## links

- https://github.com/eseom/nunjucks-template
- https://marketplace.visualstudio.com/items?itemName=eseom.nunjucks-template#overview
