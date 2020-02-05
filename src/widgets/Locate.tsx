import Locate from 'esri/widgets/Locate'
export default class Locate {
  constructor(view: object, position: object, index: number) {
    this.locate = new Locate({
      view: view
    })
    view.ui.add(this.locate, position, index)
  }
}
