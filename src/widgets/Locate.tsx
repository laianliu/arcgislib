import Locate1 from 'esri/widgets/Locate'
export default class Locate {
  constructor(view: object, position: object, index: number) {
    this.locate = new Locate1({
      view: view
    })
    view.ui.add(this.locate, position, index)
  }
}
