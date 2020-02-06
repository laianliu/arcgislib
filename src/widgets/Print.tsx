import Expand from 'esri/widgets/Expand'
import Print1 from 'esri/widgets/Print'
export default class Print {
  constructor(view: object, position: object, index: number) {
    this.print = null
    this.panel = document.getElementById('printPanel')

    this.print = new Print1({
      view: view,
      style: 'card',
      printServiceUrl:
        'http://120.77.57.182:6080/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task',
      container: this.panel
    })
  }
}
