import Home1 from 'esri/widgets/Home'
export default class Home {
  constructor(view: object, position: object, index: number) {
    this.home = null
    this.home = new Home1({
      view: view
    })
    view.ui.add(this.home, position, index)
  }
}
