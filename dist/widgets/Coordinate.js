define(["require", "exports", "esri/widgets/CoordinateConversion", "esri/geometry/Point", "esri/Graphic"], function (require, exports, CoordinateConversion_1, Point_1, Graphic_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Coordinate = /** @class */ (function () {
        function Coordinate(view, position, index) {
            this.coordinateConversion = null;
            this.panel = document.getElementById('locatePanel');
            this.coordinateConversion = new CoordinateConversion_1.default({
                view: view,
                multipleConversions: true,
                mode: 'capture',
                container: this.panel
            });
        }
        Coordinate.prototype.createCenter = function (wkid, x, y) {
            var point = new Point_1.default({
                x: x,
                y: y,
                spatialReference: wkid
            });
            return point;
        };
        Coordinate.prototype.startQuery = function (mapPoint, layerId) {
            var graphic = new Graphic_1.default({
                geometry: mapPoint
            });
            var sq = MapApp.createSpatialQuery(MapApp, layerId, graphic.geometry);
            sq.querySelectedFeatures();
            MapApp.view.graphics.removeAll();
        };
        return Coordinate;
    }());
    exports.default = Coordinate;
});
