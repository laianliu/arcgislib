import ScaleBar from 'esri/widgets/ScaleBar'
export default class ScaleBar {
  constructor(view: object, position: object, index: number) {
    let scaleBar = new ScaleBar({
      view: view,
      unit: 'metric'
    })
    view.ui.add(scaleBar, position, index)
  }
}
