import { $, attr, className } from 'luett'
import delegate from 'delegate'

const location = window.location
const tabs = attr('data-tab')
const activeClass = className('is-active')

function setWithoutScroll (callback) {
  const scrollTop = document.documentElement.scrollTop
  callback()
  document.documentElement.scrollTop = scrollTop
}

function toArray (it) {
  return Array.prototype.slice.call(it, 0)
}

function forEach (iterable, callable) {
  iterable.forEach(callable)
  return iterable
}

export default (el, opts) => {
  const tabbableId = opts.conf.id
  const tabbableTabsList = attr('data-tabbable-tabs').$(tabbableId, el)
  const tabbableContentsList = attr('data-tabbable-contents').$(tabbableId, el)

  function switchFromTabEl (tab) {
    setWithoutScroll(() => { location.href = attr('href').get(tab) })
    switchTab(tab.dataset.tab)
  }

  function switchTab (index) {
    // activate tab
    forEach(tabs.$$(tabbableTabsList), tab => activeClass.remove(tab.parentNode))
      .filter(tab => parseInt(tab.dataset.tab) === parseInt(index))
      .forEach(tab => activeClass.add(tab.parentNode))

    // activate content
    forEach(toArray(tabbableContentsList.children), content => activeClass.remove(content))
      .filter(content => parseInt(content.dataset.tabContent) === parseInt(index))
      .forEach(content => activeClass.add(content))
  }

  delegate(tabbableTabsList, tabs.selector(), 'click', event => {
    event.preventDefault()
    switchFromTabEl(event.delegateTarget)
  })

  try {
    const currentHashTab = $(location.hash, tabbableTabsList)
    if (currentHashTab) {
      // in case the current hash references on of this components’ tabs
      // we open the correct tab now
      switchFromTabEl(currentHashTab)
    } else {
      switchTab(0)
    }
  } catch (e) {
    switchTab(0)
  }
}
