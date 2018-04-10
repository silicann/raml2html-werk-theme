import delegate from 'delegate'

export default el => {
  delegate(el, 'a[href^="#"]', 'click', event => {
    event.delegateTarget.classList.toggle('is-active')
  })
}
