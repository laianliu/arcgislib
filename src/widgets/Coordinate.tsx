import Expand from 'esri/widgets/Expand'
import CoordinateConversion from 'esri/widgets/CoordinateConversion'
import Point from 'esri/geometry/Point'
import Graphic from 'esri/Graphic'
export default class Coordinate {
  constructor(view: object, position: object, index: number) {
    this.coordinateConversion = null
    this.panel = document.getElementById('locatePanel')
    this.coordinateConversion = new CoordinateConversion({
      view: view,
      multipleConversions: true,
      mode: 'capture',
      container: this.panel
    })
  }
  createCenter(wkid: number, x: number, y: number) {
    let point = new Point({
      x: x,
      y: y,
      spatialReference: wkid
    })
    return point
  }

  startQuery(mapPoint: object, layerId: string) {
    var graphic = new Graphic({
      geometry: mapPoint
    })
    let sq = MapApp.createSpatialQuery(MapApp, layerId, graphic.geometry)
    sq.querySelectedFeatures()
    MapApp.view.graphics.removeAll()
  }
}
