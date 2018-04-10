import 'details-element-polyfill'
import { $$, component } from 'luett'

import './docs.less'

import codeHighlighting from './components/code-highlighting'
import tabbable from './components/tabbable'
import menu from './components/menu'

function init () {
  component($$('pre code:not([data-hljs="disabled"])'), codeHighlighting)
  component('tabbable', tabbable)
  component('menu', menu)
}

init()
