define(["require", "exports", "esri/widgets/Sketch", "esri/layers/GraphicsLayer"], function (require, exports, Sketch_1, GraphicsLayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var GraphicsLayer = /** @class */ (function () {
        function GraphicsLayer(view, position, index) {
            this.view = view;
            this.panel = document.getElementById('sketchPanel');
            this.graphicsLayer = new GraphicsLayer_1.default({
                title: 'SGLayer',
                id: 'SGLayer',
                listMode: 'hide',
                visible: true
            });
            this.sketch = new Sketch_1.default({
                layer: this.graphicsLayer,
                view: this.view,
                container: this.panel
            });
            view.map.add(this.graphicsLayer);
            // view.ui.add(this.sketch, position);
            var me = this;
            this.sketch.on('create', function (event) {
                if (event.state === 'start') {
                    var sgLayer = me.view.map.findLayerById('SGLayer');
                    if (!sgLayer) {
                        me.view.map.add(me.graphicsLayer);
                    }
                }
                if (event.state === 'complete') {
                    // if (!MapApp.findLayerById("SGLayer")) {
                    //     MapApp.removeLayerById("SGLayer");
                    // }
                }
            });
        }
        return GraphicsLayer;
    }());
    exports.default = GraphicsLayer;
});
