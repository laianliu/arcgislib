import Zoom1 from 'esri/widgets/Zoom'
export default class Zoom {
  constructor(view: object, position: object, index: number) {
    this.zoom = null
    this.zoom = new Zoom1({
      view: view
      // layout: "horizontal",
      // container: document.getElementById("zoomButton")
    })
  }
}
