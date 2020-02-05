import Expand from 'esri/widgets/Expand'
import Sketch from 'esri/widgets/Sketch'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
export default class GraphicsLayer {
  constructor(view: object, position: object, index: number) {
    this.view = view
    this.panel = document.getElementById('sketchPanel')
    this.graphicsLayer = new GraphicsLayer({
      title: 'SGLayer',
      id: 'SGLayer',
      listMode: 'hide',
      visible: true
    })
    this.sketch = new Sketch({
      layer: this.graphicsLayer,
      view: this.view,
      container: this.panel
    })
    view.map.add(this.graphicsLayer)

    // view.ui.add(this.sketch, position);

    let me = this
    this.sketch.on('create', function(event) {
      if (event.state === 'start') {
        let sgLayer = me.view.map.findLayerById('SGLayer')
        if (!sgLayer) {
          me.view.map.add(me.graphicsLayer)
        }
      }
      if (event.state === 'complete') {
        // if (!MapApp.findLayerById("SGLayer")) {
        //     MapApp.removeLayerById("SGLayer");
        // }
      }
    })
  }
}
