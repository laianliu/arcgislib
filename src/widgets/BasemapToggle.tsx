import esriConfig from 'esri/config'
import Basemap from 'esri/Basemap'
import BasemapToggle from 'esri/widgets/BasemapToggle'
import LayerFactory from '../LayerFactory'
export default class BasemapToggle {
  constructor(view: object, position: object, index: number) {
    const nextBasemap = LayerFactory.createBaseLayer(
      esriConfig.appConfig.map.basemaps[1]
    )
    const toggle = new BasemapToggle({
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
