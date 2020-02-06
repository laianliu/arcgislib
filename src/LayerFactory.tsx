import TileLayer from 'esri/layers/TileLayer'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import MapImageLayer from 'esri/layers/MapImageLayer'
import FeatureLayer from 'esri/layers/FeatureLayer'
import GeoJSONLayer from 'esri/layers/GeoJSONLayer'
import WMTSLayer from './layers/WMTSLayer'
import DynamicLayer from './layers/DynamicLayer'
import url = require('dojo/_base/url')
import esriConfig = require('esri/config')
import proxyUtils = require('./proxyUtils')
import utils = require('./utils')
import Basemap from 'esri/Basemap'
import Graphic from 'esri/Graphic'
import webMercatorUtils = require('esri/geometry/support/webMercatorUtils')
export const subDomains = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']
const layerMap = {
  tiled: TileLayer,
  graphics: GraphicsLayer,
  image: MapImageLayer,
  feature: FeatureLayer,
  geojson: GeoJSONLayer
}
const defaultFillSymbol = {
  type: 'simple-fill',
  color: [255, 255, 255, 0.6],
  outline: {
    color: [255, 0, 0],
    width: 2
  }
}
export interface LayerInfo {
  type: string
  url: string
  title: string
  visible: boolean
  useProxy: boolean
}
export function createLayer(layerInfo: LayerInfo) {
  const classKey =
    esriConfig.mapType === '2D'
      ? layerInfo.type
      : esriConfig.mapType + layerInfo.type
  const keyProperties = ['url', 'title', 'visible', 'useProxy']
  let option = {}
  for (let p in layerInfo) {
    if (keyProperties.indexOf(p) !== -1) {
      option[p] = layerInfo[p]
    }
  }
  let layer = null
  if (layerMap[classKey]) {
    layer = new layerMap[classKey](option)
  } else if (layerInfo.type === 'wmts') {
    let needAddProxy = true
    if (typeof layerInfo.useProxy !== 'undefined') {
      needAddProxy = layerInfo.useProxy
    }
    if (needAddProxy) {
      proxyUtils.addProxyRule(layerInfo)
    }
    layer = this.createWMTSLayer(layerInfo)
  } else {
    console.error('加载图层出错，未定义该类型图层', layerInfo)
    return null
  }
  layer.id = layerInfo.id || layerInfo.title
  layer.title = layerInfo.title
  if (typeof layerInfo.visible === 'boolean') {
    layer.visible = layerInfo.visible
  }
  return layer
}
export function createBaseLayer(layerInfos: LayerInfo[], fn: Function) {
  if (layerInfos.length > 0) {
    const me = this
    let baseLayers = []
    utils.visitConf(layerInfos, layerInfo => {
      const baseLayer = me.createLayer(layerInfo)
      baseLayer
        .load()
        .then(function(res) {
          if (fn) {
            if (res.message) {
              fn(res.message)
            }
          }
        })
        .catch(function(error) {
          if (fn) {
            fn(error.message)
          }
        })
      baseLayers.push(baseLayer)
    })
    let baseMap = new Basemap({
      baseLayers: baseLayers
    })
    baseMap.title = layerInfos[0].title
    return baseMap
  }
}
export function getBaseMaps(layerInfo: LayerInfo) {
  const me = this
  let baseMaps = []
  utils.visitConf(layerInfo, function(layerInfo) {
    const baseMap = me.createBaseLayer(layerInfo)
    baseMaps.push(baseMap)
  })
  return baseMaps
}
export function createUrlTemplate(option: object) {
  let urlTemplate
  if (option.url) {
    urlTemplate = createESRIWMTSUrlTemplate(option.url)
    if (!urlTemplate) {
      let myUrl = option.url
      if (myUrl.indexOf('/wmts') === -1) {
        myUrl += '/wmts'
      }
      const tempUrl = new url(myUrl)
      const splits = tempUrl.path.split('/')
      const layer = splits[splits.length - 2]
      urlTemplate =
        myUrl +
        '?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=' +
        layer +
        '&STYLE=' +
        layer +
        '&FORMAT=image/tile&TILEMATRIXSET=Matrix_0&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}'
    }
  } else {
    urlTemplate =
      'http://{subDomain}.tianditu.gov.cn/DataServer?T=' +
      option.layer +
      '&x={col}&y={row}&l={level}&tk=' +
      (option.key || 'fb1bfb9e06cd7681813a42f4c934e1ea')
    return urlTemplate
  }
}
export function createESRIWMTSUrlTemplate(url: string) {
  const index0 = url.indexOf('services')
  const index1 = url.indexOf('MapServer')
  if (index0 > -1 && index1 > -1) {
    const tempStr = url.substring(index0 + 9, index1 - 1).replace(/\//g, '_')
    const urlTemplate =
      url +
      '/WMTS?SERVICE=WMTS&VERSION=1.0.0&REQUEST=GetTile&LAYER=' +
      tempStr +
      '&STYLE=default&FORMAT=image/png&TILEMATRIXSET=default028mm&TILEMATRIX={level}&TILEROW={row}&TILECOL={col}'
    return urlTemplate
  }
  return null
}
export function createWMTSLayer(option: object) {
  let myWMTSLayer = new WMTSLayer(
    option.url
      ? {
          urlTemplate: createUrlTemplate(option),
          tileInfo: esriConfig.appConfig.epsg.tileInfo
        }
      : {
          urlTemplate: createUrlTemplate(option),
          subDomains: subDomains,
          tileInfo: esriConfig.appConfig.epsg.tileInfo
        }
  )
  myWMTSLayer.id = option.id || option.title
  myWMTSLayer.title = option.title
  myWMTSLayer.visible = option.visible
  return myWMTSLayer
}
export function createDynamicLayer(option: object) {
  if (option.url) {
    let dynamicLayer = new DynamicLayer({
      urlTemplate: option.url,
      tileInfo: esriConfig.appConfig.epsg.tileInfo
    })
    dynamicLayer.title = option.title
    dynamicLayer.id = 'DynamicLayer'
    return dynamicLayer
  }
}
export function createDynamicLayer2(params: object, name: string) {
  let dynamicLayer = new MapImageLayer(params)
  dynamicLayer.id = 'DynamicLayer'
  dynamicLayer.title = name
  return dynamicLayer
}
export function createMaskLayer(maskInfo: object) {
  const outerRing = [
    [
      [-180, 90],
      [180, 90],
      [180, -90],
      [-180, -90]
    ]
  ]
  // rings = [...outerRing, ...maskInfo.points] || outerRing
  rings =
    JSON.parse(JSON.stringify(outerRing)).concat(maskInfo.points[0]) ||
    outerRing
  const mask = {
    type: 'polygon',
    rings: rings
  }
  const maskGraphic = new Graphic({
    geometry: mask,
    symbol: maskInfo.symbol || defaultFillSymbol
  })
  let maskLayer = new GraphicsLayer({ graphics: [maskGraphic] })
  maskLayer.id = 'MASKLAYER'
  maskLayer.title = maskLayer.id
  return maskLayer
}
export function createGraphicLayer(
  features: {},
  needTransform: boolean,
  colors: []
) {
  if (!features) return
  let gs = []
  let graphicLayer
  features.forEach(function(feature, index) {
    let rings
    if (needTransform) {
      rings = webMercatorUtils.webMercatorToGeographic(feature.geometry).rings
    } else {
      rings = feature.geometry.rings || feature.geometry.coordinates
    }
    let g = new Graphic({
      geometry: {
        type: 'polygon',
        rings: rings
      },
      attributes: feature.attributes,
      symbol: {
        type: 'simple-fill',
        color: colors[feature.attributes.Color_ID * 1 - 1],
        outline: {
          color: [0, 0, 0],
          width: 0.5
        }
      }
    })
    gs.push(g)
    if (index === features.length - 1) {
      graphicLayer = new GraphicsLayer({
        graphics: gs
      })
    }
  })
  return graphicLayer
}

export function showAllFeatures(mapApp: object, features: object) {
  if (!mapApp || !features) return
  let graphics = []
  let symbol = {
    type: 'simple-fill', // 根据不同数据类型更改
    color: [255, 255, 255, 0],
    style: 'none',
    outline: {
      color: [255, 255, 255],
      width: 1
    }
  }

  // 移除上次选择图层（若存在）
  if (mapApp.findLayerById('SGLayer')) {
    mapApp.removeLayerById('SGLayer')
  }
  if (features.length > 0) {
    features.forEach(function(feature) {
      const rings = feature.geometry.rings || feature.geometry.coordinates
      rings.forEach(function(ring) {
        let g = new Graphic({
          geometry: {
            type: feature.geometry.type.toLowerCase(),
            rings: ring
          },
          attributes: feature.attributes || feature.properties,
          symbol: symbol
        })
        graphics.push(g)
      })
    })
    let renderGraphicLayer = new GraphicsLayer({
      graphics: graphics,
      listMode: 'hide'
    })
    renderGraphicLayer.id = 'SGLayer'
    mapApp.map.add(renderGraphicLayer) // 数据量过大无法完全展示
  }
}

export function showSelectedFeature(mapApp: object, feature: object) {
  if (!mapApp || !feature) return
  let graphics = []
  let symbol = {
    type: 'simple-fill', // 根据不同数据类型更改
    color: [0, 255, 255, 0.7],
    style: 'none',
    outline: {
      color: [0, 255, 255],
      width: 2
    }
  }
  const rings = feature.geometry.rings || feature.geometry.coordinates
  rings.forEach(function(ring) {
    let g = new Graphic({
      geometry: {
        type: feature.geometry.type.toLowerCase(),
        rings: ring
      },
      attributes: feature.attributes || feature.properties,
      symbol: symbol
    })
    graphics.push(g)
  })

  // 移除上次选择图层（若存在）
  if (mapApp.findLayerById('RGLayer')) {
    mapApp.removeLayerById('RGLayer')
  }
  let renderGraphicLayer = new GraphicsLayer({
    graphics: graphics,
    listMode: 'hide'
  })
  renderGraphicLayer.id = 'RGLayer'
  mapApp.map.add(renderGraphicLayer) // 数据量过大无法完全展示
  mapApp.view.goTo({
    target: renderGraphicLayer.graphics.items[0].geometry.extent,
    zoom: mapApp.view.constraints.maxZoom
  })
}
