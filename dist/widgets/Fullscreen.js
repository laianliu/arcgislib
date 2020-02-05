define(["require", "exports", "esri/widgets/Fullscreen"], function (require, exports, Fullscreen_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Fullscreen = /** @class */ (function () {
        function Fullscreen(view, position, index) {
            this.fullscreen = null;
            this.fullscreen = new Fullscreen_1.default({
                view: view
            });
            view.ui.add({
                component: this.fullscreen,
                position: position,
                index: index
            });
        }
        return Fullscreen;
    }());
    exports.default = Fullscreen;
});
