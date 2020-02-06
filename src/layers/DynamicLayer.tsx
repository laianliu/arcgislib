import lang = require('dojo/_base/lang')
import url = require('dojo/_base/url')
import WebTileLayer = require('esri/layers/WebTileLayer')
const DynamicLayer = WebTileLayer.createSubclass({
  declaredClass: 'DynamicLayer',
  normalizeCtorArgs: function(b, c) {
    this.layerDefinitions = null
    this.dynamicLayerInfos = null
    this.layerDrawingOptions = null
    this.dynamicLayerObjs = []
    this._refresh = true
    return typeof b === 'string' ? lang.mixin({ urlTemplate: b }, c || {}) : b
  },
  properties: {
    copyright: '',
    type: 'png',
    legendEnabled: {
      json: {
        readFrom: ['showLegend'],
        read: function(b, c) {
          return c.showLegend != null ? c.showLegend : !0
        }
      }
    },
    levelValues: {
      dependsOn: ['tileInfo'],
      get: function() {
        var b = []
        if (!this.tileInfo) return null
        this.tileInfo.lods.forEach(function(c) {
          b[c.level] = c.levelValue || c.level
        }, this)
        return b
      }
    },
    popupEnabled: {
      json: {
        readFrom: ['disablePopup'],
        read: function(b, c) {
          return c.disablePopup != null ? !c.disablePopup : !0
        }
      }
    },
    subDomains: null,
    tileServers: {
      value: null,
      dependsOn: ['urlTemplate', 'subDomains', 'urlPath'],

      get: function() {
        var b = new url(this.urlTemplate)

        var c = b.scheme ? b.scheme + '://' : '//'

        var a = c + b.authority + '/'

        var e = this.subDomains

        var d

        var f = []
        b.authority.indexOf('{subDomain}') === -1 && f.push(a)
        e &&
          e.length > 0 &&
          b.authority.split('.').length > 1 &&
          b.authority.indexOf('{subDomain}') !== -1 &&
          e.forEach(function(a, e) {
            b.authority.indexOf('{subDomain}') > -1 &&
              (d = c + b.authority.replace(/\{subDomain\}/gi, a) + '/')
            f.push(d)
          }, this)
        return (f = f.map(function(b) {
          b.charAt(b.length - 1) !== '/' && (b += '/')
          return b
        }))
      }
    },
    urlPath: {
      dependsOn: ['urlTemplate'],
      get: function() {
        if (!this.urlTemplate) return null
        var b = this.urlTemplate
        var a = new url(b)
        return b.substring(
          ((a.scheme ? a.scheme + '://' : '//') + a.authority + '/').length
        )
      }
    },
    urlTemplate: null
  },
  setLayerDefinitions: function(layerDefinitions) {
    this.layerDefinitions = layerDefinitions
    this._refresh = true
  },

  setDynamicLayerInfos: function(dynamicLayerInfos) {
    this.dynamicLayerInfos = dynamicLayerInfos
    this._refresh = true
  },

  setLayerDrawingOptions: function(layerDrawingOptions) {
    this.layerDrawingOptions = layerDrawingOptions
    this._refresh = true
  },

  getTileUrl: function(level, row, col) {
    if (!this.dynamicLayerObjs.length === 0) return
    let resolution = 0
    for (var i = 0; i < this.tileInfo.lods.length; i++) {
      var lod = this.tileInfo.lods[i]
      if (lod.level == level) {
        resolution = lod.resolution
        break
      }
    }

    let xmin, ymin, xmax, ymax
    xmin = -180 + resolution * 256 * col
    ymin = 90 - resolution * 256 * (row + 1)
    xmax = -180 + resolution * 256 * (col + 1)
    ymax = 90 - resolution * 256 * row
    const bbox = xmin + ',' + ymin + ',' + xmax + ',' + ymax

    if (this.dynamicLayerObjs.length === 0 || this.tileInfo._refresh) {
      this.dynamicLayerInfos.forEach(function(dynamicLayerInfo, index) {
        const layerId = dynamicLayerInfo.id
        let dynamicLayerObj = { id: layerId }
        dynamicLayerObj.source =
          dynamicLayerInfo.source && dynamicLayerInfo.source
        if (this.layerDefinitions && this.layerDefinitions[index]) {
          dynamicLayerObj.definitionExpression = this.layerDefinitions[index]
        }
        if (this.layerDrawingOptions && this.layerDrawingOptions[index]) {
          dynamicLayerObj.drawingInfo = this.layerDrawingOptions[index]
        }
        this.dynamicLayerObjs.push(dynamicLayerObj)
      })
    }
    let requestUrl = []
    requestUrl.push(this.urlTemplate + '/export?')
    requestUrl.push('dpi=96&')
    requestUrl.push('transparent=true&')
    requestUrl.push('format=png8&')
    requestUrl.push(
      'dynamicLayers=' +
        encodeURIComponent(JSON.stringify(this.dynamicLayerObjs)) +
        '&'
    )
    requestUrl.push('bbox=' + bbox + '&')
    requestUrl.push('bboxSR=' + this.tileInfo.spatialReference.wkid + '&')
    requestUrl.push('imageSR=' + this.tileInfo.spatialReference.wkid + '&')
    requestUrl.push('size=256,256&')
    requestUrl.push('f=image')
    return requestUrl.join('')
  }
})
export default DynamicLayer
