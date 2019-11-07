const path = require('path')
const fsExtra = require('fs-extra')
const minify = require('html-minifier').minify
const MarkdownIt = require('markdown-it')
const nunjucks = require('nunjucks')

const templateDir = __dirname
const indexTemplate = templateDir + '/index.nunjucks'

function isStandardType (type) {
  if (typeof type === 'object') {
    return false
  }

  return type && type.indexOf('{') === -1 && type.indexOf('<') === -1
}

function isIterable (it) {
  return it && (it.length > 0 || Object.values(it).length > 0)
}

function iter (it) {
  return it.length > 0 ? it : Object.values(it)
}

function any (check, args) {
  if (typeof args === 'undefined') {
    args = check
    check = Boolean
  }

  for (const arg of args) {
    if ((check || Boolean)(arg)) {
      return true
    }
  }
  return false
}

function has (obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key)
}

function is (type, it) {
  return typeof it === String(type)  // eslint-disable-line
}

function reverse (array) {
  return [...array].reverse()
}

function find (collection, predicate) {
  if (!collection || !collection.length) return
  for (const item of collection) {
    if (predicate(item)) {
      return item
    }
  }
}

function dump (data) {
  return JSON.stringify(data, null, 4)
}

function addUniqueTypeIds (raml) {
  raml.types = (Object.keys(raml.types || {}).reduce((types, typeName) => {
    types[typeName] = { uniqueId: `type__${typeName}`, ...raml.types[typeName] }
    return types
  }, {}))
  return raml
}

function annotate (obj, annotations) {
  if (obj && obj.annotations && obj.annotations.length) {
    return obj.annotations.map(annotation => {
      const annotationClass = annotations[annotation.key]
      const displayAs = has(annotationClass, 'facets')
        ? annotationClass.facets.__display_as.default
        : 'flag'
      return [ displayAs, annotationClass, annotation ]
    })
  }

  return []
}

function inheritAnnotations (raml, annotations, parents = []) {
  if (!annotations || annotations.length === 0) {
    // don’t do anything if no annotations have been defined
    return
  }

  function addAnnotation (obj, annotation) {
    if (!annotation) return
    if (!has(obj, 'annotations')) {
      obj.annotations = []
    }
    obj.annotations.push(annotation)
  }

  function findAnnotation (name, searchIn = null) {
    searchIn = searchIn || reverse(parents)
    for (const item of searchIn) {
      const annotation = find(item.annotations, a => a.name === name)
      if (annotation) {
        return annotation
      }
    }
  }

  function inheritIfNotExists (obj, annotationName, searchIn = null) {
    if (!findAnnotation(annotationName, [obj])) {
      addAnnotation(obj, findAnnotation(annotationName, searchIn))
    }
  }

  function findAnnotationSubset (applyTo) {
    return Object.values(annotations)
      .filter(a => has(a, 'facets'))
      .filter(a => a.facets.__apply_to.default === applyTo)
  }

  const methodAnnotations = findAnnotationSubset('Method')
  const responseAnnotations = findAnnotationSubset('Response')

  raml.resources = raml.resources.map(resource => {
    if (methodAnnotations && methodAnnotations.length > 0 && resource.methods && resource.methods.length > 0) {
      methodAnnotations
        .forEach(methodAnnotation => {
          resource.methods
            .forEach(method => {
              inheritIfNotExists(method, methodAnnotation.name)

              if (method.responses && method.responses.length > 0) {
                responseAnnotations.forEach(responseAnnotation => {
                  method.responses.forEach(response => {
                    inheritIfNotExists(response, responseAnnotation.name, [...parents, method])
                  })
                })
              }
            })
        })
    }

    if (resource.resources && resource.resources.length) {
      inheritAnnotations(resource, annotations, [...parents, resource])
    }

    return resource
  })
}

function createMarkdownParser () {
  function createDefaultParser (options) {
    const headingBaseLevel = (options.headingBaseLevel || 1) - 1
    const markdownParser = MarkdownIt({
      html: true,
      langPrefix: 'lang-'
    })

    markdownParser
      .use(require('markdown-it-deflist'))

    function modifyHeadingBase (tokens, idx, options, env, slf) {
      const token = tokens[idx]
      const newHeadingLevel = parseInt(token.tag.match(/h([1-6])/)[1]) + headingBaseLevel
      token.tag = newHeadingLevel <= 6 ? 'h' + String(newHeadingLevel) : 'p'
      token.attrJoin('class', 'title')
      token.attrJoin('class', 'is-' + newHeadingLevel)
      return slf.renderToken(tokens, idx, options, env, slf)
    }

    markdownParser.renderer.rules.heading_open =
      markdownParser.renderer.rules.heading_close = modifyHeadingBase

    return markdownParser
  }

  return (markdownContent, options) => createDefaultParser(options || {}).render(markdownContent || '')
}

function createRenderEngine (raml) {
  return nunjucks
    .configure(templateDir, {
      autoescape: false
    })
    .addGlobal('isStandardType', isStandardType)
    .addGlobal('isIterable', isIterable)
    .addGlobal('iter', iter)
    .addGlobal('any', any)
    .addGlobal('is', is)
    .addGlobal('dump', dump)
    .addGlobal('raml', raml)
    .addGlobal('markdown', createMarkdownParser())
    .addGlobal('annotate', obj => annotate(obj, raml['annotationTypes']))
}

module.exports = {
  postProcessHtml (html) {
    return minify(html, {
      collapseWhitespace: true,
      conservativeCollapse: true
    })
  },
  processRamlObj (ramlObj, config, options) {
    addUniqueTypeIds(ramlObj)
    inheritAnnotations(ramlObj, ramlObj.annotationTypes)
    ramlObj.config = config
    ramlObj.options = options

    const engine = createRenderEngine(ramlObj)
    return Promise.resolve(
      engine.render(indexTemplate, ramlObj)
    )
  },
  writeOutput (result, config, argv) {
    const bundleAssets = has(argv, 'bundleAssets') ? argv.bundleAssets : true

    // check if the user provided the output option
    if (bundleAssets && !argv.output) {
      throw new Error(
        'this theme requires local assets to work.\n' +
        'please use the --output option or use a different theme'
      )
    }

    result = result.replace(/___ASSET_BASEPATH___/g, argv.assetBasePath || './assets')

    return Promise.all([
      fsExtra.writeFile(argv.output, result),
      bundleAssets
        ? fsExtra.copy(
          path.join(__dirname, 'dist', 'assets'),
          path.join(path.dirname(argv.output), 'assets')
        )
        : Promise.resolve()
    ])
  }
}
