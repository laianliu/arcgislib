import esriConfig = require('esri/config')
import Basemap = require('esri/Basemap')
import BasemapToggle1 from 'esri/widgets/BasemapToggle'
import LayerFactory1 from '../LayerFactory'
export default class BasemapToggle {
  constructor(view: object, position: object, index: number) {
    const nextBasemap = LayerFactory1.createBaseLayer(
      esriConfig.appConfig.map.basemaps[1]
    )
    const toggle = new BasemapToggle1({
      view: view,
      nextBasemap: nextBasemap
    })
    view.ui.add({
      component: toggle,
      position: position,
      index: index
    })
  }
}
