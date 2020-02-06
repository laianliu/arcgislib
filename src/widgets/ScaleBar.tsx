import ScaleBar1 = require('esri/widgets/ScaleBar')
export default class ScaleBar {
  constructor(view: object, position: object, index: number) {
    let scaleBar = new ScaleBar1({
      view: view,
      unit: 'metric'
    })
    view.ui.add(scaleBar, position, index)
  }
}
