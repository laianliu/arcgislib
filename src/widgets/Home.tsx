import Home from 'esri/widgets/Home'
export default class Home {
  constructor(view: object, position: object, index: number) {
    this.home = null
    this.home = new Home({
      view: view
    })
    view.ui.add(this.home, position, index)
  }
}
