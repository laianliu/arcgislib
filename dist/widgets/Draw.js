var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/views/draw/Draw", "esri/Graphic", "esri/geometry/Polygon", "esri/geometry/Point", "esri/geometry/Circle", "esri/layers/GraphicsLayer"], function (require, exports, Draw_1, Graphic_1, Polygon_1, Point_1, Circle_1, GraphicsLayer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Draw_1 = __importDefault(Draw_1);
    Graphic_1 = __importDefault(Graphic_1);
    Polygon_1 = __importDefault(Polygon_1);
    Point_1 = __importDefault(Point_1);
    Circle_1 = __importDefault(Circle_1);
    GraphicsLayer_1 = __importDefault(GraphicsLayer_1);
    var Draw = /** @class */ (function () {
        function Draw(view, position, index) {
            this.draw = null;
            this.graphic = null;
            this.draw = new Draw_1.default({
                view: view
            });
        }
        Draw.prototype.createBuffer = function (event) {
            var mapApp = event.mapApp;
            var spatialReference = mapApp.view.spatialReference;
            var point = event.mapPoint;
            var radius = event.radius;
            // 绘制缓冲区
            var circle = new Circle_1.default({
                center: point,
                radius: radius,
                hasM: false,
                hasZ: false,
                spatialReference: spatialReference
            });
            var graphic = new Graphic_1.default({
                geometry: circle,
                symbol: {
                    type: 'simple-fill',
                    color: [0, 255, 255, 0.5],
                    style: 'solid',
                    outline: {
                        color: [0, 255, 255],
                        width: 1
                    }
                }
            });
            // 添加图形到地图上
            mapApp.view.graphics.removeAll();
            if (mapApp.findLayerById('RGLayer')) {
                mapApp.removeLayerById('RGLayer');
            }
            this.renderGraphicLayer = new GraphicsLayer_1.default({
                graphics: graphic,
                listMode: 'hide'
            });
            this.renderGraphicLayer.id = 'RGLayer';
            mapApp.map.add(this.renderGraphicLayer);
            // 开始查询
            var sq = mapApp.createSpatialQuery(mapApp, event.layerId, graphic.geometry);
            sq.querySelectedFeatures();
            mapApp.view.graphics.removeAll();
        };
        Draw.prototype.createPoint = function (event) {
            var mapApp = event.mapApp;
            var graphic = new Graphic_1.default({
                geometry: event.mapPoint
            });
            var sq = mapApp.createSpatialQuery(mapApp, event.layerId, graphic.geometry);
            sq.querySelectedFeatures();
            mapApp.view.graphics.removeAll();
        };
        Draw.prototype.createPolygon = function (event) {
            var mapApp = event.mapApp;
            var vertices = event.vertices;
            var spatialReference = mapApp.view.spatialReference;
            mapApp.view.graphics.removeAll();
            var polygon = {
                type: 'polygon',
                rings: vertices,
                spatialReference: spatialReference
            };
            var graphic = new Graphic_1.default({
                geometry: polygon,
                symbol: {
                    type: 'simple-fill',
                    color: [0, 255, 255, 0.5],
                    style: 'solid',
                    outline: {
                        color: [0, 255, 255],
                        width: 1
                    }
                }
            });
            mapApp.view.graphics.add(graphic);
            if (event.type === 'draw-complete') {
                var sq = mapApp.createSpatialQuery(mapApp, event.layerId, graphic.geometry);
                sq.querySelectedFeatures();
                mapApp.view.graphics.removeAll();
                mapApp.view.container.style.cursor = 'auto';
            }
        };
        Draw.prototype.createCircle = function (event) {
            var mapApp = event.mapApp;
            var vertices = event.vertices;
            var spatialReference = mapApp.view.spatialReference;
            mapApp.view.graphics.removeAll();
            if (vertices.length < 2)
                return;
            // var [
            //   [lat1, lng1],
            //   [lat2, lng2]
            // ] = vertices;
            var lat1 = vertices[0][0];
            var lng1 = vertices[0][1];
            var lat2 = vertices[1][0];
            var lng2 = vertices[1][1];
            var center = new Point_1.default({
                x: vertices[0][0],
                y: vertices[0][1],
                hasM: false,
                hasZ: false,
                spatialReference: spatialReference
            });
            var distance;
            // 两个WGS84坐标求距离
            if (mapApp.view.spatialReference.wkid !== 4326) {
                // 两点之间的欧式距离
                distance = center.distance(new Point_1.default({
                    x: vertices[1][0],
                    y: vertices[1][1],
                    hasM: false,
                    hasZ: false,
                    spatialReference: spatialReference
                }));
            }
            else {
                function rad(d) {
                    return (d * Math.PI) / 180.0;
                }
                var radLat1 = rad(lat1);
                var radLat2 = rad(lat2);
                var a = radLat1 - radLat2;
                var b = rad(lng1) - rad(lng2);
                distance =
                    2 *
                        Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
                            Math.cos(radLat1) *
                                Math.cos(radLat2) *
                                Math.pow(Math.sin(b / 2), 2)));
                distance = distance * 6378.137; // EARTH_RADIUS;
                distance = Math.round(distance * 10000) / 7.5; //输出单位有误
            }
            var circle = new Circle_1.default({
                center: center,
                radius: distance,
                hasM: false,
                hasZ: false,
                spatialReference: spatialReference
            });
            var graphic = new Graphic_1.default({
                geometry: circle,
                symbol: {
                    type: 'simple-fill',
                    color: [0, 255, 255, 0.5],
                    style: 'solid',
                    outline: {
                        color: [0, 255, 255],
                        width: 1
                    }
                }
            });
            mapApp.view.graphics.add(graphic);
            if (event.type === 'draw-complete') {
                var sq = mapApp.createSpatialQuery(mapApp, event.layerId, graphic.geometry);
                sq.querySelectedFeatures();
                mapApp.view.graphics.removeAll();
                mapApp.view.container.style.cursor = 'auto';
            }
        };
        Draw.prototype.createRectangle = function (event) {
            var mapApp = event.mapApp;
            var vertices = event.vertices;
            var spatialReference = mapApp.view.spatialReference;
            mapApp.view.container.style.cursor = 'crossHair';
            mapApp.view.graphics.removeAll();
            if (vertices.length < 2)
                return;
            var rings = [
                vertices[0],
                [vertices[0][0], vertices[1][1]],
                vertices[1],
                [vertices[1][0], vertices[0][1]]
            ];
            var polygon = new Polygon_1.default({
                rings: [rings],
                spatialReference: spatialReference
            });
            var graphic = new Graphic_1.default({
                geometry: polygon,
                symbol: {
                    type: 'simple-fill',
                    color: [0, 255, 255, 0.5],
                    style: 'solid',
                    outline: {
                        color: [0, 255, 255],
                        width: 1
                    }
                }
            });
            mapApp.view.graphics.add(graphic);
            if (event.type === 'draw-complete') {
                var sq = mapApp.createSpatialQuery(mapApp, event.layerId, graphic.geometry);
                sq.querySelectedFeatures();
                mapApp.view.graphics.removeAll();
                mapApp.view.container.style.cursor = 'auto';
            }
        };
        return Draw;
    }());
    exports.default = Draw;
});
