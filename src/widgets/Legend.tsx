import Expand from 'esri/widgets/Expand'
import Legend from 'esri/widgets/Legend'
export default class Legend {
  constructor(view: object, position: object, index: number) {
    this.legend = new Legend({
      view: view,
      style: 'classic',
      layout: 'side-by-side'
    })
    this.expand = new Expand({
      content: this.legend,
      view: view,
      expandTooltip: '查看图例',
      expandIconClass: 'esri-icon-review'
    })
    view.ui.add(this.expand, position, index)
  }
}
