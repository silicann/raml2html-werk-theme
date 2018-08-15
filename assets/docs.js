import 'details-element-polyfill'
import { $$, component } from 'luett'

import './docs.less'

import codeHighlighting from './components/code-highlighting'
import menu from './components/menu'
import tabbable from './components/tabbable'
import settings from './components/settings'

function init () {
  component($$('pre code:not([data-hljs="disabled"])'), codeHighlighting)
  component('tabbable', tabbable)
  component('menu', menu)
  component('settings', settings)
}

init()
