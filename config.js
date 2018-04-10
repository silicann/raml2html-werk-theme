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
  return it && it.length > 0
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

function is (type, it) {
  return typeof it === String(type)  // eslint-disable-line
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
    .addGlobal('any', any)
    .addGlobal('is', is)
    .addGlobal('dump', dump)
    .addGlobal('raml', raml)
    .addGlobal('markdown', createMarkdownParser())
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
    ramlObj.config = config
    ramlObj.options = options

    const engine = createRenderEngine(ramlObj)
    return Promise.resolve(
      engine.render(indexTemplate, ramlObj)
    )
  },
  writeOutput (result, config, argv) {
    // check if the user provided the output option
    if (!argv.output) {
      throw new Error(
        'this theme requires local assets to work.\n' +
        'please use the --output option or use a different theme'
      )
    }

    return Promise.all([
      fsExtra.writeFile(argv.output, result),
      fsExtra.copy(
        path.join(__dirname, 'dist', 'assets'),
        path.join(path.dirname(argv.output), 'assets')
      )
    ])
  }
}
