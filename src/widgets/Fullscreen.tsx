import Fullscreen from 'esri/widgets/Fullscreen'
export default class Fullscreen {
  constructor(view: object, position: object, index: number) {
    this.fullscreen = null
    this.fullscreen = new Fullscreen({
      view: view
    })
    view.ui.add({
      component: this.fullscreen,
      position: position,
      index: index
    })
  }
}
