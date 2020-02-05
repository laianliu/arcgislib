define(["require", "exports", "esri/views/draw/Draw", "esri/Graphic", "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/Circle", "esri/layers/GraphicsLayer", "esri/widgets/Sketch/SketchViewModel", "esri/geometry/geometryEngine"], function (require, exports, Draw_1, Graphic_1, Point_1, Polyline_1, Circle_1, GraphicsLayer_1, SketchViewModel_1, geometryEngine_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Buffer = /** @class */ (function () {
        function Buffer(view, position, index) {
            this.draw = new Draw_1.default({
                view: view
            });
            this.sketchViewModel = null;
            this.featureLayerView = null;
            this.pausableWatchHandle = null;
            this.centerGeometryAtStart = null;
            this.centerGraphic = null; // 中心位置
            this.mapPoint = null;
            this.edgeGraphic = null;
            this.polylineGraphic = null;
            this.bufferGraphic = null;
            this.labelGraphic = null;
            this.radius = null;
            this.graphicsLayer = new GraphicsLayer_1.default({
                title: 'SGLayer1',
                id: 'SGLayer1',
                listMode: 'hide'
            });
            this.graphicsLayer2 = new GraphicsLayer_1.default({
                title: 'SGLayer2',
                id: 'SGLayer2',
                listMode: 'hide'
            });
            this.unit = 'kilometers';
        }
        Buffer.prototype.setUpSketch = function () {
            this.sketchViewModel = new SketchViewModel_1.default({
                view: view,
                layer: this.graphicsLayer
            });
            var me = this;
            me.sketchViewModel.on('update', function (event) {
                if (event.toolEventInfo && event.toolEventInfo.mover.attributes.edge) {
                    var toolType = event.toolEventInfo.type;
                    if (toolType === 'move-start') {
                        me.centerGeometryAtStart = me.centerGraphic.geometry;
                    }
                    else if (toolType === 'move' || toolType === 'move-stop') {
                        me.centerGraphic.geometry = me.centerGeometryAtStart;
                    }
                }
                var vertices = [
                    [me.centerGraphic.geometry.x, me.centerGraphic.geometry.y],
                    [me.edgeGraphic.geometry.x, me.edgeGraphic.geometry.y]
                ];
                me.polylineGraphic.geometry = new Polyline_1.default({
                    paths: vertices,
                    spatialReference: view.spatialReference
                });
                var length = geometryEngine_1.default.geodesicLength(me.polylineGraphic.geometry, me.unit);
                var buffer = geometryEngine_1.default.geodesicBuffer(me.centerGraphic.geometry, length, me.unit);
                me.bufferGraphic.geometry = buffer;
                me.labelGraphic.geometry = me.edgeGraphic.geometry;
                me.labelGraphic.symbol = {
                    type: 'text',
                    color: '#FFEB00',
                    text: length.toFixed(2) + ' 千米',
                    xoffset: 50,
                    yoffset: 10,
                    font: {
                        // autocast as Font
                        size: 14,
                        family: 'sans-serif'
                    }
                };
                if (event.state === 'cancel' || event.state === 'complete') {
                    me.sketchViewModel.update([me.edgeGraphic, me.centerGraphic], {
                        tool: 'move'
                    });
                }
            }); // 拖拉更新Buffer视图
        };
        Buffer.prototype.calculateBuffer = function (vertices) {
            this.polylineGraphic.geometry = new Polyline_1.default({
                paths: vertices,
                spatialReference: view.spatialReference
            });
            var length = geometryEngine_1.default.geodesicLength(this.polylineGraphic.geometry, this.unit);
            var buffer = geometryEngine_1.default.geodesicBuffer(this.centerGraphic.geometry, length, this.unit);
            this.bufferGraphic.geometry = buffer;
            this.labelGraphic.geometry = this.edgeGraphic.geometry;
            this.labelGraphic.symbol = {
                type: 'text',
                color: '#FFEB00',
                text: length.toFixed(2) + ' 千米',
                xoffset: 50,
                yoffset: 10,
                font: {
                    // autocast as Font
                    size: 14,
                    family: 'sans-serif'
                }
            };
        };
        Buffer.prototype.setUpBufferUI = function (layer, radius, event) {
            var me = this;
            this.mapPoint = event.mapPoint;
            var circle = new Circle_1.default({
                center: this.mapPoint,
                radius: Number(radius),
                radiusUnit: 'kilometers'
            });
            // const center = circle.center.toArray();
            var rings = circle.rings[0][0];
            var point = new Point_1.default({
                x: rings[0],
                y: rings[1]
            });
            me.drawBufferPolygon(radius, point);
            // return buffer;
        };
        Buffer.prototype.drawBufferPolygon = function (radius, point) {
            // this.pausableWatchHandle.pause();
            var viewCenter = this.mapPoint;
            var centerScreenPoint = view.toScreen(viewCenter);
            var centerPoint = view.toMap({
                x: centerScreenPoint.x,
                y: centerScreenPoint.y
            });
            var edgePoint = view.toMap({
                x: centerScreenPoint.x + 100,
                y: centerScreenPoint.y
            });
            var vertices = [
                [centerPoint.x, centerPoint.y],
                [point.x, point.y]
            ];
            if (!this.centerGraphic) {
                var polyline = new Polyline_1.default({
                    paths: vertices,
                    spatialReference: view.spatialReference
                });
                var length_1 = geometryEngine_1.default.geodesicLength(polyline, this.unit);
                console.log(length_1);
                var buffer = geometryEngine_1.default.geodesicBuffer(centerPoint, Number(radius), this.unit);
                var pointSymbol = {
                    type: 'simple-marker',
                    style: 'circle',
                    size: 10,
                    color: [0, 255, 255, 0.5]
                };
                this.centerGraphic = new Graphic_1.default({
                    geometry: centerPoint,
                    symbol: pointSymbol,
                    attributes: {
                        center: 'center'
                    }
                });
                this.edgeGraphic = new Graphic_1.default({
                    geometry: point,
                    symbol: pointSymbol,
                    attributes: {
                        edge: 'edge'
                    }
                });
                this.polylineGraphic = new Graphic_1.default({
                    geometry: polyline,
                    symbol: {
                        type: 'simple-line',
                        color: [254, 254, 254, 1],
                        width: 2.5
                    }
                });
                this.bufferGraphic = new Graphic_1.default({
                    geometry: buffer,
                    symbol: {
                        type: 'simple-fill',
                        color: [0, 255, 255, 0.5],
                        outline: {
                            color: [0, 255, 255],
                            width: 2
                        }
                    }
                });
                this.labelGraphic = new Graphic_1.default({
                    geometry: edgePoint,
                    symbol: {
                        type: 'text',
                        color: '#FFEB00',
                        text: Number(radius).toFixed(2) + ' 千米',
                        xoffset: 50,
                        yoffset: 10,
                        font: {
                            // autocast as Font
                            size: 14,
                            family: 'sans-serif'
                        }
                    }
                });
                this.graphicsLayer.addMany([this.centerGraphic, this.edgeGraphic]);
                this.sketchViewModel.update([this.edgeGraphic, this.centerGraphic], {
                    tool: 'move'
                });
                this.graphicsLayer2.addMany([
                    this.bufferGraphic,
                    this.polylineGraphic,
                    this.labelGraphic
                ]);
            }
            else {
                this.centerGraphic.geometry = centerPoint;
                this.edgeGraphic.geometry = edgePoint;
            }
            this.calculateBuffer(vertices);
        };
        return Buffer;
    }());
    exports.default = Buffer;
});
