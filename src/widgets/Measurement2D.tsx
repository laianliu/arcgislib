import Expand from 'esri/widgets/Expand'
import AreaMeasurement2D from 'esri/widgets/AreaMeasurement2D'
import DistanceMeasurement2D from 'esri/widgets/DistanceMeasurement2D'
export default class Measurement2D {
  constructor(view: object, position: object, index: number) {
    this.areaMeasurement2D = null
    this.areaMeasurement2D = new Expand({
      view: view,
      content: null,
      group: 'top-right',
      expandIconClass: 'esri-icon-polygon',
      expandTooltip: '面积测量'
    })
    this.areaMeasurement2D.watch('expanded', function(expanded) {
      if (expanded) {
        this.content = new AreaMeasurement2D({
          view: view,
          unit: 'square-meters',
          iconClass: 'esri-icon-polygon'
        })
        this.content.viewModel.newMeasurement()
      } else {
        this.content.destroy()
      }
    })

    this.distanceMeasurement2D = null
    this.distanceMeasurement2D = new Expand({
      view: view,
      content: null,
      group: 'top-right',
      expandIconClass: 'esri-icon-minus',
      expandTooltip: '距离测量'
    })
    this.distanceMeasurement2D.watch('expanded', function(expanded) {
      if (expanded) {
        this.content = new DistanceMeasurement2D({
          view: view,
          unit: 'square-meters',
          iconClass: 'esri-icon-minus'
        })
        this.content.viewModel.newMeasurement()
      } else {
        this.content.destroy()
      }
    })

    view.ui.add(
      [this.areaMeasurement2D, this.distanceMeasurement2D],
      position,
      index
    )
  }
}
