import lang = require('dojo/_base/lang')
import array = require('dojo/_base/array')
import topic = require('dojo/topic')
import Map from 'esri/Map'
import MapView from 'esri/views/MapView'
import SceneView from 'esri/views/SceneView'
import Graphic from 'esri/Graphic'
import jsonUtils = require('esri/geometry/support/jsonUtils')
import AttributeQuery from './analyst/AttributeQuery'
import SpatialQuery from './analyst/SpatialQuery'
import Point from 'esri/geometry/Point'
import esriConfig = require('esri/config')
import LayerFactory = require('./LayerFactory')
import utils = require('./utils')
import esriRequest = require('esri/request')
import QueryTask from 'esri/tasks/QueryTask'
import Query from 'esri/tasks/support/Query'
import widgetUtils = require('./widgetUtils')
import epsg4326 = require('./epsg/4326')
import promiseUtils = require('esri/core/promiseUtils')
import watchUtils = require('esri/core/watchUtils')

export default class MapApp {
  constructor(appConfig: object, callBackFn: FunctionStringCallback) {
    this.polySymbol = {
      type: 'simple-fill',
      color: [0, 255, 255, 0.7],
      outline: {
        color: [0, 255, 255],
        width: 2
      }
    }
    this.pointSymbol = {
      type: 'simple-marker',
      color: [255, 0, 0],
      outline: {
        color: [255, 255, 255],
        width: 2
      }
    }
    this.map = null
    this.mapType = null
    this.view = null
    this.widgets = []
    this.widgetInstance = {}
    this.linkedState = false
    this.visible = true
    this.res = []
    this.selectedFeatures = []
    this.baseLayers = []
    this.operationLayers = []
    this.httpProxy = {}
    this.mapType = appConfig.map['2D'] === true ? '2D' : '3D'
    this.name = appConfig.view.container

    this.callBackFn = callBackFn
    this.layerLoadedObj = {}

    this.appConfig = appConfig
    esriConfig.appConfig = appConfig
    esriConfig.mapType = this.mapType
    esriConfig.httpProxy = appConfig.httpProxy

    let viewOptions = appConfig.view
    viewOptions.constraints = viewOptions.constraints || {}

    if (appConfig.httpProxy) {
      this.httpProxy = appConfig.httpProxy
    }
    const initBasemaps = appConfig.map[`basemaps_${this.mapType.toLowerCase()}`][0] || []
    esriConfig.appConfig.epsg = epsg4326
    this.initMap(initBasemaps, viewOptions)
    utils.createCustomCorner(this.view)
    this.initWidget(appConfig.widgets || [])
    this.executeNewMethods()
    window[`MapApp_${this.mapType.toLowerCase()}`] = this
  }

  initMap(initBasemaps: [], viewOptions: {}) {
    const me = this
    if (initBasemaps.length > 0) {
      const baseMap = LayerFactory.createBaseLayer(
        initBasemaps,
        this.callBackFn
      )
      this.map = new Map({
        basemap: baseMap
      })
    } else {
      this.map = new Map()
    }
    let option = JSON.parse(JSON.stringify(viewOptions))

    option.map = this.map
    if (this.mapType === '2D') {
      const minZoom = option.constraints.minZoom
      const maxZoom = option.constraints.maxZoom
      option.scale = esriConfig.appConfig.epsg.lods[minZoom + 1].scale
      option.constraints.lods = esriConfig.appConfig.epsg.lods
      option.constraints.minScale = esriConfig.appConfig.epsg.lods[minZoom].scale
      option.constraints.maxScale = esriConfig.appConfig.epsg.lods[maxZoom].scale
    }
    if (this.mapType === '2D') {
      this.view = new MapView(option)
    } else if (this.mapType === '3D') {
      this.view = new SceneView(option)
    }
  }
  executeNewMethods() {
    this.addMaskLayer()
    this.addXZQHLayer()
  }
  addMaskLayer() {
    const me = this
    if (this.appConfig.map.maskService.disable) {
      const maskService = this.appConfig.map.maskService
      const borderLayer = LayerFactory.createLayer(maskService)
      this.baseLayers.push(borderLayer)
      this.addLayer(borderLayer)
      let pathArr = []
      this.getServiceStatus(maskService.url).then(function(res) {
        const layers = res.data.layers
        const url = res.url
        layers.forEach(function(layer, index) {
          me.getServiceInfo(url + '/' + index).then(function(response) {
            response.features.forEach(function(feature) {
              feature.geometry.paths.forEach(function(path) {
                pathArr.push(path)
              })
            })
            if (index === layers.length - 1) {
              const mySymbol = this.appConfig.map.maskService.symbol
              const maskInfo = { points: pathArr, symbol: mySymbol }
              const maskLayer = LayerFactory.createMaskLayer(maskInfo)
              me.addLayer(maskLayer)
              me.baseLayers.push(maskLayer)
            }
          })
        })
      })
    }
  }
  addXZQHLayer(init: boolean, visible: boolean) {
    const me = this
    const xzqhService = this.appConfig.map.xzqhService
    if (xzqhService.disable || init) {
      this.getServiceInfo(xzqhService.url).then(function(res) {
        const features = res.features
        const gLayer = LayerFactory.createGraphicLayer(
          features,
          xzqhService.needTransform || false,
          xzqhService.colors
        )
        gLayer.id = xzqhService.id
        gLayer.title = xzqhService.title
        if (typeof visible === 'boolean') {
          gLayer.visible = visible
        } else {
          gLayer.visible = true
        }
        me.addLayer(gLayer)
      })
    }
  }
  addDynamicLayer(option: {}) {
    return LayerFactory.createDynamicLayer(option)
  }
  addDynamicLayer2(params: {}, name: {}) {
    return LayerFactory.createDynamicLayer2(params, name)
  }
  initWidget(widgets: []) {
    if (this.view) {
      const me = this
      this.view.ui.components.forEach(c => this.view.ui.remove(c))
      utils.visitConf(widgets, function(widget, index) {
        const newWidget = widgetUtils.createWidget(
          widget.name,
          me.view,
          widget.position,
          index
        )
        me.widgets.push(newWidget)
      })
    }
  }
  visitConf(items: [], fn: () => {}) {
    items.forEach(function(item) {
      fn(item)
    })
  }
  createLayer(layerInfo: LayerFactory.LayerInfo) {
    return LayerFactory.createLayer(layerInfo)
  }
  getServiceAllLayers(url: string) {
    return esriRequest(url, {
      responseType: 'json'
    })
  }
  getServiceStatus(url: string) {
    return esriRequest(url, {
      query: {
        f: 'json'
      },
      responseType: 'json'
    })
  }
  getDataFromNormalService(url: string, data: {}, method: string) {
    const option = {
      body: data,
      timeout: 180000,
      method: method || 'post',
      responseType: 'json'
    }
    return esriRequest(url, option)
  }
  // 获取服务信息
  getServiceInfo(url: string) {
    let query = new Query()
    query.outFields = ['*']
    query.where = '1=1'
    query.returnGeometry = true
    const queryTask = new QueryTask(url)
    return queryTask.execute(query)
  }

  getDynamicLayerInfo(url: string, query: {}) {
    const queryTask = new QueryTask(url)
    return queryTask.execute(query)
  }
  watchLayerLoaded(layerId: string, callback: FunctionStringCallback) {
    // let val
    // Object.defineProperty(this.layerLoadedObj, layerId, {
    //     set: function(newVal) {
    //         val = newVal
    //         callback(val)
    //     },
    //     get: function() {
    //         return val
    //     }
    // })
    watchUtils.watch(this.layerLoadedObj, layerId, callback)
  }
  addLayerEvent(
    layerId: string,
    eventName: string,
    callback: FunctionStringCallback
  ) {
    const me = this
    if (!this.view) return
    this.view[layerId + eventName] = this.view.on(eventName, function(event) {
      me.view.hitTest(event).then(function(res) {
        if (res.results.length > 0) {
          const result = res.results.find(function(result) {
            result.graphic.layer.id === layerId
          })
          callback(result)
        }
      })
    })
  }

  removeLayerEvent(layerId: string, eventName: string) {
    this.view[layerId + eventName].remove()
  }

  /**
   * 添加图层到地图
   * @param {图层配置} layerInfo
   * to 前端 ，动态添加已发布图层（目录树）
   */
  addLayerToMap(layerInfo: LayerFactory.LayerInfo) {
    const me = this
    return promiseUtils.create(function(resolve) {
      const layer = me.createLayer(layerInfo)
      me.addLayer(layer).then(function(res) {
        resolve(res)
      })
    })
  }

  addLayer(layer: {}, index: number) {
    const me = this
    me.layerLoadedObj[layer.id] = false
    return promiseUtils.create(function(resolve) {
      layer
        .load()
        .then(function(res) {
          if (res.message !== 'Error') {
            me.map.add(layer, index)
          } else {
            if (me.callBackFn) {
              me.callBackFn(res.message)
            }
          }
          me.layerLoadedObj[layer.id] = true
          res.layer = layer
          resolve(res)
        })
        .catch(function(error) {
          if (me.callBackFn) {
            me.callBackFn(error.message)
          }
          resolve(error)
        })
    })
  }

  /**
   * 根据图层id获取图层index
   * @param {图层id} layerId
   */
  findLayerIndexById(layerId: string) {
    this.map.layers.items.findIndex(function(layer) {
      return layer.id === layerId
    })
  }

  /**
   * 图层排序功能（上移、下移、置顶、置底）
   * @param {图层id} layerId
   * @param {排序指令} command
   */
  reorderLayer(layerId: string, command: string) {
    let layer = this.findLayerById(layerId)
    let layerIndex = this.findLayerIndexById(layerId)
    let layersLength = this.map.layers.items.length
    if (layer && typeof layerIndex !== 'undefined') {
      if (layerIndex === 0 && command === 'bottom') return
      if (layerIndex === layersLength - 1 && command === 'top') return
      switch (command) {
        case 'up':
          this.map.reorder(layer, layerIndex + 1)
          break
        case 'down':
          this.map.reorder(layer, layerIndex - 1)
          break
        case 'top':
          this.map.reorder(layer, layersLength - 1)
          break
        case 'bottom':
          this.map.reorder(layer, 0)
          break
      }
    }
  }
  /**
   * to 前端 通过id来查找图层
   * @param {图层id} id
   */
  findLayerById(layerId: string) {
    if (!layerId) return null
    const layer = this.map.findLayerById(layerId)
    return layer
  }
  removeLayer(layer: {}) {
    this.map.remove(layer)
  }
  /**
   * 移除所有图层
   */
  removeAllLayer() {
    this.operationLayers.forEach(function(layer, index) {
      this.map.remove(layer)
    })
  }
  /**
   * 根据图层id移除图层
   * @param {图层id} layerId
   */
  removeLayerById(layerId: string) {
    let layer = this.findLayerById(layerId)
    if (layer) {
      return this.removeLayer(layer)
    } else {
      throw new Error('指定图层不存在')
    }
  }
  /**
   *设置图层显隐性
   * @param {图层id} layerId
   * @param {布尔类型} toShow
   */
  setLayerVisiblity(layerId: string, toShow: boolean) {
    let layer = this.findLayerById(layerId)
    if (typeof toShow === 'boolean') {
      if (layer) layer.visible = toShow
      if (toShow === true) {
        this.operationLayers.push(layer)
      } else {
        const index = this.findLayerIndex(layerId)
        this.operationLayers.splice(index, 1)
      }
    }
  }
  findLayerIndex(layerId: string) {
    let index = 0
    for (let i = 0; i < this.operationLayers.length; i++) {
      if (this.operationLayers[i].id === layerId) {
        index = i
        break
      }
    }
    return index
  }
  /**
   * 设置图层透明度
   * @param {图层id} layerId
   * @param {透明度} opacity
   */
  setLayerOpacity(layerId: string, opacity: number) {
    let layer = this.findLayerById(layerId)
    if (typeof opacity === 'number') {
      if (layer) layer.opacity = opacity
    }
  }
  getAllLayer() {
    return this.operationLayers
  }
  setBaseLayerVisiblity() {}

  showSelectedFeature(feature: {}) {
    LayerFactory.showSelectedFeature(this, feature)
  }
  showAllFeatures(features: {}) {
    LayerFactory.showAllFeatures(this, features)
  }
  /**
   *
   * @param {监听的属性} attrName
   * @param {回调方法} callback
   */
  addAttributeListener(attrName: string, fn: FunctionStringCallback) {
    if (!this.view) return
    return this.view.watch(attrName, fn)
  }
  createAttributeQuery(mapApp: {}, layerId: string, extent: {}) {
    return new AttributeQuery(mapApp, layerId, extent)
  }
  createSpatialQuery(mapApp: {}, layerId: '', geometry: {}) {
    return new SpatialQuery(mapApp, layerId, geometry)
  }
  /**
   * 解析geojson对象为GraphicsLayer
   * @param {geojson对象} geojson
   * @param {解析类} parser
   */
  parseJsonLayer(geojson: {}, parser: {}) {
    for (var i in geojson.features) {
      let geojson_geometry = parser.convert(geojson.features[i].geometry)
      let arcgis_geometry = jsonUtils.fromJSON(geojson_geometry)
      let attributes = geojson.features[i].properties
      let g = new Graphic({
        geometry: arcgis_geometry,
        symbol:
          geojson.features[i].geometry.type === 'Point'
            ? this.pointSymbol
            : this.polySymbol,
        attributes: attributes
      })
      this.view.graphics.add(g)
    }
  }
  addPoint(x: number, y: number) {
    let p = new Point({
      longitude: Number(x),
      latitude: Number(y),
      spatialReference: this.view.extent.spatialReference
    })
    let g = new Graphic({
      geometry: p,
      symbol: this.pointSymbol
    })
    this.view.graphics.add(g)
  }
  createLegend(container: {}) {
    this.widgetInstance.legend = widgetUtils.createLegend(this.view, container)
  }
}
