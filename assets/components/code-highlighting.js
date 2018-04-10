const factory = async el => {
  const hl = await import('highlight.js')
  hl.highlightBlock(el)
}

factory.NAME = 'code-highlighting'

export default factory
