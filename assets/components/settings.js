import { $$, $, on } from 'luett'
import store from 'store'

function createOpenDetailsHandler (el) {
  const storeKey = 'settings.openDetails'
  const checkEl = $('[name="openDetails"]')

  function setOpen (state = null) {
    state = state === null ? store.get(storeKey) || false : state
    store.set(storeKey, state)
    checkEl.checked = state
    $$('details').forEach(details => { details.open = state })
  }

  const listener = on(checkEl, 'input', event => {
    event.preventDefault()
    setOpen(event.target.checked)
  })

  setOpen()

  return {
    destroy () { listener.destroy() }
  }
}

export default el => {
  const openDetailsHandler = createOpenDetailsHandler(el)

  return {
    destroy () {
      openDetailsHandler.destroy()
    }
  }
}
