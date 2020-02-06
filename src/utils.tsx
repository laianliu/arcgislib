import domConstruct = require('dojo/dom-construct')
export function visitConf(items: [], fn: FunctionStringCallback) {
  items.forEach(function(item, index) {
    fn(item, index)
  })
}
export function createCustomCorner(view: {}) {
  const customRightCorner = domConstruct.create(
    'div',
    {
      className: 'esri-ui-right esri-ui-corner'
    },
    view.ui._innerContainer
  )

  view.ui._positionNameToContainerLookup.customRight = customRightCorner
  view.ui._cornerNameToContainerLookup.customRight = customRightCorner
}
