define(["require", "exports", "esri/widgets/Expand", "esri/layers/GraphicsLayer", "../analyst/SpatialQuery"], function (require, exports, Expand_1, GraphicsLayer_1, SpatialQuery_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var SketchSelect = /** @class */ (function () {
        function SketchSelect(view, position, index) {
            this.graphicsLayer = new GraphicsLayer_1.default();
            this.graphicsLayer.title = '临时图层2';
            this.graphicsLayer.id = 'drawtool2';
            this.spatialQuery = null;
            this.spatialQueryInstance = SpatialQuery_1.default.getInstance(null);
            this.dialog = true;
            this.isMultiSelected = false;
            this.selectedFeatures = [];
            // this.graphicsLayer2 = new GraphicsLayer()
            this.sketch = new Expand_1.default({
                // content: new Sketch({
                //     layer: this.graphicsLayer,
                //     view: view
                // }),
                content: document.getElementById('drawBox'),
                expandIconClass: 'esri-icon-sketch-rectangle',
                view: view,
                group: 'top-right'
            });
            view.ui.add(this.sketch, position);
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
        return SketchSelect;
    }());
    exports.default = SketchSelect;
});
