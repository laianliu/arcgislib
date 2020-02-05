define(["require", "exports", "esri/widgets/Zoom"], function (require, exports, Zoom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Zoom = /** @class */ (function () {
        function Zoom(view, position, index) {
            this.zoom = null;
            this.zoom = new Zoom_1.default({
                view: view
                // layout: "horizontal",
                // container: document.getElementById("zoomButton")
            });
        }
        return Zoom;
    }());
    exports.default = Zoom;
});
