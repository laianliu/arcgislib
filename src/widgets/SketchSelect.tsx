import Expand from 'esri/widgets/Expand'
import Sketch from 'esri/widgets/Sketch'
import GraphicsLayer from 'esri/layers/GraphicsLayer'
import SpatialQuery from '../analyst/SpatialQuery'
export default class SketchSelect {
  constructor(view: object, position: object, index: number) {
    this.graphicsLayer = new GraphicsLayer()
    this.graphicsLayer.title = '临时图层2'
    this.graphicsLayer.id = 'drawtool2'
    this.spatialQuery = null
    this.spatialQueryInstance = SpatialQuery.getInstance(null)

    this.dialog = true
    this.isMultiSelected = false
    this.selectedFeatures = []

    // this.graphicsLayer2 = new GraphicsLayer()
    this.sketch = new Expand({
      // content: new Sketch({
      //     layer: this.graphicsLayer,
      //     view: view
      // }),
      content: document.getElementById('drawBox'),
      expandIconClass: 'esri-icon-sketch-rectangle',
      view: view,
      group: 'top-right'
    })

    view.ui.add(this.sketch, position)
    // this.graphicsLayer.visible = false;
    // view.map.layers.add(this.graphicsLayer);
    // let me = this;
    // this.sketch.content.on('create', function (event) {
    //     if (event.state === 'start') {
    //         if (!me.graphicsLayer) {
    //             me.graphicsLayer = new GraphicsLayer();
    //         }
    //         me.graphicsLayer.visible = true;
    //     }
    //     if (event.state === 'complete') {
    //         me.spatialQuery = new SpatialQuery(event.graphic.geometry, '2015年土地现状');
    //         me.spatialQuery.querySelectedFeatures();
    //         me.clearGraphic();
    //     }
    // })
  }

  // clearGraphic(){
  //   this.view.map.layers.remove(this.graphicsLayer);
  // }
}
