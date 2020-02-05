import lang from 'dojo/_base/lang'
import url from 'dojo/_base/url'
import string from 'dojo/string'
import WebTileLayer from 'esri/layers/WebTileLayer'
import urlUtils from 'esri/core/urlUtils'
import JSONSupport from 'esri/core/JSONSupport'
export default WebTileLayer.createSubclass([JSONSupport], {
  declaredClass: 'WMTSLayer',
  normalizeCtorArgs: function(b, c) {
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
        // var e = this.subDomains
        // var g = []
        // if (a.path.indexOf('{subDomain}') !== -1) {
        //   e.forEach(function (i, e) {
        //     a.path = a.path.replace(/\{subDomain\}/gi, i) + '/'
        //     b = b.replace(/\{subDomain\}/gi, i) + '/'
        //     g.push(b)
        //   })
        // }
        return b.substring(
          ((a.scheme ? a.scheme + '://' : '//') + a.authority + '/').length
        )
      }
    },
    urlTemplate: null
  },
  getTileUrl: function(b, a, d) {
    b = this.levelValues[b]
    var e =
      this.tileServers[a % this.tileServers.length] +
      string.substitute(this.urlPath, {
        level: b,
        col: d,
        row: a
      })

    var e = e
      .replace(/\{level\}/gi, b)
      .replace(/\{row\}/gi, a)
      .replace(/\{col\}/gi, d)
    return urlUtils.addProxy(e).trim()
  }
})
