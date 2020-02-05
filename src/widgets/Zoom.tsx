import Zoom from 'esri/widgets/Zoom'
export default class Zoom {
  constructor(view: object, position: object, index: number) {
    this.zoom = null
    this.zoom = new Zoom({
      view: view
      // layout: "horizontal",
      // container: document.getElementById("zoomButton")
    })
  }
}
