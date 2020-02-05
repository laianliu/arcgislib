import Compass from 'esri/widgets/Compass'
export default class Compass {
  constructor(view: object, position: object, index: number) {
    const compassWidget = new Compass({
      view: view
    })
    view.ui.add(compassWidget, position, index)
  }
}
