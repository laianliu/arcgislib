import Expand from 'esri/widgets/Expand'
import LayerList1 from 'esri/widgets/LayerList'
export default class LayerList {
  constructor(view: object, position: object, index: number) {
    this.layerList = null

    this.layerList = new Expand({
      content: new LayerList1({
        view: view
      }),
      view: view,
      group: 'top-right',
      expandTooltip: '图层列表'
    })
    view.ui.add(this.layerList, position, index)
  }
}
