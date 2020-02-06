var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
define(["require", "exports", "esri/widgets/Zoom"], function (require, exports, Zoom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    Zoom_1 = __importDefault(Zoom_1);
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
