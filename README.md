# raml2html werk theme

A [bulma](https://bulma.io/) and [open-color](https://yeun.github.io/open-color/) based single-page theme that is easily searchable and offline-ready.


 Example API                     | Example Request
:-------------------------------:|:-----------------------------------:
 ![front](./docs/front_800x.png) | ![request](./docs/request_800x.png)

## General use

```sh
npm install raml2html-werk-theme
raml2html --theme raml2html-werk-theme --output output/docs.html --input docs.raml
```

**Note**: Use of the `--output` flag is required, because the theme bundles assets along with the HTML.

This theme is intended for general use and we would love to see others use it. That being said there are some caveats when using this theme that you should be aware of.

### REQUIRED raml2html version 

As of April 10th, 2018 this theme requires the `develop` branch version of raml2html in order to produce a working output. This is because we bundle assets with the HTML instead of referencing them on external CDNs.

### Annotations

There currently is no general purpose rendering implementation for annotations. We’ve implemented what we needed but don’t feel that this scratches the surface of what people may want to use annotations for. If you use annotations and want to see better support in this theme please open up an issue and discuss your use case with us.

### Todos

There are still some things, that we’d like to implement (ordered by priority):

* Scroll-Spy support

  The menu on the left hand side is just static. Instead it should indicate the current menu-item, show sub-menus when scrolling the page and (in case of rather large api documentations) scroll with the content on the page.
  
* Document Search

  With all the meta-data from raml it should be possible to implement a more sophisticated search than the one the browser supports.
  
* Bookmarks

  With the help of WebStorage it should be possible to implement persistent bookmarks in order to easily navigate between often used resource/type definitions.

## Thanks

This theme is originally based on the existing sources of the [raml2html-default-theme](https://github.com/raml2html/default-theme) published by [@kevinrenskers](https://github.com/kevinrenskers). Learning how raml works and how things relate to each other would have been substantially harder hadn’t there been an already working theme implementation. 

## License
raml2html-werk-theme is available under the MIT license. See the LICENSE file for more info.
