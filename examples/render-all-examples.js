const fs = require('fs')
const glob = require('glob')
const path = require('path')
const raml2html = require('raml2html')

process.chdir(__dirname)

const config = raml2html.getConfigForTheme(path.join(__dirname, '..'))
const options = { pretty: true }
const examples = glob.sync('*.raml')

// deactivate post-processing for examples
delete config.postProcessHtml

examples.forEach(ramlFile => {
  raml2html.render(ramlFile, config, options).then(result => {
    const filename = ramlFile.replace('.raml', '.html')
    fs.writeFileSync(filename, result)
  }, (error) => {
    console.log('error! ', error)
  })
})
