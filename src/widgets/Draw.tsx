import Draw1 from 'esri/views/draw/Draw'
import Graphic from 'esri/Graphic'
import Polygon from 'esri/geometry/Polygon'
import Point from 'esri/geometry/Point'
import Circle from 'esri/geometry/Circle'
import GraphicsLayer from 'esri/layers/GraphicsLayer'

export default class Draw {
  constructor(view: object, position: object, index: number) {
    this.draw = null
    this.graphic = null
    this.draw = new Draw1({
      view: view
    })
  }
  createBuffer(event: object) {
    const mapApp = event.mapApp
    const spatialReference = mapApp.view.spatialReference
    const point = event.mapPoint
    const radius = event.radius

    // 绘制缓冲区
    var circle = new Circle({
      center: point,
      radius: radius,
      hasM: false,
      hasZ: false,
      spatialReference: spatialReference
    })

    var graphic = new Graphic({
      geometry: circle,
      symbol: {
        type: 'simple-fill',
        color: [0, 255, 255, 0.5],
        style: 'solid',
        outline: {
          color: [0, 255, 255],
          width: 1
        }
      }
    })

    // 添加图形到地图上
    mapApp.view.graphics.removeAll()

    if (mapApp.findLayerById('RGLayer')) {
      mapApp.removeLayerById('RGLayer')
    }
    this.renderGraphicLayer = new GraphicsLayer({
      graphics: graphic,
      listMode: 'hide'
    })
    this.renderGraphicLayer.id = 'RGLayer'
    mapApp.map.add(this.renderGraphicLayer)

    // 开始查询
    let sq = mapApp.createSpatialQuery(mapApp, event.layerId, graphic.geometry)
    sq.querySelectedFeatures()
    mapApp.view.graphics.removeAll()
  }
  createPoint(event: object) {
    const mapApp = event.mapApp
    var graphic = new Graphic({
      geometry: event.mapPoint
    })
    let sq = mapApp.createSpatialQuery(mapApp, event.layerId, graphic.geometry)
    sq.querySelectedFeatures()
    mapApp.view.graphics.removeAll()
  }
  createPolygon(event: object) {
    const mapApp = event.mapApp
    const vertices = event.vertices
    const spatialReference = mapApp.view.spatialReference

    mapApp.view.graphics.removeAll()
    var polygon = {
      type: 'polygon',
      rings: vertices,
      spatialReference: spatialReference
    }

    var graphic = new Graphic({
      geometry: polygon,
      symbol: {
        type: 'simple-fill',
        color: [0, 255, 255, 0.5],
        style: 'solid',
        outline: {
          color: [0, 255, 255],
          width: 1
        }
      }
    })
    mapApp.view.graphics.add(graphic)
    if (event.type === 'draw-complete') {
      let sq = mapApp.createSpatialQuery(
        mapApp,
        event.layerId,
        graphic.geometry
      )
      sq.querySelectedFeatures()
      mapApp.view.graphics.removeAll()
      mapApp.view.container.style.cursor = 'auto'
    }
  }
  createCircle(event: object) {
    const mapApp = event.mapApp
    const vertices = event.vertices
    const spatialReference = mapApp.view.spatialReference
    mapApp.view.graphics.removeAll()
    if (vertices.length < 2) return

    // var [
    //   [lat1, lng1],
    //   [lat2, lng2]
    // ] = vertices;

    var lat1 = vertices[0][0]
    var lng1 = vertices[0][1]
    var lat2 = vertices[1][0]
    var lng2 = vertices[1][1]

    var center = new Point({
      x: vertices[0][0],
      y: vertices[0][1],
      hasM: false,
      hasZ: false,
      spatialReference: spatialReference
    })

    let distance
    // 两个WGS84坐标求距离
    if (mapApp.view.spatialReference.wkid !== 4326) {
      // 两点之间的欧式距离
      distance = center.distance(
        new Point({
          x: vertices[1][0],
          y: vertices[1][1],
          hasM: false,
          hasZ: false,
          spatialReference: spatialReference
        })
      )
    } else {
      function rad(d) {
        return (d * Math.PI) / 180.0
      }
      let radLat1 = rad(lat1)
      let radLat2 = rad(lat2)
      let a = radLat1 - radLat2
      let b = rad(lng1) - rad(lng2)
      distance =
        2 *
        Math.asin(
          Math.sqrt(
            Math.pow(Math.sin(a / 2), 2) +
              Math.cos(radLat1) *
                Math.cos(radLat2) *
                Math.pow(Math.sin(b / 2), 2)
          )
        )
      distance = distance * 6378.137 // EARTH_RADIUS;
      distance = Math.round(distance * 10000) / 7.5 //输出单位有误
    }

    var circle = new Circle({
      center: center,
      radius: distance,
      hasM: false,
      hasZ: false,
      spatialReference: spatialReference
    })

    var graphic = new Graphic({
      geometry: circle,
      symbol: {
        type: 'simple-fill',
        color: [0, 255, 255, 0.5],
        style: 'solid',
        outline: {
          color: [0, 255, 255],
          width: 1
        }
      }
    })
    mapApp.view.graphics.add(graphic)
    if (event.type === 'draw-complete') {
      let sq = mapApp.createSpatialQuery(
        mapApp,
        event.layerId,
        graphic.geometry
      )
      sq.querySelectedFeatures()
      mapApp.view.graphics.removeAll()
      mapApp.view.container.style.cursor = 'auto'
    }
  }
  createRectangle(event: object) {
    const mapApp = event.mapApp
    const vertices = event.vertices
    const spatialReference = mapApp.view.spatialReference
    mapApp.view.container.style.cursor = 'crossHair'

    mapApp.view.graphics.removeAll()
    if (vertices.length < 2) return
    var rings = [
      vertices[0],
      [vertices[0][0], vertices[1][1]],
      vertices[1],
      [vertices[1][0], vertices[0][1]]
    ]

    var polygon = new Polygon({
      rings: [rings],
      spatialReference: spatialReference
    })
    var graphic = new Graphic({
      geometry: polygon,
      symbol: {
        type: 'simple-fill',
        color: [0, 255, 255, 0.5],
        style: 'solid',
        outline: {
          color: [0, 255, 255],
          width: 1
        }
      }
    })
    mapApp.view.graphics.add(graphic)

    if (event.type === 'draw-complete') {
      let sq = mapApp.createSpatialQuery(
        mapApp,
        event.layerId,
        graphic.geometry
      )
      sq.querySelectedFeatures()
      mapApp.view.graphics.removeAll()
      mapApp.view.container.style.cursor = 'auto'
    }
  }
}
