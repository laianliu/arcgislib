import lang = require('esri/core/lang')
import promiseUtils = require('esri/core/promiseUtils')
import MapApp from './MapApp'
export default class MapAppFactory {
  constructor() {
    this.mapApps = {}
    this.appConfig = null
  }
  createMapApp(appConfig: {}, fn: FunctionStringCallback) {
    const me = this
    if (!appConfig) return
    const curMapApp = this.mapApps[appConfig.mapview.container]
    return promiseUtils.create(function(resolve) {
      if (appConfig.delay > 0) {
        setTimeout(function() {
          const mapApp = curMapApp || me._createMapApp(appConfig, fn)
          resolve(mapApp)
        }, appConfig.delay)
      } else {
        const mapApp = curMapApp || me._createMapApp(appConfig, fn)
        resolve(mapApp)
      }
    })
  }
  _createMapApp(appConfig: {}, fn: FunctionStringCallback) {
    if (appConfig.mapview.map) delete appConfig.mapview.map
    const mapAppId = appConfig.mapview.container
    const currentAppConfig = lang.clone(appConfig)
    let currentMapApp = null
    if (!this.mapApps[mapAppId]) {
      currentMapApp = new MapApp(currentAppConfig, fn)
      this.mapApps[mapAppId] = currentMapApp
      if (appConfig.mapview.linked) {
        this.setMappAppState(mapAppId, true)
      }
    } else {
      if (!this.mapApps[mapAppId].visible) {
        if (appConfig.mapview.linked) {
          this.setMappAppState(this.mapApps[mapAppId])
        }
      }
      currentMapApp = this.mapApps[mapAppId]
    }
    this.mapApps[mapAppId].visible = true
    return currentMapApp
  }
  destroyMapApp(mapAppId: string) {
    delete this.mapApps[mapAppId]
  }
  watchMapApp(mapAppId: string, callback: FunctionStringCallback) {
    const mapApp = this.mapApps[mapAppId]
    let val
    Object.defineProperty(mapApp, 'view', {
      set: function(newVal) {
        val = newVal
        callback(val)
      },
      set: function() {
        return val
      }
    })
  }
  getArrDiff(arr1: [], arr2: []) {
    return arr1.concat(arr2).filter(function(value, i, arr) {
      return arr.indexOf(value) === arr.lastIndexOf(value)
    })
  }
  removeEventLinstener(mapAppId: string) {
    this.mapApps[mapAppId].visible = false
    this.mapApps[mapAppId].view.extentListener.remove()
    this.mapApps[mapAppId].view.rotationListener.remove()
  }
  findMapApp(mapAppId: string) {
    return this.mapApps[mapAppId]
  }
  /**
   *
   * @param {地图div id} mapAppId
   */
  setMappAppState(mapAppId: string, isInit: boolean) {
    if (this.mapApps[mapAppId]) {
      if (this.mapApps[mapAppId].linkedState && !isInit) {
        this.mapApps[mapAppId].linkedState = false
        this.removeEventLinstener(mapAppId)
      } else {
        this.mapApps[mapAppId].linkedState = true
        this.addEventLinstener(mapAppId)
      }
    }
  }
  addEventLinstener(mapAppId: string) {
    this.mapApps[mapAppId].visible = true
    this.addExtentChangeListener(mapAppId)
    this.addRotationChangeListener(mapAppId)
  }
  addExtentChangeListener(mapAppId: string) {
    if (!this.mapApps) return
    const me = this
    const hasExtentLinstener = this.mapApps[mapAppId].view.hasEventListener(
      'extent'
    )
    if (!hasExtentLinstener) {
      this.mapApps[mapAppId].view.extentListener = this.mapApps[
        mapAppId
      ].addAttributeListener('extent', function(response) {
        if (me.mapApps[mapAppId]) {
          if (me.mapApps[mapAppId].linkedState) {
            const currentMapApps = Object.keys(me.mapApps)
            for (let i = 0; i < currentMapApps.length; i++) {
              if (currentMapApps[i] !== mapAppId) {
                let targetMapApp = me.mapApps[currentMapApps[i]]
                if (targetMapApp.linkedState && targetMapApp.visible) {
                  const targetMapAppExtent = targetMapApp.view.extent
                  if (targetMapAppExtent) {
                    if (
                      targetMapAppExtent.xmax !== response.xmax ||
                      targetMapAppExtent.ymax !== response.ymax
                    ) {
                      targetMapApp.view.extent = response
                    }
                  }
                }
              }
            }
          }
        }
      })
    }
  }
  addRotationChangeListener(mapAppId: string) {
    if (!this.mapApps) return
    let me = this
    let hasRotationLinstener = this.mapApps[mapAppId].view.hasEventListener(
      'rotation'
    )
    if (!hasRotationLinstener) {
      this.mapApps[mapAppId].view.rotationListener = this.mapApps[
        mapAppId
      ].addAttributeListener('rotation', function(response) {
        if (me.mapApps[mapAppId]) {
          if (me.mapApps[mapAppId].linkedState) {
            const currentMapApps = Object.keys(me.mapApps)
            for (let i = 0; i < currentMapApps.length; i++) {
              if (currentMapApps[i] !== mapAppId) {
                let targetMapApp = me.mapApps[currentMapApps[i]]
                if (targetMapApp.linkedState && targetMapApp.visible) {
                  const targetMapAppRotation = targetMapApp.view.rotation
                  if (typeof targetMapAppRotation !== 'undefined') {
                    if (targetMapAppRotation !== response) {
                      targetMapApp.view.rotation = response
                    }
                  }
                }
              }
            }
          }
        }
      })
    }
  }
}
let instance = null
export function getInstance() {
  if (instance === null) {
    instance = new MapAppFactory()
  }
  return instance
}
