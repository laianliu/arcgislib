import Expand from 'esri/widgets/Expand'
import BasemapGallery from 'esri/widgets/BasemapGallery'
import LayerFactory from '../LayerFactory'
import esriConfig from 'esri/config'
import LocalBasemapsSource from 'esri/widgets/BasemapGallery/support/LocalBasemapsSource'
export default class BasemapGallery {
  constructor(view: object, position: object, index: number) {
    const basemapGallery = new BasemapGallery({
      view: view,
      source: this.getSource()
    })
    const basemapGalleryExpand = new Expand({
      content: basemapGallery,
      view: view,
      group: position,
      expandTooltip: '底图切换'
    })
    view.ui.add({
      component: basemapGalleryExpand,
      position: position,
      index: index
    })
  }
  getSource() {
    return new LocalBasemapsSource({
      basemaps: LayerFactory.getBaseMaps(esriConfig.appConfig.map.basemaps)
    })
  }
}
