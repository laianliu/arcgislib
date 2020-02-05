define(["require", "exports", "esri/widgets/Compass"], function (require, exports, Compass_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var Compass = /** @class */ (function () {
        function Compass(view, position, index) {
            var compassWidget = new Compass_1.default({
                view: view
            });
            view.ui.add(compassWidget, position, index);
        }
        return Compass;
    }());
    exports.default = Compass;
});
