import Draw from 'esri/views/draw/Draw'
import Graphic from 'esri/Graphic'
import Polygon from 'esri/geometry/Polygon'
import Point from 'esri/geometry/Point'
import Polyline from 'esri/geometry/Polyline'
import Circle from 'esri/geometry/Circle'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import SketchViewModel from 'esri/widgets/Sketch/SketchViewModel'
import watchUtils from 'esri/core/watchUtils'
import geometryEngine from 'esri/geometry/geometryEngine'
export default class Buffer {
  constructor(view: object, position: object, index: number) {
    this.draw = new Draw({
      view: view
    })
    this.sketchViewModel = null

    this.featureLayerView = null
    this.pausableWatchHandle = null

    this.centerGeometryAtStart = null
    this.centerGraphic = null // 中心位置
    this.mapPoint = null
    this.edgeGraphic = null
    this.polylineGraphic = null
    this.bufferGraphic = null
    this.labelGraphic = null
    this.radius = null

    this.graphicsLayer = new GraphicsLayer({
      title: 'SGLayer1',
      id: 'SGLayer1',
      listMode: 'hide'
    })
    this.graphicsLayer2 = new GraphicsLayer({
      title: 'SGLayer2',
      id: 'SGLayer2',
      listMode: 'hide'
    })

    this.unit = 'kilometers'
  }

  setUpSketch() {
    this.sketchViewModel = new SketchViewModel({
      view: view,
      layer: this.graphicsLayer
    })
    let me = this
    me.sketchViewModel.on('update', function(event) {
      if (event.toolEventInfo && event.toolEventInfo.mover.attributes.edge) {
        const toolType = event.toolEventInfo.type
        if (toolType === 'move-start') {
          me.centerGeometryAtStart = me.centerGraphic.geometry
        } else if (toolType === 'move' || toolType === 'move-stop') {
          me.centerGraphic.geometry = me.centerGeometryAtStart
        }
      }

      const vertices = [
        [me.centerGraphic.geometry.x, me.centerGraphic.geometry.y],
        [me.edgeGraphic.geometry.x, me.edgeGraphic.geometry.y]
      ]

      me.polylineGraphic.geometry = new Polyline({
        paths: vertices,
        spatialReference: view.spatialReference
      })

      const length = geometryEngine.geodesicLength(
        me.polylineGraphic.geometry,
        me.unit
      )
      const buffer = geometryEngine.geodesicBuffer(
        me.centerGraphic.geometry,
        length,
        me.unit
      )

      me.bufferGraphic.geometry = buffer

      me.labelGraphic.geometry = me.edgeGraphic.geometry
      me.labelGraphic.symbol = {
        type: 'text',
        color: '#FFEB00',
        text: length.toFixed(2) + ' 千米',
        xoffset: 50,
        yoffset: 10,
        font: {
          // autocast as Font
          size: 14,
          family: 'sans-serif'
        }
      }

      if (event.state === 'cancel' || event.state === 'complete') {
        me.sketchViewModel.update([me.edgeGraphic, me.centerGraphic], {
          tool: 'move'
        })
      }
    }) // 拖拉更新Buffer视图
  }
  calculateBuffer(vertices: object) {
    this.polylineGraphic.geometry = new Polyline({
      paths: vertices,
      spatialReference: view.spatialReference
    })

    const length = geometryEngine.geodesicLength(
      this.polylineGraphic.geometry,
      this.unit
    )
    const buffer = geometryEngine.geodesicBuffer(
      this.centerGraphic.geometry,
      length,
      this.unit
    )

    this.bufferGraphic.geometry = buffer

    this.labelGraphic.geometry = this.edgeGraphic.geometry
    this.labelGraphic.symbol = {
      type: 'text',
      color: '#FFEB00',
      text: length.toFixed(2) + ' 千米',
      xoffset: 50,
      yoffset: 10,
      font: {
        // autocast as Font
        size: 14,
        family: 'sans-serif'
      }
    }
  }
  setUpBufferUI(layer: object, radius: number, event: object) {
    let me = this
    this.mapPoint = event.mapPoint
    let circle = new Circle({
      center: this.mapPoint,
      radius: Number(radius),
      radiusUnit: 'kilometers'
    })
    // const center = circle.center.toArray();
    const rings = circle.rings[0][0]
    let point = new Point({
      x: rings[0],
      y: rings[1]
    })

    me.drawBufferPolygon(radius, point)

    // return buffer;
  }
  drawBufferPolygon(radius: number, point: object) {
    // this.pausableWatchHandle.pause();

    const viewCenter = this.mapPoint
    const centerScreenPoint = view.toScreen(viewCenter)
    const centerPoint = view.toMap({
      x: centerScreenPoint.x,
      y: centerScreenPoint.y
    })

    const edgePoint = view.toMap({
      x: centerScreenPoint.x + 100,
      y: centerScreenPoint.y
    })

    const vertices = [
      [centerPoint.x, centerPoint.y],
      [point.x, point.y]
    ]

    if (!this.centerGraphic) {
      const polyline = new Polyline({
        paths: vertices,
        spatialReference: view.spatialReference
      })
      const length = geometryEngine.geodesicLength(polyline, this.unit)
      console.log(length)
      const buffer = geometryEngine.geodesicBuffer(
        centerPoint,
        Number(radius),
        this.unit
      )

      const pointSymbol = {
        type: 'simple-marker',
        style: 'circle',
        size: 10,
        color: [0, 255, 255, 0.5]
      }

      this.centerGraphic = new Graphic({
        geometry: centerPoint,
        symbol: pointSymbol,
        attributes: {
          center: 'center'
        }
      })
      this.edgeGraphic = new Graphic({
        geometry: point,
        symbol: pointSymbol,
        attributes: {
          edge: 'edge'
        }
      })

      this.polylineGraphic = new Graphic({
        geometry: polyline,
        symbol: {
          type: 'simple-line',
          color: [254, 254, 254, 1],
          width: 2.5
        }
      })

      this.bufferGraphic = new Graphic({
        geometry: buffer,
        symbol: {
          type: 'simple-fill',
          color: [0, 255, 255, 0.5],
          outline: {
            color: [0, 255, 255],
            width: 2
          }
        }
      })

      this.labelGraphic = new Graphic({
        geometry: edgePoint,
        symbol: {
          type: 'text',
          color: '#FFEB00',
          text: Number(radius).toFixed(2) + ' 千米',
          xoffset: 50,
          yoffset: 10,
          font: {
            // autocast as Font
            size: 14,
            family: 'sans-serif'
          }
        }
      })

      this.graphicsLayer.addMany([this.centerGraphic, this.edgeGraphic])

      this.sketchViewModel.update([this.edgeGraphic, this.centerGraphic], {
        tool: 'move'
      })

      this.graphicsLayer2.addMany([
        this.bufferGraphic,
        this.polylineGraphic,
        this.labelGraphic
      ])
    } else {
      this.centerGraphic.geometry = centerPoint
      this.edgeGraphic.geometry = edgePoint
    }

    this.calculateBuffer(vertices)
  }
}
